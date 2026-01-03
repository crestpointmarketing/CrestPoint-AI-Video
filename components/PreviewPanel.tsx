
import React, { useState, useEffect, useRef } from 'react';
import { VideoProject, Scene } from '../types';

interface PreviewPanelProps {
  project: VideoProject | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'stats'>('preview');
  const [showWhySlow, setShowWhySlow] = useState(false);
  const [currentPlayingIdx, setCurrentPlayingIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const scenes = project?.storyboard?.scenes || [];
  const completedScenes = scenes.filter(s => s.status === 'completed');
  const totalScenes = scenes.length;
  const progress = totalScenes > 0 ? (completedScenes.length / totalScenes) * 100 : 0;

  // Handle sequential playback of multiple clips
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (completedScenes.length > 1) {
        setCurrentPlayingIdx((prev) => (prev + 1) % completedScenes.length);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [completedScenes.length]);

  // If a new scene is completed and we aren't playing anything, start it
  useEffect(() => {
    if (completedScenes.length > 0 && !videoRef.current?.src) {
      setCurrentPlayingIdx(0);
    }
  }, [completedScenes.length]);

  const currentVideoUrl = completedScenes[currentPlayingIdx]?.videoUrl;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
        <div className="w-24 h-24 bg-slate-800/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-400">Video Preview</h3>
        <p className="text-sm mt-2 max-w-xs">Complete the storyboard and click "Generate Video" to see the magic happen.</p>
      </div>
    );
  }

  const handleDownload = () => {
    // In sequence mode, we'd ideally zip these or provide the final merged one.
    // For now, we download the current clip or the "final" project URL if merged.
    const url = project.finalVideoUrl || currentVideoUrl;
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `VeoScript_Studio_${project.id}_Scene_${currentPlayingIdx + 1}.mp4`;
      a.click();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex bg-slate-800/50 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'preview' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preview
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'stats' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Timeline
          </button>
        </div>
        {(project.status === 'ready' || completedScenes.length > 0) && (
          <button 
            onClick={handleDownload}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg font-medium transition-all"
          >
            Download {completedScenes.length > 1 ? 'Current Clip' : 'Video'}
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative group shadow-2xl custom-glow">
          {completedScenes.length > 0 ? (
            <>
              <video 
                key={currentVideoUrl} // Key forces re-render/reload on URL change
                ref={videoRef}
                src={currentVideoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                Playing Scene {currentPlayingIdx + 1} / {completedScenes.length}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4">
              {project.status === 'generating' ? (
                <>
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-indigo-400 font-medium animate-pulse">Rendering Cinematic Frames...</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Scene {completedScenes.length + 1} of {totalScenes}</p>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-600 px-10">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium">Ready to produce</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 tracking-widest">
              <span>Production Progress ({completedScenes.length}/{totalScenes} clips)</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl space-y-3">
             <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Wait Times</h4>
                <button 
                  onClick={() => setShowWhySlow(!showWhySlow)}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  {showWhySlow ? 'Hide' : 'Why does this take long?'}
                </button>
             </div>
             
             {showWhySlow ? (
               <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                 Video generation is computationally expensive. To reach your requested {project.config.duration}s duration, the AI generates {totalScenes} separate high-fidelity clips. Each one requires thousands of specialized GPU calculations to maintain detail and motion.
               </p>
             ) : (
               <div className="flex gap-4">
                 <div className="flex-1">
                   <span className="text-[10px] text-slate-500 block uppercase">Target Length</span>
                   <span className="text-xs font-medium text-slate-300">{project.config.duration}s Total</span>
                 </div>
                 <div className="flex-1">
                   <span className="text-[10px] text-slate-500 block uppercase">Format</span>
                   <span className="text-xs font-medium text-slate-300">16:9 Sequence</span>
                 </div>
               </div>
             )}
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4 flex gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[10px] text-indigo-300/80 leading-snug">
              VeoScript Studio plays clips back-to-back as they are ready. Once all scenes are green, the full video timeline is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
