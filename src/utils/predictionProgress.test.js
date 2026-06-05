import { describe, expect, it } from "vitest";
import { calculatePredictionProgress } from "./predictionProgress";

describe("calculatePredictionProgress", () => {
  it("counts completed group and knockout predictions", () => {
    const progress = calculatePredictionProgress({
      1: { score1: 2, score2: 1 },
      2: { score1: "", score2: 0 },
      R32_1: { score1: 1, score2: 0 },
      R32_2: { score1: 1, score2: 1, penaltyWinner: "Brasil" }
    });

    expect(progress).toMatchObject({
      completed: 3,
      total: 104,
      groupCompleted: 1,
      knockoutCompleted: 2,
      isComplete: false
    });
  });

  it("does not count tied knockout matches without a penalty winner", () => {
    const progress = calculatePredictionProgress({
      R32_1: { score1: 1, score2: 1 }
    });

    expect(progress.knockoutCompleted).toBe(0);
  });
});
