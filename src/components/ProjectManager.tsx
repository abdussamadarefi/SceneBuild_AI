import { useState, useEffect } from 'react';
import { FolderKanban, Play, Trash2, Film, FolderOpen, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';
import { storage, Project, Scene } from '../lib/storage';

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = storage.getProjects();
    setProjects(allProjects.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this project? All scenes and videos will be removed.')) {
      storage.deleteProject(id);
      loadProjects();
    }
  };

  const handleOpenFolder = (projectId: string) => {
    const project = storage.getProject(projectId);
    if (project?.project_folders) {
      console.log('Opening folder:', project.project_folders.root);
      alert(`Folder: ${project.project_folders.root}`);
    }
  };

  const getProjectStats = (projectId: string) => {
    const scenes = storage.getScenesByProject(projectId);
    const total = scenes.length;
    const completed = scenes.filter(s => s.status === 'completed').length;
    const failed = scenes.filter(s => s.status === 'failed' || s.status === 'policy_violation').length;
    const pending = scenes.filter(s => s.status === 'pending').length;
    const generating = scenes.filter(s => s.status === 'generating').length;

    return { total, completed, failed, pending, generating };
  };

  const getStatusBadge = (status: Project['status']) => {
    const badges = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft' },
      generating: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Generating' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
    };
    const badge = badges[status];
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Manager</h1>
        <p className="text-slate-600">Manage all your video projects</p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6">Create your first project to get started!</p>
          <button className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium">
            Create New Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const stats = getProjectStats(project.id);
            const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

            return (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
                      {getStatusBadge(project.status)}
                    </div>
                    <p className="text-slate-600 mb-2">{project.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <Film className="w-4 h-4 mr-1" />
                        {stats.total} scenes
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(project.updated_at)}
                      </span>
                      <span className="capitalize">{project.generation_mode.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                </div>

                {stats.total > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">Progress: {stats.completed}/{stats.total}</span>
                      <span className="text-slate-600">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {stats.completed} completed
                      </span>
                      {stats.pending > 0 && (
                        <span className="flex items-center text-slate-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {stats.pending} pending
                        </span>
                      )}
                      {stats.generating > 0 && (
                        <span className="flex items-center text-blue-600">
                          <Clock className="w-4 h-4 mr-1 animate-spin" />
                          {stats.generating} generating
                        </span>
                      )}
                      {stats.failed > 0 && (
                        <span className="flex items-center text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          {stats.failed} failed
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Scenes</span>
                  </button>

                  <button
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Play className="w-4 h-4" />
                    <span>Generate Video</span>
                  </button>

                  <button
                    onClick={() => handleOpenFolder(project.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
                    title="Open Folder"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Open Folder</span>
                  </button>

                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
