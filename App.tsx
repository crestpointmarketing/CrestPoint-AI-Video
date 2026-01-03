
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, VideoProject, Storyboard, Scene, StylePreset } from './types';
import { DURATION_OPTIONS, STYLE_PRESETS, EXAMPLES } from './constants';
import { generateStoryboard } from './services/geminiService';
import { generateSceneVideo, mergeVideoClips } from './services/veoService';
import InputPanel from './components/InputPanel';
import StoryboardPanel from './components/StoryboardPanel';
import PreviewPanel from './components/PreviewPanel';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentProject: null,
    history: [],
    isDarkMode: true,
    isApiKeySelected: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setState(prev => ({ ...prev, isApiKeySelected: hasKey }));
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setState(prev => ({ ...prev, isApiKeySelected: true }));
    setError(null);
  };

  const scrubError = (err: any): string => {
    const errStr = typeof err === 'string' ? err : err.message || JSON.stringify(err);
    
    // Check for 429 Quota errors specifically
    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('quota')) {
      return "QUOTA_ERROR";
    }

    // Attempt to extract message from JSON if it leaked through
    try {
      const match = errStr.match(/"message"\s*:\s*"([^"]+)"/);
      if (match && match[1]) return match[1];
    } catch (e) {}

    return errStr.replace(/^Error:\s*/, '');
  };

  const handleGenerateStoryboard = async (text: string, duration: number, style: string, quality: 'standard' | 'ultra' = 'standard') => {
    setIsLoading(true);
    setError(null);
    try {
      const storyboard = await generateStoryboard(text, duration, style);
      const newProject: VideoProject = {
        id: crypto.randomUUID(),
        originalText: text,
        storyboard,
        config: { duration, style, aspectRatio: '16:9', quality },
        status: 'idle',
        version: 1,
      };
      setState(prev => ({
        ...prev,
        currentProject: newProject,
        history: [newProject, ...prev.history]
      }));
    } catch (err: any) {
      const msg = scrubError(err);
      setError(msg === "QUOTA_ERROR" ? "Quota Limit Reached (Storyboard)" : "Storyboard Error: " + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!state.currentProject?.storyboard) return;

    const project = { ...state.currentProject };
    project.status = 'generating';
    setState(prev => ({ ...prev, currentProject: project }));

    const scenes = [...project.storyboard.scenes];
    const quality = project.config.quality;
    
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].status === 'completed') continue;

      try {
        scenes[i] = { ...scenes[i], status: 'generating', error: undefined };
        updateProjectScenes(scenes);

        const videoUrl = await generateSceneVideo(scenes[i], quality);
        scenes[i] = { ...scenes[i], status: 'completed', videoUrl };
      } catch (err: any) {
        if (err.message === "API_KEY_RESET_REQUIRED") {
          setError("API Session invalid. Please click 'Connect API Key' again.");
          setState(prev => ({ ...prev, isApiKeySelected: false }));
          return;
        }
        const msg = scrubError(err);
        if (msg === "QUOTA_ERROR") {
             setError("QUOTA_ERROR");
        }
        scenes[i] = { ...scenes[i], status: 'failed', error: msg === "QUOTA_ERROR" ? "Free Tier Limit Reached" : msg };
      }
      updateProjectScenes(scenes);
    }

    const allFinished = scenes.every(s => s.status === 'completed' || s.status === 'failed');
    const allSuccessful = scenes.every(s => s.status === 'completed');

    if (allFinished) {
      setState(prev => ({
        ...prev,
        currentProject: {
          ...prev.currentProject!,
          status: allSuccessful ? 'ready' : 'idle'
        }
      }));
    }
  };

  const updateProjectScenes = (scenes: Scene[]) => {
    setState(prev => ({
      ...prev,
      currentProject: {
        ...prev.currentProject!,
        storyboard: { ...prev.currentProject!.storyboard!, scenes: [...scenes] }
      }
    }));
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    if (!state.currentProject?.storyboard) return;
    const scenes = state.currentProject.storyboard.scenes.map(s => 
      s.id === updatedScene.id ? updatedScene : s
    );
    updateProjectScenes(scenes);
  };

  const handleRegenerateScene = async (sceneId: string) => {
    if (!state.currentProject?.storyboard) return;
    const scene = state.currentProject.storyboard.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    try {
      const updatedScene = { ...scene, status: 'generating' as const, videoUrl: undefined, error: undefined };
      handleUpdateScene(updatedScene);
      const url = await generateSceneVideo(updatedScene, state.currentProject.config.quality);
      handleUpdateScene({ ...updatedScene, status: 'completed', videoUrl: url });
    } catch (err: any) {
       const msg = scrubError(err);
       if (msg === "QUOTA_ERROR") setError("QUOTA_ERROR");
       handleUpdateScene({ ...scene, status: 'failed', error: msg === "QUOTA_ERROR" ? "Free Tier Limit Reached" : msg });
    }
  };

  return (
    <div className={`min-h-screen ${state.isDarkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-950'}`}>
      {!state.isApiKeySelected ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl custom-glow">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
               <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
               </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4 tracking-tight">Studio Access</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              To use <strong>Veo 3 Pro</strong>, you must link an API key from a billing-enabled Google Cloud Project.
            </p>
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
            >
              Connect API Key
            </button>
            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-[11px] text-slate-500 mb-2">Already Upgraded?</p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Make sure the API key you select is associated with your <strong>Paid Project</strong> in the <a href="https://aistudio.google.dev/app/apikey" target="_blank" className="text-indigo-400 underline">API Key Settings</a>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-12 h-screen overflow-hidden">
          <aside className="lg:col-span-3 border-r border-slate-800 bg-slate-900/50 backdrop-blur overflow-y-auto h-full">
            <InputPanel 
              onGenerate={handleGenerateStoryboard} 
              isLoading={isLoading} 
              onReset={() => setState(prev => ({ ...prev, currentProject: null }))}
              history={state.history}
              onReauth={handleOpenKeySelector}
            />
          </aside>

          <main className="lg:col-span-5 border-r border-slate-800 flex flex-col h-full bg-slate-950">
            <header className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Storyboard</h2>
                {state.currentProject?.storyboard && (
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-indigo-400 font-bold uppercase">
                      {state.currentProject.storyboard.totalDurationSec}s
                    </span>
                    <span className={`text-[10px] border px-2 py-0.5 rounded font-bold uppercase ${
                      state.currentProject.config.quality === 'ultra' 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                      : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                      {state.currentProject.config.quality}
                    </span>
                  </div>
                )}
              </div>
              {state.currentProject?.storyboard && state.currentProject.status !== 'generating' && (
                <button 
                  onClick={handleGenerateVideo}
                  className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/10"
                >
                  {state.currentProject.storyboard.scenes.some(s => s.status === 'failed') ? 'Retry Failed Scenes' : 'Generate Video'}
                </button>
              )}
            </header>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <StoryboardPanel 
                storyboard={state.currentProject?.storyboard}
                onUpdateScene={handleUpdateScene}
                onRegenerateScene={handleRegenerateScene}
                isGenerating={state.currentProject?.status === 'generating'}
              />
              {error === "QUOTA_ERROR" ? (
                <div className="mt-4 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm space-y-4 shadow-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="space-y-1">
                      <p className="font-bold">Wrong Project Selected (Free Tier Detected)</p>
                      <p className="text-xs opacity-80 leading-relaxed">
                        You are still connected to a Free Tier project. You likely have multiple projects with the same name.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-red-500/20">
                    <p className="text-[10px] font-bold uppercase mb-3 text-red-300">How to find the correct Project ID:</p>
                    <ol className="list-decimal list-inside text-[11px] space-y-2 text-slate-300">
                      <li>Go to <a href="https://console.cloud.google.com/billing/projects" target="_blank" className="text-white underline font-medium">Google Cloud Billing Projects</a>.</li>
                      <li>Find the project name that has a <strong>Billing Account</strong> listed (not "Disabled").</li>
                      <li>Copy the <strong>Project ID</strong> (e.g., <code>gen-lang-client-09659...</code>).</li>
                      <li>Click "Change API Key" below and select the one matching that ID.</li>
                    </ol>
                  </div>

                  <div className="pt-3 border-t border-red-500/10 flex gap-3">
                     <button 
                      onClick={handleOpenKeySelector}
                      className="w-full text-xs font-bold bg-white text-red-600 hover:bg-slate-100 px-4 py-3 rounded-lg transition-all shadow-lg"
                     >
                      Change API Key
                     </button>
                  </div>
                </div>
              ) : error && (
                <div className="mt-4 p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm flex items-start gap-3">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
              )}
            </div>
          </main>

          <section className="lg:col-span-4 flex flex-col h-full bg-slate-900/30">
            <PreviewPanel project={state.currentProject} />
          </section>
        </div>
      )}
    </div>
  );
};

export default App;
