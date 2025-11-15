import { GoogleGenAI, Type } from '@google/genai';
import type { VideoData, AnalysisResult, ApiConfig } from '../types';
import { scoringSchema, outputExample } from './scoringSchema';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    total_score: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.NUMBER },
        max: { type: Type.NUMBER },
        percent: { type: Type.NUMBER },
        grade: { type: Type.STRING },
        summary: { type: Type.STRING },
      },
       required: ["value", "max", "percent", "grade", "summary"]
    },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          score: {
            type: Type.OBJECT,
            properties: {
              value: { type: Type.NUMBER },
              max: { type: Type.NUMBER },
              percent_of_category: { type: Type.NUMBER },
            },
            required: ["value", "max", "percent_of_category"]
          },
          summary: { type: Type.STRING },
          subcriteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                score: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    max: { type: Type.NUMBER },
                    min: { type: Type.NUMBER }, // Optional
                  },
                   required: ["value", "max"]
                },
                explanation: { type: Type.STRING },
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
               required: ["id", "label", "score", "explanation", "suggestions"]
            },
          },
        },
        required: ["id", "label", "score", "summary", "subcriteria"]
      },
    },
    recommendations: {
      type: Type.OBJECT,
      properties: {
        priority_order: { type: Type.ARRAY, items: { type: Type.STRING } },
        quick_wins: { type: Type.ARRAY, items: { type: Type.STRING } },
        // The 'by_category' field is intentionally omitted from the schema
        // because its dynamic keys (category IDs) are not compatible with a
        // fixed property definition, which caused a validation error.
        // The model will still generate this field based on the provided
        // 'outputExample' in the prompt.
      },
       required: ["priority_order", "quick_wins"]
    },
  },
  required: ["total_score", "categories", "recommendations"]
};


export const analyzeVideoContent = async (videoData: VideoData, thumbnailBase64: string | null, config: ApiConfig): Promise<AnalysisResult> => {
  if (config.provider === 'openai') {
      throw new Error("OpenAI provider is not yet implemented.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as an expert YouTube SEO analyst. Your name is ClearCue.
    Your task is to analyze the provided YouTube video data based STRICTLY on the following JSON scoring schema.
    You must return a single, valid JSON object that follows the structure of the provided "OUTPUT EXAMPLE".
    All text (summaries, explanations, suggestions, etc.) must be in Vietnamese.

    ---
    SCORING SCHEMA (Use this as your rulebook):
    ${JSON.stringify(scoringSchema, null, 2)}
    ---

    ---
    OUTPUT EXAMPLE (Your response MUST perfectly match this structure):
    ${JSON.stringify(outputExample, null, 2)}
    ---

    VIDEO DATA TO ANALYZE:
    - Title: ${videoData.title}
    - Description: ${videoData.description}
    - Tags: ${videoData.tags}
    - Transcript Snippet: ${videoData.transcript}
    - ASSUMED Video Length: Assume the video is over 10 minutes long (e.g., 720 seconds) for rules related to chapters/timestamps unless the transcript or description suggests otherwise.

    THUMBNAIL:
    ${thumbnailBase64 ? "[An image is provided for visual context. Analyze it for general themes but focus your scoring on the text metadata according to the schema.]" : "[No image provided]"}

    Now, perform the analysis and generate the JSON output. Do not include any text or markdown formatting before or after the JSON object.
  `;
  
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [];

  parts.push({ text: prompt });

  if (thumbnailBase64) {
    parts.unshift({ // Add image first for better performance in some models
        inlineData: {
          mimeType: 'image/jpeg',
          data: thumbnailBase64,
        },
      });
  }

  const response = await ai.models.generateContent({
    model: config.model,
    contents: { parts: parts },
    config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    }
  });

  const jsonString = response.text.trim();

  try {
    const result: AnalysisResult = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("Failed to parse Gemini response:", jsonString, error);
    throw new Error("Received invalid JSON format from the analysis service.");
  }
};