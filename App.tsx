import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  FileSpreadsheet, 
  FileText, 
  Save, 
  Cpu, 
  AlertTriangle, 
  CheckCircle,
  Menu
} from 'lucide-react';

import { RailProfileType, InputParams, ProjectDetails, AnalysisReport, AIAnalysisResponse } from './types';
import { INITIAL_INPUTS, INITIAL_PROJECT, RAIL_LIBRARY } from './constants';
import { calculateAnalysis } from './services/calculationService';
import { verifyCalculationWithAI } from './services/geminiService';

// --- Sub-components (Inline for single file structural requirement, logically separated) ---

const InputField = ({ label, value, unit, onChange, type = "number", step = "1" }: any) => (
  <div className="flex flex-col mb-3">
    <label className="text-slate-400 text-xs uppercase font-bold mb-1 tracking-wider">{label}</label>
    <div className="flex items-center bg-slate-800 rounded border border-slate-700 focus-within:border-primary transition-colors">
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        className="w-full bg-transparent p-2 text-sm text-white focus:outline-none font-mono"
      />
      {unit && <span className="text-slate-500 text-xs px-2 font-mono select-none">{unit}</span>}
    </div>
  </div>
);

const ResultRow = ({ label, value, unit, highlight = false, limit = null }: any) => {
  const isOverLimit = limit !== null && value > limit;
  return (
    <div className={`flex justify-between items-center py-1.5 border-b border-slate-700/50 last:border-0 ${highlight ? 'bg-slate-800/50 -mx-2 px-2 rounded' : ''}`}>
      <span className="text-slate-400 text-xs font-medium">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-mono font-bold ${isOverLimit ? 'text-red-400' : (highlight ? 'text-primary' : 'text-slate-200')}`}>
          {value.toFixed(2)}
        </span>
        <span className="text-slate-600 text-[10px] ml-1">{unit}</span>
      </div>
    </div>
  );
};

const Card = ({ title, children, className = "" }: any) => (
  <div className={`bg-slate-850 border border-slate-700 rounded-lg p-4 shadow-xl ${className}`}>
    <h3 className="text-primary font-bold text-sm uppercase tracking-wide mb-4 border-l-4 border-primary pl-2">{title}</h3>
    {children}
  </div>
);

export default function App() {
  const [project, setProject] = useState<ProjectDetails>(INITIAL_PROJECT);
  const [inputs, setInputs] = useState<InputParams>(INITIAL_INPUTS);
  const [results, setResults] = useState<AnalysisReport>(calculateAnalysis(INITIAL_INPUTS));
  const [aiResponse, setAiResponse] = useState<AIAnalysisResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Recalculate whenever inputs change
  useEffect(() => {
    setResults(calculateAnalysis(inputs));
    // Clear old AI response when data changes to avoid mismatch
    if (aiResponse) setAiResponse(null);
  }, [inputs]);

  const handleInputChange = (key: keyof InputParams, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleProjectChange = (key: keyof ProjectDetails, value: any) => {
    setProject(prev => ({ ...prev, [key]: value }));
  };

  const runAiAnalysis = async () => {
    setIsAiLoading(true);
    const response = await verifyCalculationWithAI(inputs, results);
    setAiResponse(response);
    setIsAiLoading(false);
  };

  const handleExcelImport = () => {
    // Mock import functionality
    const mockData = { ...INITIAL_INPUTS, P: 1250, Q: 1000, L: 2800 };
    setInputs(mockData);
    alert("Simulated Excel Import: Updated P to 1250kg, Q to 1000kg, L to 2800mm.");
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col md:flex-row print:block">
      
      {/* Sidebar Controls */}
      <aside className={`fixed md:relative z-20 w-80 bg-slate-900 border-r border-slate-800 h-screen overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 print:hidden shadow-2xl custom-scrollbar`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 text-primary">
            <Calculator className="w-8 h-8" />
            <h1 className="text-xl font-bold leading-tight">Elevator<br/><span className="text-white">RailCalc</span></h1>
          </div>

          <div className="space-y-8">
            {/* Rail Selection */}
            <section>
              <h4 className="text-white font-semibold mb-4 text-sm">Rail Configuration</h4>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-slate-400 text-xs mb-1">Car Rail Profile</label>
                  <select 
                    value={inputs.carRail}
                    onChange={(e) => handleInputChange('carRail', e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 focus:border-primary outline-none"
                  >
                    {Object.values(RailProfileType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-slate-400 text-xs mb-1">CWT Rail Profile</label>
                  <select 
                    value={inputs.cwtRail}
                    onChange={(e) => handleInputChange('cwtRail', e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-sm rounded p-2 focus:border-primary outline-none"
                  >
                    {Object.values(RailProfileType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Loads */}
            <section>
              <h4 className="text-white font-semibold mb-4 text-sm">Standard Parameters</h4>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="P (Car Empty)" value={inputs.P} unit="kg" onChange={(v: number) => handleInputChange('P', v)} />
                <InputField label="Q (Rated Load)" value={inputs.Q} unit="kg" onChange={(v: number) => handleInputChange('Q', v)} />
                <InputField label="M (CWT)" value={inputs.M_cwt} unit="kg" onChange={(v: number) => handleInputChange('M_cwt', v)} />
                <InputField label="Motor" value={inputs.Motor} unit="kg" onChange={(v: number) => handleInputChange('Motor', v)} />
              </div>
            </section>

             {/* Geometry */}
             <section>
              <h4 className="text-white font-semibold mb-4 text-sm">Geometry</h4>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="L (Bracket Dist)" value={inputs.L} unit="mm" onChange={(v: number) => handleInputChange('L', v)} />
                <InputField label="h (Car Shoes)" value={inputs.h_car} unit="mm" onChange={(v: number) => handleInputChange('h_car', v)} />
                <InputField label="h (CWT Shoes)" value={inputs.h_cwt} unit="mm" onChange={(v: number) => handleInputChange('h_cwt', v)} />
              </div>
            </section>

             {/* Eccentricities */}
             <section>
              <h4 className="text-white font-semibold mb-4 text-sm">Eccentricities</h4>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Xp (Car)" value={inputs.xp} unit="mm" onChange={(v: number) => handleInputChange('xp', v)} />
                <InputField label="Yp (Car)" value={inputs.yp} unit="mm" onChange={(v: number) => handleInputChange('yp', v)} />
                <InputField label="Xq (Load)" value={inputs.xq} unit="mm" onChange={(v: number) => handleInputChange('xq', v)} />
                <InputField label="Yq (Load)" value={inputs.yq} unit="mm" onChange={(v: number) => handleInputChange('yq', v)} />
              </div>
            </section>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 no-print">
          <h1 className="text-xl font-bold">RailCalc</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-slate-800 rounded">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Top Actions */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white print:text-black">Project Analysis Dashboard</h2>
            <div className="flex gap-4 mt-2 text-sm text-slate-400 print:text-black">
              <input 
                className="bg-transparent border-b border-slate-700 focus:border-primary outline-none w-40 print:border-none" 
                value={project.customer} 
                onChange={(e) => handleProjectChange('customer', e.target.value)} 
                placeholder="Customer Name"
              />
              <input 
                className="bg-transparent border-b border-slate-700 focus:border-primary outline-none w-40 print:border-none" 
                value={project.reference} 
                onChange={(e) => handleProjectChange('reference', e.target.value)} 
                placeholder="Reference / Job Ref"
              />
              <span className="print:hidden">{project.date}</span>
            </div>
          </div>
          
          <div className="flex gap-3 print:hidden">
            <button 
              onClick={handleExcelImport}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700 text-sm font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-500" />
              Import Excel Data
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700 text-sm font-medium"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              Export Report
            </button>
            <button 
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors text-sm font-bold shadow-lg shadow-primary-dim"
            >
              <Save className="w-4 h-4" />
              Save Project
            </button>
          </div>
        </header>

        {/* AI Assistant Section */}
        <section className="mb-8 print:hidden">
          <div className="bg-gradient-to-r from-slate-850 to-slate-800 rounded-xl p-6 border border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu className="w-32 h-32 text-accent" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    AI Engineering Assistant
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-xl">
                    Powered by Gemini 2.0 Flash. Get optimization tips, standard verification, and safety analysis of your current configuration.
                  </p>
                </div>
                <button 
                  onClick={runAiAnalysis}
                  disabled={isAiLoading}
                  className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAiLoading ? (
                    <span className="animate-pulse">Analyzing...</span>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" /> Run Analysis
                    </>
                  )}
                </button>
              </div>

              {aiResponse && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    {aiResponse.safetyStatus === 'SAFE' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {aiResponse.safetyStatus === 'WARNING' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                    {aiResponse.safetyStatus === 'CRITICAL' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                    <span className={`font-bold text-sm ${
                      aiResponse.safetyStatus === 'SAFE' ? 'text-green-400' : 
                      aiResponse.safetyStatus === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      STATUS: {aiResponse.safetyStatus}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3 leading-relaxed">{aiResponse.analysis}</p>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Optimization Tips:</span>
                    <ul className="list-disc list-inside text-sm text-slate-400 mt-1">
                      {aiResponse.optimizationTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Car Safety Gear */}
          <Card title={`Car (${inputs.carRail}): Safety Gear`}>
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Forces & Moments</h4>
              <ResultRow label="Fx (Lateral)" value={results.carSafety.Fx} unit="N" />
              <ResultRow label="Fy (Guide)" value={results.carSafety.Fy} unit="N" />
              <ResultRow label="Mx (Bending)" value={results.carSafety.Mx} unit="Nmm" />
              <ResultRow label="My (Bending)" value={results.carSafety.My} unit="Nmm" />
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stresses</h4>
              <ResultRow label="Sigma X" value={results.carSafety.sigmaX} unit="MPa" />
              <ResultRow label="Sigma Y" value={results.carSafety.sigmaY} unit="MPa" />
              <ResultRow 
                label="Sigma Total" 
                value={results.carSafety.sigmaTotal} 
                unit="MPa" 
                highlight 
                limit={results.carSafety.permStress}
              />
              <div className="text-right text-[10px] text-slate-500 mt-1">Limit: {results.carSafety.permStress} MPa</div>
            </div>

            <div>
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Buckling (Safety Gear)</h4>
               <ResultRow label="Slenderness (λ)" value={results.carSafety.slenderness} unit="" />
               <ResultRow label="Omega (ω)" value={results.carSafety.omega} unit="" />
               <ResultRow label="Sigma Buckling" value={results.carSafety.sigmaBuckling} unit="MPa" />
            </div>
          </Card>

          {/* Card 2: Car Normal */}
          <Card title={`Car (${inputs.carRail}): Normal`}>
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Forces & Moments</h4>
              <ResultRow label="Fx (Lateral)" value={results.carNormal.Fx} unit="N" />
              <ResultRow label="Fy (Guide)" value={results.carNormal.Fy} unit="N" />
              <ResultRow label="Mx (Bending)" value={results.carNormal.Mx} unit="Nmm" />
              <ResultRow label="My (Bending)" value={results.carNormal.My} unit="Nmm" />
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stresses</h4>
              <ResultRow label="Sigma X" value={results.carNormal.sigmaX} unit="MPa" />
              <ResultRow label="Sigma Y" value={results.carNormal.sigmaY} unit="MPa" />
              <ResultRow 
                label="Sigma Total" 
                value={results.carNormal.sigmaTotal} 
                unit="MPa" 
                highlight 
                limit={results.carNormal.permStress}
              />
              <div className="text-right text-[10px] text-slate-500 mt-1">Limit: {results.carNormal.permStress} MPa</div>
            </div>

            <div>
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Deflection</h4>
               <ResultRow label="Deflection X" value={results.carNormal.deflectionX} unit="mm" highlight limit={5} />
               <ResultRow label="Deflection Y" value={results.carNormal.deflectionY} unit="mm" highlight limit={5} />
            </div>
          </Card>

           {/* Card 3: CWT Normal */}
           <Card title={`CWT (${inputs.cwtRail}): Normal`}>
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Forces & Moments</h4>
              <ResultRow label="Fx (Lateral)" value={results.cwtNormal.Fx} unit="N" />
              <ResultRow label="Fy (Guide)" value={results.cwtNormal.Fy} unit="N" />
              <ResultRow label="Mx (Bending)" value={results.cwtNormal.Mx} unit="Nmm" />
              <ResultRow label="My (Bending)" value={results.cwtNormal.My} unit="Nmm" />
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Stresses</h4>
              <ResultRow label="Sigma X" value={results.cwtNormal.sigmaX} unit="MPa" />
              <ResultRow label="Sigma Y" value={results.cwtNormal.sigmaY} unit="MPa" />
              <ResultRow 
                label="Sigma Total" 
                value={results.cwtNormal.sigmaTotal} 
                unit="MPa" 
                highlight 
                limit={results.cwtNormal.permStress}
              />
              <div className="text-right text-[10px] text-slate-500 mt-1">Limit: {results.cwtNormal.permStress} MPa</div>
            </div>

            <div>
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Deflection</h4>
               <ResultRow label="Deflection X" value={results.cwtNormal.deflectionX} unit="mm" />
               <ResultRow label="Deflection Y" value={results.cwtNormal.deflectionY} unit="mm" />
            </div>
          </Card>
        </div>

        {/* Summary Footer */}
        <div className="bg-slate-850 border border-slate-700 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold mb-1">Analysis Summary</h3>
              <p className="text-slate-400 text-sm">Base structural validation complete.</p>
            </div>
            
            <div className="flex gap-8">
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Max Stress (Car)</span>
                <span className={`text-2xl font-bold ${results.carSafety.sigmaTotal > results.carSafety.permStress ? 'text-red-500' : 'text-green-400'}`}>
                  {results.carSafety.sigmaTotal.toFixed(2)} <span className="text-sm">MPa</span>
                </span>
              </div>
              
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Max Deflection</span>
                <span className={`text-2xl font-bold ${results.carNormal.deflectionX > 5 ? 'text-red-500' : 'text-blue-400'}`}>
                  {Math.max(results.carNormal.deflectionX, results.carNormal.deflectionY).toFixed(2)} <span className="text-sm">mm</span>
                </span>
              </div>
              
              <div className="text-center md:text-left">
                 <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Slenderness</span>
                <span className="text-2xl font-bold text-accent">
                  {results.carSafety.slenderness.toFixed(1)}
                </span>
              </div>
            </div>
        </div>

      </main>
    </div>
  );
}