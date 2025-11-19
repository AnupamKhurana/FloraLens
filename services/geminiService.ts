
import { GoogleGenAI, Type } from "@google/genai";
import { PlantInfo, ChatMessage, AILanguageModel } from "../types";

// Using gemini-3-pro-preview as requested for complex reasoning and image analysis
const MODEL_NAME = "gemini-3-pro-preview";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in the environment");
  }
  return new GoogleGenAI({ apiKey });
};

export const identifyPlant = async (base64Image: string, mimeType: string): Promise<PlantInfo> => {
  const ai = getAiClient();
  
  const prompt = `Identify this plant from the image. Provide detailed care instructions. 
  Return the result as a structured JSON object exactly matching the schema provided. 
  Ensure 'petFriendly' is a boolean indicating if it is safe for cats and dogs.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commonName: { type: Type.STRING },
            scientificName: { type: Type.STRING },
            description: { type: Type.STRING },
            petFriendly: { type: Type.BOOLEAN },
            funFact: { type: Type.STRING },
            careInstructions: {
              type: Type.OBJECT,
              properties: {
                water: { type: Type.STRING },
                light: { type: Type.STRING },
                soil: { type: Type.STRING },
                humidity: { type: Type.STRING },
                temperature: { type: Type.STRING },
              },
              required: ["water", "light", "soil", "humidity", "temperature"],
            },
          },
          required: ["commonName", "scientificName", "description", "careInstructions", "petFriendly", "funFact"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from API");
    
    return JSON.parse(text) as PlantInfo;
  } catch (error) {
    console.error("Error identifying plant:", error);
    throw error;
  }
};

// --- Local AI (Edge) Capabilities ---

export const checkLocalAICapability = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.ai) return false;
  try {
    const capabilities = await window.ai.languageModel.capabilities();
    return capabilities.available === 'readily';
  } catch (e) {
    return false;
  }
};

export const createLocalSession = async (context?: PlantInfo): Promise<AILanguageModel> => {
  if (!window.ai) throw new Error("Local AI not supported");

  let systemInstruction = "You are FloraLens, an expert botanist and gardening assistant. You are helpful, friendly, and concise.";
  
  if (context) {
    systemInstruction += ` The user is currently looking at a plant identified as ${context.commonName} (${context.scientificName}). 
    Here are its details: Description: ${context.description}. 
    Care: Water - ${context.careInstructions.water}, Light - ${context.careInstructions.light}. 
    Pet Friendly: ${context.petFriendly}.
    Use this context to answer specific questions about this plant.`;
  }

  return await window.ai.languageModel.create({
    systemPrompt: systemInstruction
  });
};

// --- Offline Identification Flow (Hybrid: MediaPipe Vision -> Local LLM Text) ---

export const identifyPlantLocal = async (detectedLabels: string[]): Promise<PlantInfo> => {
  if (!window.ai) {
    throw new Error("Local AI is required for offline mode to generate plant details.");
  }

  const labelsStr = detectedLabels.join(", ");
  console.log("Offline identified labels:", labelsStr);

  // Create a specialized session for generating JSON structure
  const session = await window.ai.languageModel.create({
    systemPrompt: "You are a botanist. You receive a list of possible plant image labels. Identify the most likely plant and generate a detailed JSON response."
  });

  // We prompt the local LLM to fill in the data based on the MediaPipe label
  const prompt = `The image classifier detected these objects: "${labelsStr}". 
  Based on this, assume the most likely plant.
  Provide a strictly valid JSON object with the following fields:
  {
    "commonName": "string",
    "scientificName": "string",
    "description": "short description",
    "petFriendly": boolean,
    "funFact": "string",
    "careInstructions": {
      "water": "string",
      "light": "string",
      "soil": "string",
      "humidity": "string",
      "temperature": "string"
    }
  }
  Do not include markdown formatting. Return only the JSON.`;

  try {
    const result = await session.prompt(prompt);
    // Clean up response if the local model includes markdown blocks
    const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(jsonStr) as PlantInfo;
    session.destroy();
    return data;
  } catch (e) {
    session.destroy();
    console.error("Local AI generation failed:", e);
    throw new Error("Could not generate plant details offline.");
  }
};

// --- Cloud Chat Fallback ---

export const sendChatMessage = async (
  history: ChatMessage[], 
  newMessage: string,
  context?: PlantInfo
): Promise<string> => {
  const ai = getAiClient();
  
  let systemInstruction = "You are FloraLens, an expert botanist and gardening assistant. You are helpful, friendly, and concise.";
  
  if (context) {
    systemInstruction += ` The user is currently looking at a plant identified as ${context.commonName} (${context.scientificName}). 
    Here are its details: ${JSON.stringify(context)}. Use this context to answer specific questions about this plant.`;
  }

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};
