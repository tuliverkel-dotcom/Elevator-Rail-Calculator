import { SystemInputs, RailProperties, CalculationResult } from '../types';
import { CONSTANTS } from '../constants';

/**
 * Calculates the Safety Gear (Zachytavac) Load Case
 * Based on PDF Page 1 formulas & EN 81-20
 */
export const calculateSafetyGearCase = (inputs: SystemInputs, rail: RailProperties): CalculationResult => {
  const { P, Q, k1, Xp, Yp, Xq, Yq, h_k, n_rails, a_brake } = inputs;
  const { gn } = CONSTANTS;

  // 1. Vertical Braking Force (Fv)
  // The force acting on the rail during safety gear engagement.
  // Standard: F = (P + Q) * (gn + a_brake)
  // If a_brake is small/zero in inputs, default to rough estimation (1.25 factor)
  let brakingDecel = a_brake * gn;
  if (!brakingDecel || brakingDecel === 0) brakingDecel = 0.25 * gn; // Fallback

  const Fv = (P + Q) * (gn + brakingDecel); 

  // 2. Bending Forces due to Eccentricity (Fx, Fy)
  // Impact factor k1 is applied here.
  
  // Fx = k1 * gn * (P*Xp + Q*Xq) / (n_rails * h_k)
  const Fx = (k1 * gn * (P * Xp + Q * Xq)) / h_k; 
  
  // Fy = k1 * gn * (P*Yp + Q*Yq) / (n_rails * h_k/2)
  const Fy = (k1 * gn * (P * Yp + Q * Yq)) / (h_k / 2);

  // 3. Moments
  const Mx = (Fy * inputs.L) / 4;
  const My = (Fx * inputs.L) / 4;

  // 4. Stresses
  const sigmaX = Mx / rail.Wx;
  const sigmaY = My / rail.Wy;
  const sigmaM = sigmaX + sigmaY;

  // 5. Buckling (Vzper)
  // Slenderness Lambda = L / i_min
  const slenderness = inputs.L / rail.iy;
  
  // Omega Method (approximate interpolation)
  // In a real app, we would have a full CSV table for Steel 370/520
  let omega = 1.0;
  if (slenderness < 20) omega = 1.04;
  else if (slenderness < 40) omega = 1.14;
  else if (slenderness < 60) omega = 1.30;
  else if (slenderness < 80) omega = 1.55;
  else if (slenderness < 100) omega = 1.90; // Approx for Steel 370
  else if (slenderness < 120) omega = 2.43;
  else if (slenderness < 140) omega = 3.31;
  else if (slenderness < 160) omega = 4.32;
  else omega = 5.25;

  const areaMM = rail.area;
  // Sigma_k = (Fv * omega) / A
  // Note: For buckling, the force is distributed per rail.
  // Fv_per_rail = Fv / n_rails
  const sigmaBuckling = ((Fv / n_rails) * omega) / areaMM;

  return {
    forceFx: Fx,
    forceFy: Fy,
    momentMx: Mx,
    momentMy: My,
    sigmaX,
    sigmaY,
    sigmaM,
    deflectionX: 0, 
    deflectionY: 0,
    slenderness,
    omega,
    sigmaBuckling
  };
};

/**
 * Calculates the Normal Operation (Running) Case
 */
export const calculateNormalCase = (inputs: SystemInputs, rail: RailProperties): CalculationResult => {
  const { P, Q, Xp, Yp, Xq, Yq, h_k, L } = inputs;
  const { gn } = CONSTANTS;
  
  // Forces
  const Fx = (gn * (P * Xp + Q * Xq)) / h_k / 2; // Divided by 2 rails
  const Fy = (gn * (P * Yp + Q * Yq)) / h_k;

  // Moments
  const Mx = (Fy * L) / 4; 
  const My = (Fx * L) / 4;

  // Stress
  const sigmaX = Mx / rail.Wx;
  const sigmaY = My / rail.Wy;
  const sigmaM = sigmaX + sigmaY;

  // Deflection (delta = F * L^3 / (48 * E * I)) - Simple beam
  const deflectionX = (Fx * Math.pow(L, 3)) / (48 * CONSTANTS.E * rail.Iy);
  const deflectionY = (Fy * Math.pow(L, 3)) / (48 * CONSTANTS.E * rail.Ix);

  return {
    forceFx: Fx,
    forceFy: Fy,
    momentMx: Mx,
    momentMy: My,
    sigmaX,
    sigmaY,
    sigmaM,
    deflectionX,
    deflectionY,
    slenderness: 0,
    omega: 0,
    sigmaBuckling: 0
  };
};

/**
 * Calculates Counterweight Data
 */
export const calculateCounterweight = (inputs: SystemInputs, rail: RailProperties): CalculationResult => {
   const { Mctw, L, h_ctw } = inputs;
   const { gn } = CONSTANTS;
   
   // Assume some eccentricity for CWT
   const e_x = rail.b * 0.10; 
   const e_y = rail.h1 * 0.10;

   const Fx = (Mctw * gn * e_x) / h_ctw;
   const Fy = (Mctw * gn * e_y) / h_ctw;

   const Mx = (Fy * L) / 4;
   const My = (Fx * L) / 4;

   const sigmaX = Mx / rail.Wx;
   const sigmaY = My / rail.Wy;
   const sigmaM = sigmaX + sigmaY;

   return {
    forceFx: Fx,
    forceFy: Fy,
    momentMx: Mx,
    momentMy: My,
    sigmaX,
    sigmaY,
    sigmaM,
    deflectionX: 0,
    deflectionY: 0,
    slenderness: 0,
    omega: 0,
    sigmaBuckling: 0
   };
}