import { draftBlouse } from "./products/blouse.js";
import { draftCoat } from "./products/coat.js";
import { draftCollarProduct } from "./products/collar.js";
import { draftCuffProduct } from "./products/cuff.js";
import { draftDress } from "./products/dress.js";
import { draftKnit } from "./products/knit.js";
import { draftBermuda } from "./products/bermuda.js";
import { draftPant } from "./products/pant.js";
import { draftPlacketProduct } from "./products/placket.js";
import { draftPocketProduct } from "./products/pocket.js";
import { draftShirt } from "./products/shirt.js";
import { draftSleeve } from "./products/sleeve.js";
import { draftSleevelessTop } from "./products/sleeveless-top.js";
import { draftStraightSkirt } from "./products/straight-skirt.js";
import { draftWaistbandProduct } from "./products/waistband.js";
import type { DraftOptions, DraftResult, Measurements } from "./types.js";

export type ProductDraftFn = (
  measurements: Measurements,
  options?: DraftOptions
) => DraftResult;

const PRODUCT_DRAFTERS: Record<string, ProductDraftFn> = {
  blusa: draftBlouse,
  manga: draftSleeve,
  camisa: draftShirt,
  "saia-reta": draftStraightSkirt,
  calca: draftPant,
  bermuda: draftBermuda,
  vestido: draftDress,
  "top-sem-mangas": draftSleevelessTop,
  punho: draftCuffProduct,
  colarinho: draftCollarProduct,
  cos: draftWaistbandProduct,
  "bolso-peito": draftPocketProduct,
  carcela: draftPlacketProduct,
  malha: draftKnit,
  casaco: draftCoat,
};

export function registerProduct(id: string, draftFn: ProductDraftFn): void {
  PRODUCT_DRAFTERS[id] = draftFn;
}

export function draftProduct(
  productId: string,
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const draftFn = PRODUCT_DRAFTERS[productId];
  if (!draftFn) {
    throw new Error(`unknown_product:${productId}`);
  }
  return draftFn(measurements, { ...options, productId });
}

export function listRegisteredProducts(): string[] {
  return Object.keys(PRODUCT_DRAFTERS);
}
