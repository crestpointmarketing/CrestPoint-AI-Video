
export interface Scene {
  id: string;
  order: number;
  durationSec: 4 | 6 | 8;
  visualPrompt: string;
  camera: string;
  lighting: string;
  style: string;
  negativePrompt: string;
  videoUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface Storyboard {
  title: string;
  totalDurationSec: number;
  scenes: Scene[];
}

export interface VideoProject {
  id: string;
  originalText: string;
  storyboard?: Storyboard;
  config: {
    duration: number;
    style: string;
    aspectRatio: '16:9';
    quality: 'standard' | 'ultra';
  };
  finalVideoUrl?: string;
  status: 'idle' | 'storyboarding' | 'generating' | 'ready';
  version: number;
}

export enum StylePreset {
  Cinematic = 'Cinematic',
  Corporate = 'Corporate',
  Futuristic = 'Futuristic',
  Minimal = 'Minimal',
  Documentary = 'Documentary'
}

export interface AppState {
  currentProject: VideoProject | null;
  history: VideoProject[];
  isDarkMode: boolean;
  isApiKeySelected: boolean;
}
