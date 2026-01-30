import React from 'react';

interface InputGroupProps {
  label: string;
  name: string;
  value: number;
  unit: string;
  onChange: (name: string, value: number) => void;
  step?: number;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, unit, onChange, step = 1 }) => {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <input
          type="number"
          name={name}
          id={name}
          step={step}
          className="block w-full rounded-md border-0 bg-slate-800 py-2 pl-3 pr-12 text-slate-100 ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all"
          value={value}
          onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-slate-500 sm:text-sm">{unit}</span>
        </div>
      </div>
    </div>
  );
};