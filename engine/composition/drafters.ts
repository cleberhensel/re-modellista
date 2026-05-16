import { buildContext } from "../context.js";
import { buildPantContext } from "../pant-context.js";
import { buildSkirtContext } from "../skirt-context.js";
import { capEaseTargetPx } from "../ease.js";
import { applyFabricProfile, getFabricProfile } from "../fabric.js";
import { draftBlouseBack } from "../pieces/blouse-back.js";
import { draftBlouseFront } from "../pieces/blouse-front.js";
import { draftCollarFall, draftCollarStand } from "../pieces/collar.js";
import { draftCuff } from "../pieces/cuff.js";
import { draftPantBack } from "../pieces/pant-back.js";
import { draftPantFront } from "../pieces/pant-front.js";
import { draftPlacket } from "../pieces/placket.js";
import { draftChestPocket } from "../pieces/pocket.js";
import { draftSidePocket } from "../pieces/side-pocket.js";
import { draftSkirtBack } from "../pieces/skirt-back.js";
import { draftSkirtFront } from "../pieces/skirt-front.js";
import { draftSleevePiece } from "../pieces/sleeve.js";
import { draftWaistband } from "../pieces/waistband.js";
import type {
  DraftContext,
  DraftOptions,
  Measurements,
  PatternPiece,
  PantContext,
  SkirtContext,
} from "../types.js";
import { isSlotActive } from "./resolve-options.js";
import type { PartSlotId } from "./types.js";

export interface BodiceDraftEnv {
  ctx: DraftContext;
  activeSlots: PartSlotId[];
}

export function buildBodiceEnv(
  measurements: Measurements,
  options: DraftOptions
): BodiceDraftEnv {
  return {
    ctx: buildContext(measurements, options),
    activeSlots: [],
  };
}

export function buildCoatBodiceEnv(
  measurements: Measurements,
  options: DraftOptions
): BodiceDraftEnv {
  const ease = measurements.designEaseBust ?? 6;
  const coatLength = measurements.coatLength ?? measurements.height + 20;
  return {
    ctx: buildContext(
      {
        ...measurements,
        bust: measurements.bust + ease,
        height: coatLength,
      },
      options
    ),
    activeSlots: [],
  };
}

export function buildKnitBodiceEnv(
  measurements: Measurements,
  options: DraftOptions
): BodiceDraftEnv {
  const profile = getFabricProfile(options.fabricProfileId ?? "knit-light");
  const adjusted = applyFabricProfile(measurements, profile);
  return {
    ctx: buildContext(adjusted, {
      ...options,
      suppressDarts: profile.suppressDarts,
    }),
    activeSlots: [],
  };
}

function pushIfDrawable(pieces: PatternPiece[], piece: PatternPiece): void {
  if (piece.paths.length > 0 || piece.error) {
    pieces.push(piece);
  }
}

export function draftBodicePieces(env: BodiceDraftEnv): PatternPiece[] {
  const { ctx } = env;
  return [draftBlouseFront(ctx), draftBlouseBack(ctx)].filter(
    (p) => p.paths.length > 0 || p.error
  );
}

export function draftUpperPieces(
  env: BodiceDraftEnv,
  options: DraftOptions,
  activeSlots: PartSlotId[],
  sleeveCapScale?: number
): PatternPiece[] {
  const pieces = draftBodicePieces(env);
  const { ctx } = env;

  if (isSlotActive("sleeve", activeSlots)) {
    const scale =
      sleeveCapScale ??
      options.sleeveCapScale ??
      1;
    pushIfDrawable(pieces, draftSleevePiece(ctx, scale));
  }

  if (isSlotActive("collar", activeSlots)) {
    pushIfDrawable(pieces, draftCollarStand(ctx));
    pushIfDrawable(pieces, draftCollarFall(ctx));
  }

  if (isSlotActive("cuff", activeSlots)) {
    pushIfDrawable(pieces, draftCuff(ctx));
  }

  if (isSlotActive("placket", activeSlots)) {
    pushIfDrawable(pieces, draftPlacket(ctx));
  }

  if (isSlotActive("chestPocket", activeSlots)) {
    pushIfDrawable(pieces, draftChestPocket(ctx));
  }

  if (isSlotActive("sidePocket", activeSlots)) {
    pushIfDrawable(pieces, draftSidePocket(ctx));
  }

  return pieces;
}

export function draftSkirtPieces(
  measurements: Measurements,
  options: DraftOptions,
  activeSlots: PartSlotId[]
): { pieces: PatternPiece[]; ctx: SkirtContext } {
  const skirtM = {
    waist: measurements.waist,
    hip: measurements.hip ?? measurements.waist + 10,
    hipDepth: measurements.hipDepth ?? 20,
    skirtLength: measurements.skirtLength ?? 60,
  };
  const ctx = buildSkirtContext(skirtM, options);
  const pieces: PatternPiece[] = [
    draftSkirtFront(ctx),
    draftSkirtBack(ctx),
  ].filter((p) => p.paths.length > 0 || p.error);

  if (isSlotActive("waistband", activeSlots)) {
    const wbCtx = buildContext(
      { ...measurements, height: 4, bust: measurements.waist },
      options
    );
    pushIfDrawable(pieces, draftWaistband(wbCtx));
  }

  return { pieces, ctx };
}

export function draftPantPieces(
  measurements: Measurements,
  options: DraftOptions,
  activeSlots: PartSlotId[]
): { pieces: PatternPiece[]; ctx: PantContext } {
  const pantM = {
    waist: measurements.waist,
    hip: measurements.hip ?? measurements.waist + 12,
    crotchDepth: measurements.crotchDepth ?? 26,
    inseam: measurements.inseam ?? 78,
  };
  const ctx = buildPantContext(pantM, options);
  const pieces: PatternPiece[] = [
    draftPantFront(ctx),
    draftPantBack(ctx),
  ].filter((p) => p.paths.length > 0 || p.error);

  if (isSlotActive("waistband", activeSlots)) {
    const wbCtx = buildContext(
      { ...measurements, height: 4, bust: measurements.waist },
      options
    );
    pushIfDrawable(pieces, draftWaistband(wbCtx));
  }

  return { pieces, ctx };
}

export function coatSleeveCapScale(ctx: DraftContext): number {
  const capTarget = capEaseTargetPx(ctx.k);
  const defaultScale = 1.08;
  return defaultScale * (1 + capTarget / (ctx.measurements.bust * ctx.k * 0.25));
}
