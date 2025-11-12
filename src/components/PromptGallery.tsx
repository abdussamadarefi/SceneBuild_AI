import { useState } from 'react';
import { Sparkles, Copy, Check, Tag } from 'lucide-react';

interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  prompt: string;
  visualPrompt: string;
  tags: string[];
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: '1',
    title: 'Cinematic Hero Shot',
    category: 'Cinematic',
    prompt: 'A cinematic hero shot with dramatic lighting, shallow depth of field, golden hour ambiance',
    visualPrompt: 'Medium shot of protagonist, backlit by warm sunlight, lens flare, cinematic color grading, professional cinematography',
    tags: ['cinematic', 'dramatic', 'hero']
  },
  {
    id: '2',
    title: 'Documentary Style',
    category: 'Documentary',
    prompt: 'Professional documentary style with natural lighting, authentic atmosphere, observational camera work',
    visualPrompt: 'Handheld camera, natural lighting, real environment, authentic moments, documentary cinematography',
    tags: ['documentary', 'realistic', 'natural']
  },
  {
    id: '3',
    title: '3D Animated Character',
    category: 'Animation',
    prompt: 'High-quality 3D animation with expressive characters, vibrant colors, smooth motion',
    visualPrompt: 'Pixar-style 3D character, expressive facial animation, vibrant color palette, professional rendering, smooth motion blur',
    tags: ['3D', 'animation', 'cartoon']
  },
  {
    id: '4',
    title: 'Dramatic Action Scene',
    category: 'Action',
    prompt: 'Fast-paced action scene with dynamic camera movement, high energy, intense atmosphere',
    visualPrompt: 'Dynamic action shot, fast camera movement, motion blur, dramatic lighting, intense atmosphere, cinematic framing',
    tags: ['action', 'dynamic', 'intense']
  },
  {
    id: '5',
    title: 'Nature Documentary',
    category: 'Nature',
    prompt: 'Beautiful nature cinematography with wildlife, stunning landscapes, natural lighting',
    visualPrompt: 'Wildlife close-up, natural habitat, golden hour lighting, shallow depth of field, nature documentary style',
    tags: ['nature', 'wildlife', 'documentary']
  },
  {
    id: '6',
    title: 'Sci-Fi Futuristic',
    category: 'Sci-Fi',
    prompt: 'Futuristic sci-fi scene with advanced technology, neon lighting, cyberpunk aesthetic',
    visualPrompt: 'Futuristic cityscape, neon lights, holographic displays, advanced technology, cyberpunk atmosphere, cinematic composition',
    tags: ['sci-fi', 'futuristic', 'cyberpunk']
  },
  {
    id: '7',
    title: 'Horror Suspense',
    category: 'Horror',
    prompt: 'Suspenseful horror scene with dark atmosphere, eerie lighting, tension building',
    visualPrompt: 'Dark atmospheric shot, dramatic shadows, dim lighting, eerie ambiance, suspenseful composition, horror cinematography',
    tags: ['horror', 'suspense', 'dark']
  },
  {
    id: '8',
    title: 'Comedy Sitcom',
    category: 'Comedy',
    prompt: 'Light-hearted comedy scene with bright lighting, cheerful atmosphere, sitcom style',
    visualPrompt: 'Bright evenly-lit scene, cheerful colors, sitcom framing, multi-camera setup style, comedic timing',
    tags: ['comedy', 'sitcom', 'cheerful']
  },
  {
    id: '9',
    title: 'Historical Drama',
    category: 'Drama',
    prompt: 'Period drama scene with authentic costumes, historical setting, dramatic lighting',
    visualPrompt: 'Historical setting, period-accurate costumes, dramatic lighting, cinematic composition, costume drama style',
    tags: ['historical', 'drama', 'period']
  },
  {
    id: '10',
    title: 'Music Video Style',
    category: 'Music',
    prompt: 'Creative music video style with artistic visuals, dynamic editing, stylized cinematography',
    visualPrompt: 'Artistic music video shot, creative lighting, stylized color grading, dynamic composition, artistic cinematography',
    tags: ['music video', 'artistic', 'stylized']
  }
];

const CATEGORIES = ['All', 'Cinematic', 'Documentary', 'Animation', 'Action', 'Nature', 'Sci-Fi', 'Horror', 'Comedy', 'Drama', 'Music'];

export function PromptGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredPrompts = selectedCategory === 'All'
    ? PROMPT_TEMPLATES
    : PROMPT_TEMPLATES.filter(p => p.category === selectedCategory);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
          <Sparkles className="w-8 h-8 mr-3 text-yellow-500" />
          Prompt Gallery
        </h1>
        <p className="text-slate-600">Pre-made prompts for high-quality video generation</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedCategory === category
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrompts.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{template.title}</h3>
                <span className="text-sm text-slate-500 font-medium">{template.category}</span>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                Premium
              </span>
            </div>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Story Prompt:</label>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{template.prompt}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Visual Prompt (Veo 3):</label>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{template.visualPrompt}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {template.tags.map((tag) => (
                <span key={tag} className="flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(template.prompt, `${template.id}-prompt`)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium"
              >
                {copiedId === `${template.id}-prompt` ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>

              <button
                onClick={() => copyToClipboard(template.visualPrompt, `${template.id}-visual`)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                {copiedId === `${template.id}-visual` ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Visual</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
