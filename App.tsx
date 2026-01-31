import React, { useState, useMemo } from 'react';
import { DEFAULT_INPUTS, AVAILABLE_RAILS } from './constants';
import { SystemInputs, RailProperties, ProjectMetadata } from './types';
import { calculateSafetyGearCase, calculateNormalCase, calculateCounterweight } from './utils/formulas';
import { InputGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';
import { AiAssistant } from './components/AiAssistant';
import { generateWordReport } from './utils/reportGenerator';
import { generateExcelReport } from './utils/excelGenerator';
import { VisualReport } from './components/VisualReport';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<SystemInputs>(DEFAULT_INPUTS);
  const [customInputs, setCustomInputs] = useState<Record<string, string | number>>({});
  
  const [carRail, setCarRail] = useState<RailProperties>(AVAILABLE_RAILS.find(r => r.name === 'T90/A') || AVAILABLE_RAILS[0]);
  const [cwtRail, setCwtRail] = useState<RailProperties>(AVAILABLE_RAILS.find(r => r.name === 'T70/A') || AVAILABLE_RAILS[1]);
  
  const [fileName, setFileName] = useState<string | null>(null);
  const [showVisualReport, setShowVisualReport] = useState(false);

  // Project Metadata State
  const [showMetadata, setShowMetadata] = useState(false);
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    projectName: 'Nový Projekt',
    customer: 'Klient',
    orderNumber: '2025-001',
    author: 'Inžinier',
    date: new Date().toLocaleDateString('sk-SK')
  });

  // Store the last AI analysis for the report
  const [lastAnalysis, setLastAnalysis] = useState<string>('');

  const handleInputChange = (name: string, value: number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomInputChange = (key: string, value: string | number) => {
    setCustomInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    const newInputs = { ...inputs };
    const newCustomInputs: Record<string, string | number> = {};
    let standardFoundCount = 0;
    let customFoundCount = 0;

    jsonData.forEach(row => {
      if (row.length >= 2) {
        const keyRaw = row[0];
        const valRaw = row[1];
        if (!keyRaw) return;
        const key = String(keyRaw).trim();
        const valNum = parseFloat(valRaw);
        const val = isNaN(valNum) ? String(valRaw) : valNum;

        const standardKey = Object.keys(DEFAULT_INPUTS).find(k => k.toLowerCase() === key.toLowerCase());
        
        if (standardKey && typeof val === 'number') {
          (newInputs as any)[standardKey] = val;
          standardFoundCount++;
        } else {
          newCustomInputs[key] = val;
          customFoundCount++;
        }
      }
    });

    setInputs(newInputs);
    setCustomInputs(newCustomInputs);
    alert(`Importovaných ${standardFoundCount} štandardných a ${customFoundCount} vlastných parametrov.`);
  };

  const safetyGearResults = useMemo(() => calculateSafetyGearCase(inputs, carRail), [inputs, carRail]);
  const normalResults = useMemo(() => calculateNormalCase(inputs, carRail), [inputs, carRail]);
  const cwtResults = useMemo(() => calculateCounterweight(inputs, cwtRail), [inputs, cwtRail]);

  const handleWordExport = () => {
    generateWordReport(
      metadata,
      inputs,
      carRail,
      cwtRail,
      safetyGearResults,
      normalResults,
      cwtResults,
      lastAnalysis
    );
  };

  const handleExcelExport = () => {
    generateExcelReport(
      metadata,
      inputs,
      carRail,
      cwtRail,
      safetyGearResults,
      normalResults
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">
      
      {showVisualReport && (
        <VisualReport 
          metadata={metadata}
          inputs={inputs}
          carRail={carRail}
          safetyResults={safetyGearResults}
          normalResults={normalResults}
          cwtResults={cwtResults}
          aiAnalysis={lastAnalysis}
          onClose={() => setShowVisualReport(false)}
        />
      )}

      <header className="max-w-7xl mx-auto mb-10 border-b border-slate-700 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Elevator Rail Calculator
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Digitálna analýza podľa EN 81-20/50.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
             <button 
               onClick={() => setShowMetadata(!showMetadata)}
               className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors px-4 py-2 rounded-md text-sm font-semibold text-white shadow-md border border-slate-600"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Nastavenia Projektu
             </button>

             <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors px-4 py-2 rounded-md cursor-pointer text-sm font-semibold text-white shadow-md border border-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {fileName ? 'Re-Import' : 'Import Excel'}
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
             </label>
             
             <div className="flex bg-slate-700 rounded-md shadow-md border border-slate-600 overflow-hidden">
                 <button 
                    onClick={() => setShowVisualReport(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 text-sm font-semibold text-white border-r border-blue-500"
                    title="Zobraziť Webový Report (PDF)"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                        <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    PDF Náhľad
                 </button>
                 <button 
                    onClick={handleWordExport}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors px-3 py-2 text-sm font-semibold text-white border-r border-slate-600"
                    title="Stiahnuť Word"
                 >
                    Word
                 </button>
                 <button 
                    onClick={handleExcelExport}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors px-3 py-2 text-sm font-semibold text-white"
                    title="Stiahnuť Excel"
                 >
                    Excel
                 </button>
             </div>
          </div>
        </div>
        
        {/* Project Metadata Panel */}
        {showMetadata && (
            <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700 animate-fadeIn">
                <h3 className="text-lg font-bold text-white mb-4">Hlavička Reportu</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Názov Projektu</label>
                        <input type="text" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm" 
                               value={metadata.projectName} onChange={e => setMetadata({...metadata, projectName: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Zákazník</label>
                        <input type="text" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm" 
                               value={metadata.customer} onChange={e => setMetadata({...metadata, customer: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Číslo Zákazky</label>
                        <input type="text" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm" 
                               value={metadata.orderNumber} onChange={e => setMetadata({...metadata, orderNumber: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Autor</label>
                        <input type="text" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm" 
                               value={metadata.author} onChange={e => setMetadata({...metadata, author: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Dátum</label>
                        <input type="text" className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm" 
                               value={metadata.date} onChange={e => setMetadata({...metadata, date: e.target.value})} />
                    </div>
                </div>
            </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Rail Configuration */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
             <h2 className="text-lg font-semibold text-white mb-4">Konfigurácia Vodidiel</h2>
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Kabína - Profil</label>
                 <select 
                    className="block w-full rounded-md border-0 bg-slate-900 py-2 pl-3 pr-10 text-slate-100 ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    value={carRail.name}
                    onChange={(e) => {
                      const r = AVAILABLE_RAILS.find(rail => rail.name === e.target.value);
                      if (r) setCarRail(r);
                    }}
                 >
                   {AVAILABLE_RAILS.map(r => <option key={r.name} value={r.name}>{r.name} ({r.weight} kg/m)</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Protiváha - Profil</label>
                 <select 
                    className="block w-full rounded-md border-0 bg-slate-900 py-2 pl-3 pr-10 text-slate-100 ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    value={cwtRail.name}
                    onChange={(e) => {
                      const r = AVAILABLE_RAILS.find(rail => rail.name === e.target.value);
                      if (r) setCwtRail(r);
                    }}
                 >
                   {AVAILABLE_RAILS.map(r => <option key={r.name} value={r.name}>{r.name} ({r.weight} kg/m)</option>)}
                 </select>
               </div>
             </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              <span>Parametre Systému</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Zaťaženie</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="P (Prázdna Kabína)" name="P" value={inputs.P} unit="kg" onChange={handleInputChange} />
                  <InputGroup label="Q (Nosnosť)" name="Q" value={inputs.Q} unit="kg" onChange={handleInputChange} />
                  <InputGroup label="M (Protiváha)" name="Mctw" value={inputs.Mctw} unit="kg" onChange={handleInputChange} />
                  <InputGroup label="Motor" name="Mot" value={inputs.Mot} unit="kg" onChange={handleInputChange} />
                </div>
              </div>

               <div>
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Dynamika</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Rýchlosť" name="v_rated" value={inputs.v_rated} unit="m/s" onChange={handleInputChange} step={0.1} />
                  <InputGroup label="Brzdné spomalenie" name="a_brake" value={inputs.a_brake} unit="g" onChange={handleInputChange} step={0.1} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Geometria</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="L (Konzoly)" name="L" value={inputs.L} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="h (Vedenie Kab.)" name="h_k" value={inputs.h_k} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="h (Vedenie CWT)" name="h_ctw" value={inputs.h_ctw} unit="mm" onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Excentricity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Xp" name="Xp" value={inputs.Xp} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="Yp" name="Yp" value={inputs.Yp} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="Xq" name="Xq" value={inputs.Xq} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="Yq" name="Yq" value={inputs.Yq} unit="mm" onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC EXTRA INPUTS SECTION */}
          {Object.keys(customInputs).length > 0 && (
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 animate-fadeIn">
              <h2 className="text-lg font-semibold text-purple-400 mb-4 flex items-center justify-between">
                <span>Extra Excel Dáta</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Načítané</span>
              </h2>
              <div className="space-y-3">
                 {Object.entries(customInputs).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        {key}
                      </label>
                      <input
                        type="text"
                        className="block w-full rounded-md border-0 bg-slate-900 py-2 pl-3 pr-3 text-slate-100 ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-purple-500 sm:text-sm"
                        value={value}
                        onChange={(e) => handleCustomInputChange(key, e.target.value)}
                      />
                    </div>
                 ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* AI Assistant Section */}
          <AiAssistant 
            inputs={inputs} 
            customInputs={customInputs}
            carRail={carRail} 
            cwtRail={cwtRail} 
            safetyGearResults={safetyGearResults} 
            normalResults={normalResults}
            onAnalysisComplete={(text) => setLastAnalysis(text)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResultCard 
              title={`Kabína (${carRail.name}): Zachytávače`} 
              data={safetyGearResults} 
              isSafetyGear={true}
            />
            
            <ResultCard 
              title={`Kabína (${carRail.name}): Jazda`} 
              data={normalResults} 
              isSafetyGear={false}
            />

            <ResultCard 
              title={`Protiváha (${cwtRail.name})`} 
              data={cwtResults} 
              isSafetyGear={false}
            />
          </div>

          {/* Visualization / Summary Section */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
             <h3 className="text-md font-bold text-white mb-4">Rýchly Prehľad</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <span className="block text-slate-400 text-xs uppercase mb-1">Max Napätie</span>
                  <span className={`text-2xl font-bold ${safetyGearResults.sigmaM > 205 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Math.max(safetyGearResults.sigmaM, normalResults.sigmaM).toFixed(2)} MPa
                  </span>
                  <div className="w-full bg-slate-700 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${safetyGearResults.sigmaM > 205 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min((Math.max(safetyGearResults.sigmaM, normalResults.sigmaM) / 205) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Limit: 205 MPa</span>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <span className="block text-slate-400 text-xs uppercase mb-1">Max Priehyb</span>
                  <span className={`text-2xl font-bold ${Math.max(normalResults.deflectionX, normalResults.deflectionY) > 5 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Math.max(normalResults.deflectionX, normalResults.deflectionY).toFixed(2)} mm
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Limit: 5 mm</span>
                </div>

                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <span className="block text-slate-400 text-xs uppercase mb-1">Štíhlosť (λ)</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {safetyGearResults.slenderness.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Profil: {carRail.name}</span>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
