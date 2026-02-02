import { InputParams, ProjectDetails, RailProfileType, RailProperties } from "./types";

/**
 * Rail Library based on ISO 7465 Standards.
 * Properties: Weight (kg/m), Area (mm2), Inertia (mm4), Modulus (mm3), Radius of Gyration (mm)
 */
export const RAIL_LIBRARY: Record<RailProfileType, RailProperties> = {
  [RailProfileType.T45_A]: {
    name: 'T45/A',
    weight: 3.25,
    area: 425,
    Ixx: 16000,
    Iyy: 8500,
    Wx: 6300,
    Wy: 3800,
    i_min: 11.2
  },
  [RailProfileType.T50_A]: {
    name: 'T50/A',
    weight: 3.98,
    area: 475,
    Ixx: 26000,
    Iyy: 11500,
    Wx: 9000,
    Wy: 4800,
    i_min: 14.1
  },
  [RailProfileType.T70_A]: {
    name: 'T70/A',
    weight: 7.379,
    area: 940,
    Ixx: 406500,
    Iyy: 188600,
    Wx: 9169,
    Wy: 5389,
    i_min: 14.17
  },
  [RailProfileType.T70_B]: {
    name: 'T70/B', // Machined
    weight: 7.379,
    area: 940,
    Ixx: 406500,
    Iyy: 188600,
    Wx: 9169,
    Wy: 5389,
    i_min: 14.17
  },
  [RailProfileType.T75_A]: {
    name: 'T75/A',
    weight: 11.0,
    area: 1402,
    Ixx: 843000,
    Iyy: 462000,
    Wx: 16600,
    Wy: 10200,
    i_min: 18.15
  },
  [RailProfileType.T75_B]: {
    name: 'T75/B',
    weight: 11.0,
    area: 1402,
    Ixx: 843000,
    Iyy: 462000,
    Wx: 16600,
    Wy: 10200,
    i_min: 18.15
  },
  [RailProfileType.T82_A]: {
    name: 'T82/A',
    weight: 13.5,
    area: 1725,
    Ixx: 1020000,
    Iyy: 524000,
    Wx: 20500,
    Wy: 11700,
    i_min: 17.5
  },
  [RailProfileType.T82_B]: {
    name: 'T82/B',
    weight: 13.5,
    area: 1725,
    Ixx: 1020000,
    Iyy: 524000,
    Wx: 20500,
    Wy: 11700,
    i_min: 17.5
  },
  [RailProfileType.T89_A]: {
    name: 'T89/A',
    weight: 12.3,
    area: 1570,
    Ixx: 898000,
    Iyy: 450000,
    Wx: 19700,
    Wy: 10000,
    i_min: 16.9
  },
  [RailProfileType.T89_B]: {
    name: 'T89/B',
    weight: 12.3,
    area: 1570,
    Ixx: 898000,
    Iyy: 450000,
    Wx: 19700,
    Wy: 10000,
    i_min: 16.9
  },
  [RailProfileType.T90_A]: {
    name: 'T90/A',
    weight: 13.54,
    area: 1725,
    Ixx: 1020000,
    Iyy: 524800,
    Wx: 20860,
    Wy: 11660,
    i_min: 17.44
  },
  [RailProfileType.T90_B]: {
    name: 'T90/B',
    weight: 13.54,
    area: 1725,
    Ixx: 1020000,
    Iyy: 524800,
    Wx: 20860,
    Wy: 11660,
    i_min: 17.44
  },
  [RailProfileType.T114_B]: {
    name: 'T114/B',
    weight: 20.7,
    area: 2620,
    Ixx: 2580000,
    Iyy: 1350000,
    Wx: 37500,
    Wy: 21500,
    i_min: 22.7
  },
  [RailProfileType.T125_A]: {
    name: 'T125/A', // Often similar to B in mass, but different finish. Using B props for safety/general
    weight: 18.0,
    area: 2280,
    Ixx: 2330000,
    Iyy: 1250000,
    Wx: 35000,
    Wy: 18000,
    i_min: 24.0
  },
  [RailProfileType.T125_B]: {
    name: 'T125/B',
    weight: 18.0,
    area: 2280,
    Ixx: 2330000,
    Iyy: 1250000,
    Wx: 35000,
    Wy: 18000,
    i_min: 24.0
  },
  [RailProfileType.T127_1_B]: {
    name: 'T127-1/B',
    weight: 22.5,
    area: 2860,
    Ixx: 3550000,
    Iyy: 1570000,
    Wx: 47500,
    Wy: 25000,
    i_min: 23.4
  },
  [RailProfileType.T127_2_B]: {
    name: 'T127-2/B',
    weight: 28.6,
    area: 3640,
    Ixx: 5570000,
    Iyy: 1870000,
    Wx: 68000,
    Wy: 29000,
    i_min: 22.6
  },
  [RailProfileType.T140_1_B]: {
    name: 'T140-1/B',
    weight: 28.6, // Sometimes listed as 28.6
    area: 3640,
    Ixx: 5570000,
    Iyy: 1870000,
    Wx: 68000,
    Wy: 29000,
    i_min: 22.6
  },
  [RailProfileType.T140_2_B]: {
    name: 'T140-2/B',
    weight: 37.4,
    area: 4770,
    Ixx: 9140000,
    Iyy: 2350000,
    Wx: 98000,
    Wy: 33500,
    i_min: 22.2
  },
  [RailProfileType.T140_3_B]: {
    name: 'T140-3/B',
    weight: 46.0,
    area: 5860,
    Ixx: 13900000,
    Iyy: 2790000,
    Wx: 135000,
    Wy: 39500,
    i_min: 21.8
  }
};

export const INITIAL_PROJECT: ProjectDetails = {
  customer: "Skyline Towers Inc.",
  reference: "Lift Group A - Shaft 1",
  projectNumber: "PRJ-2024-001",
  date: new Date().toISOString().split('T')[0]
};

export const INITIAL_INPUTS: InputParams = {
  P: 1100,
  Q: 800,
  M_cwt: 1500,
  Motor: 300,
  ratedSpeed: 1.0,
  brakeDecel: 0.5, // g
  L: 2500,
  h_car: 3300,
  h_cwt: 3000,
  xp: 75,
  yp: 10,
  xq: 187.5,
  yq: 162.5,
  xc: 0,
  yc: 0,
  carRail: RailProfileType.T90_A,
  cwtRail: RailProfileType.T70_A
};