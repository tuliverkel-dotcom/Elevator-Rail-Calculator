export enum RailProfileType {
  T45_A = 'T45/A',
  T50_A = 'T50/A',
  T70_A = 'T70/A',
  T70_B = 'T70/B',
  T75_A = 'T75/A',
  T75_B = 'T75/B',
  T82_A = 'T82/A',
  T82_B = 'T82/B',
  T89_A = 'T89/A',
  T89_B = 'T89/B',
  T90_A = 'T90/A',
  T90_B = 'T90/B',
  T114_B = 'T114/B',
  T125_A = 'T125/A',
  T125_B = 'T125/B',
  T127_1_B = 'T127-1/B',
  T127_2_B = 'T127-2/B',
  T140_1_B = 'T140-1/B',
  T140_2_B = 'T140-2/B',
  T140_3_B = 'T140-3/B'
}

export interface RailProperties {
  name: string;
  weight: number; // kg/m
  area: number; // mm2
  Ixx: number; // mm4 (Moment of Inertia X-axis)
  Iyy: number; // mm4 (Moment of Inertia Y-axis)
  Wx: number; // mm3 (Section Modulus X-axis)
  Wy: number; // mm3 (Section Modulus Y-axis)
  i_min: number; // mm (Radius of gyration, min)
}

export interface ProjectDetails {
  customer: string;
  reference: string;
  projectNumber: string;
  date: string;
}

export interface InputParams {
  // Loads
  P: number; // Empty Car (kg)
  Q: number; // Rated Load (kg)
  M_cwt: number; // Counterweight mass (kg)
  Motor: number; // Motor weight (if on car) (kg)
  
  // Dynamics
  ratedSpeed: number; // m/s
  brakeDecel: number; // m/s2, usually 0.5-1.0 g roughly, represented as g's or value
  
  // Geometry
  L: number; // Bracket distance (mm)
  h_car: number; // Vertical distance between car guide shoes (mm)
  h_cwt: number; // Vertical distance between CWT guide shoes (mm)
  
  // Eccentricities (Center of Gravity coordinates)
  xp: number; // Car Empty CG X (mm)
  yp: number; // Car Empty CG Y (mm)
  xq: number; // Rated Load CG X (mm)
  yq: number; // Rated Load CG Y (mm)
  xc: number; // CWT CG X (mm)
  yc: number; // CWT CG Y (mm)

  // Rail Selection
  carRail: RailProfileType;
  cwtRail: RailProfileType;
}

export interface CalculationResult {
  // Forces & Moments
  Fx: number;
  Fy: number;
  Mx: number;
  My: number;
  
  // Stresses
  sigmaX: number;
  sigmaY: number;
  sigmaTotal: number;
  permStress: number; // Permissible stress
  
  // Deflection (Normal operation)
  deflectionX: number;
  deflectionY: number;
  maxDeflection: number;
  
  // Buckling (Safety Gear operation)
  slenderness: number; // Lambda
  omega: number; // Buckling factor
  sigmaBuckling: number;
}

export interface AnalysisReport {
  carSafety: CalculationResult;
  carNormal: CalculationResult;
  cwtNormal: CalculationResult; // CWT usually analyzed in normal or buffer strike
}

// AI Analysis Types
export interface AIAnalysisResponse {
  analysis: string;
  optimizationTips: string[];
  safetyStatus: 'SAFE' | 'CRITICAL' | 'WARNING';
}