import type { DraftOptions, Measurements } from "../types.js";
import type { GarmentRecipe, PartSlotId } from "./types.js";

const SHORT_SLEEVE_CM = 22;
const THREE_QUARTER_SLEEVE_CM = 40;
const MIN_LONG_SLEEVE_CM = 50;

export function applySleevePreset(
  measurements: Measurements,
  options: DraftOptions
): Measurements {
  const preset = options.sleevePreset;
  if (!preset) return measurements;
  const base = measurements.sleeveLength ?? 27;
  let sleeveLength = base;
  if (preset === "short") {
    sleeveLength = SHORT_SLEEVE_CM;
  } else if (preset === "threeQuarter") {
    sleeveLength = THREE_QUARTER_SLEEVE_CM;
  } else if (preset === "long") {
    sleeveLength = Math.max(base, MIN_LONG_SLEEVE_CM);
  }
  return { ...measurements, sleeveLength };
}

function slotToOptionKey(
  slot: PartSlotId
): keyof DraftOptions | null {
  switch (slot) {
    case "sleeve":
      return "includeSleeve";
    case "collar":
      return "includeCollar";
    case "cuff":
      return "includeCuff";
    case "placket":
      return "includePlacket";
    case "chestPocket":
      return "includeChestPocket";
    case "sidePocket":
      return "includeSidePocket";
    case "waistband":
      return "includeWaistband";
    default:
      return null;
  }
}

function slotWanted(
  rule: GarmentRecipe["slots"][number],
  recipe: GarmentRecipe,
  merged: DraftOptions
): boolean {
  const locked = recipe.lockedSlots?.[rule.slot];
  if (locked !== undefined) return locked;
  if (rule.required) return true;
  const key = slotToOptionKey(rule.slot);
  if (key && merged[key] !== undefined) {
    return !!merged[key];
  }
  return rule.defaultOn;
}

export function resolveCompositionOptions(
  recipe: GarmentRecipe,
  options: DraftOptions
): { resolved: DraftOptions; activeSlots: PartSlotId[] } {
  const merged: DraftOptions = {
    ...recipe.defaultOptions,
    ...options,
    productId: options.productId ?? recipe.productId,
  };

  if (merged.sleeveless) {
    merged.includeSleeve = false;
  }

  const wanted = new Map<PartSlotId, boolean>();
  for (const rule of recipe.slots) {
    if (!rule.allowed) {
      wanted.set(rule.slot, false);
      continue;
    }
    wanted.set(rule.slot, slotWanted(rule, recipe, merged));
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of recipe.slots) {
      if (!rule.allowed) continue;
      if (!wanted.get(rule.slot)) continue;
      if (rule.dependsOn?.some((dep) => !wanted.get(dep))) {
        wanted.set(rule.slot, false);
        changed = true;
      }
    }
  }

  if (!wanted.get("sleeve")) {
    wanted.set("cuff", false);
  }

  const activeSlots = recipe.slots
    .filter((r) => r.allowed && wanted.get(r.slot))
    .map((r) => r.slot);

  const resolved: DraftOptions = { ...merged };
  resolved.includeSleeve = wanted.get("sleeve") ?? false;
  resolved.includeCollar = wanted.get("collar") ?? false;
  resolved.includeCuff = wanted.get("cuff") ?? false;
  resolved.includePlacket = wanted.get("placket") ?? false;
  resolved.includeChestPocket = wanted.get("chestPocket") ?? false;
  resolved.includeSidePocket = wanted.get("sidePocket") ?? false;
  resolved.includeWaistband = wanted.get("waistband") ?? false;

  return { resolved, activeSlots };
}

export function isSlotActive(
  slot: PartSlotId,
  activeSlots: PartSlotId[]
): boolean {
  return activeSlots.includes(slot);
}
