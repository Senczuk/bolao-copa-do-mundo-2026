import { useState } from "react";
import { groups, groupMatches } from "../data/matchesData";
import { calculatePlayerPoints } from "../utils/pointsCalculator";
import { calculateGroupStandings, getBestThirdPlacedTeams } from "../utils/standingsCalculator";
import { getRoundOf32Matchups, getKnockoutStages } from "../utils/bracketMatcher";
import Flag from "./Flag";

export default function LeaderboardTable({ 
  players = [], 
  officialResults = {}, 
  currentUserProfile = {}, 
  currentUserPredictions = {} 
}) {
  const [selectedPlayerForView, setSelectedPlayerForView] = useState(null);
  const [compareMode, setCompareMode] = useState("official"); // official or user

  // Calcula a pontuação e os detalhes de cada jogador cadastrado
  const rankedPlayers = players.map(player => {
    const calculation = calculatePlayerPoints(player, {
      groupPredictions: officialResults,
      knockoutPredictions: officialResults
    });
    return {
      ...player,
      score: calculation.totalPoints,
      details: calculation.details
    };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Critérios de desempate no ranking: placares exatos
    if (b.details.exactScoresCount !== a.details.exactScoresCount) {
      return b.details.exactScoresCount - a.details.exactScoresCount;
    }
    return a.name.localeCompare(b.name);
  });

  // Limpa o celular para comparação
  const cleanUserPhone = currentUserProfile?.phone?.replace(/\D/g, "");

  // Helper para comparar palpites de dois jogadores
  const getOutcomeComparison = (playerVal, userVal) => {
    if (
      !playerVal || !userVal || 
      playerVal.score1 === "" || playerVal.score1 === undefined || playerVal.score1 === null ||
      playerVal.score2 === "" || playerVal.score2 === undefined || playerVal.score2 === null ||
      userVal.score1 === "" || userVal.score1 === undefined || userVal.score1 === null ||
      userVal.score2 === "" || userVal.score2 === undefined || userVal.score2 === null
    ) {
      return { label: "Sem palpite", className: "pts-0" };
    }

    const p1 = parseInt(playerVal.score1, 10);
    const p2 = parseInt(playerVal.score2, 10);
    const u1 = parseInt(userVal.score1, 10);
    const u2 = parseInt(userVal.score2, 10);

    if (p1 === u1 && p2 === u2) {
      return { label: "🟢 Iguais (Placar Exato)", className: "pts-25" };
    }

    const pWinner = p1 > p2 ? 1 : p1 < p2 ? 2 : 0;
    const uWinner = u1 > u2 ? 1 : u1 < u2 ? 2 : 0;

    if (pWinner === uWinner) {
      return { label: "🟡 Mesmo Vencedor", className: "pts-15" };
    } else {
      return { label: "🔴 Divergentes", className: "pts-5" };
    }
  };

  // Cálculo das estatísticas do grupo
  const getGroupStats = () => {
    if (players.length === 0) return null;

    const championTally = {};
    let totalGolsPalpitados = 0;
    let totalMatchesPalpitados = 0;

    players.forEach(player => {
      // Resolve chaves para pegar o campeão do participante
      const userGroupStandings = {};
      Object.keys(groups).forEach(groupName => {
        userGroupStandings[groupName] = calculateGroupStandings(groupName, groups[groupName], groupMatches, player.groupPredictions || {});
      });
      const userBestThirds = getBestThirdPlacedTeams(groups, groupMatches, player.groupPredictions || {});
      const userR32Matchups = getRoundOf32Matchups(userGroupStandings, userBestThirds);
      const stages = getKnockoutStages(userR32Matchups, player.knockoutPredictions || {});

      if (stages.champion) {
        championTally[stages.champion] = (championTally[stages.champion] || 0) + 1;
      }

      // Estatísticas de gols
      const groupPreds = player.groupPredictions || {};
      Object.keys(groupPreds).forEach(k => {
        const p = groupPreds[k];
        if (p && p.score1 !== "" && p.score1 !== undefined && p.score1 !== null && p.score2 !== "" && p.score2 !== undefined && p.score2 !== null) {
          totalGolsPalpitados += (parseInt(p.score1, 10) || 0) + (parseInt(p.score2, 10) || 0);
          totalMatchesPalpitados++;
        }
      });
    });

    const sortedChampions = Object.entries(championTally)
      .map(([team, votes]) => ({
        team,
        votes,
        percentage: Math.round((votes / players.length) * 100)
      }))
      .sort((a, b) => b.votes - a.votes);

    const mediaGols = totalMatchesPalpitados > 0 
      ? (totalGolsPalpitados / totalMatchesPalpitados).toFixed(2) 
      : "0.00";

    return {
      sortedChampions,
      mediaGols,
      totalPlayers: players.length
    };
  };

  const groupStats = getGroupStats();

  return (
    <div className="leaderboard-table-container">
      {rankedPlayers.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 20px" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)" }}>
            Nenhum palpite enviado ainda. Seja o primeiro a palpitar e enviar online! 🚀
          </p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th className="pos-col">Pos</th>
                  <th>Participante</th>
                  <th className="data-col">Placar Exato (25)</th>
                  <th className="data-col">Saldo Gols (15)</th>
                  <th className="data-col">Vencedor (10)</th>
                  <th className="data-col font-highlight">Pontos</th>
                  <th className="action-col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rankedPlayers.map((player, idx) => {
                  const isCurrent = cleanUserPhone && player.phone.replace(/\D/g, "") === cleanUserPhone;
                  
                  return (
                    <tr 
                      key={player.phone} 
                      className={`${idx === 0 ? "leader-row" : ""} ${isCurrent ? "current-user-row" : ""}`}
                    >
                      <td className="pos-col font-bold">
                        {idx === 0 ? "👑 1º" : `${idx + 1}º`}
                      </td>
                      <td className="font-bold">
                        {player.name} {isCurrent && <span className="user-badge-self">(Você)</span>}
                      </td>
                      <td className="data-col">{player.details.exactScoresCount}</td>
                      <td className="data-col">{player.details.correctWinnerGDCount}</td>
                      <td className="data-col">{player.details.correctWinnerCount}</td>
                      <td className="data-col font-highlight font-bold font-large">
                        {player.score} pts
                      </td>
                      <td className="action-col">
                        <button 
                          className="btn btn-xs btn-primary"
                          onClick={() => {
                            setSelectedPlayerForView(player);
                            setCompareMode("official");
                          }}
                        >
                          👁️ Comparar Palpites
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAINEL DE ESTATÍSTICAS DO GRUPO */}
          {groupStats && (
            <div className="group-stats-card card" style={{ marginTop: "30px", border: "1px solid rgba(163, 230, 53, 0.15)" }}>
              <h4 className="column-title" style={{ borderLeftColor: "var(--accent-green)", marginBottom: "15px" }}>
                📊 Central de Estatísticas do Grupo GruPera Pear
              </h4>
              
              <div className="stats-dashboard-grid">
                {/* O favorito do grupo */}
                <div className="stat-box">
                  <h5>🏆 Favoritos ao Título no Bolão</h5>
                  {groupStats.sortedChampions.length === 0 ? (
                    <p className="font-secondary" style={{ fontSize: "0.9rem" }}>Ainda sem palpites de campeão definidos.</p>
                  ) : (
                    <ul className="stats-champions-list">
                      {groupStats.sortedChampions.slice(0, 3).map((item, i) => (
                        <li key={item.team} className="champion-stat-item">
                          <span className="champion-rank">{i+1}º</span>
                          <span className="champion-flag"><Flag teamName={item.team} /></span>
                          <span className="champion-name">{item.team}</span>
                          <span className="champion-votes font-highlight">{item.percentage}% ({item.votes} votos)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Métricas Globais */}
                <div className="stat-box metrics-box">
                  <h5>💡 Curiosidades do Grupo</h5>
                  <div className="metric-item">
                    <span className="metric-label">Total de Participantes:</span>
                    <span className="metric-value font-bold">{groupStats.totalPlayers}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Média de Gols nos Palpites (Grupos):</span>
                    <span className="metric-value font-bold font-highlight">{groupStats.mediaGols} por jogo</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Mais escolhido como Campeão:</span>
                    <span className="metric-value font-bold">
                      {groupStats.sortedChampions[0]?.team || "Nenhum"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL DETALHADO DO JOGADOR (COMPARATIVO DE PALPITES PÚBLICO) */}
      {selectedPlayerForView && (
        <div className="modal-overlay" onClick={() => setSelectedPlayerForView(null)}>
          <div className="modal-content card max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🧐 Comparando Palpites de {selectedPlayerForView.name}</h2>
              <button className="close-btn" onClick={() => setSelectedPlayerForView(null)}>&times;</button>
            </div>
            
            <div className="modal-body overflow-y">
              <div className="compare-mode-selector">
                <button 
                  className={`compare-tab-btn ${compareMode === "official" ? "active" : ""}`}
                  onClick={() => setCompareMode("official")}
                >
                  ⚽ Resultados Oficiais
                </button>
                <button 
                  className={`compare-tab-btn ${compareMode === "user" ? "active" : ""}`}
                  disabled={!cleanUserPhone}
                  title={!cleanUserPhone ? "Preencha seus dados de telefone para poder comparar" : ""}
                  onClick={() => setCompareMode("user")}
                >
                  👤 Contra Meus Palpites
                </button>
              </div>

              {compareMode === "official" ? (
                <p className="modal-desc-highlight">
                  Pontuação Total: **{selectedPlayerForView.score} pontos** | Placar Exato: **{selectedPlayerForView.details.exactScoresCount}**
                </p>
              ) : (
                <p className="modal-desc-highlight">
                  Comparação lado-a-lado com os seus palpites atuais neste navegador.
                </p>
              )}
              
              <div className="comparison-section">
                <h4 className="rules-subtitle" style={{ marginBottom: "15px" }}>Comparativo de Jogos (Grupos)</h4>
                <div className="comparison-list">
                  {groupMatches.map(match => {
                    const usr = selectedPlayerForView.groupPredictions?.[match.id];
                    
                    if (compareMode === "official") {
                      const off = officialResults?.[match.id];
                      const hasOff = off && off.score1 !== "" && off.score2 !== "" && off.score1 !== undefined && off.score2 !== undefined;
                      
                      // Recalcula ponto individual desse jogo
                      const matchPts = (usr && off) ? calculatePlayerPoints({
                        groupPredictions: { [match.id]: usr },
                        knockoutPredictions: {}
                      }, {
                        groupPredictions: { [match.id]: off },
                        knockoutPredictions: {}
                      }).totalPoints : 0;

                      return (
                        <div key={match.id} className="comparison-row">
                          <div className="comparison-match">
                            <span>
                              <Flag teamName={match.team1} /> {match.team1} vs {match.team2} <Flag teamName={match.team2} />
                            </span>
                          </div>
                          <div className="comparison-scores">
                            <span className="user-score-badge" title="Palpite do jogador">
                              👤 {usr ? `${usr.score1}x${usr.score2}` : "N/A"}
                            </span>
                            <span className="official-score-badge" title="Resultado oficial">
                              ⚽ {off && off.score1 !== "" && off.score1 !== undefined ? `${off.score1}x${off.score2}` : "-x-"}
                            </span>
                          </div>
                          {hasOff && (
                            <div className={`comparison-points pts-${matchPts}`}>
                              +{matchPts} pts
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Modo comparação com usuário atual
                      const myPred = currentUserPredictions?.[match.id];
                      const comp = getOutcomeComparison(usr, myPred);

                      return (
                        <div key={match.id} className="comparison-row">
                          <div className="comparison-match">
                            <span>
                              <Flag teamName={match.team1} /> {match.team1} vs {match.team2} <Flag teamName={match.team2} />
                            </span>
                          </div>
                          <div className="comparison-scores">
                            <span className="user-score-badge" title={`Palpite de ${selectedPlayerForView.name}`}>
                              👤 {selectedPlayerForView.name.split(" ")[0]}: {usr ? `${usr.score1}x${usr.score2}` : "N/A"}
                            </span>
                            <span className="official-score-badge" title="Seu palpite">
                              👤 Você: {myPred && myPred.score1 !== "" && myPred.score1 !== undefined ? `${myPred.score1}x${myPred.score2}` : "N/A"}
                            </span>
                          </div>
                          <div className={`comparison-points ${comp.className}`} style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                            {comp.label}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedPlayerForView(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
