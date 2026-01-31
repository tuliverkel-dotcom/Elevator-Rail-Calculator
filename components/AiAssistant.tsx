import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SystemInputs, RailProperties, CalculationResult } from '../types';
import { CONSTANTS } from '../constants';

interface AiAssistantProps {
  inputs: SystemInputs;
  customInputs: Record<string, string | number>;
  carRail: RailProperties;
  cwtRail: RailProperties;
  safetyGearResults: CalculationResult;
  normalResults: CalculationResult;
  onAnalysisComplete?: (text: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ 
  inputs,
  customInputs,
  carRail, 
  cwtRail, 
  safetyGearResults, 
  normalResults,
  onAnalysisComplete
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
      const errorMsg = "Chyba: Chýba API kľúč.";
      setAnalysis(errorMsg);
      if(onAnalysisComplete) onAnalysisComplete(errorMsg);
      return;
    }

    setLoading(true);
    setAnalysis('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Convert custom inputs to a readable string
      const customDataStr = Object.entries(customInputs)
        .map(([key, val]) => `- ${key}: ${val}`)
        .join('\n');

      const prompt = `
        Správaj sa ako expert na výťahovú techniku a normy EN 81-20/50.
        Analyzuj nasledujúce výpočty vodidiel. Odpovedaj v **Slovenskom jazyku**.

        **Štandardné Vstupy:**
        - Hmotnosť P (Kabína): ${inputs.P} kg
        - Nosnosť Q: ${inputs.Q} kg
        - Vzdialenosť konzol L: ${inputs.L} mm
        - Vodidlo Kabíny: ${carRail.name}
        
        **Extra dáta z Excelu (ak sú):**
        ${customDataStr || "Žiadne extra dáta"}

        **Výsledky Výpočtov:**
        - Max Napätie (Zachytávače): ${safetyGearResults.sigmaM.toFixed(2)} MPa (Limit: ${CONSTANTS.sigma_perm} MPa)
        - Max Napätie (Jazda): ${normalResults.sigmaM.toFixed(2)} MPa
        - Max Priehyb: ${Math.max(normalResults.deflectionX, normalResults.deflectionY).toFixed(2)} mm (Limit: ${CONSTANTS.deflection_perm} mm)
        - Štíhlosť (Lambda): ${safetyGearResults.slenderness.toFixed(1)}

        **Inštrukcie:**
        1. Zhodnoť, či je inštalácia bezpečná na základe výsledkov.
        2. **DÔLEŽITÉ:** Pozri sa na "Extra dáta z Excelu". Ak tam sú neštandardné parametre (napr. tlak vetra, seizmicita, extra váha), vysvetli, ako by mali ovplyvniť výsledok, aj keď ich základný kalkulátor nezohľadnil.
        3. Ak NEVYHOVUJE: Navrhni konkrétne zmeny (napr. väčšie vodidlo, hustejšie konzoly).
        4. Ak VYHOVUJE: Okomentuj možnú optimalizáciu.
        
        Odpoveď formátuj prehľadne, profesionálne a technicky správne v slovenčine.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || 'Žiadna odpoveď nebola vygenerovaná.';
      setAnalysis(text);
      if(onAnalysisComplete) onAnalysisComplete(text);

    } catch (error) {
      console.error(error);
      const errorMsg = 'Nepodarilo sa vygenerovať analýzu.';
      setAnalysis(errorMsg);
      if(onAnalysisComplete) onAnalysisComplete(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 relative overflow-hidden">
       {/* Background decoration */}
       <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

       <div className="flex justify-between items-start mb-4">
         <div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              AI Engineering Assistant
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Powered by Gemini. Získajte optimalizáciu a analýzu dát v slovenčine.
            </p>
         </div>
         <button 
           onClick={handleAnalyze}
           disabled={loading}
           className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {loading ? (
             <>
               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Analyzujem...
             </>
           ) : (
             'Spustiť Analýzu'
           )}
         </button>
       </div>

       {analysis && (
         <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 text-slate-200 text-sm leading-relaxed whitespace-pre-line animate-fadeIn">
            {analysis}
         </div>
       )}
    </div>
  );
};