import { useState } from "react";
import { flags, countryCodes } from "../data/matchesData";

export default function Flag({ teamName, className = "" }) {
  const [error, setError] = useState(false);
  
  if (!teamName) return null;
  
  const code = countryCodes[teamName];
  
  // Fallback para emoji de bandeira se não houver código de país ou ocorrer erro
  if (!code || error) {
    const emoji = flags[teamName];
    if (emoji) {
      return <span className={`flag-fallback-emoji ${className}`}>{emoji}</span>;
    }
    // Para placeholders (ex: "A definir")
    return <span className={`flag-fallback-emoji placeholder-flag ${className}`}>⚽</span>;
  }
  
  return (
    <img 
      src={`https://flagcdn.com/w80/${code}.png`} 
      alt={`Bandeira de ${teamName}`}
      className={`flag-img ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
