
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { PanelShape, PanelPosition } from "../types";

/**
 * Generates a sacred art image optimized for the specific mockup shape and position.
 */
export async function generateSacredArt(
  prompt: string, 
  shape: PanelShape = 'square', 
  position: PanelPosition = 'center'
): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Contexto de otimização baseado na geometria do mockup
    let geometryContext = "";
    if (shape === 'circle') {
      geometryContext = "centralized radial composition, optimized for a circular frame, vignette edges";
    } else if (shape === 'oval') {
      geometryContext = "vertical elongated composition, focused central subject, optimized for an oval medallion format";
    } else {
      geometryContext = "balanced square composition, classical proportions";
    }

    // Contexto litúrgico baseado na posição
    const positionContext = position === 'top' ? "celestial, divine, glory" : 
                       position === 'center' ? "central devotional figure, high detail" : 
                       "supporting sacred symbols, meditative atmosphere";

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Sacred art, high-end devotional quality, classical oil painting: ${prompt}. 
            Context: ${positionContext}. 
            Technical Layout: ${geometryContext}. 
            Rich textures, gold leaf accents, sfumato technique, cinematic liturgical lighting.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: shape === 'oval' ? "3:4" : "1:1",
        },
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
