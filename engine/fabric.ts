import type { FabricProfile, Measurements } from "./types.js";

export interface FabricProfileConfig {
  id: string;
  stretchWidthPercent: number;
  stretchLengthPercent: number;
  suppressDarts: boolean;
}

export const FABRIC_PROFILES: Record<string, FabricProfileConfig> = {
  woven: {
    id: "woven",
    stretchWidthPercent: 0,
    stretchLengthPercent: 0,
    suppressDarts: false,
  },
  "knit-light": {
    id: "knit-light",
    stretchWidthPercent: 0.05,
    stretchLengthPercent: 0.02,
    suppressDarts: true,
  },
  "knit-strong": {
    id: "knit-strong",
    stretchWidthPercent: 0.12,
    stretchLengthPercent: 0.05,
    suppressDarts: true,
  },
};

export function applyFabricProfile(
  measurements: Measurements,
  profile: FabricProfileConfig
): Measurements {
  return {
    ...measurements,
    bust: measurements.bust * (1 - profile.stretchWidthPercent),
    waist: measurements.waist * (1 - profile.stretchWidthPercent),
    height: measurements.height * (1 - profile.stretchLengthPercent),
  };
}

export function getFabricProfile(id: string): FabricProfileConfig {
  return FABRIC_PROFILES[id] ?? FABRIC_PROFILES.woven;
}

export type FabricProfile = FabricProfileConfig;
