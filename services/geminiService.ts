import { GoogleGenAI, Type, Modality } from '@google/genai';
import type { VideoData, AnalysisResult, SeoSuggestion } from '../types';
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


export const analyzeVideoContent = async (
    videoData: VideoData, 
    thumbnailBase64: string | null, 
    geminiKey: string,
    model: string = 'gemini-2.5-flash' // Default model
): Promise<AnalysisResult> => {
  if (!geminiKey) {
    throw new Error("An API Key must be set when running in a browser");
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });

  const prompt = `
    Act as a deterministic, rule-based YouTube SEO scoring engine. Your name is ClearCue.
    Your primary function is to analyze the provided YouTube video data and calculate a score based STRICTLY on the rules defined in the SCORING SCHEMA.
    You MUST NOT be creative or subjective. Your output must be consistent for the same input. Follow the logic in the "scoring_bins" for each criterion precisely.
    You must return a single, valid JSON object that follows the structure of the provided "OUTPUT EXAMPLE".
    All text (summaries, explanations, suggestions, etc.) must be in Vietnamese.

    ---
    SCORING SCHEMA (This is your strict rulebook. Adhere to it precisely.):
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
    model: model,
    contents: { parts: parts },
    config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Make the output more deterministic and less "creative"
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

const suggestionsResponseSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: { type: Type.STRING },
            thumbnail_text: { type: Type.STRING },
            thumbnail_prompt: { type: Type.STRING },
        },
        required: ["title", "description", "tags", "thumbnail_text", "thumbnail_prompt"],
    },
};

export const getSeoSuggestions = async (
    videoData: VideoData,
    analysisResult: AnalysisResult,
    geminiKey: string,
    model: string = 'gemini-2.5-flash'
): Promise<SeoSuggestion[]> => {
    if (!geminiKey) {
        throw new Error("Gemini API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const prompt = `
    Act as an expert YouTube SEO strategist. Your task is to generate 5 distinct, highly optimized SEO packages for a YouTube video.
    You will be given the original video data, a detailed SEO analysis report, and the EXACT SCORING SCHEMA used for the analysis.
    Your goal is to create metadata packages that, if used, would achieve a score of 90/100 or higher according to the provided schema.
    All output must be in Vietnamese.

    ---
    CRITICAL SCORING SCHEMA (Your suggestions MUST follow these rules to maximize the score):
    ${JSON.stringify(scoringSchema, null, 2)}
    ---

    RULES:
    1.  **Primary Goal:** Every suggestion package you create must be designed to score at least 90/100 based on the SCORING SCHEMA above. For example, if the schema says the optimal title length is 35–70 characters, your suggested titles must be within this range. Address all weaknesses from the analysis report.
    2.  Generate EXACTLY 5 packages.
    3.  Each package MUST include: title, description, tags (comma-separated string), thumbnail_text (text to put on the thumbnail), and thumbnail_prompt (a DALL-E/Midjourney style prompt to generate the thumbnail image).
    4.  Base your suggestions on the weaknesses identified in the provided analysis report, using the scoring schema as your guide for improvement.
    5.  The output MUST be a valid JSON array of objects, strictly adhering to the provided schema. Do not include any text before or after the JSON array.

    ---
    EXISTING VIDEO DATA:
    - Title: ${videoData.title}
    - Description: ${videoData.description}
    - Tags: ${videoData.tags}
    - Transcript: ${videoData.transcript}

    ---
    EXISTING SEO ANALYSIS REPORT (This shows where the video is currently weak):
    - Overall Score: ${analysisResult.total_score.value}/${analysisResult.total_score.max}
    - Summary: ${analysisResult.total_score.summary}
    - Key Recommendations: ${analysisResult.recommendations.priority_order.join(', ')}

    ---
    Now, generate the 5 SEO packages as a JSON array, ensuring each one would score above 90/100 based on the provided SCORING SCHEMA.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [{ text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: suggestionsResponseSchema,
            temperature: 0.7, // Allow for some creativity in suggestions
        }
    });

    const jsonString = response.text.trim();
    try {
        const result: SeoSuggestion[] = JSON.parse(jsonString);
        if (result.length < 1) { // Check for at least one suggestion
            throw new Error(`Expected at least 1 suggestion, but received ${result.length}.`);
        }
        return result;
    } catch (error) {
        console.error("Failed to parse SEO suggestions from Gemini:", jsonString, error);
        throw new Error("Received invalid JSON format for SEO suggestions.");
    }
};


export const editThumbnailImage = async (
    base64ImageData: string,
    prompt: string,
    geminiKey: string
): Promise<string> => {
    if (!geminiKey) {
        throw new Error("Gemini API Key is not configured.");
    }
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData,
        },
    };

    const textPart = {
        text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    
    throw new Error("No image was generated by the model.");
};