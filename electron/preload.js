const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  getProjectsFolder: () => ipcRenderer.invoke('get-projects-folder'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),

  storageGet: (key) => ipcRenderer.invoke('storage-get', key),
  storageSet: (key, value) => ipcRenderer.invoke('storage-set', key, value),
  storageDelete: (key) => ipcRenderer.invoke('storage-delete', key),
  storageClear: () => ipcRenderer.invoke('storage-clear'),

  createProjectFolder: (projectName) => ipcRenderer.invoke('create-project-folder', projectName),
  saveSceneScript: (projectFolder, sceneNumber, content) =>
    ipcRenderer.invoke('save-scene-script', projectFolder, sceneNumber, content),

  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),

  getSecureValue: (key) => ipcRenderer.invoke('get-secure-value', key),
  setSecureValue: (key, value) => ipcRenderer.invoke('set-secure-value', key, value),
  deleteSecureValue: (key) => ipcRenderer.invoke('delete-secure-value', key),

  aiSplitScenes: (options) => ipcRenderer.invoke('ai-split-scenes', options),
  extractVideoScenes: (options) => ipcRenderer.invoke('extract-video-scenes', options),

  veoLogin: (credentials) => ipcRenderer.invoke('veo-login', credentials),
  veoGenerateScene: (sceneData) => ipcRenderer.invoke('veo-generate-scene', sceneData),
  veoCheckStatus: (jobId) => ipcRenderer.invoke('veo-check-status', jobId),
  veoDownloadVideo: (videoUrl, destinationPath) =>
    ipcRenderer.invoke('veo-download-video', videoUrl, destinationPath),

  mergeVideos: (videoFiles, outputPath, options) =>
    ipcRenderer.invoke('merge-videos', videoFiles, outputPath, options),
  convertAspectRatio: (inputPath, outputPath, aspectRatio) =>
    ipcRenderer.invoke('convert-aspect-ratio', inputPath, outputPath, aspectRatio),
  checkFFmpeg: () => ipcRenderer.invoke('check-ffmpeg'),

  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),

  onProgress: (callback) => {
    ipcRenderer.on('progress', (event, data) => callback(data));
  },
  onNotification: (callback) => {
    ipcRenderer.on('notification', (event, data) => callback(data));
  },
  onError: (callback) => {
    ipcRenderer.on('error', (event, data) => callback(data));
  }
});

console.log('Electron Preload Script Loaded - Video Extraction Ready');
