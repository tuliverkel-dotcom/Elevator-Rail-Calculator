import { InputParams, AnalysisReport, CalculationResult, RailProfileType } from "../types";
import { RAIL_LIBRARY } from "../constants";

const G = 9.81;

/**
 * Calculates the Omega factor (Buckling factor) based on Slenderness ratio (Lambda).
 * Simplified table lookup/interpolation for Steel (St37/Fe360).
 */
function getOmega(lambda: number): number {
  // Simplified linear approximation for demo purposes based on standard Eurocode tables for Steel
  if (lambda < 20) return 1.0;
  if (lambda > 250) return 8.0; // Extreme
  
  // A rough curve fitting standard steel tables
  // Lambda: 20 -> 1.04
  // Lambda: 100 -> 1.71 (approx)
  // Lambda: 150 -> 3.5
  
  if (lambda <= 100) {
      return 1.0 + (lambda - 20) * (0.8 / 80); 
  } else {
      return 1.8 + (lambda - 100) * (0.04);
  }
}

export function calculateAnalysis(inputs: InputParams): AnalysisReport {
  const carRail = RAIL_LIBRARY[inputs.carRail];
  const cwtRail = RAIL_LIBRARY[inputs.cwtRail];

  // --- 1. CAR SAFETY GEAR OPERATION ---
  // Scenario: Safety gear engages. High vertical force + Moment due to eccentric load.
  // Standard assumes Safety Gear acts on both rails.
  
  const k1 = 2; // Impact factor for safety gear
  const totalMassCar = inputs.P + inputs.Q + inputs.Motor; // Total moving mass
  const brakingForce = (totalMassCar * G * (k1)); // Total vertical force stopping the car
  
  // Forces per rail (simplified symmetric assumption unless detailed X/Y given)
  // Fv (vertical braking force per rail)
  const Fv_safety = brakingForce / 2;

  // Bending Moments due to eccentricity
  // We combine Empty Car (P) at (xp, yp) and Load (Q) at (xq, yq)
  const totalMomentX = ((inputs.P * inputs.xp) + (inputs.Q * inputs.xq)) * G;
  const totalMomentY = ((inputs.P * inputs.yp) + (inputs.Q * inputs.yq)) * G;
  
  // Horizontal Forces on Guide Shoes (Lever principle: M / h)
  const Fx_safety = (totalMomentX / inputs.h_car) * 1.5; // 1.5 safety factor generic
  const Fy_safety = (totalMomentY / inputs.h_car) * 1.5;

  // Bending Moments on Rail
  // Simplified beam formula: M = F * L / 4 (point load in middle of bracket span)
  const Mx_safety = (Fy_safety * inputs.L) / 4; 
  const My_safety = (Fx_safety * inputs.L) / 4;

  // Stress Calculation (Bending)
  const sigma_m_x = Mx_safety / carRail.Wx;
  const sigma_m_y = My_safety / carRail.Wy;
  
  // Buckling Calculation
  // Force causing buckling is Fv_safety
  // Free buckling length l_k approx L (simplification)
  const l_k = inputs.L; 
  const slenderness = l_k / carRail.i_min;
  const omega = getOmega(slenderness);
  
  // Sigma Buckling = (Fv * omega) / Area
  const sigma_buckling = (Fv_safety * omega) / carRail.area;
  const sigma_total_safety = sigma_buckling + 0.9 * (sigma_m_x + sigma_m_y); // Combined stress formula approx

  const carSafety: CalculationResult = {
    Fx: Fx_safety,
    Fy: Fy_safety,
    Mx: Mx_safety,
    My: My_safety,
    sigmaX: sigma_m_x,
    sigmaY: sigma_m_y,
    sigmaTotal: sigma_total_safety,
    permStress: 205, // Steel usually 205-235 MPa for safety gear
    deflectionX: 0, // Not critical for safety gear
    deflectionY: 0,
    maxDeflection: 0,
    slenderness: slenderness,
    omega: omega,
    sigmaBuckling: sigma_buckling
  };

  // --- 2. CAR NORMAL OPERATION ---
  // Scenario: Running, forces due to guiding eccentric loads.
  
  // Forces are smaller, primarily due to off-balance P+Q
  // Using simplified static balance
  const Fx_normal = ((inputs.P * inputs.xp + inputs.Q * inputs.xq) * G) / inputs.h_car;
  const Fy_normal = ((inputs.P * inputs.yp + inputs.Q * inputs.yq) * G) / inputs.h_car;

  const Mx_normal = (Fy_normal * inputs.L) / 4; 
  const My_normal = (Fx_normal * inputs.L) / 4;

  const sigma_n_x = Mx_normal / carRail.Wx;
  const sigma_n_y = My_normal / carRail.Wy;
  const sigma_total_normal = sigma_n_x + sigma_n_y;

  // Deflection (delta = F * L^3 / (48 * E * I)) - Simple beam center load
  const E = 210000; // Modulus of Elasticity for Steel (N/mm2)
  const def_x = (Fx_normal * Math.pow(inputs.L, 3)) / (48 * E * carRail.Iyy); // Force X bends around Y axis
  const def_y = (Fy_normal * Math.pow(inputs.L, 3)) / (48 * E * carRail.Ixx); // Force Y bends around X axis

  const carNormal: CalculationResult = {
    Fx: Fx_normal,
    Fy: Fy_normal,
    Mx: Mx_normal,
    My: My_normal,
    sigmaX: sigma_n_x,
    sigmaY: sigma_n_y,
    sigmaTotal: sigma_total_normal,
    permStress: 165, // Lower for normal running
    deflectionX: def_x,
    deflectionY: def_y,
    maxDeflection: 5, // mm limit typically
    slenderness: 0,
    omega: 0,
    sigmaBuckling: 0
  };

  // --- 3. COUNTERWEIGHT (Simplified) ---
  // Assuming CWT is balanced usually, but let's add some small eccentricity or seismic factor
  const cwt_mass = inputs.M_cwt;
  const Fx_cwt = (cwt_mass * G * 0.05); // Assume 5% unbalance force
  const Fy_cwt = (cwt_mass * G * 0.05);

  const Mx_cwt = (Fy_cwt * inputs.L) / 4;
  const My_cwt = (Fx_cwt * inputs.L) / 4;

  const sigma_cwt_x = Mx_cwt / cwtRail.Wx;
  const sigma_cwt_y = My_cwt / cwtRail.Wy;

  const cwtResult: CalculationResult = {
    Fx: Fx_cwt,
    Fy: Fy_cwt,
    Mx: Mx_cwt,
    My: My_cwt,
    sigmaX: sigma_cwt_x,
    sigmaY: sigma_cwt_y,
    sigmaTotal: sigma_cwt_x + sigma_cwt_y,
    permStress: 165,
    deflectionX: (Fx_cwt * Math.pow(inputs.L, 3)) / (48 * E * cwtRail.Iyy),
    deflectionY: (Fy_cwt * Math.pow(inputs.L, 3)) / (48 * E * cwtRail.Ixx),
    maxDeflection: 5,
    slenderness: inputs.L / cwtRail.i_min,
    omega: 1,
    sigmaBuckling: 0
  };

  return {
    carSafety: carSafety,
    carNormal: carNormal,
    cwtNormal: cwtResult
  };
}