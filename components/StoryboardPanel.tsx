
import React from 'react';
import { Storyboard, Scene } from '../types';
import SceneCard from './SceneCard';

interface StoryboardPanelProps {
  storyboard?: Storyboard;
  onUpdateScene: (scene: Scene) => void;
  onRegenerateScene: (sceneId: string) => void;
  isGenerating: boolean;
}

const StoryboardPanel: React.FC<StoryboardPanelProps> = ({ 
  storyboard, 
  onUpdateScene, 
  onRegenerateScene,
  isGenerating
}) => {
  if (!storyboard) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-10">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-slate-400 max-w-xs">Your storyboard will appear here once you describe your video idea.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-1">
        <h3 className="text-xl font-bold">{storyboard.title}</h3>
        <p className="text-sm text-slate-400">Timeline: {storyboard.scenes.length} scenes</p>
      </div>

      <div className="space-y-4">
        {storyboard.scenes.map((scene) => (
          <SceneCard 
            key={scene.id} 
            scene={scene} 
            onUpdate={onUpdateScene}
            onRegenerate={onRegenerateScene}
            disabled={isGenerating}
          />
        ))}
      </div>
    </div>
  );
};

export default StoryboardPanel;
