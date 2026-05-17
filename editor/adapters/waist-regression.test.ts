import { describe, expect, it } from "vitest";
import { draft } from "../../engine/index.js";
import { renderDraftToSvg } from "../../render/svg.js";
import { fromDraft } from "./from-draft.js";
import { renderDocumentToSvg } from "../export/to-svg.js";

const base = {
  bust: 92,
  height: 45,
  waist: 70,
  wrist: 12,
  sleeveLength: 27,
};

describe("waist regression blusa", () => {
  it("draft moves side hem on front and back", () => {
    const loose = draft({ ...base, waist: 95 }, { productId: "blusa" });
    const tight = draft({ ...base, waist: 68 }, { productId: "blusa" });
    for (const id of ["blouse-front", "blouse-back"] as const) {
      const a = loose.pieces.find((p) => p.id === id)!;
      const b = tight.pieces.find((p) => p.id === id)!;
      const ax = a.points?.sideBottom?.x;
      const bx = b.points?.sideBottom?.x;
      expect(ax).toBeDefined();
      expect(bx).toBeDefined();
      expect(ax!).toBeGreaterThan(bx!);
    }
  });

  it("V1 svg differs on front and back when waist changes", () => {
    const loose = draft({ ...base, waist: 95 }, { productId: "blusa" });
    const tight = draft({ ...base, waist: 68 }, { productId: "blusa" });
    const svgLoose = renderDraftToSvg(loose, { seamAllowanceCm: 1 });
    const svgTight = renderDraftToSvg(tight, { seamAllowanceCm: 1 });
    const extract = (svg: string, id: string) => {
      const re = new RegExp(`data-piece="${id}"[\\s\\S]*?<path d="([^"]+)"`, "m");
      return re.exec(svg)?.[1] ?? "";
    };
    expect(extract(svgLoose, "blouse-front")).not.toBe(
      extract(svgTight, "blouse-front")
    );
    expect(extract(svgLoose, "blouse-back")).not.toBe(extract(svgTight, "blouse-back"));
  });

  it("editor roundtrip differs on front and back when waist changes", () => {
    const loose = fromDraft(draft({ ...base, waist: 95 }, { productId: "blusa" }), {
      productId: "blusa",
      seamAllowanceCm: 1,
    });
    const tight = fromDraft(draft({ ...base, waist: 68 }, { productId: "blusa" }), {
      productId: "blusa",
      seamAllowanceCm: 1,
    });
    const svgLoose = renderDocumentToSvg(loose, { seamAllowanceCm: 1 });
    const svgTight = renderDocumentToSvg(tight, { seamAllowanceCm: 1 });
    expect(svgLoose).not.toBe(svgTight);
  });
});
