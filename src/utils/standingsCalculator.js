/**
 * Calcula a tabela de classificação de um grupo específico com base nos palpites ou resultados.
 */
export const calculateGroupStandings = (groupName, teams, matches, predictions) => {
  // Inicializa o objeto de classificação para cada time
  const standings = teams.reduce((acc, team) => {
    acc[team] = {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
    return acc;
  }, {});

  // Filtra as partidas deste grupo
  const groupMatches = matches.filter(m => m.group === groupName);

  groupMatches.forEach(match => {
    const pred = predictions[match.id];
    
    // Verifica se a partida tem um palpite/resultado válido (ambos os campos preenchidos)
    if (
      pred && 
      pred.score1 !== undefined && pred.score1 !== null && pred.score1 !== "" &&
      pred.score2 !== undefined && pred.score2 !== null && pred.score2 !== ""
    ) {
      const g1 = parseInt(pred.score1, 10);
      const g2 = parseInt(pred.score2, 10);

      if (isNaN(g1) || isNaN(g2)) return;

      const t1 = match.team1;
      const t2 = match.team2;

      standings[t1].played += 1;
      standings[t2].played += 1;
      standings[t1].goalsFor += g1;
      standings[t1].goalsAgainst += g2;
      standings[t2].goalsFor += g2;
      standings[t2].goalsAgainst += g1;

      if (g1 > g2) {
        standings[t1].won += 1;
        standings[t1].points += 3;
        standings[t2].lost += 1;
      } else if (g1 < g2) {
        standings[t2].won += 1;
        standings[t2].points += 3;
        standings[t1].lost += 1;
      } else {
        standings[t1].drawn += 1;
        standings[t1].points += 1;
        standings[t2].drawn += 1;
        standings[t2].points += 1;
      }

      standings[t1].goalDifference = standings[t1].goalsFor - standings[t1].goalsAgainst;
      standings[t2].goalDifference = standings[t2].goalsFor - standings[t2].goalsAgainst;
    }
  });

  // Converte em array e ordena com base nos critérios de desempate da FIFA
  return Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    // Critério geográfico/alfabético simples como último recurso para evitar empates travados no layout
    return a.team.localeCompare(b.team);
  });
};

/**
 * Calcula e ordena os terceiros colocados de todos os 12 grupos.
 * Retorna uma lista ordenada contendo o time, o grupo e os seus dados estatísticos.
 */
export const getBestThirdPlacedTeams = (groupsData, matches, predictions) => {
  const thirdPlaces = [];

  Object.keys(groupsData).forEach(groupName => {
    const teams = groupsData[groupName];
    const standings = calculateGroupStandings(groupName, teams, matches, predictions);
    
    // O terceiro colocado fica no índice 2 (terceiro elemento da lista ordenada de 4)
    if (standings.length >= 3) {
      const third = standings[2];
      const groupKey = groupName.replace("Grupo ", "");
      thirdPlaces.push({
        ...third,
        team: third.played > 0 ? third.team : `3º do ${groupKey}`,
        group: groupName
      });
    }
  });

  // Ordena os 12 terceiros colocados para encontrar os 8 melhores
  return thirdPlaces.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
};
