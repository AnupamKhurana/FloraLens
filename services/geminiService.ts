import { GoogleGenAI, Type } from "@google/genai";
import { PlantInfo, ChatMessage } from "../types";

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
    // Construct the chat history for the API
    // The SDK's chat management is great, but for simple stateless-ish requests or custom history management
    // inside React state, we can also just use generateContent with the history formatted, 
    // OR use the chat API. Let's use the proper Chat API.
    
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
