import * as XLSX from 'xlsx';
import { ProjectMetadata, SystemInputs, RailProperties, CalculationResult } from '../types';
import FileSaver from 'file-saver';

export const generateExcelReport = (
  metadata: ProjectMetadata,
  inputs: SystemInputs,
  carRail: RailProperties,
  cwtRail: RailProperties,
  safetyResults: CalculationResult,
  normalResults: CalculationResult
) => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // --- Sheet 1: Prehľad ---
  const overviewData = [
    ["VÝPOČET VODIDIEL VÝŤAHU", ""],
    ["Projekt", metadata.projectName],
    ["Zákazník", metadata.customer],
    ["Číslo", metadata.orderNumber],
    ["Dátum", metadata.date],
    ["", ""],
    ["VSTUPNÉ PARAMETRE", ""],
    ["Parameter", "Hodnota", "Jednotka"],
    ["Hmotnosť Kabíny (P)", inputs.P, "kg"],
    ["Nosnosť (Q)", inputs.Q, "kg"],
    ["Rýchlosť", inputs.v_rated, "m/s"],
    ["Vzdialenosť konzol", inputs.L, "mm"],
    ["Typ Vodidla (Kabína)", carRail.name, ""],
    ["Typ Vodidla (Protiváha)", cwtRail.name, ""],
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Prehľad");

  // --- Sheet 2: Výpočty ---
  const calcData = [
    ["VÝSLEDKY ANALÝZY", "", "", ""],
    ["", "", "", ""],
    ["1. ZACHYTÁVAČE (Safety Gear)", "", "Limit", "Status"],
    ["Ohybový moment Mx", safetyResults.momentMx, "-", "-"],
    ["Ohybový moment My", safetyResults.momentMy, "-", "-"],
    ["Napätie Sigma Total", safetyResults.sigmaM, 205, safetyResults.sigmaM > 205 ? "FAIL" : "OK"],
    ["Štíhlosť (Lambda)", safetyResults.slenderness, "-", "-"],
    ["Vzperné napätie", safetyResults.sigmaBuckling, "-", "-"],
    ["", "", "", ""],
    ["2. NORMÁLNA JAZDA", "", "Limit", "Status"],
    ["Priehyb X", normalResults.deflectionX, 5, normalResults.deflectionX > 5 ? "FAIL" : "OK"],
    ["Priehyb Y", normalResults.deflectionY, 5, normalResults.deflectionY > 5 ? "FAIL" : "OK"],
    ["Napätie Sigma", normalResults.sigmaM, 165, normalResults.sigmaM > 165 ? "FAIL" : "OK"],
  ];

  const wsCalc = XLSX.utils.aoa_to_sheet(calcData);
  XLSX.utils.book_append_sheet(wb, wsCalc, "Detail Výpočtov");

  // Generate Buffer
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Save
  const safeName = metadata.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${safeName}_vypocet.xlsx`);
};
