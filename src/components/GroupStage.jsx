import { useState } from "react";
import { groups } from "../data/matchesData";
import { calculateGroupStandings } from "../utils/standingsCalculator";
import Flag from "./Flag";

export default function GroupStage({ matches, predictions, setPredictions }) {
  const groupKeys = Object.keys(groups);
  const [selectedGroup, setSelectedGroup] = useState(groupKeys[0]);

  const handleScoreChange = (matchId, teamKey, value) => {
    // Permite apenas números entre 0 e 99 ou vazio
    const val = value === "" ? "" : parseInt(value, 10);
    if (val !== "" && (isNaN(val) || val < 0 || val > 99)) return;

    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [teamKey]: val
      }
    }));
  };

  // Filtra as partidas do grupo selecionado
  const currentMatches = matches.filter(m => m.group === selectedGroup);
  
  // Calcula a tabela do grupo selecionado
  const standings = calculateGroupStandings(
    selectedGroup,
    groups[selectedGroup],
    matches,
    predictions
  );

  return (
    <section className="group-stage-section card">
      <h3 className="section-title">📅 Fase de Grupos</h3>
      <p className="section-description">
        Dê seus palpites nos jogos das rodadas de cada grupo. A classificação atualizará automaticamente!
      </p>

      {/* Seletor de Grupos (Abas A-L) */}
      <div className="group-selector">
        {groupKeys.map(groupName => {
          const letter = groupName.replace("Grupo ", "");
          const isSelected = selectedGroup === groupName;
          
          // Conta quantos jogos já foram respondidos no grupo
          const groupMatchesList = matches.filter(m => m.group === groupName);
          const answeredCount = groupMatchesList.filter(m => {
            const p = predictions[m.id];
            return p && p.score1 !== "" && p.score1 !== undefined && p.score2 !== "" && p.score2 !== undefined;
          }).length;

          return (
            <button
              key={groupName}
              className={`group-tab-btn ${isSelected ? "active" : ""}`}
              onClick={() => setSelectedGroup(groupName)}
            >
              <span className="group-letter">{letter}</span>
              <span className="group-progress-badge">
                {answeredCount}/6
              </span>
            </button>
          );
        })}
      </div>

      {/* Painel do Grupo Ativo (Grelha de Jogos + Tabela de Classificação) */}
      <div className="group-grid">
        {/* Lado Esquerdo: Partidas */}
        <div className="group-matches-col">
          <h4 className="column-title">Jogos do Grupo {selectedGroup.replace("Grupo ", "")}</h4>
          
          <div className="matches-list">
            {currentMatches.map(match => {
              const pred = predictions[match.id] || { score1: "", score2: "" };
              
              return (
                <div key={match.id} className="match-card">
                  <div className="match-info">
                    <span className="match-round">{match.round}</span>
                    <span className="match-details">{match.date} às {match.time} · {match.stadium}</span>
                  </div>

                  <div className="match-teams-input">
                    {/* Time 1 */}
                    <div className="team-row left-team">
                      <Flag teamName={match.team1} />
                      <span className="team-name">{match.team1}</span>
                    </div>

                    <div className="score-inputs">
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        className="score-input"
                        value={pred.score1 !== undefined ? pred.score1 : ""}
                        onChange={(e) => handleScoreChange(match.id, "score1", e.target.value)}
                      />
                      <span className="vs-divider">&times;</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        className="score-input"
                        value={pred.score2 !== undefined ? pred.score2 : ""}
                        onChange={(e) => handleScoreChange(match.id, "score2", e.target.value)}
                      />
                    </div>

                    {/* Time 2 */}
                    <div className="team-row right-team">
                      <span className="team-name">{match.team2}</span>
                      <Flag teamName={match.team2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lado Direito: Tabela de Classificação */}
        <div className="group-standings-col">
          <h4 className="column-title">Classificação Virtual</h4>
          
          <div className="table-responsive">
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="pos-col">Pos</th>
                  <th className="team-col">Seleção</th>
                  <th className="data-col">P</th>
                  <th className="data-col">J</th>
                  <th className="data-col">V</th>
                  <th className="data-col">E</th>
                  <th className="data-col">D</th>
                  <th className="data-col">GP</th>
                  <th className="data-col font-secondary">GC</th>
                  <th className="data-col font-highlight">SG</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, idx) => {
                  const isQualified = idx < 2; // Top 2 qualificados automáticos
                  
                  return (
                    <tr 
                      key={row.team} 
                      className={isQualified ? "qualified-row" : "eliminated-row"}
                    >
                      <td className="pos-col">{idx + 1}º</td>
                      <td className="team-col">
                        <span className="team-flag-inline">
                          <Flag teamName={row.team} />
                        </span>
                        <span className="team-name-inline">{row.team}</span>
                      </td>
                      <td className="data-col font-bold">{row.points}</td>
                      <td className="data-col">{row.played}</td>
                      <td className="data-col">{row.won}</td>
                      <td className="data-col">{row.drawn}</td>
                      <td className="data-col">{row.lost}</td>
                      <td className="data-col">{row.goalsFor}</td>
                      <td className="data-col font-secondary">{row.goalsAgainst}</td>
                      <td className="data-col font-highlight font-bold">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="table-legend">
            <div className="legend-item">
              <span className="legend-color qualified"></span>
              <span>Classificados diretos (1º e 2º)</span>
            </div>
            <p className="legend-note">
              *Os 8 melhores 3ºs colocados gerais também avançam para os 16avos de final.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
