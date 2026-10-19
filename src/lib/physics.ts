export interface ReactorParams {
  controlRods: number;
  enrichment: number;
  coolantFlow: number;
  turbineEfficiency: number;
}

export interface ReactorState {
  kEff: number;
  thermalPower: number;
  coreTemperature: number;
  steamTemperature: number;
  steamPressure: number;
  electricalPower: number;
  overallEfficiency: number;
  status: 'parada' | 'arranque' | 'operacion' | 'potencia maxima' | 'emergencia';
  fissionRate: number;
  energyPerFission: number;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

export function formatNumber(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '∞';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e6) return n.toExponential(2);
  if (abs >= 1) return n.toFixed(digits);
  return n.toFixed(4);
}

export function computeReactorState(params: ReactorParams): ReactorState {
  const { controlRods, enrichment, coolantFlow, turbineEfficiency } = params;

  const kBase = 0.85 + (enrichment / 100) * 0.6;
  const kRods = kBase * (0.45 + (controlRods / 100) * 0.65);
  const kEff = Math.max(0, kRods);

  const reactivity = Math.max(0, (kEff - 1) / kEff);
  const thermalPower = clamp(reactivity * 3500, 0, 3200);

  const coreTemperature = clamp(280 + thermalPower * 0.08 - coolantFlow * 0.15, 20, 650);
  const steamTemperature = clamp(coreTemperature - 40 - (3000 - thermalPower) * 0.005, 20, 340);
  const steamPressure = clamp((steamTemperature - 100) * 1.6, 0, 155);

  const electricalPower = clamp(thermalPower * 0.33 * turbineEfficiency, 0, 1100);
  const overallEfficiency = thermalPower > 0 ? (electricalPower / thermalPower) * 100 : 0;

  const energyPerFission = 200;
  const fissionRate = thermalPower > 0 ? (thermalPower * 1e6) / (energyPerFission * 1.602e-13) : 0;

  let status: ReactorState['status'];
  if (thermalPower < 1) status = 'parada';
  else if (thermalPower < 300) status = 'arranque';
  else if (thermalPower < 2800) status = 'operacion';
  else if (thermalPower <= 3100) status = 'potencia maxima';
  else status = 'emergencia';

  return {
    kEff,
    thermalPower,
    coreTemperature,
    steamTemperature,
    steamPressure,
    electricalPower,
    overallEfficiency,
    status,
    fissionRate,
    energyPerFission,
  };
}

/* ========================================================================== */
/* MOTOR DE FÍSICA NUCLEAR OFFLINE (100% NATIVO EN JAVASCRIPT / TYPESCRIPT)   */
/* ========================================================================== */

// --- 1. MONTE CARLO DE FISIÓN ---
export type MonteCarloResult = {
  id: string;
  generations: number[];
  population: number[];
  fissions: number[];
  k_effective: number[];
  total_fissions: number;
  final_population: number;
  average_k: number;
  regime: 'subcritical' | 'critical' | 'supercritical';
  timestamp: string;
};

function poissonSample(lam: number): number {
  const threshold = Math.exp(-lam);
  let k = 0;
  let prod = 1.0;
  while (prod > threshold) {
    k += 1;
    prod *= Math.random();
  }
  return Math.max(0, k - 1);
}

export function computeMonteCarloFission(
  initialNeutrons: number,
  generations: number,
  fissionProbability: number,
  neutronsPerFission = 2.43
): MonteCarloResult {
  let population = initialNeutrons;
  const gen: number[] = [0];
  const pops: number[] = [population];
  const fissionsPerGen: number[] = [0];
  const kEffective: number[] = [0.0];
  let totalFissions = 0;

  for (let g = 1; g <= generations; g++) {
    if (population <= 0) {
      gen.push(g);
      pops.push(0);
      fissionsPerGen.push(0);
      kEffective.push(0.0);
      continue;
    }

    const sampled = Math.min(population, 50000);
    const scale = population / sampled;
    let fissions = 0;
    for (let i = 0; i < sampled; i++) {
      if (Math.random() < fissionProbability) {
        fissions += 1;
      }
    }
    fissions = Math.floor(fissions * scale);

    let newNeutrons = 0;
    const poissonSampled = Math.min(fissions, 50000);
    for (let i = 0; i < poissonSampled; i++) {
      newNeutrons += poissonSample(neutronsPerFission);
    }
    if (fissions > 50000 && poissonSampled > 0) {
      newNeutrons = Math.floor(newNeutrons * (fissions / poissonSampled));
    }

    const k = population > 0 ? newNeutrons / population : 0.0;
    population = Math.min(newNeutrons, 1_000_000_000);
    totalFissions += fissions;

    gen.push(g);
    pops.push(population);
    fissionsPerGen.push(fissions);
    kEffective.push(Number(k.toFixed(6)));
  }

  const validK = kEffective.slice(1);
  const avgK = validK.length > 0 ? validK.reduce((a, b) => a + b, 0) / validK.length : 0;
  let regime: MonteCarloResult['regime'] = 'subcritical';
  if (avgK >= 0.98 && avgK <= 1.02) {
    regime = 'critical';
  } else if (avgK > 1.02) {
    regime = 'supercritical';
  }

  return {
    id: Math.floor(100000 + Math.random() * 900000).toString(),
    generations: gen,
    population: pops,
    fissions: fissionsPerGen,
    k_effective: kEffective,
    total_fissions: totalFissions,
    final_population: population,
    average_k: Number(avgK.toFixed(4)),
    regime,
    timestamp: new Date().toISOString(),
  };
}

// --- 2. DISPERSIÓN ELÁSTICA ---
export type ScatteringResult = {
  id: string;
  angles_deg: number[];
  energy_after: number[];
  energies_grid: number[];
  cross_section: number[];
  alpha: number;
  min_energy: number;
  max_energy_loss_fraction: number;
  timestamp: string;
};

export function computeElasticScattering(
  initialEnergy: number,
  nucleusMass: number,
  numPoints = 180
): ScatteringResult {
  const alpha = ((nucleusMass - 1.0) / (nucleusMass + 1.0)) ** 2;
  const angles: number[] = [];
  const energyAfter: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const deg = i * (180.0 / (numPoints - 1));
    angles.push(Number(deg.toFixed(2)));
    const thetaRad = (deg * Math.PI) / 180.0;
    const ratio = 0.5 * (1.0 + alpha + (1.0 - alpha) * Math.cos(thetaRad));
    energyAfter.push(Number((initialEnergy * ratio).toFixed(6)));
  }

  const eMin = 0.001;
  const eMax = Math.max(initialEnergy * 1.5, 1.0);
  const energiesGrid: number[] = [];
  const crossSection: number[] = [];
  const sigma0 = 4.0;
  const eRes = 0.5 + nucleusMass / 100.0;
  const gamma = 0.15;

  for (let i = 0; i < numPoints; i++) {
    const e = eMin + ((eMax - eMin) * i) / (numPoints - 1);
    energiesGrid.push(Number(e.toFixed(4)));
    const base = sigma0 / Math.sqrt(e);
    const resonance = (8.0 * (gamma ** 2)) / ((e - eRes) ** 2 + gamma ** 2);
    crossSection.push(Number((base + resonance).toFixed(4)));
  }

  return {
    id: Math.floor(100000 + Math.random() * 900000).toString(),
    angles_deg: angles,
    energy_after: energyAfter,
    energies_grid: energiesGrid,
    cross_section: crossSection,
    alpha: Number(alpha.toFixed(6)),
    min_energy: Number((initialEnergy * alpha).toFixed(6)),
    max_energy_loss_fraction: Number((1.0 - alpha).toFixed(6)),
    timestamp: new Date().toISOString(),
  };
}

// --- 3. DECAIMIENTO RADIACTIVO Y CADENAS ---
export type QuantityMode = 'activities' | 'masses' | 'moles' | 'numbers';

export interface IsotopeNuclearData {
  halfLifeSeconds: number;
  halfLifeReadable: string;
  halfLifeYears: number;
  progeny: string[];
  branchingFractions: number[];
  decayModes: string[];
  Z: number;
  A: number;
  atomicMass: number;
}

export const NUCLEAR_DATABASE: Record<string, IsotopeNuclearData> = {
  'Mo-99': {
    halfLifeSeconds: 237492, // 65.97 h
    halfLifeReadable: '65.97 h',
    halfLifeYears: 0.00753,
    progeny: ['Tc-99m', 'Tc-99'],
    branchingFractions: [0.876, 0.124],
    decayModes: ['β-', 'β-'],
    Z: 42,
    A: 99,
    atomicMass: 98.9077,
  },
  'Tc-99m': {
    halfLifeSeconds: 21624, // 6.006 h
    halfLifeReadable: '6.006 h',
    halfLifeYears: 0.000685,
    progeny: ['Tc-99'],
    branchingFractions: [1.0],
    decayModes: ['IT (γ)'],
    Z: 43,
    A: 99,
    atomicMass: 98.9063,
  },
  'Tc-99': {
    halfLifeSeconds: 6.66e12, // 211,100 y
    halfLifeReadable: '2.111e5 y',
    halfLifeYears: 211100,
    progeny: ['Ru-99'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 43,
    A: 99,
    atomicMass: 98.9062,
  },
  'I-131': {
    halfLifeSeconds: 693120, // 8.025 d
    halfLifeReadable: '8.025 d',
    halfLifeYears: 0.02197,
    progeny: ['Xe-131'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 53,
    A: 131,
    atomicMass: 130.9061,
  },
  'I-135': {
    halfLifeSeconds: 23652, // 6.57 h
    halfLifeReadable: '6.57 h',
    halfLifeYears: 0.00075,
    progeny: ['Xe-135'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 53,
    A: 135,
    atomicMass: 134.9100,
  },
  'Xe-135': {
    halfLifeSeconds: 32904, // 9.14 h
    halfLifeReadable: '9.14 h',
    halfLifeYears: 0.00104,
    progeny: ['Cs-135'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 54,
    A: 135,
    atomicMass: 134.9072,
  },
  'Cs-137': {
    halfLifeSeconds: 9.49e8, // 30.08 y
    halfLifeReadable: '30.08 y',
    halfLifeYears: 30.08,
    progeny: ['Ba-137m', 'Ba-137'],
    branchingFractions: [0.946, 0.054],
    decayModes: ['β-', 'β-'],
    Z: 55,
    A: 137,
    atomicMass: 136.9071,
  },
  'Ba-137m': {
    halfLifeSeconds: 153.1, // 2.55 m
    halfLifeReadable: '2.55 m',
    halfLifeYears: 4.85e-6,
    progeny: ['Ba-137'],
    branchingFractions: [1.0],
    decayModes: ['IT (γ)'],
    Z: 56,
    A: 137,
    atomicMass: 136.9058,
  },
  'Ba-137': {
    halfLifeSeconds: Infinity,
    halfLifeReadable: 'estable',
    halfLifeYears: Infinity,
    progeny: [],
    branchingFractions: [],
    decayModes: [],
    Z: 56,
    A: 137,
    atomicMass: 136.9058,
  },
  'Co-60': {
    halfLifeSeconds: 1.66e8, // 5.27 y
    halfLifeReadable: '5.271 y',
    halfLifeYears: 5.271,
    progeny: ['Ni-60'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 27,
    A: 60,
    atomicMass: 59.9338,
  },
  'Sr-90': {
    halfLifeSeconds: 9.08e8, // 28.79 y
    halfLifeReadable: '28.79 y',
    halfLifeYears: 28.79,
    progeny: ['Y-90'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 38,
    A: 90,
    atomicMass: 89.9077,
  },
  'Y-90': {
    halfLifeSeconds: 230400, // 64 h
    halfLifeReadable: '64.0 h',
    halfLifeYears: 0.0073,
    progeny: ['Zr-90'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 39,
    A: 90,
    atomicMass: 89.9071,
  },
  'Kr-85': {
    halfLifeSeconds: 3.39e8, // 10.75 y
    halfLifeReadable: '10.75 y',
    halfLifeYears: 10.75,
    progeny: ['Rb-85'],
    branchingFractions: [1.0],
    decayModes: ['β-'],
    Z: 36,
    A: 85,
    atomicMass: 84.9125,
  },
  'Kr-85m': {
    halfLifeSeconds: 16128, // 4.48 h
    halfLifeReadable: '4.48 h',
    halfLifeYears: 0.00051,
    progeny: ['Kr-85', 'Rb-85'],
    branchingFractions: [0.788, 0.212],
    decayModes: ['IT (γ)', 'β-'],
    Z: 36,
    A: 85,
    atomicMass: 84.9125,
  },
  'U-235': {
    halfLifeSeconds: 2.22e16, // 704M y
    halfLifeReadable: '7.04e8 y',
    halfLifeYears: 704000000,
    progeny: ['Th-231'],
    branchingFractions: [1.0],
    decayModes: ['α'],
    Z: 92,
    A: 235,
    atomicMass: 235.0439,
  },
  'U-238': {
    halfLifeSeconds: 1.41e17, // 4.468B y
    halfLifeReadable: '4.468e9 y',
    halfLifeYears: 4468000000,
    progeny: ['Th-234'],
    branchingFractions: [1.0],
    decayModes: ['α'],
    Z: 92,
    A: 238,
    atomicMass: 238.0508,
  },
  'Pu-239': {
    halfLifeSeconds: 7.61e11, // 24,110 y
    halfLifeReadable: '2.411e4 y',
    halfLifeYears: 24110,
    progeny: ['U-235'],
    branchingFractions: [1.0],
    decayModes: ['α'],
    Z: 94,
    A: 239,
    atomicMass: 239.0522,
  },
};

export type DecayResult = {
  id: string;
  isotope: string;
  input_isotope: string;
  input_units: string;
  input_value: number;
  output_mode: QuantityMode;
  output_units: string;
  time_units: 's' | 'm' | 'h' | 'd' | 'y';
  times: number[];
  series_by_nuclide: Record<string, number[]>;
  parent_series: number[];
  total_series: number[];
  final_parent_value: number;
  inventory_after: Record<string, number>;
  fractions: Record<string, number>;
  cumulative_decays: Record<string, number>;
  half_life_years: number | null;
  half_life_label: string;
  nuclide_data: {
    progeny: string[];
    branching_fractions: number[];
    decay_modes: string[];
    Z: number;
    A: number;
    atomic_mass: number;
  };
  chain_data: {
    half_lives: Record<string, string>;
    progeny: Record<string, string[]>;
    branching_fractions: Record<string, number[]>;
    decay_modes: Record<string, string[]>;
  };
  products: Array<{ nuclide: string; final_value: number }>;
  timestamp: string;
};

const TIME_MULTIPLIERS_IN_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
  y: 31557600,
};

export function computeRadioactiveDecay(
  isotope: string,
  initialValue: number,
  inputUnits = 'Bq',
  duration = 100,
  timeUnits: 's' | 'm' | 'h' | 'd' | 'y' = 'h',
  points = 240,
  outputMode: QuantityMode = 'activities',
  outputUnits = 'Bq'
): DecayResult {
  const normIsotope = isotope.trim();
  const data = NUCLEAR_DATABASE[normIsotope] || {
    halfLifeSeconds: 3600 * 24,
    halfLifeReadable: '24.0 h',
    halfLifeYears: 0.00274,
    progeny: [],
    branchingFractions: [],
    decayModes: ['β-'],
    Z: 50,
    A: 100,
    atomicMass: 100.0,
  };

  const tUnitSec = TIME_MULTIPLIERS_IN_SECONDS[timeUnits] || 3600;
  const lambda1 = Math.LN2 / data.halfLifeSeconds;

  const times: number[] = [];
  const parentSeries: number[] = [];
  const seriesByNuclide: Record<string, number[]> = {
    [normIsotope]: parentSeries,
  };

  const daughterNames = data.progeny;
  const daughterSeries: Record<string, number[]> = {};
  for (const d of daughterNames) {
    daughterSeries[d] = [];
    seriesByNuclide[d] = daughterSeries[d];
  }

  for (let i = 0; i < points; i++) {
    const tVal = (duration * i) / (points - 1);
    times.push(Number(tVal.toFixed(3)));
    const tSec = tVal * tUnitSec;

    // Decaimiento del padre N1(t) = N0 * exp(-lambda1 * t)
    const n1 = initialValue * Math.exp(-lambda1 * tSec);
    parentSeries.push(n1);

    // Ecuaciones de Bateman para hijas directas
    daughterNames.forEach((dName, dIdx) => {
      const dData = NUCLEAR_DATABASE[dName];
      const bf = data.branchingFractions[dIdx] ?? 1.0;
      if (!dData || !Number.isFinite(dData.halfLifeSeconds) || dData.halfLifeSeconds === Infinity) {
        // Hija estable acumulativa
        const nD = initialValue * bf * (1 - Math.exp(-lambda1 * tSec));
        daughterSeries[dName].push(nD);
      } else {
        const lambda2 = Math.LN2 / dData.halfLifeSeconds;
        let nD = 0;
        if (Math.abs(lambda1 - lambda2) > 1e-15) {
          nD = initialValue * bf * (lambda1 / (lambda2 - lambda1)) * (Math.exp(-lambda1 * tSec) - Math.exp(-lambda2 * tSec));
        } else {
          nD = initialValue * bf * lambda1 * tSec * Math.exp(-lambda1 * tSec);
        }
        daughterSeries[dName].push(Math.max(0, nD));
      }
    });
  }

  const totalSeries = times.map((_, idx) => {
    let sum = 0;
    for (const key in seriesByNuclide) {
      sum += seriesByNuclide[key][idx] || 0;
    }
    return sum;
  });

  const finalParent = parentSeries[parentSeries.length - 1];
  const inventoryAfter: Record<string, number> = {};
  const fractions: Record<string, number> = {};
  let finalSum = 0;

  for (const key in seriesByNuclide) {
    const fVal = seriesByNuclide[key][seriesByNuclide[key].length - 1] || 0;
    inventoryAfter[key] = fVal;
    finalSum += fVal;
  }
  for (const key in inventoryAfter) {
    fractions[key] = finalSum > 0 ? inventoryAfter[key] / finalSum : 0;
  }

  const products = daughterNames.map((dName) => ({
    nuclide: dName,
    final_value: inventoryAfter[dName] || 0,
  }));

  const chainHalfLives: Record<string, string> = { [normIsotope]: data.halfLifeReadable };
  const chainProgeny: Record<string, string[]> = { [normIsotope]: data.progeny };
  const chainBf: Record<string, number[]> = { [normIsotope]: data.branchingFractions };
  const chainModes: Record<string, string[]> = { [normIsotope]: data.decayModes };

  daughterNames.forEach((dName) => {
    const dData = NUCLEAR_DATABASE[dName];
    if (dData) {
      chainHalfLives[dName] = dData.halfLifeReadable;
      chainProgeny[dName] = dData.progeny;
      chainBf[dName] = dData.branchingFractions;
      chainModes[dName] = dData.decayModes;
    }
  });

  return {
    id: Math.floor(100000 + Math.random() * 900000).toString(),
    isotope: normIsotope,
    input_isotope: normIsotope,
    input_units: inputUnits,
    input_value: initialValue,
    output_mode: outputMode,
    output_units: outputUnits,
    time_units: timeUnits,
    times,
    series_by_nuclide: seriesByNuclide,
    parent_series: parentSeries,
    total_series: totalSeries,
    final_parent_value: finalParent,
    inventory_after: inventoryAfter,
    fractions,
    cumulative_decays: inventoryAfter,
    half_life_years: data.halfLifeYears,
    half_life_label: data.halfLifeReadable,
    nuclide_data: {
      progeny: data.progeny,
      branching_fractions: data.branchingFractions,
      decay_modes: data.decayModes,
      Z: data.Z,
      A: data.A,
      atomic_mass: data.atomicMass,
    },
    chain_data: {
      half_lives: chainHalfLives,
      progeny: chainProgeny,
      branching_fractions: chainBf,
      decay_modes: chainModes,
    },
    products,
    timestamp: new Date().toISOString(),
  };
}
