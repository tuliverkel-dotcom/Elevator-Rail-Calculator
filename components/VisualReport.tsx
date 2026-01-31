import React from 'react';
import { ProjectMetadata, SystemInputs, RailProperties, CalculationResult } from '../types';
import { CONSTANTS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import clsx from 'clsx';

interface VisualReportProps {
  metadata: ProjectMetadata;
  inputs: SystemInputs;
  carRail: RailProperties;
  safetyResults: CalculationResult;
  normalResults: CalculationResult;
  cwtResults: CalculationResult;
  aiAnalysis: string;
  onClose: () => void;
}

// Helper to generate graph data simulating beam bending
const generateBendingData = (length: number, maxMoment: number) => {
  const data = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * length;
    // Simulate a simplified triangular/parabolic moment distribution for visualization
    // M(x) is max at applied load (simplified to center for visual aesthetics)
    const normalizedPos = i / steps;
    const factor = normalizedPos < 0.5 ? normalizedPos * 2 : (1 - normalizedPos) * 2;
    data.push({
      x: x.toFixed(0),
      moment: (maxMoment * factor).toFixed(2),
    });
  }
  return data;
};

const generateDeflectionData = (length: number, maxDeflection: number) => {
    const data = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * length;
        // Simple beam deflection shape
        const normalizedPos = i / steps; // 0 to 1
        // Sinusoidal approximation for visual shape
        const factor = Math.sin(normalizedPos * Math.PI);
        data.push({
            x: x.toFixed(0),
            deflection: (maxDeflection * factor).toFixed(2)
        });
    }
    return data;
};

export const VisualReport: React.FC<VisualReportProps> = ({
  metadata,
  inputs,
  carRail,
  safetyResults,
  normalResults,
  aiAnalysis,
  onClose
}) => {
  
  const momentData = generateBendingData(inputs.L, Math.max(safetyResults.momentMx, safetyResults.momentMy));
  const deflectionData = generateDeflectionData(inputs.L, Math.max(normalResults.deflectionX, normalResults.deflectionY));

  const ReportSection = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={clsx("mb-8 break-inside-avoid", className)}>
      <h3 className="text-lg font-bold text-slate-800 border-b-2 border-blue-600 pb-1 mb-4 uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );

  const StatBox = ({ label, value, unit, limit, isGood }: { label: string, value: string | number, unit: string, limit?: number, isGood?: boolean }) => (
    <div className="bg-slate-50 p-3 rounded border border-slate-200 flex flex-col items-center justify-center text-center">
      <span className="text-slate-500 text-xs uppercase font-semibold">{label}</span>
      <span className="text-xl font-bold text-slate-900 my-1">{value} <span className="text-sm font-normal text-slate-500">{unit}</span></span>
      {limit && (
        <div className={clsx("text-xs font-bold px-2 py-0.5 rounded-full mt-1", isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
          Limit: {limit} {isGood ? "✔" : "✘"}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-sm flex justify-center">
      
      {/* Print Controls (Hidden when printing) */}
      <div className="fixed top-4 right-4 flex gap-2 no-print z-50">
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Tlačiť / Uložiť ako PDF
        </button>
        <button 
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
        >
          Zavrieť
        </button>
      </div>

      {/* A4 Page Container */}
      <div className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl my-8 mx-auto print:m-0 print:shadow-none print:w-full">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b-4 border-slate-900 pb-4 mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">ANALÝZA VODIDIEL</h1>
                <p className="text-blue-600 font-bold text-sm tracking-widest uppercase mt-1">Technická Správa EN 81-20/50</p>
            </div>
            <div className="text-right">
                <div className="text-2xl font-bold text-slate-400">#{metadata.orderNumber}</div>
                <div className="text-sm text-slate-500">{metadata.date}</div>
            </div>
        </header>

        {/* PROJECT INFO */}
        <div className="grid grid-cols-2 gap-8 mb-8 bg-slate-50 p-6 rounded-lg border border-slate-100">
            <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Projekt</h4>
                <div className="font-semibold text-lg">{metadata.projectName}</div>
                <div className="text-slate-600">{metadata.customer}</div>
            </div>
            <div className="text-right">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Autor</h4>
                <div className="font-semibold text-lg">{metadata.author}</div>
                <div className="text-slate-600">Generated by ElevatorCalc Pro</div>
            </div>
        </div>

        {/* 1. INPUT CONFIGURATION */}
        <ReportSection title="1. Konfigurácia Systému">
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <div className="text-xs text-blue-500 font-bold uppercase">Kabína (P)</div>
                    <div className="text-lg font-bold">{inputs.P} kg</div>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <div className="text-xs text-blue-500 font-bold uppercase">Nosnosť (Q)</div>
                    <div className="text-lg font-bold">{inputs.Q} kg</div>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <div className="text-xs text-blue-500 font-bold uppercase">Konzoly (L)</div>
                    <div className="text-lg font-bold">{inputs.L} mm</div>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <div className="text-xs text-blue-500 font-bold uppercase">Profil</div>
                    <div className="text-lg font-bold">{carRail.name}</div>
                </div>
            </div>
        </ReportSection>

        {/* 2. SAFETY GEAR ANALYSIS */}
        <ReportSection title="2. Pádová Skúška (Zachytávače)">
            <div className="flex gap-8 mb-6">
                <div className="w-1/3 space-y-4">
                     <StatBox 
                        label="Max Napätie (σ)" 
                        value={safetyResults.sigmaM.toFixed(2)} 
                        unit="MPa" 
                        limit={CONSTANTS.sigma_perm} 
                        isGood={safetyResults.sigmaM <= CONSTANTS.sigma_perm} 
                     />
                     <StatBox 
                        label="Vzper (Buckling)" 
                        value={safetyResults.sigmaBuckling.toFixed(2)} 
                        unit="MPa" 
                        limit={CONSTANTS.sigma_perm}
                        isGood={safetyResults.sigmaBuckling <= CONSTANTS.sigma_perm}
                     />
                     <div className="bg-slate-100 p-3 rounded text-center">
                        <div className="text-xs text-slate-500 uppercase">Štíhlosť (λ)</div>
                        <div className="font-mono font-bold text-lg">{safetyResults.slenderness.toFixed(1)}</div>
                     </div>
                </div>
                
                <div className="w-2/3 bg-white border border-slate-200 rounded p-4 shadow-sm">
                    <h4 className="text-xs font-bold text-center text-slate-400 uppercase mb-2">Priebeh Ohybového Momentu (Model)</h4>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={momentData}>
                                <defs>
                                    <linearGradient id="colorMoment" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="x" label={{ value: 'L (mm)', position: 'insideBottomRight', offset: -5 }} tick={{fontSize: 10}} />
                                <YAxis label={{ value: 'Nmm', angle: -90, position: 'insideLeft' }} tick={{fontSize: 10}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="moment" stroke="#2563eb" fillOpacity={1} fill="url(#colorMoment)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </ReportSection>

        {/* 3. NORMAL RUNNING ANALYSIS */}
        <ReportSection title="3. Normálna Prevádzka">
             <div className="flex gap-8 mb-6">
                <div className="w-2/3 bg-white border border-slate-200 rounded p-4 shadow-sm">
                    <h4 className="text-xs font-bold text-center text-slate-400 uppercase mb-2">Priehyb Vodidla (Deflection)</h4>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={deflectionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="x" tick={{fontSize: 10}} />
                                <YAxis tick={{fontSize: 10}} />
                                <ReferenceLine y={CONSTANTS.deflection_perm} label="Limit" stroke="red" strokeDasharray="3 3" />
                                <Tooltip />
                                <Line type="monotone" dataKey="deflection" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="w-1/3 flex flex-col justify-center gap-4">
                     <StatBox 
                        label="Max Priehyb" 
                        value={Math.max(normalResults.deflectionX, normalResults.deflectionY).toFixed(2)} 
                        unit="mm" 
                        limit={CONSTANTS.deflection_perm} 
                        isGood={Math.max(normalResults.deflectionX, normalResults.deflectionY) <= CONSTANTS.deflection_perm} 
                     />
                     <StatBox 
                        label="Napätie v ťahu" 
                        value={normalResults.sigmaM.toFixed(2)} 
                        unit="MPa" 
                        limit={CONSTANTS.sigma_perm_normal}
                        isGood={normalResults.sigmaM <= CONSTANTS.sigma_perm_normal}
                     />
                </div>
            </div>
        </ReportSection>

        {/* 4. AI CONCLUSION */}
        <ReportSection title="4. Inžinierske Zhodnotenie (AI)" className="page-break">
            <div className="bg-slate-50 border-l-4 border-purple-500 p-6 rounded-r-lg text-sm leading-relaxed text-justify whitespace-pre-line text-slate-800">
                {aiAnalysis || "Analýza nebola vygenerovaná."}
            </div>
        </ReportSection>

        <footer className="mt-12 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400">
            <div>© {new Date().getFullYear()} Elevator Safety Calc</div>
            <div>Vygenerované automaticky. Nutné overenie autorizovaným inžinierom.</div>
        </footer>

      </div>
    </div>
  );
};
