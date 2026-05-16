import { describe, expect, it } from "vitest";
import { SEVENTH_HEAD_DIGITS } from "./constants.js";
import { seventhFromBustCm, seventhToPx } from "./seventh.js";

describe("seventhFromBustCm", () => {
  it("derives one two four from bust half over seven", () => {
    const s = seventhFromBustCm(92);
    expect(s.one).toBe(6);
    expect(s.two).toBe(3);
    expect(s.four).toBe(1.5);
  });

  it("uses head digit truncation from constants", () => {
    expect(SEVENTH_HEAD_DIGITS).toBe(3);
    const s = seventhFromBustCm(100);
    expect(s.one).toBe(parseInt((50 / 7).toString().substring(0, 3), 10));
  });
});

describe("seventhToPx", () => {
  it("scales seventh segments to pixels", () => {
    const cm = seventhFromBustCm(92);
    const px = seventhToPx(cm, 28.347);
    expect(px.one).toBe(cm.one * 28.347);
    expect(px.two).toBe(cm.two * 28.347);
    expect(px.four).toBe(cm.four * 28.347);
  });
});
