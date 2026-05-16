import { expect } from "vitest";
import type { Point2 } from "../types.js";

export function expectPointClose(
  actual: Point2,
  expected: Point2,
  tolerancePx = 2
): void {
  expect(Math.abs(actual.x - expected.x)).toBeLessThanOrEqual(tolerancePx);
  expect(Math.abs(actual.y - expected.y)).toBeLessThanOrEqual(tolerancePx);
}
