import { RailProperties, SystemInputs } from './types';

// PDF Page 5 Constants
export const CONSTANTS = {
  gn: 9.81, // Gravity
  E: 2.1e5, // Modulus of Elasticity (MPa)
  sigma_perm: 205, // Permissible stress (MPa)
  deflection_perm: 5, // Max deflection (mm)
};

// PDF Page 3 Rail Data
export const RAIL_T90A: RailProperties = {
  name: 'T90/A',
  area: 1725,
  weight: 13.54,
  b: 75,
  h1: 65,
  k: 10,
  n: 10,
  c: 8, // Estimated
  Ix: 1020000, // Derived from PDF 102.0 cm4
  Iy: 524800, // Derived from PDF 52.48 cm4
  Wx: 20860, // Derived from PDF
  Wy: 11660, // Derived from PDF
  ix: 24.31,
  iy: 17.44
};

export const RAIL_T70A: RailProperties = {
  name: 'T70/A',
  area: 940,
  weight: 7.379,
  b: 65,
  h1: 65, // Note: PDF lists dimensions broadly
  k: 6,
  n: 8,
  c: 5,
  Ix: 406500, // 40.65 cm4
  Iy: 188600, // 18.86 cm4
  Wx: 9169,
  Wy: 5389,
  ix: 20.87,
  iy: 14.17
};

export const RAIL_T125B: RailProperties = {
    name: 'T125/B',
    area: 2320, // Example placeholder data
    weight: 18.2,
    b: 125,
    h1: 82,
    k: 16,
    n: 16,
    c: 10,
    Ix: 2000000, 
    Iy: 1000000,
    Wx: 30000,
    Wy: 15000,
    ix: 30,
    iy: 20
}

export const AVAILABLE_RAILS = [RAIL_T90A, RAIL_T70A, RAIL_T125B];

// Default inputs extracted from PDF Page 1
export const DEFAULT_INPUTS: SystemInputs = {
  P: 1100,
  Q: 800,
  Mot: 300,
  Mctw: 1500,
  L: 2500,
  h_k: 3300,
  h_ctw: 3000,
  n_rails: 2,
  Xp: 75,
  Yp: 10,
  Xq: 187.5,
  Yq: 162.5,
  xi: 800,
  yi: 100,
  k1: 2,
  k2: 1.2,
  k3: 1.2,
};