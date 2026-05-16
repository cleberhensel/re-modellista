import type { GarmentRecipe } from "../types.js";

export const COAT_RECIPE: GarmentRecipe = {
  productId: "casaco",
  slots: [
    { slot: "bodice", defaultOn: true, allowed: true, required: true },
    { slot: "sleeve", defaultOn: true, allowed: true, required: true },
    { slot: "collar", defaultOn: false, allowed: false },
    { slot: "cuff", defaultOn: false, allowed: false },
    { slot: "placket", defaultOn: false, allowed: false },
    { slot: "chestPocket", defaultOn: false, allowed: false },
    { slot: "sidePocket", defaultOn: false, allowed: true },
  ],
  defaultOptions: {
    includeSleeve: true,
    sleevePreset: "long",
  },
  lockedSlots: {
    sleeve: true,
  },
};
