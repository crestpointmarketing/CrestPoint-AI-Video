
import { StylePreset } from './types';

export const DURATION_OPTIONS = [8, 16, 24, 32, 48, 64];

export const STYLE_PRESETS = [
  StylePreset.Cinematic,
  StylePreset.Corporate,
  StylePreset.Futuristic,
  StylePreset.Minimal,
  StylePreset.Documentary
];

export const EXAMPLES = [
  {
    label: 'Product Ad',
    text: 'A high-end smartwatch rotating in space, showing luxury materials and sleek digital interfaces. Cyberpunk neon city lights reflected in the glass.'
  },
  {
    label: 'Explainer',
    text: 'A friendly animated character explaining complex cloud computing concepts using glowing abstract blocks and flowing data streams.'
  },
  {
    label: 'Corporate Intro',
    text: 'Modern architectural glass building at sunset, clean lines, professional atmosphere, drone flying through a bright lobby.'
  },
  {
    label: 'Documentary',
    text: 'Wide shots of a dense tropical rainforest with mist rolling over the mountains, close-ups of exotic flowers and sunlight breaking through leaves.'
  }
];

export const VEO_MODEL_FAST = 'veo-3.1-fast-generate-preview';
export const VEO_MODEL_PRO = 'veo-3.1-generate-preview';
export const STORYBOARD_MODEL = 'gemini-3-pro-preview';
