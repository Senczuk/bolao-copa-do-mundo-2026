

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
            <p className="rules-desc">
              Válido para partidas da Fase de Grupos e do Mata-Mata. A pontuação por partida não é cumulativa:
              será considerada apenas a maior pontuação obtida em cada jogo.
            </p>
            <ul className="rules-list">
              <li>
                <strong className="score-badge exact">25 pontos</strong>
                <strong>Acerto de Placar Exato:</strong> você previu 2x1 e o jogo terminou 2x1.
              </li>
              <li>
                <strong className="score-badge gd">15 pontos</strong>
                <strong>Acerto de Resultado + Saldo de Gols:</strong> você acertou o vencedor ou o empate e também acertou a diferença de gols. Ex.: previu 3x1 e terminou 2x0; ou previu 1x1 e terminou 2x2.
              </li>
              <li>
                <strong className="score-badge winner">10 pontos</strong>
                <strong>Acerto de Resultado:</strong> você acertou o vencedor ou o empate, mas errou o placar exato e o saldo de gols. Ex.: previu 2x1 e terminou 3x0.
              </li>
              <li>
                <strong className="score-badge single">5 pontos</strong>
                <strong>Acerto de Gols de uma Equipe:</strong> você errou o resultado, mas acertou exatamente a quantidade de gols feita por uma das equipes. Ex.: previu 2x1 e terminou 2x3. Limite: máximo de 5 pontos por partida neste critério.
              </li>
            </ul>
            <p className="rules-desc rules-note">
              No Mata-Mata, o placar considerado é o resultado até o fim da prorrogação, sem contar a disputa de pênaltis.
              A classificação por pênaltis conta apenas para os bônus de progressão.
            </p>
          </div>

          <div className="rules-section">
            <h4 className="rules-subtitle">🏆 Bônus por Progressão no Mata-Mata</h4>
            <p className="rules-desc">Pontos extras por cada seleção prevista corretamente em cada fase:</p>
            <div className="progression-grid">
              <div className="progression-card">
                <span>16avos de Final — R32</span>
                <strong>+5 pts</strong>
                <small>por seleção correta</small>
              </div>
              <div className="progression-card">
                <span>Oitavas de Final — R16</span>
                <strong>+10 pts</strong>
                <small>por seleção correta</small>
              </div>
              <div className="progression-card">
                <span>Quartas de Final — QF</span>
                <strong>+15 pts</strong>
                <small>por seleção correta</small>
              </div>
              <div className="progression-card">
                <span>Semifinais — SF</span>
                <strong>+20 pts</strong>
                <small>por seleção correta</small>
              </div>
              <div className="progression-card font-highlight">
                <span>Finalistas — FI</span>
                <strong>+30 pts</strong>
                <small>por seleção correta</small>
              </div>
              <div className="progression-card champion-card">
                <span>Campeão do Mundo 🏆</span>
                <strong>+50 pts</strong>
                <small>se acertar o campeão</small>
              </div>
              <div className="progression-card third-place-card">
                <span>Terceiro Lugar 🥉</span>
                <strong>+30 pts</strong>
                <small>se acertar a seleção em 3º lugar</small>
              </div>
            </div>
          </div>

          <div className="rules-section" style={{ marginTop: "15px", borderTop: "1px solid var(--border-glass)", paddingTop: "15px" }}>
            <h4 className="rules-subtitle">📋 Desempate de Grupos no Bolão</h4>
            <p className="rules-desc" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Caso duas ou mais seleções empatem em pontos na classificação de um grupo dentro do sistema do bolão,
              aplicam-se os critérios abaixo, nesta ordem:
            </p>
            <ul className="rules-list" style={{ fontSize: "0.85rem", listStyleType: "decimal", paddingLeft: "20px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>Pontos totais no grupo</strong></li>
              <li><strong>Saldo de gols</strong></li>
              <li><strong>Gols pró</strong></li>
              <li><strong>Ordem alfabética:</strong> apenas para evitar empate travado no sistema virtual.</li>
            </ul>
          </div>

          <p className="rules-footnote">
            💡 Exemplo de Progressão: se você previu que o Brasil seria campeão e ele realmente vencer a Copa,
            você ganhará +5 (R32) +10 (R16) +15 (QF) +20 (SF) +30 (finalista) +50 (campeão),
            totalizando 130 pontos acumulados pela campanha do Brasil.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
