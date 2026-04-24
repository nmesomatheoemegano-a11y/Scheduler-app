import { GoogleGenAI, Type } from "@google/genai";
import { StudyTask } from "../types.ts";

export async function adaptSchedule(currentTasks: StudyTask[], userGoals: string): Promise<{ suggestion: string, updatedTasks: StudyTask[] }> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return { 
      suggestion: "API Key not found. Please ensure your environment is configured correctly.", 
      updatedTasks: currentTasks 
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    You are an expert MCAT Study Coach. 
    Current Schedule: ${JSON.stringify(currentTasks)}
    User Input: ${userGoals}
    
    Tasks:
    - If the user is behind, move uncompleted tasks to future days.
    - If the user wants to focus on a specific subject, add new tasks for that subject.
    - Ensure a balanced workload (max 4-5 tasks per day).
    - Provide a supportive encouragement message.
    
    CRITICAL: The 'date' field must be in YYYY-MM-DD format.
    
    Return the response in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING, description: "A message to the student" },
            updatedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  section: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN },
                  date: { type: Type.STRING, description: "YYYY-MM-DD format" },
                  duration: { type: Type.STRING }
                },
                required: ["id", "title", "section", "completed", "date", "duration"]
              }
            }
          },
          required: ["suggestion", "updatedTasks"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data;
  } catch (e) {
    console.error("Failed to parse AI response or fetch content", e);
    return { 
      suggestion: "I had trouble updating the schedule. Please check your connection and try again!", 
      updatedTasks: currentTasks 
    };
  }
}