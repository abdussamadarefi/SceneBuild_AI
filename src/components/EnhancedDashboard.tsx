import { useState } from 'react';
import { Film, FolderKanban, Sparkles, Settings, HelpCircle, Plus } from 'lucide-react';
import { VideosGallery } from './VideosGallery';
import { PromptGallery } from './PromptGallery';
import { ProjectManager } from './ProjectManager';
import { NewProjectForm } from './NewProjectForm';
import { SettingsPanel } from './SettingsPanel';

type Tab = 'projects' | 'videos' | 'prompts' | 'new' | 'settings';

export function EnhancedDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [showSettings, setShowSettings] = useState(false);

  const tabs = [
    { id: 'projects' as Tab, label: 'Project Manager', icon: FolderKanban },
    { id: 'videos' as Tab, label: 'Videos', icon: Film },
    { id: 'prompts' as Tab, label: 'Prompt Gallery', icon: Sparkles },
    { id: 'new' as Tab, label: 'New Project', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">SceneBuild AI</h1>
              <p className="text-sm text-slate-600">Veo 3 Automation Platform</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition">
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </button>
            </div>
          </div>
        </div>

        <nav className="border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition border-b-2 ${
                      activeTab === tab.id
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      <main className="pb-12">
        {activeTab === 'projects' && <ProjectManager />}
        {activeTab === 'videos' && <VideosGallery />}
        {activeTab === 'prompts' && <PromptGallery />}
        {activeTab === 'new' && <NewProjectForm onComplete={() => setActiveTab('projects')} />}
      </main>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
