import { blouseGuardrails } from "./blouse.js";
import { coatGuardrails } from "./coat.js";
import { collarGuardrails } from "./collar.js";
import { cuffGuardrails } from "./cuff.js";
import { dressGuardrails } from "./dress.js";
import { knitGuardrails } from "./knit.js";
import { pantGuardrails } from "./pant.js";
import { placketGuardrails } from "./placket.js";
import { pocketGuardrails } from "./pocket.js";
import { shirtGuardrails } from "./shirt.js";
import { skirtGuardrails } from "./skirt.js";
import { sleeveGuardrails } from "./sleeve.js";
import { sleevelessTopGuardrails } from "./sleeveless-top.js";
import { waistbandGuardrails } from "./waistband.js";
import type { DraftOptions, Measurements } from "../types.js";
import type { MeasurementKey, PieceGuardrails } from "./types.js";

export type { FieldRange, FieldSpec, MeasurementKey, PieceGuardrails } from "./types.js";
export {
  dartClearsArmhole,
  isBlouseBackStable,
  isBlouseFrontStable,
  isBlouseStable,
  shoulderBackIntersects,
  shoulderIntersects,
} from "./checks.js";
import { blouseGuardrails, blouseStability } from "./blouse.js";

export { blouseGuardrails, blouseStability };
export const blouseFrontGuardrails = blouseGuardrails;

const REGISTRY: Record<string, PieceGuardrails> = {
  blusa: blouseGuardrails,
  manga: sleeveGuardrails,
  camisa: shirtGuardrails,
  "saia-reta": skirtGuardrails,
  calca: pantGuardrails,
  bermuda: pantGuardrails,
  vestido: dressGuardrails,
  "top-sem-mangas": sleevelessTopGuardrails,
  punho: cuffGuardrails,
  colarinho: collarGuardrails,
  cos: waistbandGuardrails,
  "bolso-peito": pocketGuardrails,
  carcela: placketGuardrails,
  malha: knitGuardrails,
  casaco: coatGuardrails,
  colete: sleevelessTopGuardrails,
};

export function getGuardrails(productId: string): PieceGuardrails {
  const g = REGISTRY[productId];
  if (!g) {
    throw new Error(`no guardrails for product: ${productId}`);
  }
  return g;
}

export function resolveMeasurements(
  productId: string,
  measurements: Measurements,
  changed: MeasurementKey,
  options?: DraftOptions
): Measurements {
  return getGuardrails(productId).resolve(measurements, changed, options);
}
