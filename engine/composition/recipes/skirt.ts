import type { GarmentRecipe } from "../types.js";

export const SKIRT_RECIPE: GarmentRecipe = {
  productId: "saia-reta",
  slots: [
    { slot: "skirt", defaultOn: true, allowed: true, required: true },
    { slot: "waistband", defaultOn: false, allowed: true },
    { slot: "bodice", defaultOn: false, allowed: false },
    { slot: "sleeve", defaultOn: false, allowed: false },
    { slot: "collar", defaultOn: false, allowed: false },
    { slot: "cuff", defaultOn: false, allowed: false },
    { slot: "placket", defaultOn: false, allowed: false },
    { slot: "chestPocket", defaultOn: false, allowed: false },
    { slot: "sidePocket", defaultOn: false, allowed: false },
    { slot: "pant", defaultOn: false, allowed: false },
  ],
  defaultOptions: {},
};

export const DRESS_RECIPE: GarmentRecipe = {
  productId: "vestido",
  slots: [
    { slot: "bodice", defaultOn: true, allowed: true, required: true },
    { slot: "skirt", defaultOn: true, allowed: true, required: true },
    { slot: "sleeve", defaultOn: false, allowed: true },
    {
      slot: "collar",
      defaultOn: false,
      allowed: true,
    },
    {
      slot: "cuff",
      defaultOn: false,
      allowed: true,
      dependsOn: ["sleeve"],
    },
    { slot: "placket", defaultOn: false, allowed: true },
    { slot: "chestPocket", defaultOn: false, allowed: true },
    { slot: "sidePocket", defaultOn: false, allowed: false },
    { slot: "waistband", defaultOn: false, allowed: true },
    { slot: "pant", defaultOn: false, allowed: false },
  ],
  defaultOptions: {},
};
