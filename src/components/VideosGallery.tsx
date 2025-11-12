import { useState, useEffect } from 'react';
import { Film, Clock, Play, Trash2, Download, FolderOpen } from 'lucide-react';
import { storage, RenderedVideo } from '../lib/storage';

export function VideosGallery() {
  const [videos, setVideos] = useState<RenderedVideo[]>([]);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = () => {
    const allVideos = storage.getRenderedVideos();
    setVideos(allVideos.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      storage.deleteRenderedVideo(id);
      loadVideos();
    }
  };

  const handleOpenFolder = (videoPath: string) => {
    const folderPath = videoPath.substring(0, videoPath.lastIndexOf('/'));
    console.log('Opening folder:', folderPath);
    alert(`Folder: ${folderPath}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Videos Gallery</h1>
        <p className="text-slate-600">All your generated videos in one place</p>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No videos yet</h3>
          <p className="text-slate-500">Create your first project and render a video!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                <Play className="w-16 h-16 text-white opacity-70" />
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-sm px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-slate-900 mb-3 truncate">
                  Video {video.id.slice(0, 8)}
                </h3>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Film className="w-4 h-4 mr-2" />
                      {video.total_scenes} scenes
                    </span>
                    <span>{formatFileSize(video.file_size)}</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(video.created_at)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(video.video_url, '_blank')}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
                  >
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                  </button>

                  <button
                    onClick={() => handleOpenFolder(video.local_path)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                    title="Open Folder"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => alert('Download: ' + video.video_url)}
                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(video.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
