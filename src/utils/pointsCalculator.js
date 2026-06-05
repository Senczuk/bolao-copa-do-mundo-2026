import { getRoundOf32Matchups, getKnockoutStages } from "./bracketMatcher";
import { groups, groupMatches } from "../data/matchesData";
import { calculateGroupStandings, getBestThirdPlacedTeams } from "./standingsCalculator";

/**
 * Calcula os pontos obtidos em um único jogo (Fase de Grupos ou Mata-Mata).
 */
export const calculateMatchPoints = (usrScore1, usrScore2, offScore1, offScore2) => {
  if (
    usrScore1 === undefined || usrScore1 === null || usrScore1 === "" ||
    usrScore2 === undefined || usrScore2 === null || usrScore2 === "" ||
    offScore1 === undefined || offScore1 === null || offScore1 === "" ||
    offScore2 === undefined || offScore2 === null || offScore2 === ""
  ) {
    return 0;
  }

  const u1 = parseInt(usrScore1, 10);
  const u2 = parseInt(usrScore2, 10);
  const o1 = parseInt(offScore1, 10);
  const o2 = parseInt(offScore2, 10);

  if (isNaN(u1) || isNaN(u2) || isNaN(o1) || isNaN(o2)) return 0;

  // 1. Placar Exato (25 pontos)
  if (u1 === o1 && u2 === o2) {
    return 25;
  }

  // Define se houve vitória do Time 1, Time 2 ou Empate
  const usrWinner = u1 > u2 ? 1 : u1 < u2 ? 2 : 0;
  const offWinner = o1 > o2 ? 1 : o1 < o2 ? 2 : 0;

  // Se acertou o vencedor/empate
  if (usrWinner === offWinner) {
    const usrGD = u1 - u2;
    const offGD = o1 - o2;

    // Vencedor/Empate + Saldo de Gols (15 pontos)
    if (usrGD === offGD) {
      return 15;
    }
    // Apenas Vencedor/Empate (10 pontos)
    return 10;
  }

  // Se errou o vencedor, mas acertou os gols de um dos times (5 pontos)
  if (u1 === o1 || u2 === o2) {
    return 5;
  }

  return 0;
};

/**
 * Coleta a lista de times que chegaram a cada fase eliminatória.
 */
const getTeamsInStages = (preds) => {
  // 1. Fase de Grupos
  const groupStandings = {};
  Object.keys(groups).forEach(gName => {
    groupStandings[gName] = calculateGroupStandings(gName, groups[gName], groupMatches, preds.groupPredictions);
  });

  const bestThirds = getBestThirdPlacedTeams(groups, groupMatches, preds.groupPredictions);
  const r32Matchups = getRoundOf32Matchups(groupStandings, bestThirds);

  // Times no Round of 32
  const r32Teams = [];
  r32Matchups.forEach(m => {
    if (m.team1) r32Teams.push(m.team1);
    if (m.team2) r32Teams.push(m.team2);
  });

  // Outros estágios
  const stages = getKnockoutStages(r32Matchups, preds.knockoutPredictions);

  const r16Teams = [];
  stages.r16Matchups.forEach(m => {
    if (m.team1) r16Teams.push(m.team1);
    if (m.team2) r16Teams.push(m.team2);
  });

  const qfTeams = [];
  stages.qfMatchups.forEach(m => {
    if (m.team1) qfTeams.push(m.team1);
    if (m.team2) qfTeams.push(m.team2);
  });

  const sfTeams = [];
  stages.sfMatchups.forEach(m => {
    if (m.team1) sfTeams.push(m.team1);
    if (m.team2) sfTeams.push(m.team2);
  });

  const finalists = [];
  if (stages.finalMatchup.team1) finalists.push(stages.finalMatchup.team1);
  if (stages.finalMatchup.team2) finalists.push(stages.finalMatchup.team2);

  return {
    r32Teams: new Set(r32Teams.filter(Boolean)),
    r16Teams: new Set(r16Teams.filter(Boolean)),
    qfTeams: new Set(qfTeams.filter(Boolean)),
    sfTeams: new Set(sfTeams.filter(Boolean)),
    finalists: new Set(finalists.filter(Boolean)),
    champion: stages.champion,
    thirdPlace: stages.thirdPlace
  };
};

/**
 * Calcula a pontuação detalhada de um participante baseado nas regras e nos resultados oficiais.
 */
export const calculatePlayerPoints = (playerPredictions, officialResults) => {
  let matchPoints = 0;
  let bracketPoints = 0;
  
  const details = {
    exactScoresCount: 0,
    correctWinnerGDCount: 0,
    correctWinnerCount: 0,
    correctSingleTeamGoalsCount: 0,
    r32CorrectCount: 0,
    r16CorrectCount: 0,
    qfCorrectCount: 0,
    sfCorrectCount: 0,
    finalistsCorrectCount: 0,
    championCorrect: false,
    thirdPlaceCorrect: false,
    breakdown: {
      groupMatches: 0,
      knockoutMatches: 0,
      progression: 0
    }
  };

  // 1. Pontos de Jogos da Fase de Grupos
  groupMatches.forEach(match => {
    const usr = playerPredictions.groupPredictions[match.id];
    const off = officialResults.groupPredictions[match.id];

    if (usr && off) {
      const pts = calculateMatchPoints(usr.score1, usr.score2, off.score1, off.score2);
      matchPoints += pts;
      details.breakdown.groupMatches += pts;

      if (pts === 25) details.exactScoresCount++;
      else if (pts === 15) details.correctWinnerGDCount++;
      else if (pts === 10) details.correctWinnerCount++;
      else if (pts === 5) details.correctSingleTeamGoalsCount++;
    }
  });

  // 2. Pontos de Jogos do Mata-Mata (Confrontos individuais, ex: R32_1, R16_1, etc.)
  const knockoutKeys = [
    ...Array(16).fill(null).map((_, i) => `R32_${i+1}`),
    ...Array(8).fill(null).map((_, i) => `R16_${i+1}`),
    ...Array(4).fill(null).map((_, i) => `QF_${i+1}`),
    ...Array(2).fill(null).map((_, i) => `SF_${i+1}`),
    "TP_1", "FI_1"
  ];

  knockoutKeys.forEach(matchId => {
    const usr = playerPredictions.knockoutPredictions[matchId];
    const off = officialResults.knockoutPredictions[matchId];

    if (usr && off) {
      const pts = calculateMatchPoints(usr.score1, usr.score2, off.score1, off.score2);
      matchPoints += pts;
      details.breakdown.knockoutMatches += pts;

      if (pts === 25) details.exactScoresCount++;
      else if (pts === 15) details.correctWinnerGDCount++;
      else if (pts === 10) details.correctWinnerCount++;
      else if (pts === 5) details.correctSingleTeamGoalsCount++;
    }
  });

  // 3. Pontos de Progressão de Chaves (Time X chegou à Fase Y?)
  const usrStages = getTeamsInStages(playerPredictions);
  const offStages = getTeamsInStages(officialResults);

  // R32 (5 pontos por time classificado)
  usrStages.r32Teams.forEach(team => {
    if (offStages.r32Teams.has(team)) {
      bracketPoints += 5;
      details.r32CorrectCount++;
    }
  });

  // R16 (10 pontos por time classificado)
  usrStages.r16Teams.forEach(team => {
    if (offStages.r16Teams.has(team)) {
      bracketPoints += 10;
      details.r16CorrectCount++;
    }
  });

  // QF (15 pontos por time classificado)
  usrStages.qfTeams.forEach(team => {
    if (offStages.qfTeams.has(team)) {
      bracketPoints += 15;
      details.qfCorrectCount++;
    }
  });

  // SF (20 pontos por time classificado)
  usrStages.sfTeams.forEach(team => {
    if (offStages.sfTeams.has(team)) {
      bracketPoints += 20;
      details.sfCorrectCount++;
    }
  });

  // Finalistas (30 pontos por time correto)
  usrStages.finalists.forEach(team => {
    if (offStages.finalists.has(team)) {
      bracketPoints += 30;
      details.finalistsCorrectCount++;
    }
  });

  // Campeão (50 pontos)
  if (usrStages.champion && usrStages.champion === offStages.champion) {
    bracketPoints += 50;
    details.championCorrect = true;
  }

  // Terceiro Lugar (30 pontos)
  if (usrStages.thirdPlace && usrStages.thirdPlace === offStages.thirdPlace) {
    bracketPoints += 30;
    details.thirdPlaceCorrect = true;
  }

  details.breakdown.progression = bracketPoints;
  
  return {
    totalPoints: matchPoints + bracketPoints,
    details
  };
};
