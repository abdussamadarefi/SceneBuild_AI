const { app, BrowserWindow, ipcMain, dialog, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();
let mainWindow;

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'SceneBuild AI - Desktop',
    icon: path.join(__dirname, '../public/icon.png')
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const windowState = store.get('windowState', {
    width: 1400,
    height: 900,
    x: undefined,
    y: undefined
  });

  if (windowState.x !== undefined && windowState.y !== undefined) {
    mainWindow.setBounds(windowState);
  }

  mainWindow.on('close', () => {
    store.set('windowState', mainWindow.getBounds());
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-app-path', async () => {
  return app.getPath('userData');
});

ipcMain.handle('get-projects-folder', async () => {
  const defaultPath = path.join(app.getPath('documents'), 'SceneBuildAI', 'projects');
  const customPath = store.get('projectsFolder', defaultPath);

  if (!fs.existsSync(customPath)) {
    fs.mkdirSync(customPath, { recursive: true });
  }

  return customPath;
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-video-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('open-folder', async (event, folderPath) => {
  const { shell } = require('electron');
  shell.openPath(folderPath);
});

ipcMain.handle('storage-get', async (event, key) => {
  return store.get(key);
});

ipcMain.handle('storage-set', async (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('storage-delete', async (event, key) => {
  store.delete(key);
  return true;
});

ipcMain.handle('storage-clear', async () => {
  store.clear();
  return true;
});

ipcMain.handle('create-project-folder', async (event, projectName) => {
  const projectsFolder = store.get('projectsFolder', path.join(app.getPath('documents'), 'SceneBuildAI', 'projects'));
  const projectFolder = path.join(projectsFolder, projectName);

  const folders = {
    root: projectFolder,
    scenes: path.join(projectFolder, 'scenes'),
    scripts: path.join(projectFolder, 'scripts'),
    veoVideos: path.join(projectFolder, 'veoVideos'),
    rendered: path.join(projectFolder, 'rendered'),
    logs: path.join(projectFolder, 'logs'),
    extracted: path.join(projectFolder, 'extracted')
  };

  Object.values(folders).forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });

  return folders;
});

ipcMain.handle('save-scene-script', async (event, projectFolder, sceneNumber, content) => {
  const scriptPath = path.join(projectFolder, 'scripts', `scene-${sceneNumber.toString().padStart(3, '0')}.txt`);
  fs.writeFileSync(scriptPath, content, 'utf8');
  return scriptPath;
});

ipcMain.handle('read-file', async (event, filePath) => {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  return null;
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
});

ipcMain.handle('file-exists', async (event, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle('delete-file', async (event, filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
});

ipcMain.handle('get-secure-value', async (event, key) => {
  const { safeStorage } = require('electron');
  const encryptedValue = store.get(`secure_${key}`);

  if (encryptedValue && safeStorage.isEncryptionAvailable()) {
    const buffer = Buffer.from(encryptedValue, 'base64');
    const decrypted = safeStorage.decryptString(buffer);
    return decrypted;
  }

  return null;
});

ipcMain.handle('set-secure-value', async (event, key, value) => {
  const { safeStorage } = require('electron');

  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(value);
    const base64 = encrypted.toString('base64');
    store.set(`secure_${key}`, base64);
    return true;
  }

  return false;
});

ipcMain.handle('delete-secure-value', async (event, key) => {
  store.delete(`secure_${key}`);
  return true;
});

const aiService = require('./services/aiService');
const veoService = require('./services/veoService');
const ffmpegService = require('./services/ffmpegService');
const videoExtractionService = require('./services/videoExtractionService');

ipcMain.handle('ai-split-scenes', async (event, options) => {
  try {
    const { safeStorage } = require('electron');
    const encryptedValue = store.get('secure_gemini_api_key');

    let apiKey = null;
    if (encryptedValue && safeStorage.isEncryptionAvailable()) {
      const buffer = Buffer.from(encryptedValue, 'base64');
      apiKey = safeStorage.decryptString(buffer);
    }

    if (!apiKey) {
      return {
        success: false,
        error: 'Gemini API key not found. Please add it in Settings.',
        scenes: []
      };
    }

    const modelName = store.get('gemini_model', 'gemini-2.0-flash-exp');
    aiService.initialize(apiKey, modelName);

    const result = await aiService.splitScenes(options);
    return result;

  } catch (error) {
    console.error('AI Scene Split Error:', error);
    return {
      success: false,
      error: error.message,
      scenes: []
    };
  }
});

ipcMain.handle('extract-video-scenes', async (event, options) => {
  try {
    const { safeStorage } = require('electron');
    const encryptedValue = store.get('secure_gemini_api_key');

    let apiKey = null;
    if (encryptedValue && safeStorage.isEncryptionAvailable()) {
      const buffer = Buffer.from(encryptedValue, 'base64');
      apiKey = safeStorage.decryptString(buffer);
    }

    mainWindow.webContents.send('progress', {
      type: 'video-extraction',
      message: 'Processing video...'
    });

    const result = await videoExtractionService.processVideoForScenes(options.videoPath, {
      apiKey: apiKey,
      maxScenes: options.maxScenes || 10,
      sceneDuration: options.sceneDuration || 8,
      analysisPrompt: options.prompt || '',
      projectName: options.projectName
    });

    mainWindow.webContents.send('progress', {
      type: 'video-extraction',
      message: 'Video processing complete'
    });

    return result;

  } catch (error) {
    console.error('Video extraction error:', error);
    mainWindow.webContents.send('error', {
      type: 'video-extraction',
      message: error.message
    });

    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('veo-login', async (event, credentials) => {
  try {
    const result = await veoService.login(credentials);
    return result;
  } catch (error) {
    console.error('Veo login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('veo-generate-scene', async (event, sceneData) => {
  try {
    const result = await veoService.generateScene(sceneData);
    return result;
  } catch (error) {
    console.error('Veo generate error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('veo-check-status', async (event, jobId) => {
  try {
    const result = await veoService.checkStatus(jobId);
    return result;
  } catch (error) {
    console.error('Veo status check error:', error);
    return {
      status: 'error',
      error: error.message
    };
  }
});

ipcMain.handle('veo-download-video', async (event, videoUrl, destinationPath) => {
  try {
    const result = await veoService.downloadVideo(videoUrl, destinationPath);
    return result;
  } catch (error) {
    console.error('Video download error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('merge-videos', async (event, videoFiles, outputPath, options) => {
  try {
    const result = await ffmpegService.mergeVideos(videoFiles, outputPath, {
      ...options,
      onProgress: (progressData) => {
        if (mainWindow) {
          mainWindow.webContents.send('progress', progressData);
        }
      }
    });
    return result;
  } catch (error) {
    console.error('Video merge error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('convert-aspect-ratio', async (event, inputPath, outputPath, aspectRatio) => {
  try {
    const result = await ffmpegService.convertAspectRatio(inputPath, outputPath, aspectRatio);
    return result;
  } catch (error) {
    console.error('Aspect ratio conversion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('check-ffmpeg', async () => {
  try {
    const isInstalled = await ffmpegService.checkFFmpegInstalled();
    return { installed: isInstalled };
  } catch (error) {
    return { installed: false, error: error.message };
  }
});

function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
}

ipcMain.handle('show-notification', async (event, title, body) => {
  showNotification(title, body);
  return true;
});

console.log('SceneBuild AI Desktop - Electron Main Process Started');
console.log('User Data Path:', app.getPath('userData'));
console.log('Projects Folder:', path.join(app.getPath('documents'), 'SceneBuildAI', 'projects'));
