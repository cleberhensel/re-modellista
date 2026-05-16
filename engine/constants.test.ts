import { describe, expect, it } from "vitest";
import {
  DEFAULT_MARGIN_CM,
  DEFAULT_PX_PER_CM,
  SEVENTH_HEAD_DIGITS,
} from "./constants.js";

describe("constants", () => {
  it("exports default scale values", () => {
    expect(DEFAULT_PX_PER_CM).toBe(28.347);
    expect(DEFAULT_MARGIN_CM).toBe(10);
    expect(SEVENTH_HEAD_DIGITS).toBe(3);
  });
});
