import type { ConstructionProfile, GuideKind } from "./types.js";

export const CONSTRUCTION_PROFILES: Record<string, ConstructionProfile> = {
  "blouse-front": {
    id: "blouse-front",
    guideOrder: [
      "cf_axis",
      "dart_center",
      "dart_plus",
      "dart_minus",
      "grain",
    ],
    guideDependsOn: {
      cf_axis: ["cf_neck", "cf_hem"],
      dart_center: ["side_bottom", "cf_hem"],
      dart_plus: ["side_bottom", "cf_hem"],
      dart_minus: ["side_bottom", "cf_hem"],
      grain: ["cf_neck", "cf_hem", "side_bottom"],
    },
  },
  "blouse-back": {
    id: "blouse-back",
    guideOrder: [
      "cf_axis",
      "shoulder_line",
      "dart_center",
      "dart_plus",
      "dart_minus",
      "grain",
    ],
    guideDependsOn: {
      cf_axis: ["cf_neck", "cf_hem"],
      shoulder_line: ["shoulder_start", "shoulder_end"],
      dart_center: ["side_bottom", "cf_hem"],
      dart_plus: ["side_bottom", "cf_hem"],
      dart_minus: ["side_bottom", "cf_hem"],
      grain: ["cf_neck", "cf_hem", "side_bottom"],
    },
  },
  "skirt-front": {
    id: "skirt-front",
    guideOrder: ["cf_axis", "dart_center", "dart_plus", "dart_minus"],
    guideDependsOn: {
      cf_axis: ["cf_neck", "cf_hem"],
      dart_center: ["side_bottom", "cf_hem", "waist_side"],
      dart_plus: ["side_bottom", "cf_hem"],
      dart_minus: ["side_bottom", "cf_hem"],
    },
  },
  "skirt-back": {
    id: "skirt-back",
    guideOrder: ["cf_axis", "dart_center", "dart_plus", "dart_minus"],
    guideDependsOn: {
      cf_axis: ["cf_neck", "cf_hem"],
      dart_center: ["side_bottom", "cf_hem", "waist_side"],
      dart_plus: ["side_bottom", "cf_hem"],
      dart_minus: ["side_bottom", "cf_hem"],
    },
  },
  "pant-back": {
    id: "pant-back",
    guideOrder: ["cf_axis", "dart_plus", "dart_minus"],
    guideDependsOn: {
      cf_axis: ["cf_neck", "cf_hem"],
      dart_plus: ["waist_side"],
      dart_minus: ["waist_side"],
    },
  },
};

export function guideOrderForCount(
  profileId: string,
  guideCount: number
): GuideKind[] {
  const profile = CONSTRUCTION_PROFILES[profileId];
  if (!profile) return [];
  const order = profile.guideOrder;
  if (guideCount >= order.length) return order.slice(0, guideCount);
  if (profileId === "blouse-front" || profileId === "blouse-back") {
    if (guideCount === 2) return ["cf_axis", "grain"];
    if (guideCount === 3 && profileId === "blouse-back")
      return ["cf_axis", "shoulder_line", "grain"];
  }
  return order.slice(0, guideCount);
}
