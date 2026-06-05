import { useState } from "react";
import { getKnockoutStages } from "../utils/bracketMatcher";
import Flag from "./Flag";

export default function KnockoutStage({ r32Matchups, predictions, setPredictions }) {
  const [activeStage, setActiveStage] = useState("R32"); // R32, R16, QF, SF, FI

  const stagesData = getKnockoutStages(r32Matchups, predictions);
  
  const handleScoreChange = (matchId, teamKey, value) => {
    const val = value === "" ? "" : parseInt(value, 10);
    if (val !== "" && (isNaN(val) || val < 0 || val > 99)) return;

    setPredictions(prev => {
      const matchPred = { ...(prev[matchId] || { score1: "", score2: "" }) };
      matchPred[teamKey] = val;
      
      // Limpa vencedor dos pênaltis se não for mais empate
      const s1 = teamKey === "score1" ? val : matchPred.score1;
      const s2 = teamKey === "score2" ? val : matchPred.score2;
      if (s1 !== s2) {
        matchPred.penaltyWinner = null;
      }
      
      return {
        ...prev,
        [matchId]: matchPred
      };
    });
  };

  const handlePenaltyWinner = (matchId, teamName) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        penaltyWinner: teamName
      }
    }));
  };

  // Mapeamento dos confrontos por aba
  const getStageMatches = () => {
    switch (activeStage) {
      case "R32":
        return { title: "16avos de Final (32 Seleções)", matches: r32Matchups };
      case "R16":
        return { title: "Oitavas de Final (16 Seleções)", matches: stagesData.r16Matchups };
      case "QF":
        return { title: "Quartas de Final (8 Seleções)", matches: stagesData.qfMatchups };
      case "SF":
        return { title: "Semifinais e Decisões", matches: [
          ...stagesData.sfMatchups,
          stagesData.thirdPlaceMatchup,
          stagesData.finalMatchup
        ]};
      default:
        return { title: "", matches: [] };
    }
  };

  const { title, matches } = getStageMatches();

  return (
    <section className="knockout-section card">
      <h3 className="section-title">🏆 Fase Eliminatória (Mata-Mata)</h3>
      <p className="section-description">
        Os confrontos são formados automaticamente baseados na classificação dos grupos. Em caso de empate, selecione o time que avança nas penalidades!
      </p>

      {/* Navegação de Fases do Mata-Mata */}
      <div className="stage-selector">
        <button 
          className={`stage-btn ${activeStage === "R32" ? "active" : ""}`}
          onClick={() => setActiveStage("R32")}
        >
          16avos (32)
        </button>
        <button 
          className={`stage-btn ${activeStage === "R16" ? "active" : ""}`}
          onClick={() => setActiveStage("R16")}
        >
          Oitavas (16)
        </button>
        <button 
          className={`stage-btn ${activeStage === "QF" ? "active" : ""}`}
          onClick={() => setActiveStage("QF")}
        >
          Quartas (8)
        </button>
        <button 
          className={`stage-btn ${activeStage === "SF" ? "active" : ""}`}
          onClick={() => setActiveStage("SF")}
        >
          Semis e Finais
        </button>
      </div>

      <h4 className="stage-title">{title}</h4>

      {/* Grid de Partidas do Estágio */}
      <div className="knockout-grid">
        {matches.map(match => {
          const pred = predictions[match.id] || { score1: "", score2: "" };
          const hasTeams = match.team1 && match.team2;
          const isDraw = pred.score1 !== "" && pred.score2 !== "" && parseInt(pred.score1, 10) === parseInt(pred.score2, 10);
          
          return (
            <div key={match.id} className={`knockout-card ${hasTeams ? "" : "disabled-match"}`}>
              <div className="knockout-match-label">{match.label}</div>
              
              <div className="knockout-match-row">
                {/* Time 1 */}
                <div className="knockout-team">
                  <Flag teamName={match.team1} />
                  <span className="team-name" title={match.team1}>{match.team1 || "A definir"}</span>
                </div>

                {/* Inputs */}
                <div className="knockout-score-inputs">
                  <input
                    type="number"
                    min="0"
                    placeholder="-"
                    disabled={!hasTeams}
                    className="score-input"
                    value={pred.score1 !== undefined ? pred.score1 : ""}
                    onChange={(e) => handleScoreChange(match.id, "score1", e.target.value)}
                  />
                  <span className="vs-divider">-</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="-"
                    disabled={!hasTeams}
                    className="score-input"
                    value={pred.score2 !== undefined ? pred.score2 : ""}
                    onChange={(e) => handleScoreChange(match.id, "score2", e.target.value)}
                  />
                </div>

                {/* Time 2 */}
                <div className="knockout-team text-right">
                  <span className="team-name" title={match.team2}>{match.team2 || "A definir"}</span>
                  <Flag teamName={match.team2} />
                </div>
              </div>

              {/* Decisão por pênaltis (se houver empate) */}
              {isDraw && hasTeams && (
                <div className="penalty-box">
                  <span className="penalty-label">🏆 Vencedor dos Pênaltis:</span>
                  <div className="penalty-selectors">
                    <button
                      className={`btn btn-xs ${pred.penaltyWinner === match.team1 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handlePenaltyWinner(match.id, match.team1)}
                    >
                      <Flag teamName={match.team1} /> Classifica
                    </button>
                    <button
                      className={`btn btn-xs ${pred.penaltyWinner === match.team2 ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handlePenaltyWinner(match.id, match.team2)}
                    >
                      Classifica <Flag teamName={match.team2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Painel do Campeão e do Pódio (Aparece na aba de Semis/Finais) */}
      {activeStage === "SF" && (
        <div className="podium-section card">
          <h4 className="podium-title">🏆 Seu Pódio Final Virtual</h4>
          <div className="podium-grid">
            <div className="podium-card gold">
              <span className="podium-rank">🥇 Campeão</span>
              <span className="podium-team-flag">
                {stagesData.champion ? <Flag teamName={stagesData.champion} /> : "🏆"}
              </span>
              <span className="podium-team-name">{stagesData.champion || "A definir"}</span>
            </div>
            
            <div className="podium-card silver">
              <span className="podium-rank">🥈 Vice-campeão</span>
              <span className="podium-team-flag">
                {stagesData.runnerUp ? <Flag teamName={stagesData.runnerUp} /> : "🥈"}
              </span>
              <span className="podium-team-name">{stagesData.runnerUp || "A definir"}</span>
            </div>
            
            <div className="podium-card bronze">
              <span className="podium-rank">🥉 Terceiro Lugar</span>
              <span className="podium-team-flag">
                {stagesData.thirdPlace ? <Flag teamName={stagesData.thirdPlace} /> : "🥉"}
              </span>
              <span className="podium-team-name">{stagesData.thirdPlace || "A definir"}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
