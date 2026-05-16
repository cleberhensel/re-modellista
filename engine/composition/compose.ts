import { buildContext } from "../context.js";
import { computeBounds } from "../bounds.js";
import {
  buildSkirtContext,
  resolveWaistMismatch,
} from "../skirt-context.js";
import { draftSkirtBack } from "../pieces/skirt-back.js";
import { draftSkirtFront } from "../pieces/skirt-front.js";
import { draftWaistband } from "../pieces/waistband.js";
import type {
  DraftOptions,
  DraftResult,
  Measurements,
  PatternPiece,
} from "../types.js";
import {
  buildBodiceEnv,
  buildCoatBodiceEnv,
  buildKnitBodiceEnv,
  coatSleeveCapScale,
  draftPantPieces,
  draftSkirtPieces,
  draftUpperPieces,
} from "./drafters.js";
import { getRecipe } from "./registry.js";
import {
  applySleevePreset,
  isSlotActive,
  resolveCompositionOptions,
} from "./resolve-options.js";
import type { GarmentRecipe, PartSlotId } from "./types.js";

function finishResult(
  productId: string,
  ctx: DraftResult["ctx"],
  pieces: DraftResult["pieces"],
  activeSlots: PartSlotId[],
  meta?: Record<string, number>
): DraftResult {
  return {
    productId,
    ctx,
    pieces,
    bounds: computeBounds(pieces, ctx),
    activeSlots,
    meta,
  };
}

function composeUpper(
  productId: string,
  recipe: GarmentRecipe,
  measurements: Measurements,
  resolved: DraftOptions,
  activeSlots: PartSlotId[],
  buildEnv: (m: Measurements, o: DraftOptions) => ReturnType<typeof buildBodiceEnv>
): DraftResult {
  const env = buildEnv(measurements, resolved);
  env.activeSlots = activeSlots;
  if (!isSlotActive("bodice", activeSlots)) {
    throw new Error("bodice_required");
  }
  const sleeveCapScale =
    productId === "casaco" ? coatSleeveCapScale(env.ctx) : resolved.sleeveCapScale;
  const pieces = draftUpperPieces(env, resolved, activeSlots, sleeveCapScale);
  const meta: Record<string, number> = {};
  if (productId === "casaco") {
    meta.designEaseBust = measurements.designEaseBust ?? 6;
    if (sleeveCapScale != null) meta.sleeveCapScale = sleeveCapScale;
  }
  return finishResult(
    productId,
    env.ctx,
    pieces,
    activeSlots,
    Object.keys(meta).length ? meta : undefined
  );
}

function composeDress(
  measurements: Measurements,
  resolved: DraftOptions,
  activeSlots: PartSlotId[]
): DraftResult {
  const bodiceLength = measurements.bodiceLength ?? measurements.height;
  const blouseCtx = buildContext(
    {
      bust: measurements.bust,
      height: bodiceLength,
      waist: measurements.waist,
      wrist: measurements.wrist,
      sleeveLength: measurements.sleeveLength,
    },
    resolved
  );
  let skirtCtx = buildSkirtContext(
    {
      waist: measurements.waist,
      hip: measurements.hip ?? measurements.waist + 10,
      hipDepth: measurements.hipDepth ?? 20,
      skirtLength: measurements.skirtLength ?? 60,
    },
    resolved
  );
  skirtCtx = resolveWaistMismatch(blouseCtx, skirtCtx);
  const waistBlouse = blouseCtx.hipPx;
  const waistSkirt = skirtCtx.waistFrontQuarterPx;
  if (Math.abs(waistBlouse - waistSkirt) > blouseCtx.k * 2) {
    return {
      productId: "vestido",
      ctx: blouseCtx,
      pieces: [],
      bounds: { width: 400, height: 400 },
      error: "waist_mismatch",
      activeSlots,
    };
  }
  const env = { ctx: blouseCtx, activeSlots };
  const upperSlots = activeSlots.filter((s) =>
    ["bodice", "sleeve", "collar", "cuff", "placket", "chestPocket"].includes(s)
  );
  const upper = draftUpperPieces(env, resolved, upperSlots);
  const skirtPieces: PatternPiece[] = [
    draftSkirtFront(skirtCtx),
    draftSkirtBack(skirtCtx),
  ].filter((p) => p.paths.length > 0 || p.error);
  if (isSlotActive("waistband", activeSlots)) {
    const wbCtx = buildContext(
      { ...measurements, height: 4, bust: measurements.waist },
      resolved
    );
    const wb = draftWaistband(wbCtx);
    if (wb.paths.length > 0 || wb.error) skirtPieces.push(wb);
  }
  const pieces = [...upper, ...skirtPieces];
  return finishResult("vestido", blouseCtx, pieces, activeSlots);
}

export function composeGarment(
  productId: string,
  measurements: Measurements,
  options: DraftOptions = {}
): DraftResult {
  const recipe = getRecipe(productId);
  if (!recipe) {
    throw new Error(`unknown_recipe:${productId}`);
  }
  const { resolved, activeSlots } = resolveCompositionOptions(recipe, {
    ...options,
    productId,
  });
  const m = applySleevePreset(measurements, resolved);

  if (productId === "vestido") {
    return composeDress(m, resolved, activeSlots);
  }

  if (isSlotActive("skirt", activeSlots) && !isSlotActive("bodice", activeSlots)) {
    const { pieces, ctx } = draftSkirtPieces(m, resolved, activeSlots);
    return finishResult(productId, ctx, pieces, activeSlots);
  }

  if (isSlotActive("pant", activeSlots)) {
    const { pieces, ctx } = draftPantPieces(m, resolved, activeSlots);
    return finishResult(productId, ctx, pieces, activeSlots);
  }

  if (productId === "casaco") {
    return composeUpper(
      productId,
      recipe,
      m,
      resolved,
      activeSlots,
      buildCoatBodiceEnv
    );
  }

  if (productId === "malha") {
    return composeUpper(
      productId,
      recipe,
      m,
      resolved,
      activeSlots,
      buildKnitBodiceEnv
    );
  }

  return composeUpper(
    productId,
    recipe,
    m,
    resolved,
    activeSlots,
    buildBodiceEnv
  );
}
