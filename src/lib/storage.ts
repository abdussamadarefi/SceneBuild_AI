interface Project {
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
  };
  created_at: string;
  updated_at: string;
}

interface Scene {
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

interface RenderedVideo {
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

class LocalStorage {
  private readonly PROJECTS_KEY = 'scenebuild_projects';
  private readonly SCENES_KEY = 'scenebuild_scenes';
  private readonly VIDEOS_KEY = 'scenebuild_rendered_videos';

  getProjects(): Project[] {
    const data = localStorage.getItem(this.PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex((p) => p.id === project.id);

    if (index >= 0) {
      projects[index] = { ...project, updated_at: new Date().toISOString() };
    } else {
      projects.push(project);
    }

    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
  }

  deleteProject(id: string): void {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filtered));

    const scenes = this.getScenesByProject(id);
    scenes.forEach((scene) => this.deleteScene(scene.id));

    const videos = this.getVideosByProject(id);
    videos.forEach((video) => this.deleteRenderedVideo(video.id));
  }

  getScenes(): Scene[] {
    const data = localStorage.getItem(this.SCENES_KEY);
    return data ? JSON.parse(data) : [];
  }

  getScenesByProject(projectId: string): Scene[] {
    return this.getScenes().filter((s) => s.project_id === projectId);
  }

  getScene(id: string): Scene | null {
    const scenes = this.getScenes();
    return scenes.find((s) => s.id === id) || null;
  }

  saveScene(scene: Scene): void {
    const scenes = this.getScenes();
    const index = scenes.findIndex((s) => s.id === scene.id);

    if (index >= 0) {
      scenes[index] = { ...scene, updated_at: new Date().toISOString() };
    } else {
      scenes.push(scene);
    }

    localStorage.setItem(this.SCENES_KEY, JSON.stringify(scenes));
  }

  deleteScene(id: string): void {
    const scenes = this.getScenes();
    const filtered = scenes.filter((s) => s.id !== id);
    localStorage.setItem(this.SCENES_KEY, JSON.stringify(filtered));
  }

  getRenderedVideos(): RenderedVideo[] {
    const data = localStorage.getItem(this.VIDEOS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getVideosByProject(projectId: string): RenderedVideo[] {
    return this.getRenderedVideos().filter((v) => v.project_id === projectId);
  }

  saveRenderedVideo(video: RenderedVideo): void {
    const videos = this.getRenderedVideos();
    videos.push(video);
    localStorage.setItem(this.VIDEOS_KEY, JSON.stringify(videos));
  }

  deleteRenderedVideo(id: string): void {
    const videos = this.getRenderedVideos();
    const filtered = videos.filter((v) => v.id !== id);
    localStorage.setItem(this.VIDEOS_KEY, JSON.stringify(filtered));
  }
}

export const storage = new LocalStorage();
export type { Project, Scene, RenderedVideo };
