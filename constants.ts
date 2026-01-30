import { RailProperties, SystemInputs } from './types';

// PDF Page 5 Constants & Excel Data
export const CONSTANTS = {
  gn: 9.81, // Gravity
  E: 2.1e5, // Modulus of Elasticity (MPa)
  sigma_perm: 205, // Permissible stress (MPa) - Safety Gear Case (Zachytavac)
  sigma_perm_normal: 165, // Permissible stress (MPa) - Normal/Loading Case
  deflection_perm: 5, // Max deflection (mm)
};

// ISO 7465 Standard Rails
export const RAIL_T45A: RailProperties = {
  name: 'T45/A',
  area: 425,
  weight: 3.33,
  b: 45,
  h1: 45,
  k: 5,
  n: 5,
  c: 3, // approx
  Ix: 68600, // 6.86 cm4
  Iy: 32600, // 3.26 cm4
  Wx: 2600,
  Wy: 1450,
  ix: 12.7,
  iy: 8.76
};

export const RAIL_T50A: RailProperties = {
  name: 'T50/A',
  area: 475,
  weight: 3.73,
  b: 50,
  h1: 50,
  k: 5,
  n: 5,
  c: 3,
  Ix: 112400,
  Iy: 52500,
  Wx: 3950,
  Wy: 2100,
  ix: 15.4,
  iy: 10.5
};

export const RAIL_T70A: RailProperties = {
  name: 'T70/A',
  area: 940,
  weight: 7.379,
  b: 70, // Standard T70 is 70mm wide (previous code had 65, corrected to standard)
  h1: 65,
  k: 6,
  n: 8,
  c: 5,
  Ix: 406500,
  Iy: 188600,
  Wx: 9169,
  Wy: 5389,
  ix: 20.87,
  iy: 14.17
};

export const RAIL_T75A: RailProperties = { // Similar to T70 but wider base
  name: 'T75/A',
  area: 1090,
  weight: 8.55,
  b: 75,
  h1: 62,
  k: 8,
  n: 7,
  c: 5,
  Ix: 407000,
  Iy: 257000,
  Wx: 9550,
  Wy: 6850,
  ix: 19.3,
  iy: 15.4
};

export const RAIL_T82A: RailProperties = {
  name: 'T82/A',
  area: 1091,
  weight: 8.55,
  b: 82.5,
  h1: 68.25,
  k: 6,
  n: 8.25,
  c: 5,
  Ix: 494000,
  Iy: 323000,
  Wx: 10600,
  Wy: 7800,
  ix: 21.3,
  iy: 17.2
};

export const RAIL_T89A: RailProperties = {
  name: 'T89/A',
  area: 1570,
  weight: 12.3,
  b: 89,
  h1: 62,
  k: 10,
  n: 8,
  c: 5,
  Ix: 598000,
  Iy: 524000,
  Wx: 14500,
  Wy: 11800,
  ix: 19.5,
  iy: 18.3
};

export const RAIL_T90A: RailProperties = {
  name: 'T90/A',
  area: 1725,
  weight: 13.54,
  b: 90, // Corrected standard width
  h1: 75,
  k: 10,
  n: 10,
  c: 8,
  Ix: 1020000,
  Iy: 524800,
  Wx: 20860,
  Wy: 11660,
  ix: 24.31,
  iy: 17.44
};

export const RAIL_T114B: RailProperties = {
  name: 'T114/B',
  area: 2690,
  weight: 21.1,
  b: 114,
  h1: 89,
  k: 16,
  n: 10,
  c: 8,
  Ix: 2210000,
  Iy: 1470000,
  Wx: 37300,
  Wy: 25800,
  ix: 28.7,
  iy: 23.4
};

export const RAIL_T125B: RailProperties = {
    name: 'T125/B',
    area: 2320, 
    weight: 18.2,
    b: 125,
    h1: 82,
    k: 16,
    n: 16,
    c: 10,
    Ix: 2000000, 
    Iy: 1510000,
    Wx: 33900,
    Wy: 24200,
    ix: 29.3,
    iy: 25.5
}

export const RAIL_T127B: RailProperties = {
  name: 'T127-1/B',
  area: 2860,
  weight: 22.5,
  b: 127,
  h1: 89,
  k: 16,
  n: 10,
  c: 8,
  Ix: 2560000,
  Iy: 1980000,
  Wx: 42100,
  Wy: 31100,
  ix: 29.9,
  iy: 26.3
};

export const RAIL_T140B: RailProperties = { // Heavy Duty
  name: 'T140-1/B',
  area: 3500,
  weight: 27.4,
  b: 140,
  h1: 108,
  k: 19,
  n: 12,
  c: 10,
  Ix: 4990000,
  Iy: 3000000,
  Wx: 69900,
  Wy: 42800,
  ix: 37.7,
  iy: 29.2
};


export const AVAILABLE_RAILS = [
  RAIL_T45A,
  RAIL_T50A,
  RAIL_T70A,
  RAIL_T75A,
  RAIL_T82A,
  RAIL_T89A,
  RAIL_T90A,
  RAIL_T114B,
  RAIL_T125B,
  RAIL_T127B,
  RAIL_T140B
];

// UPDATED DEFAULTS based on User Excel
export const DEFAULT_INPUTS: SystemInputs = {
  // Load Params
  P: 1100, // Car Mass
  Q: 800,  // Rated Load
  Mot: 300,
  Mctw: 1500,
  
  // Dynamics
  v_rated: 1.0, // Default for T90/T70 systems usually
  a_brake: 2.8, // Derived from Excel Fv approx (approx 0.3gn)

  // Geometry
  L: 2500,
  h_k: 3300,
  h_ctw: 3000,
  n_rails: 2,

  // Eccentricities (Matches Excel)
  Xp: 75,
  Yp: 10,
  Xq: 187.5,
  Yq: 162.5,
  
  // Shoes
  xi: 800,
  yi: 100,
  
  // Safety Factors (Matches Excel)
  k1: 2,
  k2: 1.2,
  k3: 1.2,
};