import { VertexAI } from "@google-cloud/vertexai";
import { TRAVEL_SYSTEM_PROMPT } from "./gemini";

/**
 * Vertex AI initialization for server-side use.
 * Leverages Google Cloud's enterprise-grade AI infrastructure.
 */
const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const location = "us-central1";

const vertexAI = project ? new VertexAI({ project, location }) : null;

/**
 * Gets a generative model instance from Vertex AI.
 * 
 * @param modelName - The name of the model to use (default: "gemini-1.5-flash").
 * @returns The generative model instance.
 */
export function getVertexModel(modelName: string = "gemini-1.5-flash") {
  if (!vertexAI) return null;
  return vertexAI.getGenerativeModel({
    model: modelName,
    systemInstruction: {
      role: "system",
      parts: [{ text: TRAVEL_SYSTEM_PROMPT }],
    },
  });
}

/**
 * Generates content using Vertex AI.
 * 
 * @param prompt - The user prompt.
 * @returns The generation result.
 */
export async function generateVertexContent(prompt: string) {
  const model = getVertexModel();
  if (!model) return null;
  return model.generateContent(prompt);
}
