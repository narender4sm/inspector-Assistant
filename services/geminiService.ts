import { GoogleGenAI, Chat, Content, Part } from "@google/genai";
import { toolDeclarations, executeTool } from "./tools";

// Initialize Gemini Client
// NOTE: In a real app, never expose API keys on the client. 
// Ideally, proxy this through a backend. 
// For this demo, we assume the user has the key in env or we prompt (but per instructions, we rely on process.env.API_KEY).
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `
You are InspectorAI, an expert reliability engineering assistant.
You have access to a database of equipment inspection reports.

Your capabilities:
1. List available equipment.
2. Retrieve full inspection history for specific equipment (findings, recommendations, dates, severity).
3. Search for similar findings across the database (e.g., "Show me all vibration issues").

Rules:
- ALWAYS provide the 'reportUrl' as a clickable Markdown link when discussing a specific inspection (e.g., [View Report](url)).
- Format findings clearly using bullet points or tables if comparing multiple items.
- If a user asks a vague question, ask for clarification or offer to list equipment.
- Be professional, concise, and safety-oriented.
- Use the provided tools to fetch data. Do not make up data.
`;

export class ChatManager {
  private chat: Chat;

  constructor() {
    this.chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: toolDeclarations }],
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      // 1. Send user message
      let result = await this.chat.sendMessage({ message });
      
      // 2. Check for function calls (Loop until no more function calls)
      // Gemini might chain multiple tool calls or return text after a tool call.
      // The SDK handles history, but we must manually execute and send back responses.
      
      // We need to handle the loop manually for tool executions
      while (true) {
        const candidates = result.candidates;
        if (!candidates || candidates.length === 0) break;

        const content = candidates[0].content;
        const parts = content.parts;
        
        // Find if there are any function calls in the response
        const functionCalls = parts.filter(p => !!p.functionCall);

        if (functionCalls.length > 0) {
          // Execute all function calls found in this turn
          const functionResponses: Part[] = [];

          for (const part of functionCalls) {
            const call = part.functionCall!;
            
            // Log call for debugging
            console.log("Executing tool:", call.name);

            try {
              const functionResult = await executeTool(call.name, call.args);
              
              // Construct response part
              // IMPORTANT: Ensure 'id' matches the call if provided.
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  id: call.id, // Must match the ID from the function call
                  response: { result: functionResult } 
                }
              });
            } catch (error: any) {
              console.error("Tool execution error:", error);
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  id: call.id,
                  response: { error: error.message }
                }
              });
            }
          }

          // Send the tool responses back to the model
          // The model will then generate a text response based on these results
          // We wrap in { message: ... } to satisfy the sendMessage signature
          result = await this.chat.sendMessage({ message: functionResponses });
        } else {
          // No function calls, meaning we have the final text response
          break;
        }
      }

      return result.text || "I processed the request but received no text output.";

    } catch (error) {
      console.error("Gemini Interaction Error:", error);
      return "I encountered an error while communicating with the inspection database. Please ensure your API key is valid.";
    }
  }
}

export const chatManager = new ChatManager();