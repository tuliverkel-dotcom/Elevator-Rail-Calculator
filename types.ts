
export interface RailProperties {
  name: string;
  area: number; // mm2
  weight: number; // kg/m
  b: number; // mm
  h1: number; // mm
  k: number; // mm
  n: number; // mm
  c: number; // mm
  Ix: number; // mm4
  Iy: number; // mm4
  Wx: number; // mm3
  Wy: number; // mm3
  ix: number; // mm
  iy: number; // mm
}

export interface SystemInputs {
  // Masses
  P: number; // Empty car mass (kg)
  Q: number; // Rated load (kg)
  Mot: number; // Motor/Accessory mass (kg)
  Mctw: number; // Counterweight mass (kg)
  
  // Dynamics
  v_rated: number; // Rated Speed (m/s)
  a_brake: number; // Safety gear braking deceleration (m/s2). Typically 0.2gn to 1.0gn
  
  // Dimensions & Geometry
  L: number; // Distance between brackets (mm)
  h_k: number; // Vert dist guide shoes car (mm)
  h_ctw: number; // Vert dist guide shoes cwt (mm)
  n_rails: number; // Number of rails (usually 2)

  // Eccentricities (Car)
  Xp: number; // mm
  Yp: number; // mm
  Xq: number; // mm
  Yq: number; // mm
  
  // Guide Shoe Dimensions
  xi: number; // mm
  yi: number; // mm
  
  // Safety Gear (Zachytavac)
  k1: number; // Impact factor (depends on instantaneous vs progressive)
  k2: number; 
  k3: number;
}

export interface CalculationResult {
  forceFx: number;
  forceFy: number;
  momentMx: number;
  momentMy: number;
  sigmaX: number;
  sigmaY: number;
  sigmaM: number;
  deflectionX: number;
  deflectionY: number;
  slenderness: number;
  omega: number;
  sigmaBuckling: number;
}
