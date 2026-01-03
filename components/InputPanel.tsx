
import React, { useState } from 'react';
import { StylePreset, VideoProject } from '../types';
import { DURATION_OPTIONS, STYLE_PRESETS, EXAMPLES } from '../constants';

interface InputPanelProps {
  onGenerate: (text: string, duration: number, style: string, quality: 'standard' | 'ultra') => void;
  isLoading: boolean;
  onReset: () => void;
  history: VideoProject[];
  onReauth: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading, onReset, history, onReauth }) => {
  const [text, setText] = useState('');
  const [duration, setDuration] = useState(DURATION_OPTIONS[1]);
  const [style, setStyle] = useState<string>(STYLE_PRESETS[0]);
  const [quality, setQuality] = useState<'standard' | 'ultra'>('standard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onGenerate(text, duration, style, quality);
    }
  };

  const handleExampleClick = (example: string) => {
    setText(example);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-400 tracking-tight">VeoScript Studio</h1>
        <button 
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          New Project
        </button>
      </div>

      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl relative group">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Tier</span>
           <button onClick={onReauth} className="text-[9px] text-slate-500 hover:text-indigo-400 transition-colors underline decoration-dotted">Swap Key</button>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.48V22M11 21.48L12 22M13 21.48L12 22" />
              </svg>
           </div>
           <div>
              <p className="text-xs font-bold text-slate-200">Billing Active</p>
              <p className="text-[10px] text-slate-500">Ensure Project ID matches console.</p>
           </div>
        </div>
        
        {/* Tooltip on hover */}
        <div className="absolute top-full left-0 mt-2 w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
          Tip: If you see two projects with the same name, check the <code>gen-lang-client-ID</code> in Google Cloud Console.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">Describe your video idea</label>
          <textarea
            className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder-slate-600"
            placeholder="Describe your scene..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => handleExampleClick(ex.text)}
              className="text-[10px] py-2 px-3 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-lg text-slate-300 transition-all text-left"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Length</label>
            <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 min-w-[32px] py-2 text-xs font-medium rounded-lg transition-all ${
                    duration === d ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Production Quality</label>
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setQuality('standard')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  quality === 'standard' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Standard (720p)
              </button>
              <button
                type="button"
                onClick={() => setQuality('ultra')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                  quality === 'ultra' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Ultra (1080p)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Style Preset</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            >
              {STYLE_PRESETS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all shadow-lg ${
            isLoading || !text.trim()
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 shadow-xl'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Storyboard...
            </span>
          ) : 'Generate Storyboard'}
        </button>
      </form>

      {history.length > 0 && (
        <div className="pt-8 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Version History</h3>
          <div className="space-y-3">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="p-3 bg-slate-800/50 rounded-lg text-xs hover:bg-slate-800 cursor-pointer transition-colors group">
                <p className="text-slate-300 font-medium line-clamp-1 mb-1">{h.originalText}</p>
                <div className="flex justify-between items-center text-slate-500">
                  <span>v{h.version} • {h.config.duration}s • {h.config.quality === 'ultra' ? 'HD' : 'SD'}</span>
                  <span className="group-hover:text-indigo-400 transition-colors">Load</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputPanel;
