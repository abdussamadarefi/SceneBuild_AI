class FFmpegService {
  async checkFFmpegInstalled() {
    return true;
  }

  async mergeVideos(videoFiles, outputPath, options) {
    return { success: false, message: 'Not implemented yet' };
  }

  async convertAspectRatio(inputPath, outputPath, aspectRatio) {
    return { success: false };
  }
}

module.exports = new FFmpegService();
