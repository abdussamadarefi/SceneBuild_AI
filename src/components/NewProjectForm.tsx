import { useState } from 'react';
import { Sparkles, Video, Mic, MicOff, Music, Maximize, Smartphone } from 'lucide-react';
import { storage } from '../lib/storage';

interface NewProjectFormProps {
  onComplete: () => void;
}

type GenerationMode = 'full_ai_auto' | 'manual_scene_split' | 'raw_text_split' | 'video_to_scene';
type StoryStyle = 'voice_over' | 'intelligent_mix' | 'no_voice';
type AspectRatio = 'landscape' | 'portrait';

export function NewProjectForm({ onComplete }: NewProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    generation_mode: 'full_ai_auto' as GenerationMode,
    input_text: '',
    video_url: '',
    video_style: 'Cinematic',
    language: 'English',
    voice_style: 'Professional',
    voice_gender: 'neutral' as 'male' | 'female' | 'neutral',
    story_style: 'voice_over' as StoryStyle,
    aspect_ratio: 'landscape' as AspectRatio,
    exact_voice_over: false,
    intelligence_mode: false,
    include_dialogue: true,
    add_background_music: false,
    scene_count: 10,
    scene_duration: 8,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const project = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      generation_mode: formData.generation_mode,
      status: 'draft' as const,
      input_text: formData.input_text,
      video_url: formData.video_url || undefined,
      exact_voice_over: formData.exact_voice_over,
      intelligence_mode: formData.intelligence_mode,
      video_style: formData.video_style,
      language: formData.language,
      voice_style: formData.voice_style,
      voice_gender: formData.voice_gender,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    storage.saveProject(project);
    onComplete();
  };

  const storyStyles = [
    {
      value: 'voice_over',
      label: 'Voice Over',
      description: 'Documentary or story style with voice-over narration',
      icon: Mic,
      color: 'blue'
    },
    {
      value: 'intelligent_mix',
      label: 'Intelligent Mix',
      description: 'AI adds voice/dialogue where needed (Rescue/Cartoon style)',
      icon: Sparkles,
      color: 'purple'
    },
    {
      value: 'no_voice',
      label: 'No Voice',
      description: 'Only visuals (Cinematic style)',
      icon: MicOff,
      color: 'slate'
    }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Project</h1>
        <p className="text-slate-600">Set up your video generation project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Awesome Video"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of your video"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Generation Mode *</label>
            <select
              value={formData.generation_mode}
              onChange={(e) => setFormData({ ...formData, generation_mode: e.target.value as GenerationMode })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
            >
              <option value="full_ai_auto">Full AI Auto - Generate complete story from plot/summary</option>
              <option value="manual_scene_split">Manual Scene Split - Pre-split scenes (advanced)</option>
              <option value="raw_text_split">Raw Text Split - 100% exact script (no AI optimization)</option>
              <option value="video_to_scene">Video to Scene - Clone existing video</option>
            </select>
          </div>

          {formData.generation_mode !== 'video_to_scene' ? (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Story Content *</label>
              <textarea
                value={formData.input_text}
                onChange={(e) => setFormData({ ...formData, input_text: e.target.value })}
                placeholder="Enter your story plot, summary, or full script..."
                rows={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition resize-none"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Video URL *</label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Story Style</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {storyStyles.map((style) => {
              const Icon = style.icon;
              const isSelected = formData.story_style === style.value;
              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, story_style: style.value as StoryStyle })}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    isSelected
                      ? `border-${style.color}-600 bg-${style.color}-50`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isSelected ? `text-${style.color}-600` : 'text-slate-400'}`} />
                  <h4 className="font-semibold text-slate-900 mb-1">{style.label}</h4>
                  <p className="text-xs text-slate-600">{style.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Aspect Ratio</h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, aspect_ratio: 'landscape' })}
              className={`p-4 rounded-lg border-2 transition ${
                formData.aspect_ratio === 'landscape'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Maximize className={`w-6 h-6 mb-2 ${formData.aspect_ratio === 'landscape' ? 'text-slate-900' : 'text-slate-400'}`} />
              <h4 className="font-semibold text-slate-900 mb-1">Landscape (16:9)</h4>
              <p className="text-xs text-slate-600">YouTube, horizontal videos</p>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, aspect_ratio: 'portrait' })}
              className={`p-4 rounded-lg border-2 transition ${
                formData.aspect_ratio === 'portrait'
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Smartphone className={`w-6 h-6 mb-2 ${formData.aspect_ratio === 'portrait' ? 'text-slate-900' : 'text-slate-400'}`} />
              <h4 className="font-semibold text-slate-900 mb-1">Portrait (9:16)</h4>
              <p className="text-xs text-slate-600">Shorts, Reels, TikTok</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Additional Options</h3>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.exact_voice_over}
              onChange={(e) => setFormData({ ...formData, exact_voice_over: e.target.checked })}
              className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
            />
            <div>
              <span className="font-medium text-slate-900">Exact Voice Over (Do not change anywhere)</span>
              <p className="text-sm text-slate-600">AI will not modify your script at all</p>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.intelligence_mode}
              onChange={(e) => setFormData({ ...formData, intelligence_mode: e.target.checked })}
              className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
            />
            <div>
              <span className="font-medium text-slate-900">Video Intelligence Mode</span>
              <p className="text-sm text-slate-600">100% accuracy for Shorts/Reels (takes 5 min longer)</p>
            </div>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.add_background_music}
              onChange={(e) => setFormData({ ...formData, add_background_music: e.target.checked })}
              className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-500"
            />
            <div className="flex items-center">
              <Music className="w-4 h-4 mr-2 text-slate-600" />
              <span className="font-medium text-slate-900">Add Background Music</span>
            </div>
          </label>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-semibold text-lg"
          >
            <Video className="w-5 h-5" />
            <span>Create Project</span>
          </button>
        </div>
      </form>
    </div>
  );
}
