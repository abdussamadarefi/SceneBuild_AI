import { useState } from 'react';
import { CheckSquare, Square, RotateCcw, Play, XCircle, CheckCircle, Clock, Edit2, ArrowUpDown } from 'lucide-react';
import { Scene } from '../lib/storage';

interface EnhancedSceneEditorProps {
  projectId: string;
  scenes: Scene[];
  onUpdate: () => void;
}

export function EnhancedSceneEditor({ projectId, scenes, onUpdate }: EnhancedSceneEditorProps) {
  const [selectedScenes, setSelectedScenes] = useState<Set<string>>(new Set());
  const [sortedScenes, setSortedScenes] = useState([...scenes]);

  const handleSelectAll = () => {
    if (selectedScenes.size === scenes.length) {
      setSelectedScenes(new Set());
    } else {
      setSelectedScenes(new Set(scenes.map(s => s.id)));
    }
  };

  const handleSelectPending = () => {
    const pendingIds = scenes
      .filter(s => s.status === 'pending' || s.status === 'failed')
      .map(s => s.id);
    setSelectedScenes(new Set(pendingIds));
  };

  const handleSelectFailed = () => {
    const failedIds = scenes
      .filter(s => s.status === 'failed' || s.status === 'policy_violation')
      .map(s => s.id);
    setSelectedScenes(new Set(failedIds));
  };

  const handleSelectCompleted = () => {
    const completedIds = scenes
      .filter(s => s.status === 'completed')
      .map(s => s.id);
    setSelectedScenes(new Set(completedIds));
  };

  const handleToggleScene = (sceneId: string) => {
    const newSelected = new Set(selectedScenes);
    if (newSelected.has(sceneId)) {
      newSelected.delete(sceneId);
    } else {
      newSelected.add(sceneId);
    }
    setSelectedScenes(newSelected);
  };

  const handleResetOrder = () => {
    const sorted = [...scenes].sort((a, b) => a.scene_number - b.scene_number);
    setSortedScenes(sorted);
    alert('Scenes reordered by scene number!');
  };

  const handleRetrySelected = () => {
    if (selectedScenes.size === 0) {
      alert('Please select scenes to retry');
      return;
    }
    alert(`Retrying ${selectedScenes.size} selected scenes...`);
    setSelectedScenes(new Set());
  };

  const getStatusIcon = (status: Scene['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'policy_violation':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'generating':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: Scene['status']) => {
    const badges = {
      pending: { bg: 'bg-slate-100', text: 'text-slate-700' },
      generating: { bg: 'bg-blue-100', text: 'text-blue-700' },
      completed: { bg: 'bg-green-100', text: 'text-green-700' },
      failed: { bg: 'bg-red-100', text: 'text-red-700' },
      policy_violation: { bg: 'bg-orange-100', text: 'text-orange-700' },
    };
    const badge = badges[status];
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded text-xs font-semibold`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const stats = {
    total: scenes.length,
    completed: scenes.filter(s => s.status === 'completed').length,
    pending: scenes.filter(s => s.status === 'pending').length,
    failed: scenes.filter(s => s.status === 'failed' || s.status === 'policy_violation').length,
    generating: scenes.filter(s => s.status === 'generating').length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Scene Statistics</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-slate-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">{stats.pending}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.generating}</div>
            <div className="text-sm text-slate-600">Generating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-slate-600">Failed</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Bulk Actions</h2>
          <span className="text-sm text-slate-600">{selectedScenes.size} selected</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
          >
            {selectedScenes.size === scenes.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            <span>Select All</span>
          </button>

          <button
            onClick={handleSelectPending}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
          >
            <Clock className="w-4 h-4" />
            <span>Select Pending ({stats.pending})</span>
          </button>

          <button
            onClick={handleSelectFailed}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
          >
            <XCircle className="w-4 h-4" />
            <span>Select Failed ({stats.failed})</span>
          </button>

          <button
            onClick={handleSelectCompleted}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Select Completed ({stats.completed})</span>
          </button>

          <button
            onClick={handleResetOrder}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium ml-auto"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Reset Order</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRetrySelected}
            disabled={selectedScenes.size === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Selected</span>
          </button>

          <button
            disabled={selectedScenes.size === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            <span>Delete Selected</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedScenes.map((scene) => (
          <div
            key={scene.id}
            className={`bg-white rounded-lg shadow-sm border-2 transition ${
              selectedScenes.has(scene.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => handleToggleScene(scene.id)}
                  className="mt-1 flex-shrink-0"
                >
                  {selectedScenes.has(scene.id) ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-bold text-slate-900">Scene {scene.scene_number}</span>
                    {getStatusBadge(scene.status)}
                    {getStatusIcon(scene.status)}
                    <span className="text-sm text-slate-600">{scene.duration}s</span>
                    {scene.selected_video_url && (
                      <button
                        onClick={() => window.open(scene.selected_video_url, '_blank')}
                        className="ml-auto flex items-center space-x-1 px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition text-sm"
                      >
                        <Play className="w-3 h-3" />
                        <span>Watch</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase">Visual Prompt</label>
                      <p className="text-sm text-slate-800">{scene.prompt}</p>
                    </div>
                    {scene.voice_text && (
                      <div>
                        <label className="text-xs font-semibold text-slate-600 uppercase">Voice Over</label>
                        <p className="text-sm text-slate-800">{scene.voice_text}</p>
                      </div>
                    )}
                    {scene.error_message && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <label className="text-xs font-semibold text-red-600 uppercase">Error</label>
                        <p className="text-sm text-red-700">{scene.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>

                <button className="flex-shrink-0 px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition text-sm font-medium">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
