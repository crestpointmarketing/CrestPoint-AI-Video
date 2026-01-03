
import { GoogleGenAI, Type } from "@google/genai";
import { Storyboard, Scene } from "../types";
import { STORYBOARD_MODEL } from "../constants";

export async function generateStoryboard(text: string, totalDuration: number, style: string): Promise<Storyboard> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Transform the following text into a professional video storyboard for a ${totalDuration} second video in ${style} style.
    
    Text Input: "${text}"
    
    Rules:
    - Return valid JSON only.
    - Each scene duration must be exactly 4, 6, or 8 seconds.
    - Sum of all scene durations must be exactly ${totalDuration} seconds.
    - visualPrompt should be optimized for a video generation model (Veo 3), high detail.
    - Camera movements should be cinematic.
    
    Format:
    {
      "title": "string",
      "totalDurationSec": ${totalDuration},
      "scenes": [
        {
          "id": "scene-1",
          "order": 1,
          "durationSec": number (4, 6, or 8),
          "visualPrompt": "detailed description",
          "camera": "camera movement",
          "lighting": "lighting description",
          "style": "${style}",
          "negativePrompt": "text, watermark, logo, distortion"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: STORYBOARD_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            totalDurationSec: { type: Type.NUMBER },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  order: { type: Type.NUMBER },
                  durationSec: { type: Type.NUMBER },
                  visualPrompt: { type: Type.STRING },
                  camera: { type: Type.STRING },
                  lighting: { type: Type.STRING },
                  style: { type: Type.STRING },
                  negativePrompt: { type: Type.STRING }
                },
                required: ["id", "order", "durationSec", "visualPrompt", "camera", "lighting", "style", "negativePrompt"]
              }
            }
          },
          required: ["title", "totalDurationSec", "scenes"]
        }
      }
    });

    const storyboard = JSON.parse(response.text) as Storyboard;
    return storyboard;
  } catch (error) {
    console.error("Storyboard generation failed", error);
    throw error;
  }
}
