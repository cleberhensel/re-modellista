import {
  BLOUSE_BASE_RECIPE,
  KNIT_RECIPE,
  SHIRT_PRESET_RECIPE,
  SLEEVELESS_RECIPE,
  VEST_RECIPE,
} from "./recipes/blouse-base.js";
import { COAT_RECIPE } from "./recipes/coat.js";
import { BERMUDA_RECIPE, PANT_RECIPE } from "./recipes/pant.js";
import { DRESS_RECIPE, SKIRT_RECIPE } from "./recipes/skirt.js";
import type { GarmentRecipe } from "./types.js";

const RECIPES: Record<string, GarmentRecipe> = {
  blusa: BLOUSE_BASE_RECIPE,
  malha: KNIT_RECIPE,
  camisa: SHIRT_PRESET_RECIPE,
  "top-sem-mangas": SLEEVELESS_RECIPE,
  colete: VEST_RECIPE,
  casaco: COAT_RECIPE,
  "saia-reta": SKIRT_RECIPE,
  calca: PANT_RECIPE,
  bermuda: BERMUDA_RECIPE,
  vestido: DRESS_RECIPE,
};

export function getRecipe(productId: string): GarmentRecipe | undefined {
  return RECIPES[productId];
}

export function listRecipeProductIds(): string[] {
  return Object.keys(RECIPES);
}
