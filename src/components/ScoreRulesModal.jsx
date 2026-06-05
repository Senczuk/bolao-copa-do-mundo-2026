

export default function ScoreRulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📜 Regulamento & Pontuação</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="rules-section">
            <h4 className="rules-subtitle">⚽ Pontuação por Placar de Partida</h4>
            <p className="rules-desc">Válido para partidas da Fase de Grupos e confrontos do Mata-Mata:</p>
            <ul className="rules-list">
              <li>
                <strong className="score-badge exact">25 Pontos</strong> 
                <strong>Acerto de Placar Exato:</strong> Você previu 2x1 e o jogo terminou 2x1.
              </li>
              <li>
                <strong className="score-badge gd">15 Pontos</strong> 
                <strong>Acerto de Vencedor + Saldo:</strong> Você previu 3x1 e o jogo terminou 2x0 (acertou o vencedor e a diferença de 2 gols).
              </li>
              <li>
                <strong className="score-badge winner">10 Pontos</strong> 
                <strong>Acerto de Vencedor:</strong> Você previu 2x1 e o jogo terminou 2x0 ou 3x0 (acertou quem ganharia, mas errou o placar e o saldo).
              </li>
              <li>
                <strong className="score-badge single">5 Pontos</strong> 
                <strong>Acerto de Gols de uma Equipe:</strong> Você previu 2x1 e o jogo terminou 2x3 (errou o vencedor, mas acertou que a primeira equipe faria exatamente 2 gols).
              </li>
            </ul>
          </div>

          <div className="rules-section">
            <h4 className="rules-subtitle">🏆 Bônus por Progressão no Mata-Mata</h4>
            <p className="rules-desc">Pontos extras por cada seleção que avançar para as fases finais:</p>
            <div className="progression-grid">
              <div className="progression-card">
                <span>16avos de Final (R32)</span>
                <strong>+5 pts</strong>
                <small>por time correto</small>
              </div>
              <div className="progression-card">
                <span>Oitavas de Final (R16)</span>
                <strong>+10 pts</strong>
                <small>por time correto</small>
              </div>
              <div className="progression-card">
                <span>Quartas de Final (QF)</span>
                <strong>+15 pts</strong>
                <small>por time correto</small>
              </div>
              <div className="progression-card">
                <span>Semifinais (SF)</span>
                <strong>+20 pts</strong>
                <small>por time correto</small>
              </div>
              <div className="progression-card font-highlight">
                <span>Finalistas (FI)</span>
                <strong>+30 pts</strong>
                <small>por time correto</small>
              </div>
              <div className="progression-card champion-card">
                <span>Campeão do Mundo 🏆</span>
                <strong>+50 pts</strong>
                <small>se acertar o campeão</small>
              </div>
              <div className="progression-card third-place-card">
                <span>Terceiro Lugar 🥉</span>
                <strong>+30 pts</strong>
                <small>se acertar a disputa</small>
              </div>
            </div>
          </div>

          <div className="rules-section" style={{ marginTop: "15px", borderTop: "1px solid var(--border-glass)", paddingTop: "15px" }}>
            <h4 className="rules-subtitle">📋 Desempate de Grupos (Simplificado)</h4>
            <p className="rules-desc" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Caso duas ou mais seleções empatem em pontos na classificação do grupo, aplicam-se em ordem:
            </p>
            <ul className="rules-list" style={{ fontSize: "0.85rem", listStyleType: "decimal", paddingLeft: "20px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>Pontos Totais:</strong> Maior soma de pontos conquistados.</li>
              <li><strong>Saldo de Gols (SG):</strong> Gols marcados menos gols sofridos.</li>
              <li><strong>Gols Pró (GP):</strong> Maior número de gols marcados.</li>
              <li><strong>Ordem Alfabética:</strong> Para evitar empates travados no layout virtual.</li>
            </ul>
          </div>

          <p className="rules-footnote">
            💡 *Exemplo de Progressão:* Se você previu que o Brasil seria campeão e ele chegar de fato na final e vencer, você ganhará 5 pts (R32) + 10 pts (R16) + 15 pts (QF) + 20 pts (SF) + 30 pts (Finalista) + 50 pts (Campeão) = 130 pontos totais acumulados apenas pela jornada da seleção!
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
