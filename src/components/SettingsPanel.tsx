import { X, Key, Settings as SettingsIcon } from 'lucide-react';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-6 h-6 text-slate-700" />
            <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2" />
              API Configuration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Get your free API key from Google AI Studio (300 credits = 500+ videos)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Model Selection
                </label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition">
                  <option value="2.5-pro">Gemini 2.5 Pro (Recommended - Best quality)</option>
                  <option value="ultrafast">Gemini UltraFast (Faster, lower quality)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Veo 3 Accounts</h3>
            <p className="text-sm text-slate-600 mb-4">
              Add multiple Flow accounts for batch processing (5+ recommended)
            </p>
            <button className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium">
              + Add Flow Account
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Veo 3 Generation Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quality Mode
                </label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition">
                  <option value="fast">Fast (Default - Saves credits)</option>
                  <option value="quality">Quality (Higher quality, more time)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Display Size
                </label>
                <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition">
                  <option value="default">Default (Recommended)</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4k">4K</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Default Duration
                </label>
                <input
                  type="number"
                  defaultValue={8}
                  min={1}
                  max={30}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Veo 3 default: 8 seconds (recommended)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-semibold"
            >
              Save Settings
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
