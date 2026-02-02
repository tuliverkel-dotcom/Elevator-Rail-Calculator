import { GoogleGenAI } from "@google/genai";
import { AnalysisReport, InputParams, AIAnalysisResponse } from "../types";

export async function verifyCalculationWithAI(
  inputs: InputParams,
  results: AnalysisReport
): Promise<AIAnalysisResponse> {
  
  if (!process.env.API_KEY) {
    return {
      analysis: "API Key is missing. Please configure the environment variable.",
      optimizationTips: [],
      safetyStatus: 'WARNING'
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-flash-preview';

  const prompt = `
    You are a Senior Mechanical Engineer specializing in Vertical Transportation (Elevators).
    Analyze the following calculation data for an Elevator Guide Rail system.
    
    INPUTS:
    - Rated Load (Q): ${inputs.Q} kg
    - Empty Car (P): ${inputs.P} kg
    - Bracket Spacing (L): ${inputs.L} mm
    - Rail Profile Car: ${inputs.carRail}
    - Rail Profile CWT: ${inputs.cwtRail}
    
    RESULTS:
    - Car Safety Gear Total Stress: ${results.carSafety.sigmaTotal.toFixed(2)} MPa (Limit: ${results.carSafety.permStress})
    - Car Safety Slenderness (Lambda): ${results.carSafety.slenderness.toFixed(2)}
    - Car Normal Deflection X: ${results.carNormal.deflectionX.toFixed(2)} mm
    - Car Normal Stress: ${results.carNormal.sigmaTotal.toFixed(2)} MPa
    
    Task:
    1. Verify if the stresses and deflections are generally acceptable for standard EN 81 norms.
    2. Provide 3 short optimization tips (e.g., can we reduce rail size? do we need more brackets?).
    3. Determine Safety Status: SAFE, WARNING, or CRITICAL.
    
    Output JSON format:
    {
      "analysis": "A brief summary paragraph...",
      "optimizationTips": ["Tip 1", "Tip 2", "Tip 3"],
      "safetyStatus": "SAFE" | "WARNING" | "CRITICAL"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResponse;

  } catch (error) {
    console.error("AI Analysis failed", error);
    return {
      analysis: "AI Service is currently unavailable or encountered an error.",
      optimizationTips: ["Check manual calculations."],
      safetyStatus: 'WARNING'
    };
  }
}