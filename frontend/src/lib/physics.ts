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
