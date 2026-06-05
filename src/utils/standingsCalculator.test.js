import { describe, expect, it } from "vitest";
import { calculateGroupStandings, getBestThirdPlacedTeams } from "./standingsCalculator";

const groupTeams = ["Brasil", "Marrocos", "Haiti", "Escocia"];

const matches = [
  { id: 1, group: "Grupo C", team1: "Brasil", team2: "Marrocos" },
  { id: 2, group: "Grupo C", team1: "Haiti", team2: "Escocia" },
  { id: 3, group: "Grupo C", team1: "Brasil", team2: "Haiti" },
  { id: 4, group: "Grupo C", team1: "Escocia", team2: "Marrocos" },
  { id: 5, group: "Grupo C", team1: "Escocia", team2: "Brasil" },
  { id: 6, group: "Grupo C", team1: "Marrocos", team2: "Haiti" }
];

const predictions = {
  1: { score1: 2, score2: 0 },
  2: { score1: 1, score2: 1 },
  3: { score1: 1, score2: 1 },
  4: { score1: 0, score2: 3 },
  5: { score1: 2, score2: 0 },
  6: { score1: 2, score2: 1 }
};

describe("calculateGroupStandings", () => {
  it("sorts teams by points, goal difference, goals scored, then name", () => {
    const standings = calculateGroupStandings("Grupo C", groupTeams, matches, predictions);

    expect(standings.map((row) => row.team)).toEqual([
      "Marrocos",
      "Brasil",
      "Escocia",
      "Haiti"
    ]);
    expect(standings[0]).toMatchObject({
      played: 3,
      won: 2,
      drawn: 0,
      lost: 1,
      goalsFor: 5,
      goalsAgainst: 3,
      goalDifference: 2,
      points: 6
    });
  });

  it("ignores incomplete and invalid predictions", () => {
    const standings = calculateGroupStandings("Grupo C", groupTeams, matches, {
      1: { score1: "", score2: 0 },
      2: { score1: "abc", score2: 1 }
    });

    expect(standings.every((row) => row.played === 0)).toBe(true);
  });
});

describe("getBestThirdPlacedTeams", () => {
  it("returns ordered third placed teams and placeholders for unplayed groups", () => {
    const thirds = getBestThirdPlacedTeams(
      {
        "Grupo C": groupTeams,
        "Grupo D": ["A", "B", "C", "D"]
      },
      matches,
      predictions
    );

    expect(thirds[0]).toMatchObject({
      team: "Escocia",
      group: "Grupo C",
      points: 4
    });
    expect(thirds[1].team).toContain("do D");
  });
});
