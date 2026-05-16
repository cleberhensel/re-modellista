import { describe, expect, it } from "vitest";
import { applyFabricProfile, getFabricProfile } from "./fabric.js";

describe("fabric", () => {
  it("returns woven by default", () => {
    expect(getFabricProfile("unknown").id).toBe("woven");
  });

  it("applies knit profile", () => {
    const m = applyFabricProfile(
      { bust: 100, height: 50, waist: 80, wrist: 12, sleeveLength: 27 },
      getFabricProfile("knit-light")
    );
    expect(m.bust).toBeLessThan(100);
  });
});
