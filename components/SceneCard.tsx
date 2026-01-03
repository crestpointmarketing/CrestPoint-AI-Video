
import React from 'react';
import { Scene } from '../types';

interface SceneCardProps {
  scene: Scene;
  onUpdate: (scene: Scene) => void;
  onRegenerate: (id: string) => void;
  disabled: boolean;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onUpdate, onRegenerate, disabled }) => {
  const getStatusColor = () => {
    switch (scene.status) {
      case 'generating': return 'bg-indigo-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-slate-700';
    }
  };

  return (
    <div className={`bg-slate-900 border rounded-2xl overflow-hidden transition-all ${
      scene.status === 'failed' ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-slate-800 hover:border-slate-700'
    }`}>
      <div className="p-4 flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
            {scene.order}
          </div>
          <div className={`w-1 flex-1 rounded-full ${getStatusColor()}`} />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-tighter bg-slate-800 px-2 py-0.5 rounded text-indigo-400">
                {scene.durationSec}s
              </span>
              <span className="text-xs font-medium text-slate-500 truncate max-w-[150px]">{scene.camera}</span>
            </div>
            {(scene.status === 'completed' || scene.status === 'failed') && (
              <button 
                onClick={() => onRegenerate(scene.id)}
                disabled={disabled}
                className={`text-xs font-medium transition-colors disabled:opacity-50 ${
                  scene.status === 'failed' ? 'text-red-400 hover:text-red-300' : 'text-indigo-400 hover:text-indigo-300'
                }`}
              >
                {scene.status === 'failed' ? 'Try Again' : 'Regenerate'}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <textarea
              className="w-full bg-transparent border-none p-0 text-sm text-slate-200 focus:ring-0 outline-none resize-none min-h-[60px]"
              value={scene.visualPrompt}
              onChange={(e) => onUpdate({ ...scene, visualPrompt: e.target.value })}
              placeholder="Visual description..."
              disabled={disabled || scene.status === 'generating'}
            />
          </div>

          {scene.status === 'generating' && (
            <div className="pt-2">
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 animate-progress-indeterminate" style={{ width: '40%' }} />
              </div>
              <p className="text-[10px] text-indigo-400 mt-1 animate-pulse">Veo 3 is generating this clip...</p>
            </div>
          )}

          {scene.status === 'failed' && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
               <p className="text-[10px] text-red-400 leading-relaxed">
                <strong>Error:</strong> {scene.error}
               </p>
            </div>
          )}

          {scene.status === 'completed' && scene.videoUrl && (
            <div className="relative group aspect-video rounded-xl overflow-hidden bg-black border border-slate-800">
              <video 
                src={scene.videoUrl} 
                className="w-full h-full object-cover" 
                controls
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SceneCard;
