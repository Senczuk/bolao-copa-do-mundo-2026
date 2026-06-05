export const groups = {
  "Grupo A": ["México", "África do Sul", "Coreia do Sul", "República Tcheca"],
  "Grupo B": ["Canadá", "Bósnia & Herzegovina", "Catar", "Suíça"],
  "Grupo C": ["Brasil", "Marrocos", "Haiti", "Escócia"],
  "Grupo D": ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  "Grupo E": ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
  "Grupo F": ["Holanda", "Japão", "Suécia", "Tunísia"],
  "Grupo G": ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  "Grupo H": ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  "Grupo I": ["França", "Senegal", "Iraque", "Noruega"],
  "Grupo J": ["Argentina", "Argélia", "Áustria", "Jordânia"],
  "Grupo K": ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
  "Grupo L": ["Inglaterra", "Croácia", "Gana", "Panamá"]
};

// Bandeiras das seleções (Emojis ou URLs se tivéssemos, mas emojis de bandeiras são excelentes, portáveis e super modernos)
export const flags = {
  "México": "🇲🇽", "África do Sul": "🇿🇦", "Coreia do Sul": "🇰🇷", "República Tcheca": "🇨🇿",
  "Canadá": "🇨🇦", "Bósnia & Herzegovina": "🇧🇦", "Catar": "🇶🇦", "Suíça": "🇨🇭",
  "Brasil": "🇧🇷", "Marrocos": "🇲🇦", "Haiti": "🇭🇹", "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Estados Unidos": "🇺🇸", "Paraguai": "🇵🇾", "Austrália": "🇦🇺", "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪", "Curaçao": "🇨🇼", "Costa do Marfim": "🇨🇮", "Equador": "🇪🇨",
  "Holanda": "🇳🇱", "Japão": "🇯🇵", "Suécia": "🇸🇪", "Tunísia": "🇹🇳",
  "Bélgica": "🇧🇪", "Egito": "🇪🇬", "Irã": "🇮🇷", "Nova Zelândia": "🇳🇿",
  "Espanha": "🇪🇸", "Cabo Verde": "🇨🇻", "Arábia Saudita": "🇸🇦", "Uruguai": "🇺🇾",
  "França": "🇫🇷", "Senegal": "🇸🇳", "Iraque": "🇮🇶", "Noruega": "🇳🇴",
  "Argentina": "🇦🇷", "Argélia": "🇩🇿", "Áustria": "🇦🇹", "Jordânia": "🇯🇴",
  "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Uzbequistão": "🇺🇿", "Colômbia": "🇨🇴",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croácia": "🇭🇷", "Gana": "🇬🇭", "Panamá": "🇵🇦"
};

const stadiums = [
  "Estádio Azteca (Cidade do México)", "Estádio BC Place (Vancouver)", "Estádio BMO Field (Toronto)",
  "MetLife Stadium (Nova York)", "SoFi Stadium (Los Angeles)", "Hard Rock Stadium (Miami)",
  "AT&T Stadium (Dallas)", "Mercedes-Benz Stadium (Atlanta)", "NRG Stadium (Houston)",
  "Levi's Stadium (San Francisco)", "Lumen Field (Seattle)", "Arrowhead Stadium (Kansas City)",
  "Gillette Stadium (Boston)", "Lincoln Financial Field (Filadélfia)", "Estádio BBVA (Monterrey)",
  "Estádio Akron (Guadalajara)"
];

// Geração dos 72 jogos da fase de grupos (6 jogos por grupo)
const generateGroupMatches = () => {
  const matches = [];
  let matchId = 1;
  const groupKeys = Object.keys(groups);

  groupKeys.forEach((groupName, groupIdx) => {
    const teams = groups[groupName];
    // Dia inicial base da Copa (11 de junho)
    // Distribuímos as rodadas de forma realista
    const baseDate = 11 + Math.floor(groupIdx / 3) * 2; // de 11 a 19 de junho
    
    const rounds = [
      { r: "Rodada 1", t1: teams[0], t2: teams[1], dateOffset: 0, time: "14:00" },
      { r: "Rodada 1", t1: teams[2], t2: teams[3], dateOffset: 0, time: "18:00" },
      { r: "Rodada 2", t1: teams[0], t2: teams[2], dateOffset: 4, time: "15:00" },
      { r: "Rodada 2", t1: teams[3], t2: teams[1], dateOffset: 4, time: "20:00" },
      { r: "Rodada 3", t1: teams[3], t2: teams[0], dateOffset: 8, time: "16:00" },
      { r: "Rodada 3", t1: teams[1], t2: teams[2], dateOffset: 8, time: "16:00" }
    ];

    rounds.forEach((rd) => {
      const matchDate = new Date(2026, 5, baseDate + rd.dateOffset); // 5 é junho em JS
      const formattedDate = matchDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });

      // Seleção cíclica do estádio para parecer bem distribuído
      const stadium = stadiums[(matchId - 1) % stadiums.length];

      matches.push({
        id: matchId++,
        round: rd.r,
        group: groupName,
        team1: rd.t1,
        team2: rd.t2,
        date: formattedDate,
        time: rd.time,
        stadium: stadium
      });
    });
  });

  return matches;
};

export const groupMatches = generateGroupMatches();

export const countryCodes = {
  "México": "mx", "África do Sul": "za", "Coreia do Sul": "kr", "República Tcheca": "cz",
  "Canadá": "ca", "Bósnia & Herzegovina": "ba", "Catar": "qa", "Suíça": "ch",
  "Brasil": "br", "Marrocos": "ma", "Haiti": "ht", "Escócia": "gb-sct",
  "Estados Unidos": "us", "Paraguai": "py", "Austrália": "au", "Turquia": "tr",
  "Alemanha": "de", "Curaçao": "cw", "Costa do Marfim": "ci", "Equador": "ec",
  "Holanda": "nl", "Japão": "jp", "Suécia": "se", "Tunísia": "tn",
  "Bélgica": "be", "Egito": "eg", "Irã": "ir", "Nova Zelândia": "nz",
  "Espanha": "es", "Cabo Verde": "cv", "Arábia Saudita": "sa", "Uruguai": "uy",
  "França": "fr", "Senegal": "sn", "Iraque": "iq", "Noruega": "no",
  "Argentina": "ar", "Argélia": "dz", "Áustria": "at", "Jordânia": "jo",
  "Portugal": "pt", "RD Congo": "cd", "Uzbequistão": "uz", "Colômbia": "co",
  "Inglaterra": "gb-eng", "Croácia": "hr", "Gana": "gh", "Panamá": "pa"
};

