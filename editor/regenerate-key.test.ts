import { describe, expect, it } from "vitest";
import { buildRegenerateKey } from "./regenerate-key.js";

describe("buildRegenerateKey", () => {
  it("changes when waist changes", () => {
    const base = {
      productId: "blusa",
      includeSleeve: true,
    } as const;
    const a = buildRegenerateKey("blusa", { bust: 90, waist: 70, height: 60 } as never, base);
    const b = buildRegenerateKey("blusa", { bust: 90, waist: 72, height: 60 } as never, base);
    expect(a).not.toBe(b);
  });

  it("is stable for identical inputs", () => {
    const m = { bust: 90, waist: 70, height: 60 };
    const o = { productId: "blusa", includeSleeve: false };
    expect(buildRegenerateKey("blusa", m as never, o)).toBe(
      buildRegenerateKey("blusa", m as never, o)
    );
  });
});
