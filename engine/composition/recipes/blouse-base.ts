import type { GarmentRecipe } from "../types.js";

const UPPER_SLOTS = [
  { slot: "bodice" as const, defaultOn: true, allowed: true, required: true },
  { slot: "sleeve" as const, defaultOn: false, allowed: true },
  {
    slot: "collar" as const,
    defaultOn: false,
    allowed: true,
  },
  {
    slot: "cuff" as const,
    defaultOn: false,
    allowed: true,
    dependsOn: ["sleeve" as const],
  },
  { slot: "placket" as const, defaultOn: false, allowed: true },
  { slot: "chestPocket" as const, defaultOn: false, allowed: true },
  { slot: "sidePocket" as const, defaultOn: false, allowed: true },
];

export const BLOUSE_BASE_RECIPE: GarmentRecipe = {
  productId: "blusa",
  slots: UPPER_SLOTS,
  defaultOptions: {},
};

export const KNIT_RECIPE: GarmentRecipe = {
  productId: "malha",
  slots: UPPER_SLOTS,
  defaultOptions: {
    fabricProfileId: "knit-light",
    suppressDarts: true,
  },
};

export const SHIRT_PRESET_RECIPE: GarmentRecipe = {
  productId: "camisa",
  slots: UPPER_SLOTS.map((s) => ({
    ...s,
    defaultOn:
      s.slot === "sidePocket"
        ? false
        : s.slot === "bodice"
          ? true
          : true,
  })),
  defaultOptions: {
    includeSleeve: true,
    includeCollar: true,
    includeCuff: true,
    includePlacket: true,
    includeChestPocket: true,
  },
};

export const SLEEVELESS_RECIPE: GarmentRecipe = {
  productId: "top-sem-mangas",
  slots: UPPER_SLOTS.map((s) => ({
    ...s,
    allowed: s.slot === "bodice" || s.slot === "chestPocket",
    defaultOn: s.slot === "bodice",
  })),
  defaultOptions: {
    sleeveless: true,
    includeSleeve: false,
    armholeDepthOffsetCm: 2,
  },
  lockedSlots: { sleeve: false },
};

export const VEST_RECIPE: GarmentRecipe = {
  productId: "colete",
  slots: UPPER_SLOTS.map((s) => ({
    ...s,
    allowed:
      s.slot === "bodice" ||
      s.slot === "chestPocket" ||
      s.slot === "placket",
    defaultOn: s.slot === "bodice",
  })),
  defaultOptions: {
    sleeveless: true,
    includeSleeve: false,
    armholeDepthOffsetCm: 2,
  },
  lockedSlots: { sleeve: false },
};
