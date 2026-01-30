import React, { useState, useMemo } from 'react';
import { DEFAULT_INPUTS, AVAILABLE_RAILS } from './constants';
import { SystemInputs, RailProperties } from './types';
import { calculateSafetyGearCase, calculateNormalCase, calculateCounterweight } from './utils/formulas';
import { InputGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<SystemInputs>(DEFAULT_INPUTS);
  
  // State for selected rails (dynamic instead of hardcoded)
  const [carRail, setCarRail] = useState<RailProperties>(AVAILABLE_RAILS.find(r => r.name === 'T90/A') || AVAILABLE_RAILS[0]);
  const [cwtRail, setCwtRail] = useState<RailProperties>(AVAILABLE_RAILS.find(r => r.name === 'T70/A') || AVAILABLE_RAILS[1]);
  
  const [fileName, setFileName] = useState<string | null>(null);

  const handleInputChange = (name: string, value: number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    
    // Assume first sheet contains inputs
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // Simple "Dictionary" search logic
    // We look for rows where the first cell matches one of our input keys (P, Q, L...)
    const newInputs = { ...inputs };
    let foundCount = 0;

    jsonData.forEach(row => {
      if (row.length >= 2) {
        const key = String(row[0]).trim();
        const val = parseFloat(row[1]);

        // Check if key exists in our inputs (case insensitive check)
        const inputKey = Object.keys(DEFAULT_INPUTS).find(k => k.toLowerCase() === key.toLowerCase());
        
        if (inputKey && !isNaN(val)) {
          (newInputs as any)[inputKey] = val;
          foundCount++;
        }
      }
    });

    if (foundCount > 0) {
      setInputs(newInputs);
      alert(`Imported ${foundCount} values from ${file.name}`);
    } else {
      alert("No matching input variables (P, Q, L...) found in the first two columns of the Excel sheet.");
    }
  };

  // Perform Calculations
  const safetyGearResults = useMemo(() => calculateSafetyGearCase(inputs, carRail), [inputs, carRail]);
  const normalResults = useMemo(() => calculateNormalCase(inputs, carRail), [inputs, carRail]);
  const cwtResults = useMemo(() => calculateCounterweight(inputs, cwtRail), [inputs, cwtRail]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10 border-b border-slate-700 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Elevator Rail Calculator
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              Digitized analysis derived from PDF engineering report.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
             <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-md cursor-pointer text-sm font-semibold text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {fileName ? 'Re-Import Excel' : 'Import Excel Data'}
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileUpload} />
             </label>
             {fileName && <span className="text-xs text-green-400">Loaded: {fileName}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Rail Configuration */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
             <h2 className="text-lg font-semibold text-white mb-4">Rail Configuration</h2>
             <div className="space-y-4">
               <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Car Rail Profile</label>
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
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">CWT Rail Profile</label>
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
              <span>Input Parameters</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Loads</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="P (Empty Car)" name="P" value={inputs.P} unit="kg" onChange={handleInputChange} />
                  <InputGroup label="Q (Rated Load)" name="Q" value={inputs.Q} unit="kg" onChange={handleInputChange} />
                  <InputGroup label="M (CWT)" name="Mctw" value={inputs.Mctw} unit="kg" onChange={handleInputChange} />
                  <InputGroup label="Motor" name="Mot" value={inputs.Mot} unit="kg" onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Geometry</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="L (Bracket Dist)" name="L" value={inputs.L} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="h (Car Shoes)" name="h_k" value={inputs.h_k} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="h (CWT Shoes)" name="h_ctw" value={inputs.h_ctw} unit="mm" onChange={handleInputChange} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">Eccentricities</h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Xp" name="Xp" value={inputs.Xp} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="Yp" name="Yp" value={inputs.Yp} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="Xq" name="Xq" value={inputs.Xq} unit="mm" onChange={handleInputChange} />
                  <InputGroup label="Yq" name="Yq" value={inputs.Yq} unit="mm" onChange={handleInputChange} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResultCard 
              title={`Car (${carRail.name}): Safety Gear`} 
              data={safetyGearResults} 
              isSafetyGear={true}
            />
            
            <ResultCard 
              title={`Car (${carRail.name}): Normal`} 
              data={normalResults} 
              isSafetyGear={false}
            />

            <ResultCard 
              title={`CWT (${cwtRail.name})`} 
              data={cwtResults} 
              isSafetyGear={false}
            />
          </div>

          {/* Visualization / Summary Section */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
             <h3 className="text-md font-bold text-white mb-4">Analysis Summary</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <span className="block text-slate-400 text-xs uppercase mb-1">Max Stress (Car)</span>
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
                  <span className="block text-slate-400 text-xs uppercase mb-1">Max Deflection (Normal)</span>
                  <span className={`text-2xl font-bold ${Math.max(normalResults.deflectionX, normalResults.deflectionY) > 5 ? 'text-red-400' : 'text-blue-400'}`}>
                    {Math.max(normalResults.deflectionX, normalResults.deflectionY).toFixed(2)} mm
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Limit: 5 mm</span>
                </div>

                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <span className="block text-slate-400 text-xs uppercase mb-1">Slenderness Ratio</span>
                  <span className="text-2xl font-bold text-purple-400">
                    {safetyGearResults.slenderness.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">Rail: {carRail.name}</span>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;