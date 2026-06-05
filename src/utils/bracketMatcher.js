/**
 * Define e calcula os confrontos da Rodada de 32 (Round of 32)
 * baseado nos vencedores, segundos colocados e melhores terceiros colocados.
 */
export const getRoundOf32Matchups = (groupStandings, bestThirdPlaced) => {
  // Coleta os vencedores (W) e segundos (R) de cada grupo (A-L)
  const winners = {};
  const runners = {};

  Object.keys(groupStandings).forEach(groupName => {
    const groupKey = groupName.replace("Grupo ", ""); // A, B, C, etc.
    const standings = groupStandings[groupName];
    if (standings && standings.length >= 2 && standings[0].played > 0) {
      winners[groupKey] = standings[0].team;
      runners[groupKey] = standings[1].team;
    } else {
      winners[groupKey] = `1º do ${groupKey}`;
      runners[groupKey] = `2º do ${groupKey}`;
    }
  });

  // Aloca os 8 melhores terceiros colocados para os 8 confrontos designados
  // Slots que jogam contra os terceiros colocados:
  const thirdPlaceSlots = [
    { slotId: 1, hostGroup: "A", name: "Vencedor A" },
    { slotId: 2, hostGroup: "B", name: "Vencedor B" },
    { slotId: 3, hostGroup: "D", name: "Vencedor D" },
    { slotId: 4, hostGroup: "E", name: "Vencedor E" },
    { slotId: 5, hostGroup: "I", name: "Vencedor I" },
    { slotId: 6, hostGroup: "G", name: "Vencedor G" },
    { slotId: 7, hostGroup: "K", name: "Vencedor K" },
    { slotId: 8, hostGroup: "L", name: "Vencedor L" }
  ];

  const assignedThirds = {};
  const remainingThirds = [...bestThirdPlaced].slice(0, 8); // Apenas os 8 melhores

  thirdPlaceSlots.forEach((slot) => {
    // Busca o primeiro terceiro colocado que não seja do mesmo grupo para evitar confronto repetido na chave inicial
    const matchIdx = remainingThirds.findIndex(t => t.group !== `Grupo ${slot.hostGroup}`);
    if (matchIdx !== -1) {
      assignedThirds[slot.slotId] = remainingThirds[matchIdx].team;
      remainingThirds.splice(matchIdx, 1);
    } else if (remainingThirds.length > 0) {
      assignedThirds[slot.slotId] = remainingThirds[0].team;
      remainingThirds.splice(0, 1);
    } else {
      assignedThirds[slot.slotId] = `3º Colocado (Slot ${slot.slotId})`;
    }
  });

  // Retorna os 16 confrontos estruturados da Rodada de 32
  return [
    { id: "R32_1", label: "Jogo 1", team1: runners["A"], team2: runners["B"] },
    { id: "R32_2", label: "Jogo 2", team1: winners["A"], team2: assignedThirds[1] },
    { id: "R32_3", label: "Jogo 3", team1: winners["B"], team2: assignedThirds[2] },
    { id: "R32_4", label: "Jogo 4", team1: winners["C"], team2: runners["F"] },
    { id: "R32_5", label: "Jogo 5", team1: winners["F"], team2: runners["C"] },
    { id: "R32_6", label: "Jogo 6", team1: winners["D"], team2: assignedThirds[3] },
    { id: "R32_7", label: "Jogo 7", team1: winners["E"], team2: assignedThirds[4] },
    { id: "R32_8", label: "Jogo 8", team1: runners["E"], team2: runners["I"] },
    { id: "R32_9", label: "Jogo 9", team1: winners["I"], team2: assignedThirds[5] },
    { id: "R32_10", label: "Jogo 10", team1: winners["G"], team2: assignedThirds[6] },
    { id: "R32_11", label: "Jogo 11", team1: winners["H"], team2: runners["J"] },
    { id: "R32_12", label: "Jogo 12", team1: winners["J"], team2: runners["H"] },
    { id: "R32_13", label: "Jogo 13", team1: winners["K"], team2: assignedThirds[7] },
    { id: "R32_14", label: "Jogo 14", team1: runners["K"], team2: runners["L"] },
    { id: "R32_15", label: "Jogo 15", team1: winners["L"], team2: assignedThirds[8] },
    { id: "R32_16", label: "Jogo 16", team1: runners["D"], team2: runners["G"] }
  ];
};

/**
 * Propaga os vencedores dos confrontos de mata-mata para a próxima fase.
 * predictions: objeto com placares/classificados do mata-mata.
 * Ex: predictions["R32_1"] = { score1: 2, score2: 1, penaltyWinner: null } ou similar.
 * Retorna as equipes para as fases seguintes.
 */
export const getKnockoutStages = (r32Matchups, knockoutPredictions) => {
  const getWinnerOfMatch = (matchId, defaultTeam1, defaultTeam2) => {
    // Busca a partida de origem na lista de confrontos da R32, ou resolve dinamicamente
    let team1 = defaultTeam1;
    let team2 = defaultTeam2;

    const pred = knockoutPredictions[matchId];
    if (!pred) return "";

    const s1 = parseInt(pred.score1, 10);
    const s2 = parseInt(pred.score2, 10);

    if (isNaN(s1) || isNaN(s2)) return "";

    if (s1 > s2) return team1;
    if (s2 > s1) return team2;
    
    // Se empatado, precisa do vencedor nos pênaltis e o time deve estar na partida
    if (pred.penaltyWinner === team1 || pred.penaltyWinner === team2) {
      return pred.penaltyWinner;
    }
    return "";
  };

  // 1. Oitavas de Final (16 Times / 8 Jogos)
  const getR32Team = (matchIndex) => {
    const match = r32Matchups[matchIndex];
    if (!match) return "";
    return getWinnerOfMatch(match.id, match.team1, match.team2);
  };

  const r16Matchups = [
    { id: "R16_1", label: "Oitavas 1", team1: getR32Team(0, 1), team2: getR32Team(1, 2) }, // Vencedor Jogo 1 vs Vencedor Jogo 2
    { id: "R16_2", label: "Oitavas 2", team1: getR32Team(2, 1), team2: getR32Team(3, 2) }, // Vencedor Jogo 3 vs Vencedor Jogo 4
    { id: "R16_3", label: "Oitavas 3", team1: getR32Team(4, 1), team2: getR32Team(5, 2) }, // Vencedor Jogo 5 vs Vencedor Jogo 6
    { id: "R16_4", label: "Oitavas 4", team1: getR32Team(6, 1), team2: getR32Team(7, 2) }, // Vencedor Jogo 7 vs Vencedor Jogo 8
    { id: "R16_5", label: "Oitavas 5", team1: getR32Team(8, 1), team2: getR32Team(9, 2) }, // Vencedor Jogo 9 vs Vencedor Jogo 10
    { id: "R16_6", label: "Oitavas 6", team1: getR32Team(10, 1), team2: getR32Team(11, 2) }, // Vencedor Jogo 11 vs Vencedor Jogo 12
    { id: "R16_7", label: "Oitavas 7", team1: getR32Team(12, 1), team2: getR32Team(13, 2) }, // Vencedor Jogo 13 vs Vencedor Jogo 14
    { id: "R16_8", label: "Oitavas 8", team1: getR32Team(14, 1), team2: getR32Team(15, 2) }  // Vencedor Jogo 15 vs Vencedor Jogo 16
  ];

  // 2. Quartas de Final (8 Times / 4 Jogos)
  const getR16Winner = (idx) => {
    const match = r16Matchups[idx];
    return getWinnerOfMatch(match.id, match.team1, match.team2);
  };

  const qfMatchups = [
    { id: "QF_1", label: "Quartas 1", team1: getR16Winner(0), team2: getR16Winner(1) },
    { id: "QF_2", label: "Quartas 2", team1: getR16Winner(2), team2: getR16Winner(3) },
    { id: "QF_3", label: "Quartas 3", team1: getR16Winner(4), team2: getR16Winner(5) },
    { id: "QF_4", label: "Quartas 4", team1: getR16Winner(6), team2: getR16Winner(7) }
  ];

  // 3. Semifinais (4 Times / 2 Jogos)
  const getQFWinner = (idx) => {
    const match = qfMatchups[idx];
    return getWinnerOfMatch(match.id, match.team1, match.team2);
  };

  const sfMatchups = [
    { id: "SF_1", label: "Semifinal 1", team1: getQFWinner(0), team2: getQFWinner(1) },
    { id: "SF_2", label: "Semifinal 2", team1: getQFWinner(2), team2: getQFWinner(3) }
  ];

  // Auxiliares para disputa de 3º lugar e Final
  const getSFResults = () => {
    const m1 = sfMatchups[0];
    const m2 = sfMatchups[1];

    const w1 = getWinnerOfMatch(m1.id, m1.team1, m1.team2);
    const w2 = getWinnerOfMatch(m2.id, m2.team1, m2.team2);

    let l1 = "";
    if (w1 && m1.team1 && m1.team2) {
      l1 = w1 === m1.team1 ? m1.team2 : m1.team1;
    }
    let l2 = "";
    if (w2 && m2.team1 && m2.team2) {
      l2 = w2 === m2.team1 ? m2.team2 : m2.team1;
    }

    return { w1, w2, l1, l2 };
  };

  const { w1, w2, l1, l2 } = getSFResults();

  // 4. Terceiro Lugar e Final
  const thirdPlaceMatchup = { id: "TP_1", label: "Disputa de 3º Lugar", team1: l1 || "Perdedor SF1", team2: l2 || "Perdedor SF2" };
  const finalMatchup = { id: "FI_1", label: "Grande Final", team1: w1 || "Vencedor SF1", team2: w2 || "Vencedor SF2" };

  // Retorna campeão e vice-campeão se a final estiver palpitada
  const champion = getWinnerOfMatch("FI_1", finalMatchup.team1, finalMatchup.team2);
  const runnerUp = champion ? (champion === finalMatchup.team1 ? finalMatchup.team2 : finalMatchup.team1) : "";
  const thirdPlace = getWinnerOfMatch("TP_1", thirdPlaceMatchup.team1, thirdPlaceMatchup.team2);

  return {
    r16Matchups,
    qfMatchups,
    sfMatchups,
    thirdPlaceMatchup,
    finalMatchup,
    champion,
    runnerUp,
    thirdPlace
  };
};
