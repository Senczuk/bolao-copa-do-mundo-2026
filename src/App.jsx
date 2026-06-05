import { useState, useEffect } from "react";
import Header from "./components/Header";
import UserProfile from "./components/UserProfile";
import GroupStage from "./components/GroupStage";
import KnockoutStage from "./components/KnockoutStage";
import AdminDashboard from "./components/AdminDashboard";
import ScoreRulesModal from "./components/ScoreRulesModal";
import LeaderboardTable from "./components/LeaderboardTable";

import { groups, groupMatches } from "./data/matchesData";
import { calculateGroupStandings, getBestThirdPlacedTeams } from "./utils/standingsCalculator";
import { getRoundOf32Matchups } from "./utils/bracketMatcher";

// URL do Google Apps Script para conexao direta com a Planilha do Google (Bando de Dados)
// Cole a URL fornecida pelo Google Apps Script entre as aspas para ativar o salvamento online
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSUEjQaViDWgeI1jdxkNKUmxlc9f5zfhk75g0O53qWvGEOBnk7lTEhKb8h7Mr90bGg/exec";

export default function App() {
  const [activeTab, setActiveTab] = useState("palpites"); // palpites, ranking, admin
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // 1. Estados do Participante
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("bolao_user_profile");
    return savedProfile ? JSON.parse(savedProfile) : { name: "", phone: "" };
  });
  const [predictions, setPredictions] = useState(() => {
    const savedPredictions = localStorage.getItem("bolao_user_predictions");
    return savedPredictions ? JSON.parse(savedPredictions) : {};
  });

  // 2. Estados do Administrador
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem("bolao_players_list");
    return saved ? JSON.parse(saved) : [];
  });
  const [officialResults, setOfficialResults] = useState(() => {
    const saved = localStorage.getItem("bolao_official_results");
    return saved ? JSON.parse(saved) : {};
  });

  const loadOnlineData = async () => {
    if (!GOOGLE_SCRIPT_URL) return;

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      if (!response.ok) throw new Error("Erro de conexão.");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // A. Extrai os resultados oficiais publicados (telefone especial: 00000000000)
        const official = data.find(p => p && p.phone && (p.phone === "00000000000" || p.phone.replace(/\D/g, "") === "00000000000"));
        if (official) {
          setOfficialResults(official.groupPredictions || {});
          localStorage.setItem("bolao_official_results", JSON.stringify(official.groupPredictions || {}));
        }

        // B. Filtra os outros jogadores normais
        const normalPlayers = data.filter(p => p && p.phone && p.phone !== "00000000000" && p.phone.replace(/\D/g, "") !== "00000000000");
        const reversed = [...normalPlayers].reverse();
        const unique = [];
        const seen = new Set();
        reversed.forEach(p => {
          if (p && p.phone) {
            const cleanPhone = p.phone.replace(/\D/g, "");
            if (p.name && cleanPhone && !seen.has(cleanPhone)) {
              seen.add(cleanPhone);
              unique.push(p);
            }
          }
        });
        setPlayers(unique);
        localStorage.setItem("bolao_players_list", JSON.stringify(unique));
      }
    } catch (err) {
      console.warn("Falha ao sincronizar Planilha Online. Usando cache local.", err);
    }
  };

  // Carrega dados iniciais e sincroniza online do Google Sheets
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOnlineData();
  }, []);

  // Ações de Persistência Local do Participante
  const handleSaveLocal = () => {
    localStorage.setItem("bolao_user_profile", JSON.stringify(profile));
    localStorage.setItem("bolao_user_predictions", JSON.stringify(predictions));
    alert("Progresso salvo com sucesso neste navegador! 💾");
  };

  const handleClearData = () => {
    if (window.confirm("Deseja realmente limpar todos os seus palpites digitados? Isso não afetará os dados do Administrador.")) {
      setPredictions({});
      localStorage.removeItem("bolao_user_predictions");
    }
  };

  const validateProfile = () => {
    const cleanName = profile.name.trim();
    const cleanPhone = profile.phone.replace(/\D/g, "");

    if (!cleanName) {
      alert("Por favor, insira seu nome completo. 👤");
      return false;
    }
    if (cleanName.split(/\s+/).filter(Boolean).length < 2) {
      alert("Por favor, insira nome e sobrenome para podermos lhe identificar no bolão. 👤");
      return false;
    }
    if (!cleanPhone) {
      alert("Por favor, insira seu número de celular. 📱");
      return false;
    }
    if (cleanPhone.length < 10) {
      alert("Por favor, insira um número de celular válido com DDD (mínimo de 10 dígitos). 📱");
      return false;
    }
    return true;
  };

  // Exportar dados como JSON
  const handleExportJSON = () => {
    if (!validateProfile()) return;

    const dataStr = JSON.stringify({
      name: profile.name,
      phone: profile.phone,
      groupPredictions: predictions, // Inclui palpites de grupo e eliminatórios
      knockoutPredictions: predictions
    }, null, 2);

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Nome do arquivo padronizado
    const safeName = profile.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.href = url;
    link.download = `bolao_grupera_${safeName}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const [submittingOnline, setSubmittingOnline] = useState(false);

  const handleSubmitOnline = async () => {
    if (!GOOGLE_SCRIPT_URL) return;
    if (!validateProfile()) return;

    setSubmittingOnline(true);
    try {
      const data = {
        name: profile.name,
        phone: profile.phone,
        groupPredictions: predictions,
        knockoutPredictions: predictions
      };

      // Envia via POST simples (evita CORS preflight OPTIONS request)
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data)
      });

      alert("Palpites enviados com sucesso para a Planilha do Google! 🚀");
      await loadOnlineData();
    } catch (err) {
      alert(`Falha ao enviar palpites online: ${err.message}`);
    } finally {
      setSubmittingOnline(false);
    }
  };

  const handleLoadPredictionsByPhone = (phoneToFind) => {
    const formattedPhone = phoneToFind.replace(/\D/g, "");
    if (!formattedPhone) {
      alert("Por favor, digite seu número de celular para buscar.");
      return;
    }

    // Busca nas palpites carregados da Planilha
    const found = players.find(p => p.phone.replace(/\D/g, "") === formattedPhone);
    if (found) {
      setProfile({ name: found.name, phone: found.phone });
      setPredictions({ ...found.groupPredictions, ...found.knockoutPredictions });
      
      localStorage.setItem("bolao_user_profile", JSON.stringify({ name: found.name, phone: found.phone }));
      localStorage.setItem("bolao_user_predictions", JSON.stringify({ ...found.groupPredictions, ...found.knockoutPredictions }));
      alert(`Palpites de ${found.name} recuperados e carregados com sucesso! 🚀`);
    } else {
      alert("Nenhum palpite foi encontrado online para este número de celular.");
    }
  };

  const [publishingOfficial, setPublishingOfficial] = useState(false);

  const handlePublishOfficialResults = async () => {
    if (!GOOGLE_SCRIPT_URL) return;
    
    if (!window.confirm("Deseja publicar estes resultados oficiais na Planilha do Google? Todos os amigos verão o ranking atualizado.")) {
      return;
    }

    setPublishingOfficial(true);
    try {
      const data = {
        name: "RESULTADOS_OFICIAIS",
        phone: "00000000000",
        groupPredictions: officialResults,
        knockoutPredictions: officialResults
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(data)
      });

      alert("Resultados oficiais publicados com sucesso online! Ranking atualizado para todos. 📢");
    } catch (err) {
      alert(`Falha ao publicar resultados online: ${err.message}`);
    } finally {
      setPublishingOfficial(false);
    }
  };

  // Ações do Administrador
  const handleAddPlayers = (newPlayersList) => {
    setPlayers(prev => {
      // Evita duplicados com base no celular
      const filteredPrev = prev.filter(p => !newPlayersList.some(n => n.phone === p.phone));
      const updated = [...filteredPrev, ...newPlayersList];
      localStorage.setItem("bolao_players_list", JSON.stringify(updated));
      return updated;
    });
    alert(`${newPlayersList.length} palpites importados/atualizados com sucesso! 📊`);
  };

  const handleRemovePlayer = (phone) => {
    if (window.confirm("Deseja excluir este participante do bolão?")) {
      setPlayers(prev => {
        const updated = prev.filter(p => p.phone !== phone);
        localStorage.setItem("bolao_players_list", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleClearPlayers = () => {
    if (window.confirm("⚠️ ATENÇÃO: Tem certeza que deseja excluir TODOS os participantes do bolão? Isso não poderá ser desfeito.")) {
      setPlayers([]);
      localStorage.removeItem("bolao_players_list");
    }
  };

  // Monitora alterações dos resultados oficiais para salvar no LocalStorage
  const handleSetOfficialResults = (newResults) => {
    const updated = typeof newResults === "function" ? newResults(officialResults) : newResults;
    setOfficialResults(updated);
    localStorage.setItem("bolao_official_results", JSON.stringify(updated));
  };

  // Verifica se todos os 104 jogos foram preenchidos (72 de grupo + 32 de mata-mata)
  const checkIsComplete = () => {
    // 1. Verifica se os 72 jogos de grupo têm palpites
    for (let i = 1; i <= 72; i++) {
      const p = predictions[i];
      if (!p || p.score1 === "" || p.score1 === undefined || p.score2 === "" || p.score2 === undefined) {
        return false;
      }
    }
    // 2. Verifica se as chaves eliminatórias foram preenchidas (R32_1 até TP_1, FI_1)
    const knockoutKeys = [
      ...Array(16).fill(null).map((_, i) => `R32_${i+1}`),
      ...Array(8).fill(null).map((_, i) => `R16_${i+1}`),
      ...Array(4).fill(null).map((_, i) => `QF_${i+1}`),
      ...Array(2).fill(null).map((_, i) => `SF_${i+1}`),
      "TP_1", "FI_1"
    ];

    for (const key of knockoutKeys) {
      const p = predictions[key];
      if (!p || p.score1 === "" || p.score1 === undefined || p.score2 === "" || p.score2 === undefined) {
        return false;
      }
      // Se for empate, precisa de vencedor por pênaltis
      if (parseInt(p.score1, 10) === parseInt(p.score2, 10) && !p.penaltyWinner) {
        return false;
      }
    }

    return true;
  };

  // --- CÁLCULO DE CHAVES VIRTUAIS ---
  // A. Chaveamento do Participante
  const userGroupStandings = {};
  Object.keys(groups).forEach(groupName => {
    userGroupStandings[groupName] = calculateGroupStandings(groupName, groups[groupName], groupMatches, predictions);
  });
  const userBestThirds = getBestThirdPlacedTeams(groups, groupMatches, predictions);
  const userR32Matchups = getRoundOf32Matchups(userGroupStandings, userBestThirds);

  // B. Chaveamento Oficial do Administrador
  const officialGroupStandings = {};
  Object.keys(groups).forEach(groupName => {
    officialGroupStandings[groupName] = calculateGroupStandings(groupName, groups[groupName], groupMatches, officialResults);
  });
  const officialBestThirds = getBestThirdPlacedTeams(groups, groupMatches, officialResults);
  const officialR32Matchups = getRoundOf32Matchups(officialGroupStandings, officialBestThirds);

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <main className="app-content">
        {activeTab === "palpites" && (
          <>
            {/* Registro de Perfil e Ações de Exportação */}
            <UserProfile 
              profile={profile}
              setProfile={setProfile}
              onSaveLocal={handleSaveLocal}
              onExportJSON={handleExportJSON}
              onClearData={handleClearData}
              isComplete={checkIsComplete()}
              onSubmitOnline={handleSubmitOnline}
              submittingOnline={submittingOnline}
              onLoadByPhone={handleLoadPredictionsByPhone}
              players={players}
              predictions={predictions}
              setPredictions={setPredictions}
            />

            {/* Fase de Grupos */}
            <GroupStage 
              matches={groupMatches}
              predictions={predictions}
              setPredictions={setPredictions}
            />

            {/* Fase Eliminatória */}
            <KnockoutStage 
              r32Matchups={userR32Matchups}
              predictions={predictions}
              setPredictions={setPredictions}
            />
          </>
        )}

        {activeTab === "ranking" && (
          <section className="card">
            <h3 className="section-title">📊 Tabela de Classificação do Bolão</h3>
            <p className="section-description">
              Classificação geral do grupo de amigos **GruPera**. Atualizado automaticamente.
            </p>
            <LeaderboardTable 
              players={players}
              officialResults={officialResults}
              currentUserProfile={profile}
              currentUserPredictions={predictions}
            />
          </section>
        )}

        {activeTab === "admin" && (
          /* Painel do Administrador */
          <AdminDashboard 
            players={players}
            onAddPlayers={handleAddPlayers}
            onRemovePlayer={handleRemovePlayer}
            onClearPlayers={handleClearPlayers}
            officialResults={officialResults}
            setOfficialResults={handleSetOfficialResults}
            officialR32Matchups={officialR32Matchups}
            onPublishOfficialResults={handlePublishOfficialResults}
            publishingOfficial={publishingOfficial}
          />
        )}
      </main>

      {/* Regulamento */}
      <ScoreRulesModal 
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
