interface ElectronAPI {
  storageGet: (key: string) => Promise<any>;
  storageSet: (key: string, value: any) => Promise<boolean>;
  storageDelete: (key: string) => Promise<boolean>;
  storageClear: () => Promise<boolean>;
  getProjectsFolder: () => Promise<string>;
  createProjectFolder: (projectName: string) => Promise<any>;
  openFolder: (folderPath: string) => Promise<void>;
  selectVideoFile: () => Promise<string | null>;
  getSecureValue: (key: string) => Promise<string | null>;
  setSecureValue: (key: string, value: string) => Promise<boolean>;
  deleteSecureValue: (key: string) => Promise<boolean>;
  aiSplitScenes: (options: any) => Promise<any>;
  extractVideoScenes: (options: any) => Promise<any>;
  veoLogin: (credentials: any) => Promise<any>;
  veoGenerateScene: (sceneData: any) => Promise<any>;
  veoCheckStatus: (jobId: string) => Promise<any>;
  veoDownloadVideo: (videoUrl: string, destinationPath: string) => Promise<any>;
  mergeVideos: (videoFiles: string[], outputPath: string, options: any) => Promise<any>;
  checkFFmpeg: () => Promise<{ installed: boolean }>;
  showNotification: (title: string, body: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export interface Project {
  id: string;
  name: string;
  description: string;
  generation_mode: 'full_ai_auto' | 'manual_scene_split' | 'raw_text_split' | 'video_to_scene';
  status: 'draft' | 'generating' | 'completed' | 'failed';
  input_text: string;
  video_url?: string;
  exact_voice_over?: boolean;
  intelligence_mode?: boolean;
  video_style: string;
  language: string;
  voice_style: string;
  voice_gender: 'male' | 'female' | 'neutral';
  project_folders?: {
    root: string;
    scenes: string;
    scripts: string;
    veoVideos: string;
    rendered: string;
    logs: string;
    extracted?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  prompt: string;
  voice_text: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'policy_violation';
  selected_video_url: string;
  local_path: string;
  script_file_path: string;
  duration: number;
  visual_elements: {
    characterConsistency: string;
    environmentConsistency: string;
  };
  error_message: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface RenderedVideo {
  id: string;
  project_id: string;
  video_url: string;
  local_path: string;
  duration: number;
  total_scenes: number;
  file_size: number;
  render_settings: any;
  created_at: string;
}

class ElectronStorage {
  private readonly PROJECTS_KEY = 'scenebuild_projects';
  private readonly SCENES_KEY = 'scenebuild_scenes';
  private readonly VIDEOS_KEY = 'scenebuild_rendered_videos';

  private isElectron(): boolean {
    return typeof window !== 'undefined' && window.electronAPI !== undefined;
  }

  async getProjects(): Promise<Project[]> {
    if (this.isElectron()) {
      const data = await window.electronAPI!.storageGet(this.PROJECTS_KEY);
      return data || [];
    }
    const data = localStorage.getItem(this.PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  async saveProject(project: Project): Promise<void> {
    const projects = await this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      projects[index] = { ...project, updated_at: new Date().toISOString() };
    } else {
      if (this.isElectron() && !project.project_folders) {
        const folders = await window.electronAPI!.createProjectFolder(project.name);
        project.project_folders = folders;
      }
      projects.push(project);
    }

    if (this.isElectron()) {
      await window.electronAPI!.storageSet(this.PROJECTS_KEY, projects);
    } else {
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    }
  }

  async deleteProject(id: string): Promise<void> {
    const projects = await this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);

    if (this.isElectron()) {
      await window.electronAPI!.storageSet(this.PROJECTS_KEY, filtered);
    } else {
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filtered));
    }

    const scenes = await this.getScenesByProject(id);
    for (const scene of scenes) {
      await this.deleteScene(scene.id);
    }

    const videos = await this.getVideosByProject(id);
    for (const video of videos) {
      await this.deleteRenderedVideo(video.id);
    }
  }

  async getScenes(): Promise<Scene[]> {
    if (this.isElectron()) {
      const data = await window.electronAPI!.storageGet(this.SCENES_KEY);
      return data || [];
    }
    const data = localStorage.getItem(this.SCENES_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getScenesByProject(projectId: string): Promise<Scene[]> {
    const scenes = await this.getScenes();
    return scenes.filter((s) => s.project_id === projectId).sort((a, b) => a.scene_number - b.scene_number);
  }

  async getScene(id: string): Promise<Scene | null> {
    const scenes = await this.getScenes();
    return scenes.find((s) => s.id === id) || null;
  }

  async saveScene(scene: Scene): Promise<void> {
    const scenes = await this.getScenes();
    const index = scenes.findIndex((s) => s.id === scene.id);

    if (index >= 0) {
      scenes[index] = { ...scene, updated_at: new Date().toISOString() };
    } else {
      scenes.push(scene);
    }

    if (this.isElectron()) {
      await window.electronAPI!.storageSet(this.SCENES_KEY, scenes);
    } else {
      localStorage.setItem(this.SCENES_KEY, JSON.stringify(scenes));
    }
  }

  async deleteScene(id: string): Promise<void> {
    const scenes = await this.getScenes();
    const filtered = scenes.filter((s) => s.id !== id);

    if (this.isElectron()) {
      await window.electronAPI!.storageSet(this.SCENES_KEY, filtered);
    } else {
      localStorage.setItem(this.SCENES_KEY, JSON.stringify(filtered));
    }
  }

  async getRenderedVideos(): Promise<RenderedVideo[]> {
    if (this.isElectron()) {
      const data = await window.electronAPI!.storageGet(this.VIDEOS_KEY);
      return data || [];
    }
    const data = localStorage.getItem(this.VIDEOS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getVideosByProject(projectId: string): Promise<RenderedVideo[]> {
    const videos = await this.getRenderedVideos();
    return videos.filter((v) => v.project_id === projectId);
  }

  async saveRenderedVideo(video: RenderedVideo): Promise<void> {
    const videos = await this.getRenderedVideos();
    videos.push(video);

    if (this.isElectron()) {
      await window.electronAPI!.storageSet(this.VIDEOS_KEY, videos);
    } else {
      localStorage.setItem(this.VIDEOS_KEY, JSON.stringify(videos));
    }
  }

  async deleteRenderedVideo(id: string): Promise<void> {
    const videos = await this.getRenderedVideos();
    const filtered = videos.filter((v) => v.id !== id);

    if (this.isElectron()) {
      await window.electronAPI!.storageSet(this.VIDEOS_KEY, filtered);
    } else {
      localStorage.setItem(this.VIDEOS_KEY, JSON.stringify(filtered));
    }
  }

  async openProjectFolder(project: Project): Promise<void> {
    if (this.isElectron() && project.project_folders) {
      await window.electronAPI!.openFolder(project.project_folders.root);
    }
  }
}

export const storage = new ElectronStorage();
