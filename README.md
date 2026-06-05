# 🍐 Bolão Copa 2026 GruPera ⚽

Plataforma digital e interativa para palpites de amigos da Copa do Mundo FIFA 2026 (USA, Canada & Mexico). O sistema é 100% frontend estático, rápido e seguro, persistindo os dados localmente no navegador e integrando-se opcionalmente a uma planilha do Google Sheets como banco de dados online via Google Apps Script API.

---

## 🚀 Funcionalidades

### Para os Participantes
*   **👤 Perfil Customizado:** Cadastro rápido com nome completo e telefone de contato.
*   **📅 Fase de Grupos:** Inserção de placares das 72 partidas da fase de grupos com cálculo e renderização em tempo real das tabelas de classificação virtual dos 12 grupos.
*   **🏆 Chaveamento Automático do Mata-Mata:** Progressão automática das seleções classificadas (os 2 melhores de cada grupo + os 8 melhores terceiros colocados gerais) para a Rodada de 32, Oitavas, Quartas, Semis e Finais.
*   **⚽ Desempate nos Pênaltis:** Seleção intuitiva de vencedores nos pênaltis em caso de empates na fase eliminatória.
*   **💾 Persistência Local e Backup:** Salvamento automático de rascunhos no `localStorage` do navegador e exportação/restauração completa de palpites via arquivos de backup `.json`.
*   **💬 Compartilhamento:** Botão dedicado para avisar os amigos no WhatsApp que os palpites foram salvos.

### Para o Administrador (Aba Restrita)
*   **📊 Classificação Geral:** Tabela de classificação com a pontuação consolidada de todos os participantes baseando-se nos resultados oficiais inseridos.
*   **🔄 Sincronização Online:** Integração nativa para puxar os palpites enviados pelos amigos direto de um formulário online e atualizar o ranking.
*   **📁 Importador em Massa:** Upload de múltiplos arquivos de backup JSON enviados pelos participantes para consolidação rápida offline.
*   **📝 Gerenciador de Resultados:** Interface amigável para preencher os placares reais da Copa do Mundo (com suporte a carregamento automático de placares reais via Web).

---

## 🛠️ Tecnologias Utilizadas

*   **Core:** [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (Build super rápida em ES Modules).
*   **Estilização:** CSS Vanilla com variáveis customizadas, suporte a modo escuro nativo e design premium responsivo.
*   **Deploy:** Otimizado para publicação estática (GitHub Pages, Vercel ou Netlify).
*   **Banco de Dados:** Google Sheets + Google Apps Script (Serverless e gratuito).

---

## 💻 Instalação e Execução Local

Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado na sua máquina.

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
   Abra o endereço informado (normalmente `http://localhost:5173`) no navegador.

3. Para gerar a build de produção:
   ```bash
   npm run build
   ```

---

## 🌐 Configuração do Banco de Dados (Google Sheets)

Para habilitar o salvamento e o ranking online:

1. Crie uma Planilha do Google com colunas para `timestamp`, `name`, `phone`, `groupPredictions` e `knockoutPredictions`.
2. Escreva uma macro do Google Apps Script com funções `doGet` e `doPost` para ler e salvar os dados como JSON.
3. Publique a macro como **Aplicativo da Web** acessível para "Qualquer pessoa" (mesmo anônima).
4. Abra o arquivo `src/App.jsx` e configure a constante `GOOGLE_SCRIPT_URL` com a URL fornecida pelo Google:
   ```javascript
   export const GOOGLE_SCRIPT_URL = "SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI";
   ```

---

## 📜 Regulamento & Pontuação

### Pontuação por Placar de Partida
Válido para partidas da Fase de Grupos e do Mata-Mata.

A pontuação por partida não é cumulativa. Será considerada apenas a maior pontuação obtida em cada jogo.

*   **25 pontos — Acerto de Placar Exato:** você previu 2x1 e o jogo terminou 2x1.
*   **15 pontos — Acerto de Resultado + Saldo de Gols:** você acertou o vencedor ou o empate e também acertou a diferença de gols. Ex.: previu 3x1 e terminou 2x0; ou previu 1x1 e terminou 2x2.
*   **10 pontos — Acerto de Resultado:** você acertou o vencedor ou o empate, mas errou o placar exato e o saldo de gols. Ex.: previu 2x1 e terminou 3x0.
*   **5 pontos — Acerto de Gols de uma Equipe:** você errou o resultado da partida, mas acertou exatamente a quantidade de gols feita por uma das equipes. Ex.: previu 2x1 e terminou 2x3. Limite: máximo de 5 pontos por partida neste critério.

Observação para o Mata-Mata: o placar considerado será o resultado da partida até o fim da prorrogação, sem contar a disputa de pênaltis. A classificação por pênaltis conta apenas para os bônus de progressão.

### Bônus por Progressão no Mata-Mata
Pontos extras por cada seleção prevista corretamente em cada fase:

*   **16avos de Final — R32:** +5 pontos por seleção correta.
*   **Oitavas de Final — R16:** +10 pontos por seleção correta.
*   **Quartas de Final — QF:** +15 pontos por seleção correta.
*   **Semifinais — SF:** +20 pontos por seleção correta.
*   **Finalistas — FI:** +30 pontos por seleção correta.
*   **Campeão do Mundo:** +50 pontos se acertar o campeão.
*   **Terceiro Lugar:** +30 pontos se acertar a seleção que terminar em 3º lugar.

Exemplo de Progressão: se você previu que o Brasil seria campeão e ele realmente vencer a Copa, você ganhará +5 por chegar ao R32, +10 por chegar às oitavas, +15 por chegar às quartas, +20 por chegar às semifinais, +30 por ser finalista e +50 por ser campeão. Total: 130 pontos acumulados pela campanha do Brasil.

### Desempate de Grupos no Bolão
Caso duas ou mais seleções empatem em pontos na classificação de um grupo dentro do sistema do bolão, aplicam-se os critérios abaixo, nesta ordem:

1. Pontos totais no grupo
2. Saldo de gols
3. Gols pró
4. Ordem alfabética, apenas para evitar empate travado no sistema virtual
