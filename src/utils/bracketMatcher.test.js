import { describe, expect, it } from "vitest";
import { getKnockoutStages } from "./bracketMatcher";

const makeRoundOf32 = () =>
  Array.from({ length: 16 }, (_, index) => ({
    id: `R32_${index + 1}`,
    label: `Jogo ${index + 1}`,
    team1: `T${index * 2 + 1}`,
    team2: `T${index * 2 + 2}`
  }));

describe("getKnockoutStages", () => {
  it("propagates winners through the bracket, including penalty winners", () => {
    const r32Matchups = makeRoundOf32();
    const knockoutPredictions = {
      ...Object.fromEntries(r32Matchups.map((match) => [match.id, { score1: 1, score2: 0 }])),
      R16_1: { score1: 1, score2: 0 },
      R16_2: { score1: 1, score2: 0 },
      R16_3: { score1: 1, score2: 0 },
      R16_4: { score1: 1, score2: 0 },
      R16_5: { score1: 1, score2: 0 },
      R16_6: { score1: 1, score2: 0 },
      R16_7: { score1: 1, score2: 0 },
      R16_8: { score1: 1, score2: 0 },
      QF_1: { score1: 1, score2: 0 },
      QF_2: { score1: 1, score2: 0 },
      QF_3: { score1: 1, score2: 0 },
      QF_4: { score1: 1, score2: 0 },
      SF_1: { score1: 1, score2: 0 },
      SF_2: { score1: 0, score2: 1 },
      TP_1: { score1: 0, score2: 0, penaltyWinner: "T17" },
      FI_1: { score1: 2, score2: 2, penaltyWinner: "T25" }
    };

    const stages = getKnockoutStages(r32Matchups, knockoutPredictions);

    expect(stages.finalMatchup).toMatchObject({ team1: "T1", team2: "T25" });
    expect(stages.thirdPlaceMatchup).toMatchObject({ team1: "T9", team2: "T17" });
    expect(stages.champion).toBe("T25");
    expect(stages.runnerUp).toBe("T1");
    expect(stages.thirdPlace).toBe("T17");
  });

  it("does not advance a team from a tied knockout game without a valid penalty winner", () => {
    const stages = getKnockoutStages(makeRoundOf32(), {
      R32_1: { score1: 1, score2: 1, penaltyWinner: "Other Team" }
    });

    expect(stages.r16Matchups[0].team1).toBe("");
  });
});
