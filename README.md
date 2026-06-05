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

## 📜 Critérios de Pontuação e Desempate

### Pontuação por Jogo
*   **Placar Exato (25 pontos):** Acerto exato do resultado (ex: previu 2x1, terminou 2x1).
*   **Vencedor + Saldo (15 pontos):** Acerto de quem venceu e a diferença de gols (ex: previu 3x1, terminou 2x0).
*   **Apenas Vencedor (10 pontos):** Acerto apenas de quem ganharia/empataria o jogo (ex: previu 2x1, terminou 3x0).
*   **Gol de uma Equipe (5 pontos):** Acerto de gols marcados por apenas uma das equipes (ex: previu 2x1, terminou 2x3).

### Bônus de Classificação
Pontos acumulados conforme as seleções palpitadas avançam nas fases reais da competição:
*   **Rodada de 32:** +5 pontos por time correto.
*   **Oitavas de Final:** +10 pontos por time correto.
*   **Quartas de Final:** +15 pontos por time correto.
*   **Semifinais:** +20 pontos por time correto.
*   **Finalistas:** +30 pontos por time correto.
*   **Terceiro Lugar 🥉:** +30 pontos.
*   **Campeão do Mundo 🏆:** +50 pontos.

### Desempate nos Grupos
Caso ocorra empate na classificação virtual da fase de grupos, aplicam-se:
1. Pontos ganhos.
2. Saldo de Gols (SG).
3. Gols Pró (GP).
4. Ordem Alfabética (Critério de desempate virtual).
