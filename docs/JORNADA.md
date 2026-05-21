# Jornada de Desenvolvimento com IA

> Relato pessoal do processo de construir esse projeto usando IA como par de programação principal. Documento entregável da disciplina **IA para não programadores**.

---

## 🎯 Contexto

- **Quem sou:** [preencher: papel, faculdade, semestre, experiência prévia com programação]
- **O que quis construir:** plataforma onde dev pode logar com GitHub e gerar posts de LinkedIn a partir dos seus repositórios — usando IA para traduzir linguagem técnica em linguagem de negócio.
- **Por que escolhi vibe-coding:** [preencher: motivação pessoal, curiosidade, desafio do trabalho]
- **Ferramentas usadas:**
  - [ ] Claude Code (CLI)
  - [ ] Cursor
  - [ ] GitHub Copilot
  - [ ] ChatGPT
  - [ ] Outros: __________

---

## 📅 Dia 1 — Quinta 21/05 — Fundação

### O que tentei fazer
Objetivo: configurar o ambiente completo e conseguir logar com GitHub no app deployado. 

Sequência real do dia:
1. Projeto Next.js 16 criado com TypeScript, App Router e Tailwind 4
2. Vitest configurado com `@testing-library/react`, `happy-dom` e `msw`
3. shadcn/ui configurado (tema slate, CSS variables)
4. Contas criadas: Supabase (banco + auth), Vercel (deploy), GitHub OAuth App
5. Landing page com hero e CTA "Entrar com GitHub" construída via TDD
6. Tela de login com botão GitHub OAuth (Supabase `signInWithOAuth`)
7. Dashboard com "Olá, [nome]" que lê a sessão do Supabase
8. Auth callback como Client Component (troca PKCE code por sessão no browser)

**Commits do dia:** ~8 commits seguindo Red → Green → Refactor

### Prompts que funcionaram bem
- *"Seguindo TDD: escrevo os testes primeiro (Red), depois implemento"* — dar esse contexto explícito fez a IA propor componentes testáveis desde o início, evitando Deus-componentes
- Colar o erro completo do terminal + nome do arquivo + linha fez a IA corrigir na primeira tentativa
- Pedir um componente por vez (primeiro GitHubLoginButton, depois DashboardPage) foi mais eficiente que pedir tudo de uma vez

### Prompts que precisaram ser refeitos
- Primeiro prompt de auth tentou usar um `route.ts` server-side para trocar o PKCE code — mas o code verifier fica no localStorage do browser, então a troca precisa ser client-side. A IA tentou `createBrowserClient()` num contexto server, o que nunca funcionaria. Corrigido convertendo o callback para um `page.tsx` Client Component.
- `Github` foi importado do `lucide-react` — mas na versão 1.x instalada, o ícone foi removido. A IA não sabia disso (dado de treinamento defasado). Solução: SVG inline criado manualmente.

### Momento UAU
A IA detectou sozinha que `useSearchParams()` no Next.js 16 exige `<Suspense>` e já envolveu o componente corretamente sem precisar ser pedido. Evitou um bug sutil de runtime que só apareceria no deploy.

### Momento frustrante
O `npx shadcn@latest add button` falhava com `EPERM: operation not permitted, scandir 'C:\Windows\CSC'` — o WSL estava chamando o `npx` do Windows em vez do Linux. Corrigir exigiu descobrir e setar o PATH correto (`/home/bruno/.nvm/versions/node/v22.22.3/bin`) antes de cada comando.

### O que aprendi hoje
- **IA erra com versões**: `lucide-react@1.x` removeu o ícone `Github`. A IA não sabe — ela conhece o pacote na versão do seu treinamento. Sempre verificar `node_modules` quando uma import falha.
- **WSL tem dois mundos de PATH**: o que funciona no terminal interativo pode não funcionar nos comandos da IA. Solução: exportar PATH explicitamente antes de cada `npm`/`npx`.
- **TDD força modularidade**: o teste de `DashboardPage` exigiu que `createBrowserClient` fosse injetável (mockável). Isso me impediu de hardcodar a chamada dentro do componente — o código ficou automaticamente mais limpo.
- **Contexto de execução importa no Supabase Auth**: client-side session ≠ server-side session. O PKCE code verifier só existe no browser. Isso é um dos pontos onde "parece certo mas não funciona" — precisa entender o fluxo, não só copiar código.

**Marco do dia atingido:** login funcionando end-to-end em produção (Vercel + Supabase + GitHub OAuth).

---

## 📅 Dia 2 — Sexta 22/05 — Tradutor de Contexto

### O que tentei fazer
Objetivo: implementar o núcleo de geração de posts usando IA (Groq/Llama 3) e integração com a API do GitHub.

Sequência real:
1. Configuração do Groq e Vercel AI SDK.
2. Endpoint `/api/generate-post` com suporte a streaming e dois tons: Negócio (Business) e Técnico (Technical).
3. Página `/gerador` para geração de posts a partir de texto livre.
4. Endpoint `/api/repos` para listar repositórios públicos do usuário via token do GitHub.
5. Endpoint `/api/repo-detail` para extrair metadados, README e linguagens de um repositório específico.
6. Página de detalhes do repositório com botão para gerar posts contextualizados.

**Commits do dia:** ~6 commits (fomos rápidos e matamos o escopo de amanhã hoje!)

### Prompts que funcionaram bem
- *"Ajuste o prompt do sistema para que o tom 'business' foque em métricas e o 'technical' em arquitetura"* — a IA refinou os prompts de sistema que resultaram em posts bem distintos e úteis.
- *"Como extrair o provider_token da sessão do Supabase?"* — a resposta foi direta e permitiu autenticar na API do GitHub sem precisar de um banco de dados intermediário para tokens.

### Prompts que precisaram ser refeitos
- Tentei usar `openai` provider com a Groq key — erro óbvio. Precisei trocar para `@ai-sdk/groq` especificamente.
- A IA sugeriu `max_tokens` mas na versão v6 do AI SDK é `maxOutputTokens`. Precisei corrigir manualmente após o erro de tipagem.

### Momento UAU
A velocidade do Groq (Llama 3.3 70B) é absurda. O post começa a aparecer quase instantaneamente após o clique. A experiência de "vibe coding" flui muito melhor quando o feedback da IA é rápido assim.

### Momento frustrante
Lidar com o README em base64 vindo da API do GitHub. Esqueci que vinha encodado e a IA inicialmente tentou ler como string direta, resultando em caracteres ilegíveis. Corrigido com `Buffer.from(data.content, 'base64').toString('utf-8')`.

### O que aprendi hoje
- **Streaming de texto** no Next.js 16 com AI SDK é extremamente simples se você seguir o padrão de Route Handlers.
- **GitHub API** exige o header `Accept: application/vnd.github+json` para algumas rotas de metadados, senão o retorno é inconsistente.
- **Contexto é tudo**: passar o README (mesmo que um trecho) para a LLM faz o post gerado ser infinitamente mais rico do que apenas usar o nome e descrição do repositório.

**Marco do dia atingido:** o núcleo de valor do produto (geração de posts a partir do código real) está pronto.

---

## 📅 Dia 3 — Sábado 23/05 — Portfólio + Skill Tree

### O que tentei fazer

### Prompts que funcionaram bem

### Prompts que precisaram ser refeitos

### Momento UAU

### Momento frustrante

### O que aprendi hoje

---

## 📅 Dia 4 — Domingo 24/05 — Polimento + Entrega

### O que tentei fazer

### Prompts que funcionaram bem

### Prompts que precisaram ser refeitos

### Momento UAU

### Momento frustrante

### O que aprendi hoje

---

## 🔍 Padrões que Descobri ao Longo dos 4 Dias

### Coisas que IA faz muito bem
- [preencher]

### Coisas que IA falha repetidamente
- [preencher]

### Quando confiar na IA cegamente
- [preencher]

### Quando duvidar / verificar
- [preencher]

### Como detectar "alucinação" (IA inventando coisas)
- [preencher: pacotes que não existem, APIs que não existem, sintaxe inventada, etc.]

---

## 🧠 Reflexão Final

### Eu conseguiria ter feito esse projeto sem IA?
[preencher]

### Em quanto tempo eu faria sem IA?
[preencher: estimativa em horas/dias/semanas]

### O que mudou na minha percepção sobre IA programadora?
[preencher: antes/depois]

### Quando eu recomendaria vibe-coding?
[preencher: para que tipo de tarefa, perfil, contexto]

### Quando eu **não** recomendaria?
[preencher: situações de risco, complexidade, criticidade]

### O que eu faria diferente numa próxima vez?
[preencher: workflow, ferramentas, ordem de tarefas]

### Sobre o papel do "não programador" com IA
[reflexão pessoal — você não é programador formal e fez isso. O que isso significa para sua área? Para o futuro do desenvolvimento? Para outras pessoas como você?]

---

## 📎 Anexos (opcional)

- Prints de conversas mais marcantes
- Trechos de código que a IA gerou "do nada" e funcionaram
- Erros engraçados ou absurdos
- Antes/depois de um prompt mal formulado vs bem formulado
