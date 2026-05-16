import { describe, expect, it, vi } from "vitest";
import * as skirtModule from "../skirt-context.js";
import { composeGarment } from "./compose.js";
import * as resolveModule from "./resolve-options.js";
import { applySleevePreset, resolveCompositionOptions } from "./resolve-options.js";
import { SHIRT_PRESET_RECIPE } from "./recipes/blouse-base.js";
import { BLOUSE_BASE_RECIPE } from "./recipes/blouse-base.js";

const measurements = {
  bust: 92,
  height: 45,
  waist: 81,
  wrist: 12,
  sleeveLength: 27,
};

describe("composeGarment", () => {
  it("blusa só corpo tem 2 peças", () => {
    const result = composeGarment("blusa", measurements, {
      includeSleeve: false,
    });
    expect(result.pieces).toHaveLength(2);
    expect(result.pieces.map((p) => p.id)).toEqual([
      "blouse-front",
      "blouse-back",
    ]);
    expect(result.activeSlots).toEqual(["bodice"]);
  });

  it("blusa com manga e colarinho", () => {
    const result = composeGarment("blusa", measurements, {
      includeSleeve: true,
      includeCollar: true,
    });
    const ids = result.pieces.map((p) => p.id);
    expect(ids).toContain("sleeve");
    expect(ids).toContain("collar-stand");
    expect(ids).toContain("collar-fall");
    expect(result.activeSlots).toContain("sleeve");
    expect(result.activeSlots).toContain("collar");
  });

  it("camisa defaults equivale a 8 peças", () => {
    const result = composeGarment("camisa", measurements, {});
    expect(result.pieces).toHaveLength(8);
    expect(result.pieces.map((p) => p.id).sort()).toEqual(
      [
        "blouse-back",
        "blouse-front",
        "chest-pocket",
        "collar-fall",
        "collar-stand",
        "cuff",
        "placket",
        "sleeve",
      ].sort()
    );
  });

  it("resolve slots inferiores sem option key", () => {
    const { activeSlots } = resolveCompositionOptions(
      {
        productId: "test",
        slots: [{ slot: "skirt", defaultOn: true, allowed: true }],
        defaultOptions: {},
      },
      {}
    );
    expect(activeSlots).toEqual(["skirt"]);
  });

  it("cuff requer sleeve", () => {
    const { activeSlots } = resolveCompositionOptions(BLOUSE_BASE_RECIPE, {
      includeSleeve: false,
      includeCuff: true,
    });
    expect(activeSlots).not.toContain("cuff");
  });

  it("camisa preset resolve todos os slots superiores", () => {
    const { activeSlots } = resolveCompositionOptions(SHIRT_PRESET_RECIPE, {});
    expect(activeSlots).toContain("bodice");
    expect(activeSlots).toContain("sleeve");
    expect(activeSlots).toContain("collar");
    expect(activeSlots).toContain("cuff");
    expect(activeSlots).not.toContain("sidePocket");
  });

  it("casaco trava manga longa", () => {
    const result = composeGarment("casaco", {
      ...measurements,
      designEaseBust: 6,
      coatLength: 65,
    });
    expect(result.activeSlots).toContain("sleeve");
    expect(result.pieces.map((p) => p.id)).toContain("sleeve");
  });

  it("aplica sleevePreset nas medidas", () => {
    const short = applySleevePreset(measurements, { sleevePreset: "short" });
    expect(short.sleeveLength).toBe(22);
    const threeQ = applySleevePreset(measurements, {
      sleevePreset: "threeQuarter",
    });
    expect(threeQ.sleeveLength).toBe(40);
    const long = applySleevePreset(measurements, { sleevePreset: "long" });
    expect(long.sleeveLength).toBeGreaterThanOrEqual(50);
  });

  it("calça com cós", () => {
    const pantM = {
      waist: 70,
      hip: 96,
      crotchDepth: 26,
      inseam: 78,
    };
    const result = composeGarment("calca", pantM, { includeWaistband: true });
    expect(result.pieces.map((p) => p.id)).toContain("waistband");
  });

  it("exige bodice no corpo superior", () => {
    vi.spyOn(resolveModule, "resolveCompositionOptions").mockReturnValue({
      resolved: {},
      activeSlots: ["sleeve"],
    });
    expect(() => composeGarment("blusa", measurements)).toThrow(
      "bodice_required"
    );
    vi.restoreAllMocks();
  });

  it("vestido com cós", () => {
    const result = composeGarment(
      "vestido",
      {
        ...measurements,
        bodiceLength: 42,
        hip: 96,
        hipDepth: 20,
        skirtLength: 60,
      },
      { includeWaistband: true }
    );
    expect(result.pieces.map((p) => p.id)).toContain("waistband");
  });

  it("vestido waist mismatch", () => {
    const badSkirt = {
      measurements: { waist: 70, hip: 96, hipDepth: 20, skirtLength: 60 },
      k: 28.347,
      startOne: 43.347,
      waistFrontQuarterPx: 999,
      waistBackQuarterPx: 999,
      hipQuarterPx: 600,
      hipLineY: 100,
      hemY: 500,
    };
    vi.spyOn(skirtModule, "buildSkirtContext").mockReturnValue(badSkirt);
    vi.spyOn(skirtModule, "resolveWaistMismatch").mockReturnValue(badSkirt);
    const result = composeGarment(
      "vestido",
      {
        ...measurements,
        bodiceLength: 42,
        hip: 96,
        hipDepth: 20,
        skirtLength: 60,
      },
      {}
    );
    expect(result.error).toBe("waist_mismatch");
    vi.restoreAllMocks();
  });

  it("saia com cós opcional", () => {
    const skirtM = {
      waist: 70,
      hip: 96,
      hipDepth: 20,
      skirtLength: 60,
    };
    const without = composeGarment("saia-reta", skirtM, {});
    expect(without.pieces).toHaveLength(2);
    const withWb = composeGarment("saia-reta", skirtM, {
      includeWaistband: true,
    });
    expect(withWb.pieces.map((p) => p.id)).toContain("waistband");
  });
});
