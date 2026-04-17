export type HydrationUnit = 'metric' | 'imperial';

const ML_PER_OZ = 29.5735;

export function mlToOz(ml: number): number {
  return Math.round((ml / ML_PER_OZ) * 10) / 10;
}

export function ozToMl(oz: number): number {
  return Math.round(oz * ML_PER_OZ);
}

export function formatHydrationAmount(ml: number, unit: HydrationUnit): string {
  if (unit === 'imperial') {
    const oz = mlToOz(ml);
    return oz >= 128 ? `${Math.round((oz / 128) * 10) / 10} gal` : `${oz} fl oz`;
  }
  return ml >= 1000 ? `${Math.round((ml / 100)) / 10} L` : `${ml} mL`;
}

export function getUnitLabel(unit: HydrationUnit): string {
  return unit === 'imperial' ? 'fl oz' : 'mL';
}

export function getStoredHydrationUnit(): HydrationUnit {
  const stored = localStorage.getItem('hydration-unit');
  return stored === 'imperial' ? 'imperial' : 'metric';
}

export function setStoredHydrationUnit(unit: HydrationUnit): void {
  localStorage.setItem('hydration-unit', unit);
}

export const QUICK_AMOUNTS_ML = [250, 350, 500, 750, 1000];
export const QUICK_AMOUNTS_OZ = [8, 12, 16, 24, 32];
