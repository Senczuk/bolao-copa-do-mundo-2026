const GROUP_MATCH_TOTAL = 72;

const KNOCKOUT_KEYS = [
  ...Array(16).fill(null).map((_, i) => `R32_${i + 1}`),
  ...Array(8).fill(null).map((_, i) => `R16_${i + 1}`),
  ...Array(4).fill(null).map((_, i) => `QF_${i + 1}`),
  ...Array(2).fill(null).map((_, i) => `SF_${i + 1}`),
  "TP_1",
  "FI_1"
];

const hasScore = (match) => (
  match &&
  match.score1 !== "" &&
  match.score1 !== undefined &&
  match.score1 !== null &&
  match.score2 !== "" &&
  match.score2 !== undefined &&
  match.score2 !== null
);

export const calculatePredictionProgress = (predictions = {}) => {
  const groupCompleted = Array.from({ length: GROUP_MATCH_TOTAL }, (_, i) => String(i + 1))
    .filter((key) => hasScore(predictions[key] ?? predictions[Number(key)]))
    .length;

  const knockoutCompleted = KNOCKOUT_KEYS
    .filter((key) => {
      const match = predictions[key];
      if (!hasScore(match)) return false;

      const score1 = parseInt(match.score1, 10);
      const score2 = parseInt(match.score2, 10);
      if (score1 === score2 && !match.penaltyWinner) return false;

      return true;
    })
    .length;

  const total = GROUP_MATCH_TOTAL + KNOCKOUT_KEYS.length;
  const completed = groupCompleted + knockoutCompleted;

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    groupCompleted,
    groupTotal: GROUP_MATCH_TOTAL,
    knockoutCompleted,
    knockoutTotal: KNOCKOUT_KEYS.length,
    isComplete: completed === total
  };
};
