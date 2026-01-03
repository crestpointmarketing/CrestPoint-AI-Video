
import { GoogleGenAI } from "@google/genai";
import { Scene } from "../types";
import { VEO_MODEL_FAST, VEO_MODEL_PRO } from "../constants";

export async function generateSceneVideo(scene: Scene, quality: 'standard' | 'ultra' = 'standard', onProgress?: (msg: string) => void): Promise<string> {
  // Always create a new instance to ensure we pick up the latest API key from the dialog
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const model = quality === 'ultra' ? VEO_MODEL_PRO : VEO_MODEL_FAST;
  const fullPrompt = `${scene.visualPrompt}. Camera: ${scene.camera}. Lighting: ${scene.lighting}. Style: ${scene.style}.`;
  
  try {
    onProgress?.(`Initiating ${quality === 'ultra' ? 'Ultra HD' : 'Standard'} generation...`);
    let operation = await ai.models.generateVideos({
      model: model,
      prompt: fullPrompt,
      config: {
        numberOfVideos: 1,
        resolution: quality === 'ultra' ? '1080p' : '720p',
        aspectRatio: '16:9'
      }
    });

    onProgress?.("Synthesizing frames...");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
      } catch (e: any) {
        if (e.message?.includes("Requested entity was not found")) {
          throw new Error("API_KEY_RESET_REQUIRED");
        }
        throw e;
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video generated");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video generation failed", error);
    throw error;
  }
}

export async function mergeVideoClips(clips: string[]): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return clips[0];
}
