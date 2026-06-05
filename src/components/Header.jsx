

export default function Header({ activeTab, setActiveTab, onOpenRules }) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-section">
          <span className="copa-badge">USA · CAN · MEX</span>
          <h1 className="header-title">
            Bolão Copa 2026 <span className="grupera-logo">GruPera 🍐</span>
          </h1>
          <p className="header-subtitle">
            Plataforma Digital de Palpites de Amigos
          </p>
        </div>
        
        <nav className="header-nav">
          <button 
            className={`nav-btn ${activeTab === "palpites" ? "active" : ""}`}
            onClick={() => setActiveTab("palpites")}
          >
            ✍️ Meus Palpites
          </button>
          <button 
            className={`nav-btn ${activeTab === "ranking" ? "active" : ""}`}
            onClick={() => setActiveTab("ranking")}
          >
            📊 Classificação Geral
          </button>
          <button 
            className={`nav-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            👑 Admin
          </button>
          <button 
            className="nav-btn rules-btn"
            onClick={onOpenRules}
          >
            📜 Regulamento
          </button>
        </nav>
      </div>
    </header>
  );
}
