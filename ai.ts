import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentType } from './types';

// The API key is fetched from Vite's environment variables
// It should be provided in .env.local as VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Helper to check if AI is enabled (i.e., API key is present)
export const isAIEnabled = () => apiKey !== '';

// Lazily initialize the Google Generative AI client to avoid crashes when API key is not present
let genAI: GoogleGenerativeAI | null = null;
const getGenAI = () => {
  if (!genAI && isAIEnabled()) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface IntentAnalysisResult {
  type: 'CONVERSATION' | 'ACTION' | 'QUERY' | 'UNKNOWN';
  agent?: AgentType;
  action?: string;
  entity?: string;
  confidence: number;
}

/**
 * Analyzes the user's input to determine the intent, target agent, and any specific entities.
 * Returns a structured JSON object.
 */
export async function analyzeIntentWithAI(userInput: string, userRole: string): Promise<IntentAnalysisResult> {
  const aiClient = getGenAI();
  if (!aiClient) {
      throw new Error("Gemini API key is missing.");
  }

  const model = aiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an intent classification engine for a Supply Chain Orchestrator platform.
    The user (Role: ${userRole}) is asking a question or giving a command.

    You must classify the intent into one of these types:
    - CONVERSATION: General greetings, thanks, or small talk.
    - ACTION: Requests to run scans, audits, create reports, or perform an active task (e.g. "run anomaly scan").
    - QUERY: Requests for specific data, tracking, or domain knowledge (e.g., "Check status of SHP-1092", "How is procurement doing?").
    - UNKNOWN: Cannot determine the intent.

    If it is an ACTION or QUERY, you must also determine the responsible AgentType:
    - LPO (Planning/Inventory/Stock/Forecasting)
    - PROCUREMENT (Vendors/Spend/Sourcing)
    - LOGISTICS (Shipping/Transport/Tracking/Routes)
    - MANUFACTURING (Factory/Machine/OEE)
    - COMPLIANCE (ESG/ISO/Audits/Carbon)
    - RETURN (RMA/Reverse Logistics/Refunds)
    - DOCUMENT (Contracts/PDFs)
    - ORCHESTRATOR (General system scans or reports crossing multiple domains)

    If it is an ACTION, define the 'action' string (e.g., 'SYSTEM_SCAN', 'SCAN_AUDIT', 'GENERATE_REPORT').
    If it is a QUERY, define the 'entity' string (e.g., 'SHP-1092', 'SKU-001', 'VENDOR', 'GENERAL').

    Return ONLY a valid JSON object matching this structure:
    {
      "type": "CONVERSATION" | "ACTION" | "QUERY" | "UNKNOWN",
      "agent": "LPO" | "PROCUREMENT" | "LOGISTICS" | "MANUFACTURING" | "COMPLIANCE" | "RETURN" | "DOCUMENT" | "ORCHESTRATOR",
      "action": "action_string" | null,
      "entity": "entity_string" | null,
      "confidence": number (0 to 1)
    }

    User Input: "${userInput}"
  `;

  try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Remove markdown JSON formatting if present
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as IntentAnalysisResult;
  } catch (error) {
      console.error("Failed to analyze intent with AI:", error);
      // Fallback object in case of API failure or parsing error
      return { type: 'UNKNOWN', confidence: 0 };
  }
}

/**
 * Generates a conversational response based on the structured data context.
 * Enables streaming.
 */
export async function generateResponseStreamWithAI(
    intent: IntentAnalysisResult,
    userInput: string,
    contextData: string,
    onChunk: (text: string) => void
): Promise<string> {
   const aiClient = getGenAI();
   if (!aiClient) {
       throw new Error("Gemini API key is missing.");
   }

   const model = aiClient.getGenerativeModel({ model: "gemini-1.5-flash" });

   const prompt = `
      You are the intelligent Supply Chain Orchestrator Assistant.
      The user asked: "${userInput}"

      Based on the following system context and retrieved data, generate a helpful, concise, and professional response.
      Do not invent data. Only use the provided context. If the context is empty, give a general domain response.
      Use Markdown for formatting (bolding key terms).

      Context Data:
      ${contextData}
   `;

   try {
       const result = await model.generateContentStream(prompt);
       let fullResponse = '';

       for await (const chunk of result.stream) {
           const chunkText = chunk.text();
           fullResponse += chunkText;
           onChunk(fullResponse);
       }

       return fullResponse;
   } catch (error) {
       console.error("Streaming generation failed:", error);
       const fallbackText = "I encountered an error while formulating my response. Please check my connection or API configuration.";
       onChunk(fallbackText);
       return fallbackText;
   }
}
