import { useState } from "react";
import { GOOGLE_SCRIPT_URL } from "../App";

export default function UserProfile({ 
  profile, 
  setProfile, 
  onSaveLocal, 
  onExportJSON, 
  onClearData,
  isComplete,
  onSubmitOnline,
  submittingOnline,
  onLoadByPhone,
  players = [],
  predictions = {},
  setPredictions
}) {
  const [recoveryPhone, setRecoveryPhone] = useState("");

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.name && data.phone && (data.groupPredictions || data.knockoutPredictions)) {
          const importedPreds = { ...data.groupPredictions, ...data.knockoutPredictions };
          setProfile({ name: data.name, phone: data.phone });
          setPredictions(importedPreds);
          
          localStorage.setItem("bolao_user_profile", JSON.stringify({ name: data.name, phone: data.phone }));
          localStorage.setItem("bolao_user_predictions", JSON.stringify(importedPreds));
          
          alert(`Backup de ${data.name} importado e restaurado com sucesso! 💾`);
        } else {
          alert("O arquivo JSON de backup não possui uma estrutura válida de palpites.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao ler o arquivo de backup: JSON corrompido.");
      }
      e.target.value = null; // Limpa input
    };
    reader.readAsText(file);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    // Formatação (XX) XXXXX-XXXX
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setProfile(prev => ({ ...prev, phone: value }));
  };

  const handleWhatsAppShare = () => {
    if (!profile.name.trim()) {
      alert("Por favor, preencha seu nome completo antes de compartilhar!");
      return;
    }

    const text = `🍐 *Bolão GruPera Copa 2026* ⚽\n\nFala galera! Já preenchi meus palpites para a Copa do Mundo!\n👤 *Nome:* ${profile.name}\n🚀 Faça seus palpites e envie online!\n\n_Compartilhando meus palpites com o grupo!_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  // Lógica de Status de Sincronização
  const getSyncStatus = () => {
    const cleanPhone = profile.phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        status: "empty",
        text: "ℹ️ Insira nome e celular válido para liberar o envio online.",
        className: "sync-badge-info"
      };
    }

    const serverUser = players.find(p => p.phone.replace(/\D/g, "") === cleanPhone);
    if (!serverUser) {
      return {
        status: "not_sent",
        text: "🔴 Seus palpites estão salvos APENAS localmente neste navegador. Envie online para entrar no Ranking!",
        className: "sync-badge-red"
      };
    }

    // Compara os palpites locais com os do servidor
    const serverPreds = { ...serverUser.groupPredictions, ...serverUser.knockoutPredictions };
    
    // Lista de todas as chaves de jogos
    const allMatchKeys = [
      ...Array(72).fill(null).map((_, i) => String(i + 1)),
      ...Array(16).fill(null).map((_, i) => `R32_${i+1}`),
      ...Array(8).fill(null).map((_, i) => `R16_${i+1}`),
      ...Array(4).fill(null).map((_, i) => `QF_${i+1}`),
      ...Array(2).fill(null).map((_, i) => `SF_${i+1}`),
      "TP_1", "FI_1"
    ];

    let isSynced = true;
    for (const key of allMatchKeys) {
      const localMatch = predictions[key];
      const serverMatch = serverPreds[key];

      const localS1 = localMatch ? String(localMatch.score1 ?? "") : "";
      const localS2 = localMatch ? String(localMatch.score2 ?? "") : "";
      const localPW = localMatch ? (localMatch.penaltyWinner || "") : "";

      const serverS1 = serverMatch ? String(serverMatch.score1 ?? "") : "";
      const serverS2 = serverMatch ? String(serverMatch.score2 ?? "") : "";
      const serverPW = serverMatch ? (serverMatch.penaltyWinner || "") : "";

      if (localS1 !== serverS1 || localS2 !== serverS2 || localPW !== serverPW) {
        isSynced = false;
        break;
      }
    }

    if (isSynced) {
      return {
        status: "synced",
        text: `🟢 Tudo certo! Seus palpites estão 100% salvos e atualizados na nuvem como "${serverUser.name}".`,
        className: "sync-badge-green"
      };
    } else {
      return {
        status: "outdated",
        text: "🟡 Você fez alterações locais! Clique em 'Enviar Palpites Online' para atualizar seu ranking.",
        className: "sync-badge-yellow"
      };
    }
  };

  const syncStatus = getSyncStatus();

  return (
    <section className="profile-section card">
      <h3 className="section-title">👤 Meus Dados do Bolão</h3>
      <p className="section-description">
        Insira seu nome e telefone para que o administrador saiba quem é o dono dos palpites.
      </p>

      <div className="profile-inputs">
        <div className="input-group">
          <label htmlFor="user-name">Nome Completo</label>
          <input 
            type="text" 
            id="user-name"
            placeholder="Digite seu nome completo"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="input-group">
          <label htmlFor="user-phone">Celular (WhatsApp)</label>
          <input 
            type="text" 
            id="user-phone"
            placeholder="(00) 00000-0000"
            value={profile.phone}
            onChange={handlePhoneChange}
          />
        </div>
      </div>

      {GOOGLE_SCRIPT_URL && (
        <div className={`sync-status-badge ${syncStatus.className}`} style={{ marginBottom: "20px" }}>
          {syncStatus.text}
        </div>
      )}

      {/* Opção de Recuperar Palpites do Banco de Dados */}
      {GOOGLE_SCRIPT_URL && (
        <div className="recovery-section" style={{ marginTop: "15px", borderTop: "1px solid var(--border-glass)", paddingTop: "15px", marginBottom: "15px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>
            🔍 Já enviou seus palpites? Busque-os aqui pelo número:
          </label>
          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <input 
              type="text" 
              placeholder="Digite o celular para recuperar palpites..." 
              value={recoveryPhone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                if (value.length > 11) value = value.slice(0, 11);
                if (value.length > 6) {
                  value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
                } else if (value.length > 2) {
                  value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                } else if (value.length > 0) {
                  value = `(${value}`;
                }
                setRecoveryPhone(value);
              }}
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "10px 16px",
                color: "#fff",
                fontSize: "0.95rem",
                flex: "1",
                outline: "none"
              }}
            />
            <button 
              className="btn btn-secondary" 
              onClick={() => onLoadByPhone(recoveryPhone)}
              style={{ padding: "10px 20px" }}
            >
              Buscar Palpites
            </button>
          </div>
        </div>
      )}

      <div className="profile-actions">
        {GOOGLE_SCRIPT_URL && (
          <button 
            className="btn btn-primary" 
            onClick={onSubmitOnline}
            disabled={submittingOnline}
          >
            {submittingOnline ? "⏳ Enviando..." : "🚀 Enviar Palpites Online"}
          </button>
        )}
        <button className="btn btn-secondary" onClick={onSaveLocal}>
          💾 Salvar Rascunho
        </button>
        <button 
          className={`btn btn-outline ${isComplete ? "" : "btn-warning"}`} 
          onClick={onExportJSON}
        >
          📤 Baixar JSON (Backup)
        </button>
        <button 
          className="btn btn-outline" 
          onClick={() => document.getElementById("user-json-upload").click()}
        >
          📥 Importar/Restaurar JSON
        </button>
        <input 
          type="file" 
          id="user-json-upload" 
          accept=".json" 
          onChange={handleImportJSON} 
          style={{ display: "none" }} 
        />
        <button className="btn btn-whatsapp" onClick={handleWhatsAppShare}>
          💬 Avisar no WhatsApp
        </button>
        <button className="btn btn-danger btn-sm" onClick={onClearData}>
          🗑️ Limpar
        </button>
      </div>

      {!isComplete && (
        <p className="warning-text">
          ⚠️ *Nota:* Você ainda não preencheu todos os placares ou chaves de mata-mata. Você pode exportar mesmo assim, mas pontuará apenas nos jogos preenchidos.
        </p>
      )}
    </section>
  );
}
