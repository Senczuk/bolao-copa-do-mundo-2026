import { useState } from "react";
import { groupMatches } from "../data/matchesData";
import { calculatePlayerPoints } from "../utils/pointsCalculator";
import GroupStage from "./GroupStage";
import KnockoutStage from "./KnockoutStage";
import Flag from "./Flag";
import { GOOGLE_SCRIPT_URL } from "../App";

export default function AdminDashboard({
  players,
  onAddPlayers,
  onRemovePlayer,
  onClearPlayers,
  officialResults,
  setOfficialResults,
  officialR32Matchups,
  onPublishOfficialResults,
  publishingOfficial
}) {
  const [adminSubTab, setAdminSubTab] = useState("ranking"); // ranking, results_groups, results_knockout, import
  const [selectedPlayerForView, setSelectedPlayerForView] = useState(null);

  // Tradutor de nomes de seleções (Inglês no JSON do GitHub -> Português do Bolão)
  const englishToPortuguese = {
    "Mexico": "México", "South Africa": "África do Sul", "South Korea": "Coreia do Sul", "Czechia": "República Tcheca", "Czech Republic": "República Tcheca",
    "Canada": "Canadá", "Bosnia & Herzegovina": "Bósnia & Herzegovina", "Bosnia and Herzegovina": "Bósnia & Herzegovina", "Qatar": "Catar", "Switzerland": "Suíça",
    "Brazil": "Brasil", "Morocco": "Marrocos", "Haiti": "Haiti", "Scotland": "Escócia",
    "United States": "Estados Unidos", "USA": "Estados Unidos", "Paraguay": "Paraguai", "Australia": "Austrália", "Turkey": "Turquia", "Türkiye": "Turquia",
    "Germany": "Alemanha", "Curaçao": "Curaçao", "Ivory Coast": "Costa do Marfim", "Côte d'Ivoire": "Costa do Marfim", "Ecuador": "Equador",
    "Netherlands": "Holanda", "Japan": "Japão", "Sweden": "Suécia", "Tunisia": "Tunísia",
    "Belgium": "Bélgica", "Egypt": "Egito", "Iran": "Irã", "New Zealand": "Nova Zelândia",
    "Spain": "Espanha", "Cape Verde": "Cabo Verde", "Cabo Verde": "Cabo Verde", "Saudi Arabia": "Arábia Saudita", "Uruguay": "Uruguai",
    "France": "França", "Senegal": "Senegal", "Iraq": "Iraque", "Norway": "Noruega",
    "Argentina": "Argentina", "Algeria": "Argélia", "Austria": "Áustria", "Jordan": "Jordânia",
    "Portugal": "Portugal", "DR Congo": "RD Congo", "Uzbekistan": "Uzbequistão", "Colombia": "Colômbia",
    "England": "Inglaterra", "Croatia": "Croácia", "Ghana": "Gana", "Panama": "Panamá"
  };

  const [loadingResults, setLoadingResults] = useState(false);

  // Busca e preenche os resultados oficiais de forma automática a partir dos dados do repositório
  const handleFetchOfficialResults = async () => {
    setLoadingResults(true);
    try {
      const response = await fetch("https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json");
      if (!response.ok) throw new Error("Erro de conexão ao servidor de dados.");
      const data = await response.json();
      
      if (!data.matches || !Array.isArray(data.matches)) {
        throw new Error("Formato do arquivo de dados recebido é inválido.");
      }
      
      const newOfficialResults = { ...officialResults };
      let updatedCount = 0;
      
      const translateTeam = (name) => englishToPortuguese[name] || name;
      
      data.matches.forEach(m => {
        if (m.score1 !== undefined && m.score1 !== null && m.score2 !== undefined && m.score2 !== null) {
          const t1_pt = translateTeam(m.team1);
          const t2_pt = translateTeam(m.team2);
          
          // Localiza o jogo no nosso banco pelas duas equipes envolvidas
          const appMatch = groupMatches.find(am => 
            (am.team1 === t1_pt && am.team2 === t2_pt) || 
            (am.team1 === t2_pt && am.team2 === t1_pt)
          );
          
          if (appMatch) {
            const isSwapped = appMatch.team1 !== t1_pt;
            newOfficialResults[appMatch.id] = {
              score1: isSwapped ? m.score2 : m.score1,
              score2: isSwapped ? m.score1 : m.score2
            };
            updatedCount++;
          }
        }
      });
      
      setOfficialResults(newOfficialResults);
      alert(`Sincronização completa! ${updatedCount} placares oficiais carregados.`);
    } catch (err) {
      alert(`Erro ao sincronizar resultados automaticamente: ${err.message}. Digite os placares manualmente.`);
    } finally {
      setLoadingResults(false);
    }
  };

  const [syncingSheets, setSyncingSheets] = useState(false);

  const handleSyncGoogleSheets = async () => {
    if (!GOOGLE_SCRIPT_URL) return;
    setSyncingSheets(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (!response.ok) throw new Error("Erro de conexão ao Google Sheets.");
      const data = await response.json();
      
      if (data.status === "error") {
        throw new Error(data.message);
      }
      
      if (!Array.isArray(data)) {
        throw new Error("Formato inválido retornado pelo servidor do Google.");
      }
      
      // Filtra duplicados mantendo o palpite mais recente do mesmo celular normalizado
      const reversedData = [...data].reverse();
      const uniquePlayers = [];
      const seenPhones = new Set();
      
      reversedData.forEach(p => {
        if (p && p.name && p.phone) {
          const cleanPhone = p.phone.replace(/\D/g, "");
          if (cleanPhone && !seenPhones.has(cleanPhone)) {
            seenPhones.add(cleanPhone);
            uniquePlayers.push({
              name: p.name,
              phone: p.phone,
              groupPredictions: p.groupPredictions || {},
              knockoutPredictions: p.knockoutPredictions || {},
              timestamp: p.timestamp
            });
          }
        }
      });
      
      onAddPlayers(uniquePlayers);
      alert(`Planilha sincronizada! ${uniquePlayers.length} palpites carregados com sucesso.`);
    } catch (err) {
      alert(`Erro ao buscar palpites da Planilha: ${err.message}`);
    } finally {
      setSyncingSheets(false);
    }
  };

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPlayers = [];
    let loaded = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.name && data.phone && data.groupPredictions && data.knockoutPredictions) {
            newPlayers.push({
              name: data.name,
              phone: data.phone,
              groupPredictions: data.groupPredictions,
              knockoutPredictions: data.knockoutPredictions,
              fileName: file.name
            });
          } else {
            alert(`O arquivo "${file.name}" não está no formato correto de palpites.`);
          }
        } catch (err) {
          console.error(err);
          alert(`Erro ao ler o arquivo "${file.name}": arquivo JSON corrompido.`);
        }
        
        loaded++;
        if (loaded === files.length) {
          onAddPlayers(newPlayers);
          // Limpa input
          e.target.value = null;
        }
      };
      
      reader.readAsText(file);
    }
  };

  // Calcula a pontuação e os detalhes de cada jogador cadastrado
  const rankedPlayers = players.map(player => {
    const calculation = calculatePlayerPoints(player, {
      groupPredictions: officialResults,
      knockoutPredictions: officialResults // Os resultados oficiais usam o mesmo formato de chaves
    });
    return {
      ...player,
      score: calculation.totalPoints,
      details: calculation.details
    };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Critérios de desempate no ranking do bolão:
    if (b.details.exactScoresCount !== a.details.exactScoresCount) {
      return b.details.exactScoresCount - a.details.exactScoresCount;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="admin-dashboard-container">
      {/* Subnavegação do Administrador */}
      <div className="admin-subnav">
        <button 
          className={`subnav-btn ${adminSubTab === "ranking" ? "active" : ""}`}
          onClick={() => setAdminSubTab("ranking")}
        >
          📊 Ranking Geral
        </button>
        <button 
          className={`subnav-btn ${adminSubTab === "import" ? "active" : ""}`}
          onClick={() => setAdminSubTab("import")}
        >
          📥 Importar Palpites ({players.length})
        </button>
        <button 
          className={`subnav-btn ${adminSubTab === "results_groups" ? "active" : ""}`}
          onClick={() => setAdminSubTab("results_groups")}
        >
          📝 Resultados Oficiais: Grupos
        </button>
        <button 
          className={`subnav-btn ${adminSubTab === "results_knockout" ? "active" : ""}`}
          onClick={() => setAdminSubTab("results_knockout")}
        >
          🏆 Resultados Oficiais: Mata-Mata
        </button>
      </div>

      {/* SUB-ABA 1: RANKING GERAL */}
      {adminSubTab === "ranking" && (
        <div className="admin-content card">
          <h3 className="section-title">📊 Tabela de Classificação do Bolão</h3>
          <p className="section-description">
            Ranking geral do grupo de amigos **GruPera**. Atualizado em tempo real conforme os resultados oficiais são preenchidos.
          </p>

          {rankedPlayers.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum palpite importado ainda. Vá na aba "Importar Palpites" para carregar os arquivos JSON dos participantes.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th className="pos-col">Pos</th>
                    <th>Participante</th>
                    <th>WhatsApp</th>
                    <th className="data-col">Placar Exato (25)</th>
                    <th className="data-col">Saldo Gols (15)</th>
                    <th className="data-col">Vencedor (10)</th>
                    <th className="data-col font-highlight">Pontos Totais</th>
                    <th className="action-col">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedPlayers.map((player, idx) => (
                    <tr key={player.phone} className={idx === 0 ? "leader-row" : ""}>
                      <td className="pos-col font-bold">
                        {idx === 0 ? "👑 1º" : `${idx + 1}º`}
                      </td>
                      <td className="font-bold">{player.name}</td>
                      <td>{player.phone}</td>
                      <td className="data-col">{player.details.exactScoresCount}</td>
                      <td className="data-col">{player.details.correctWinnerGDCount}</td>
                      <td className="data-col">{player.details.correctWinnerCount}</td>
                      <td className="data-col font-highlight font-bold font-large">
                        {player.score} pts
                      </td>
                      <td className="action-col">
                        <button 
                          className="btn btn-xs btn-primary"
                          onClick={() => setSelectedPlayerForView(player)}
                        >
                          👁️ Ver Palpites
                        </button>
                        <button 
                          className="btn btn-xs btn-danger"
                          onClick={() => onRemovePlayer(player.phone)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: IMPORTAR PALPITES */}
      {adminSubTab === "import" && (
        <div className="admin-content card">
          <h3 className="section-title">📥 Upload e Importação de Palpites</h3>
          <p className="section-description">
            Sincronize online com o Google Sheets ou selecione múltiplos arquivos `.json` salvos localmente.
          </p>

          {GOOGLE_SCRIPT_URL && (
            <div className="sheets-sync-box">
              <h4 className="column-title">Sincronização Online (Google Sheets)</h4>
              <p className="upload-help" style={{ marginBottom: "15px" }}>
                Importe instantaneamente todos os palpites enviados pelos participantes direto da planilha cadastrada.
              </p>
              <button 
                className="btn btn-primary"
                onClick={handleSyncGoogleSheets}
                disabled={syncingSheets}
              >
                {syncingSheets ? "⏳ Importando palpites..." : "🔄 Sincronizar com Planilha do Google"}
              </button>
              
              <div style={{ margin: "25px 0", borderBottom: "1px solid var(--border-glass)" }}></div>
            </div>
          )}

          <div className="upload-box">
            <label className="upload-label" htmlFor="json-upload-input">
              📁 Selecionar arquivos JSON do WhatsApp
            </label>
            <input
              type="file"
              id="json-upload-input"
              accept=".json"
              multiple
              onChange={handleFileUpload}
              className="file-input-hidden"
            />
            <p className="upload-help">
              Você pode selecionar vários arquivos de uma só vez (Ctrl + Clique).
            </p>
          </div>

          <div className="players-list-section">
            <div className="section-header-inline">
              <h4>Participantes Ativos ({players.length})</h4>
              {players.length > 0 && (
                <button className="btn btn-danger btn-sm" onClick={onClearPlayers}>
                  Limpar Todos os Participantes
                </button>
              )}
            </div>

            {players.length === 0 ? (
              <p className="empty-text">Nenhum jogador importado.</p>
            ) : (
              <ul className="players-list">
                {players.map(player => (
                  <li key={player.phone} className="player-list-item">
                    <div>
                      <strong>{player.name}</strong> 
                      <span className="player-phone-badge">{player.phone}</span>
                    </div>
                    <button 
                      className="btn btn-danger btn-xs"
                      onClick={() => onRemovePlayer(player.phone)}
                    >
                      Excluir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* SUB-ABA 3: PLACARES OFICIAIS GRUPOS */}
      {adminSubTab === "results_groups" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <div>
              💡 **Resultados Oficiais:** Insira os placares reais da Copa para calcular as pontuações do grupo.
            </div>
            <div className="admin-sync-actions">
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleFetchOfficialResults}
                disabled={loadingResults}
              >
                {loadingResults ? "⏳ Buscando..." : "🔄 Sincronizar via Web"}
              </button>
              <button 
                className="btn btn-sm"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)", color: "#fff", fontWeight: "600" }}
                onClick={onPublishOfficialResults}
                disabled={publishingOfficial}
              >
                {publishingOfficial ? "⏳ Publicando..." : "📢 Publicar Resultados"}
              </button>
              <a 
                href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=BR&wtw-filter=ALL"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary"
              >
                ⚽ Ver Resultados na FIFA
              </a>
            </div>
          </div>
          <GroupStage
            matches={groupMatches}
            predictions={officialResults}
            setPredictions={setOfficialResults}
          />
        </div>
      )}

      {/* SUB-ABA 4: PLACARES OFICIAIS MATA-MATA */}
      {adminSubTab === "results_knockout" && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <div>
              💡 **Resultados Mata-Mata:** Insira os placares reais e selecione o time vencedor dos pênaltis se der empate.
            </div>
            <div className="admin-sync-actions">
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleFetchOfficialResults}
                disabled={loadingResults}
              >
                {loadingResults ? "⏳ Buscando..." : "🔄 Sincronizar via Web"}
              </button>
              <button 
                className="btn btn-sm"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)", color: "#fff", fontWeight: "600" }}
                onClick={onPublishOfficialResults}
                disabled={publishingOfficial}
              >
                {publishingOfficial ? "⏳ Publicando..." : "📢 Publicar Resultados"}
              </button>
              <a 
                href="https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=BR&wtw-filter=ALL"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-secondary"
              >
                ⚽ Ver Resultados na FIFA
              </a>
            </div>
          </div>
          <KnockoutStage
            r32Matchups={officialR32Matchups}
            predictions={officialResults}
            setPredictions={setOfficialResults}
          />
        </div>
      )}

      {/* MODAL DETALHADO DO JOGADOR (COMPARATIVO DE PALPITES) */}
      {selectedPlayerForView && (
        <div className="modal-overlay" onClick={() => setSelectedPlayerForView(null)}>
          <div className="modal-content card max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🧐 Palpites de {selectedPlayerForView.name}</h2>
              <button className="close-btn" onClick={() => setSelectedPlayerForView(null)}>&times;</button>
            </div>
            
            <div className="modal-body overflow-y">
              <p className="modal-desc-highlight">
                WhatsApp: {selectedPlayerForView.phone} | Pontuação Total: **{selectedPlayerForView.score} pontos**
              </p>
              
              <div className="comparison-section">
                <h4 className="rules-subtitle">Pontuação de Fase de Grupos ({selectedPlayerForView.details.breakdown.groupMatches} pts)</h4>
                <div className="comparison-list">
                  {groupMatches.map(match => {
                    const usr = selectedPlayerForView.groupPredictions[match.id];
                    const off = officialResults[match.id];
                    const hasOff = off && off.score1 !== "" && off.score2 !== "";
                     
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
                            ⚽ {off && off.score1 !== "" ? `${off.score1}x${off.score2}` : "-x-"}
                          </span>
                        </div>
                        {hasOff && (
                          <div className={`comparison-points pts-${matchPts}`}>
                            +{matchPts} pts
                          </div>
                        )}
                      </div>
                    );
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
