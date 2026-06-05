import { describe, expect, it } from "vitest";
import { calculateMatchPoints } from "./pointsCalculator";

describe("calculateMatchPoints", () => {
  it("awards 25 points for an exact score", () => {
    expect(calculateMatchPoints(2, 1, 2, 1)).toBe(25);
  });

  it("awards 15 points for the right result and goal difference", () => {
    expect(calculateMatchPoints(3, 1, 2, 0)).toBe(15);
  });

  it("awards 10 points for the right result with a different goal difference", () => {
    expect(calculateMatchPoints(2, 1, 3, 0)).toBe(10);
  });

  it("awards 5 points when the result is wrong but one team score is right", () => {
    expect(calculateMatchPoints(1, 2, 1, 0)).toBe(5);
  });

  it("handles draws with the same rule tiers", () => {
    expect(calculateMatchPoints("1", "1", "2", "2")).toBe(15);
  });

  it("returns 0 for missing or invalid scores", () => {
    expect(calculateMatchPoints("", 1, 0, 1)).toBe(0);
    expect(calculateMatchPoints("x", 1, 0, 1)).toBe(0);
  });
});
