import type { GarmentRecipe } from "../types.js";

const PANT_SLOTS = [
  { slot: "pant" as const, defaultOn: true, allowed: true, required: true },
  { slot: "waistband" as const, defaultOn: false, allowed: true },
  { slot: "bodice" as const, defaultOn: false, allowed: false },
  { slot: "skirt" as const, defaultOn: false, allowed: false },
  { slot: "sleeve" as const, defaultOn: false, allowed: false },
  { slot: "collar" as const, defaultOn: false, allowed: false },
  { slot: "cuff" as const, defaultOn: false, allowed: false },
  { slot: "placket" as const, defaultOn: false, allowed: false },
  { slot: "chestPocket" as const, defaultOn: false, allowed: false },
  { slot: "sidePocket" as const, defaultOn: false, allowed: false },
];

export const PANT_RECIPE: GarmentRecipe = {
  productId: "calca",
  slots: PANT_SLOTS,
  defaultOptions: {},
};

export const BERMUDA_RECIPE: GarmentRecipe = {
  productId: "bermuda",
  slots: PANT_SLOTS,
  defaultOptions: { legLengthCm: 45 },
};
