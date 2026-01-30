import React from 'react';
import { CalculationResult } from '../types';
import { CONSTANTS } from '../constants';

interface ResultCardProps {
  title: string;
  data: CalculationResult;
  isSafetyGear?: boolean;
}

const ResultRow = ({ label, value, unit, highlight = false }: { label: string, value: number | string, unit: string, highlight?: boolean }) => (
  <div className={`flex justify-between items-center py-2 border-b border-slate-700 last:border-0 ${highlight ? 'bg-slate-700/30 -mx-4 px-4' : ''}`}>
    <span className={highlight ? "text-blue-300 font-semibold" : "text-slate-400"}>{label}</span>
    <span className={`font-mono ${highlight ? "text-white font-bold" : "text-slate-200"}`}>
      {typeof value === 'number' ? value.toFixed(2) : value} <span className="text-xs text-slate-500 ml-1">{unit}</span>
    </span>
  </div>
);

export const ResultCard: React.FC<ResultCardProps> = ({ title, data, isSafetyGear }) => {
  // Select Limit based on case type
  const sigmaLimit = isSafetyGear ? CONSTANTS.sigma_perm : CONSTANTS.sigma_perm_normal;
  const isOverStress = data.sigmaM > sigmaLimit;
  
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 border-b border-slate-600 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {isOverStress && (
          <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded border border-red-500/50">
            FAIL
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Forces & Moments</h4>
        <ResultRow label="Fx (Lateral)" value={data.forceFx} unit="N" />
        <ResultRow label="Fy (Guide)" value={data.forceFy} unit="N" />
        <ResultRow label="Mx (Bending)" value={data.momentMx} unit="Nmm" />
        <ResultRow label="My (Bending)" value={data.momentMy} unit="Nmm" />

        <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">Stresses</h4>
        <ResultRow label="Sigma X" value={data.sigmaX} unit="MPa" />
        <ResultRow label="Sigma Y" value={data.sigmaY} unit="MPa" />
        <div className="mt-2">
            <ResultRow label="Sigma Total" value={data.sigmaM} unit="MPa" highlight />
            <div className="flex justify-end mt-1">
                <span className={`text-xs ${isOverStress ? 'text-red-400' : 'text-emerald-400'}`}>
                    Limit: {sigmaLimit} MPa
                </span>
            </div>
        </div>

        {isSafetyGear && (
           <>
            <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">Buckling (Safety Gear)</h4>
            <ResultRow label="Slenderness" value={data.slenderness} unit="λ" />
            <ResultRow label="Omega (ω)" value={data.omega} unit="" />
            <ResultRow label="Sigma Buckling" value={data.sigmaBuckling} unit="MPa" highlight />
           </>
        )}

        {!isSafetyGear && (
            <>
            <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">Deflection</h4>
            <ResultRow label="Deflection X" value={data.deflectionX} unit="mm" />
            <ResultRow label="Deflection Y" value={data.deflectionY} unit="mm" />
            </>
        )}
      </div>
    </div>
  );
};