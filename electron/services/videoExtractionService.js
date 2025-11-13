const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class VideoExtractionService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initializeGemini(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async downloadYouTubeVideo(url, destinationPath) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Downloading YouTube video:', url);

        const videoStream = ytdl(url, {
          quality: 'highestvideo',
          filter: 'videoandaudio'
        });

        const writeStream = fs.createWriteStream(destinationPath);

        videoStream.pipe(writeStream);

        let downloadedBytes = 0;

        videoStream.on('progress', (chunkLength, downloaded, total) => {
          downloadedBytes = downloaded;
          const percent = (downloaded / total * 100).toFixed(2);
          console.log(`Progress: ${percent}% (${(downloaded / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB)`);
        });

        writeStream.on('finish', () => {
          console.log('Download complete');
          resolve({
            success: true,
            filePath: destinationPath,
            size: downloadedBytes
          });
        });

        videoStream.on('error', (error) => {
          console.error('Video stream error:', error);
          reject(error);
        });

        writeStream.on('error', (error) => {
          console.error('Write stream error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('Download error:', error);
        reject(error);
      }
    });
  }

  async extractFrames(videoPath, outputDir, options = {}) {
    const {
      frameRate = 1,
      maxFrames = 20,
      quality = 2
    } = options;

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      console.log('Extracting frames from video:', videoPath);

      ffmpeg(videoPath)
        .on('end', () => {
          const frames = fs.readdirSync(outputDir)
            .filter(file => file.endsWith('.jpg'))
            .map(file => path.join(outputDir, file))
            .slice(0, maxFrames);

          console.log(`Extracted ${frames.length} frames`);
          resolve({
            success: true,
            frames: frames,
            count: frames.length
          });
        })
        .on('error', (error) => {
          console.error('Frame extraction error:', error);
          reject(error);
        })
        .screenshots({
          count: maxFrames,
          folder: outputDir,
          filename: 'frame-%03d.jpg',
          quality: quality
        });
    });
  }

  async getVideoInfo(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          reject(error);
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

        resolve({
          duration: metadata.format.duration,
          width: videoStream?.width,
          height: videoStream?.height,
          fps: eval(videoStream?.r_frame_rate),
          bitrate: metadata.format.bit_rate,
          hasAudio: !!audioStream,
          format: metadata.format.format_name
        });
      });
    });
  }

  async analyzeVideoWithGemini(framePaths, prompt = '') {
    if (!this.model) {
      throw new Error('Gemini not initialized. Call initializeGemini first.');
    }

    console.log('Analyzing video with Gemini Vision...');

    const imageParts = await Promise.all(
      framePaths.slice(0, 10).map(async (framePath) => {
        const imageData = fs.readFileSync(framePath);
        return {
          inlineData: {
            data: imageData.toString('base64'),
            mimeType: 'image/jpeg'
          }
        };
      })
    );

    const analysisPrompt = prompt || `Analyze this video by looking at these frames. Provide:
1. Main subject/topic
2. Visual style (cinematic, documentary, animated, etc.)
3. Key scenes or sections (describe 8-10 distinct scenes)
4. Setting and environment
5. Characters or objects present
6. Mood and atmosphere
7. Suggested scene breakdown for recreation

Format as JSON:
{
  "title": "Video title/topic",
  "style": "Visual style",
  "mood": "Atmosphere",
  "scenes": [
    {
      "scene_number": 1,
      "description": "What happens in this scene",
      "visual_prompt": "Detailed prompt for AI video generation",
      "duration": 8,
      "timing": "0:00-0:08"
    }
  ]
}`;

    const result = await this.model.generateContent([
      analysisPrompt,
      ...imageParts
    ]);

    const response = result.response;
    const text = response.text();

    console.log('Gemini analysis complete');

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return {
          success: true,
          analysis: JSON.parse(jsonMatch[0]),
          rawText: text
        };
      }
    } catch (e) {
      console.error('Failed to parse JSON, returning raw text');
    }

    return {
      success: true,
      analysis: null,
      rawText: text
    };
  }

  async processVideoForScenes(videoPathOrUrl, options = {}) {
    const {
      apiKey,
      maxScenes = 10,
      sceneDuration = 8,
      analysisPrompt = '',
      projectName = 'video-analysis'
    } = options;

    try {
      let videoPath = videoPathOrUrl;
      let isTemporary = false;

      if (videoPathOrUrl.startsWith('http')) {
        console.log('Downloading video from URL...');
        const tempDir = path.join(os.tmpdir(), 'scenebuild-video-' + Date.now());
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        videoPath = path.join(tempDir, 'video.mp4');

        if (videoPathOrUrl.includes('youtube.com') || videoPathOrUrl.includes('youtu.be')) {
          await this.downloadYouTubeVideo(videoPathOrUrl, videoPath);
        } else {
          await this.downloadGenericVideo(videoPathOrUrl, videoPath);
        }

        isTemporary = true;
      }

      console.log('Getting video information...');
      const videoInfo = await this.getVideoInfo(videoPath);
      console.log('Video info:', videoInfo);

      const framesDir = path.join(os.tmpdir(), `scenebuild-frames-${Date.now()}`);
      console.log('Extracting frames...');
      const frameCount = Math.min(maxScenes * 2, 20);
      const { frames } = await this.extractFrames(videoPath, framesDir, {
        maxFrames: frameCount,
        frameRate: videoInfo.duration / frameCount
      });

      if (apiKey) {
        this.initializeGemini(apiKey);
        console.log('Analyzing with Gemini Vision...');
        const analysis = await this.analyzeVideoWithGemini(frames, analysisPrompt);

        this.cleanup(framesDir);
        if (isTemporary) {
          this.cleanup(path.dirname(videoPath));
        }

        return {
          success: true,
          videoInfo: videoInfo,
          analysis: analysis.analysis,
          rawAnalysis: analysis.rawText,
          scenes: analysis.analysis?.scenes || []
        };
      } else {
        const basicScenes = this.createBasicScenes(videoInfo, maxScenes, sceneDuration);

        this.cleanup(framesDir);
        if (isTemporary) {
          this.cleanup(path.dirname(videoPath));
        }

        return {
          success: true,
          videoInfo: videoInfo,
          scenes: basicScenes,
          message: 'Created basic scene breakdown. Add Gemini API key for AI analysis.'
        };
      }

    } catch (error) {
      console.error('Video processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  createBasicScenes(videoInfo, maxScenes, sceneDuration) {
    const scenes = [];
    const totalDuration = videoInfo.duration;
    const sceneCount = Math.min(maxScenes, Math.ceil(totalDuration / sceneDuration));

    for (let i = 0; i < sceneCount; i++) {
      const startTime = i * sceneDuration;
      const endTime = Math.min((i + 1) * sceneDuration, totalDuration);

      scenes.push({
        scene_number: i + 1,
        description: `Scene ${i + 1}`,
        visual_prompt: `Scene from ${this.formatTime(startTime)} to ${this.formatTime(endTime)}`,
        duration: sceneDuration,
        timing: `${this.formatTime(startTime)}-${this.formatTime(endTime)}`
      });
    }

    return scenes;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async downloadGenericVideo(url, destinationPath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(destinationPath);

      https.get(url, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve({
            success: true,
            filePath: destinationPath
          });
        });
      }).on('error', (error) => {
        fs.unlink(destinationPath, () => {});
        reject(error);
      });
    });
  }

  cleanup(dirPath) {
    try {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          if (fs.lstatSync(filePath).isDirectory()) {
            this.cleanup(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
        });
        fs.rmdirSync(dirPath);
        console.log('Cleanup complete:', dirPath);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new VideoExtractionService();
