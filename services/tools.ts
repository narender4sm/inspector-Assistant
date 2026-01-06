import { FunctionDeclaration, Type } from "@google/genai";
import * as db from './mockDatabase';

// 1. Define the Tool Schemas for Gemini
export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_equipment_list",
    description: "Retrieves a list of all available equipment in the inspection database. Returns ID, Name, and Type.",
    parameters: {
      type: Type.OBJECT,
      properties: {}, 
    },
  },
  {
    name: "get_inspection_history",
    description: "Retrieves the full inspection history for a specific piece of equipment using its ID. Returns findings, recommendations, and report links.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        equipmentId: {
          type: Type.STRING,
          description: "The unique ID of the equipment (e.g., 'EQ-P-101').",
        },
      },
      required: ["equipmentId"],
    },
  },
  {
    name: "search_similar_findings",
    description: "Searches the entire database for inspections with findings or recommendations matching a keyword query. Useful for finding similar defects or issues across different equipment.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "The search keyword or phrase (e.g., 'corrosion', 'vibration', 'leak').",
        },
      },
      required: ["query"],
    },
  },
];

// 2. Define the Execution Logic (Map tool name to function)
export const executeTool = async (name: string, args: any) => {
  console.log(`[Tool Execution] Calling ${name} with args:`, args);
  
  switch (name) {
    case "get_equipment_list":
      // Limit to 40 items to prevent payload issues with the API
      // Returning too much data (100+ items) can cause XHR errors or token limits
      const allEquipment = db.getAllEquipment();
      if (allEquipment.length > 40) {
        return {
          items: allEquipment.slice(0, 40),
          note: `Showing 40 of ${allEquipment.length} items. Ask for specific equipment if not listed.`
        };
      }
      return allEquipment;
    
    case "get_inspection_history":
      if (!args.equipmentId) throw new Error("Missing equipmentId");
      const history = db.getEquipmentHistory(args.equipmentId);
      if (!history) return { error: "Equipment not found" };
      return history;

    case "search_similar_findings":
      if (!args.query) throw new Error("Missing query");
      const results = db.searchInspections(args.query);
      // Limit search results to prevent huge payloads
      if (results.length > 20) {
         return {
            results: results.slice(0, 20),
            note: `Showing top 20 of ${results.length} matches.`
         }
      }
      return results.length > 0 ? results : { message: "No matching findings found." };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};