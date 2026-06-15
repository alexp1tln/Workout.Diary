import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getGemini() {
  if (!ai) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error("VITE_GEMINI_API_KEY is not defined in environment variables");
    }
    ai = new GoogleGenAI({
      apiKey: key,
    });
  }
  return ai;
}

export async function analyzeInBody(text: string, previousResults: string | null = null, fileData?: string, fileMimeType?: string) {
  const gemini = getGemini();
  const promptParts: any[] = [];
  
  promptParts.push({ 
    text: `I have uploaded my InBody results. Please interpret them for me. 
      Here are the details:
      ${text || "See attached file for InBody result."}
      ${previousResults ? `\nHere is my previous result for comparison:\n${previousResults}` : ""}
      
      Provide a sophisticated, encouraging but analytical response. Highlight changes, strengths, and areas to improve. Return the response in JSON format.
    ` 
  });

  if (fileData && fileMimeType) {
    promptParts.push({
      inlineData: {
        data: fileData,
        mimeType: fileMimeType
      }
    });
  }

  const response = await gemini.models.generateContent({
    model: "gemini-3.5-flash",
    contents: promptParts,
    config: {
      systemInstruction: "You are a professional personal trainer and nutritionist. Your tone is supportive, analytical, and respectful. Summarize results accurately. Respond in Russian.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          interpretation: {
            type: Type.STRING,
            description: "A detailed but concise interpretation of the InBody results in Russian. Tone should be elegant and motivating.",
          },
          comparison: {
            type: Type.STRING,
            description: "If previous results exist, compare them here. Otherwise, leave null or provide a message saying no comparison available.",
          },
          metricsSummary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                status: { type: Type.STRING, description: "e.g., Low, Normal, High, Optimal" }
              }
            }
          }
        },
        required: ["interpretation", "comparison", "metricsSummary"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini");
  }

  return JSON.parse(response.text);
}

export async function summarizeWorkout(workoutStats: any, goals: string) {
  const gemini = getGemini();
  const response = await gemini.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `I just finished a workout. Here are the stats:
      ${JSON.stringify(workoutStats)}
      
      My personal goals are: ${goals || "To be healthy and strong."}
      
      Estimate my total calorie burn based on these exercises, sets, weights, and reps. Then create a customized nutrition plan for today/tomorrow based on my goals. Output in JSON.`,
    config: {
      systemInstruction: "You are a professional athletic coach. Provide accurate calorie estimations and a precise, practical nutrition plan. Respond in Russian.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          estimatedCaloriesBurned: {
            type: Type.NUMBER,
            description: "The estimated number of calories burned."
          },
          summaryText: {
            type: Type.STRING,
            description: "An elegant, encouraging summary of the workout."
          },
          nutritionPlan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                mealName: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                macros: { type: Type.STRING }
              }
            }
          }
        },
        required: ["estimatedCaloriesBurned", "summaryText", "nutritionPlan"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Empty response from Gemini");
  }

  return JSON.parse(response.text);
}
