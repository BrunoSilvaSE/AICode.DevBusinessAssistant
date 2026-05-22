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

## 📅 Dia 3 — Sábado 23/05 — Portfólio Público + Linha do Tempo

### O que tentei fazer
Objetivo: transformar a ferramenta em uma plataforma de portfólio público completa, com Skill Tree persistida, linha do tempo editável e repositórios em destaque.

Sequência real:
1. Criação das tabelas `posts`, `profiles` e `timeline_items` no Supabase com RLS completo.
2. Endpoint `/api/posts` (GET/POST) com validação Zod para salvar e recuperar posts por usuário.
3. Endpoint `/api/sync-profile` — chamado no login do Dashboard, sincroniza skills calculadas dos repos do GitHub para o banco, sem bloquear o fluxo do usuário.
4. Portfólio público `/u/[username]` — hero com avatar, Skill Tree, mini-timeline e posts gerados. Página de servidor pura (sem "use client"), carregamento instantâneo.
5. Timeline completa `/u/[username]/timeline` — nós verticais com ícone por tipo, cálculo de duração, cards coloridos e links clicáveis para repositórios vinculados.
6. Editor `/timeline` — formulário para adicionar itens (work, education, bootcamp, certification, project) com dropdown de repos do GitHub para vincular ao item.
7. Seleção de repos em destaque `/repos-destaque` — checkboxes com máximo 3, salvos em `profiles.featured_repos` (JSONB). Aparecem no portfólio como cards clicáveis.
8. Auto-README: botão na página de repositório que chama `/api/generate-readme` — IA gera README.md completo em markdown usando contexto do repo.
9. Dark mode toggle adicionado ao dashboard.
10. Validação Zod em todos os endpoints de API.

**Commits do dia:** ~12 commits seguindo Red → Green → Refactor

### Prompts que funcionaram bem
- *"Quero um portfólio público para cada usuário. A abordagem mais robusta seria salvar as skills no banco no login e servir de lá"* — a IA propôs a arquitetura correta: sync-profile no dashboard + SELECT público no Supabase.
- *"A timeline deve ter uma versão resumida no portfólio com link para a completa"* — gerou os dois componentes de uma vez com design consistente.
- *"Vincular um repositório do GitHub ao item da timeline"* — a IA adicionou o dropdown de seleção no formulário e o link `<ExternalLink>` nos nós, tudo coerente.

### Prompts que precisaram ser refeitos
- Primeira versão de `/u/[username]/page.tsx` fazia um `fetch` interno para `http://localhost:3000/api/u/[username]` — quebra em produção (a URL é do servidor local). Corrigido chamando o Supabase diretamente no server component, sem round-trip HTTP.
- Zod v4 usa `parsed.error.issues` (não `.errors`). A IA gerou o código v3-style. Corrigido em todos os endpoints após o primeiro erro de teste.
- Input `type="month"` espera `yyyy-MM` mas o state armazenava `yyyy-MM-dd` — o `value` do input explotou. Corrigido com `.slice(0, 7)`.

### Momento UAU
O portfólio público ficou bonito e utilizável com menos de 200 linhas de componente React. O server component carrega tudo sem loading spinner — dados chegam prontos. Ver meu próprio portfólio em `/u/BrunoSilvaSE` com skills reais do GitHub, posts gerados pela IA e uma linha do tempo foi o momento mais satisfatório do projeto inteiro.

### Momento frustrante
As migrações SQL no Supabase precisaram ser rodadas manualmente. A tentativa de usar a service role key via REST API falhou — ela não tem acesso à Management API (que exige um Personal Access Token separado). A CLI do Supabase também não estava instalada. Três tentativas de rodar o mesmo SQL com erros diferentes antes de chegar no script correto (posts não existia ainda quando o profiles tentou criar a policy).

### O que aprendi hoje
- **Server components no Next.js 16**: não usar `fetch` para si mesmo em produção. Chamar o banco diretamente é mais eficiente e não depende de URL de ambiente.
- **Zod v4 quebrou a API de erro**: `.errors` virou `.issues`. Bibliotecas que atualizam versão major mudam APIs — sempre verificar o CHANGELOG quando a IA gera código v3-style numa v4.
- **JSONB no Postgres é poderoso**: armazenar `featured_repos` e `skills` como JSONB evitou precisar de tabelas de relacionamento. Para listas pequenas e estáticas por usuário, é a escolha certa.
- **Streaming em duas rotas paralelas**: usar dois `useCompletion` distintos na mesma página (um pra post, outro pro README) funciona perfeitamente — cada um tem seu estado isolado.

**Marco do dia atingido:** portfólio público completo, linha do tempo editável, repos em destaque e Auto-README funcionando em produção.

---

## 📅 Dia 4 — Domingo 24/05 — Polimento + Entrega

### O que tentei fazer
Objetivo: garantir que o produto esteja polido, sem bugs e com uma documentação de qualidade para a entrega final.

Sequência real:
1. Revisão de todos os fluxos de navegação.
2. Refinamento visual da Skill Tree com barras de progresso proporcionais.
3. Atualização do README.md com uma visão clara do produto e instruções de uso.
4. Limpeza de código e correção de pequenos bugs (como o import faltante no Dashboard detectado pelos testes).
5. Consolidação final da jornada de desenvolvimento.

**Commits do dia:** ~4 commits (finalizando com a casa arrumada)

### Prompts que funcionaram bem
- *"Melhore o visual dos cards de skill, adicione uma barra de progresso baseada no peso de cada linguagem"* — a IA sugeriu um design limpo usando apenas Tailwind.

### Prompts que precisaram ser refeitos
- Nenhum relevante hoje. O processo já estava bem azeitado.

### Momento UAU
Perceber que terminamos o escopo de 4 dias em praticamente 2 dias de trabalho intenso com a IA. O ganho de produtividade foi imenso, especialmente na parte de boilerplate e integração de APIs.

### Momento frustrante
O teste do Dashboard falhando no último minuto por causa de um import esquecido. Serve de lembrete que TDD e testes automatizados são essenciais mesmo quando tudo parece estar funcionando no navegador.

### O que aprendi hoje
- **A importância do README**: um projeto bom precisa parecer bom logo de cara.
- **Feedback visual**: pequenos detalhes como barras de progresso transformam uma lista de dados em uma interface rica.
- **Ciclo completo**: o trabalho não acaba quando a feature está pronta, mas sim quando ela está testada, documentada e polida.

**Marco do dia atingido:** entrega finalizada com 100% dos requisitos do Núcleo Apresentável.

---

## 🔍 Padrões que Descobri ao Longo dos 4 Dias

### Coisas que IA faz muito bem
- Escrever boilerplate (Next.js routes, basic components).
- Sugerir implementações iniciais para algoritmos simples (agregação de dados).
- Explicar erros de terminal e sugerir correções rápidas.
- Gerar testes automatizados coerentes com o código.

### Coisas que IA falha repetidamente
- Manter o controle de versões de bibliotecas muito recentes (como Vercel AI SDK v6).
- Entender contextos complexos de autenticação (PKCE client vs server) sem muita explicação.
- Lidar com caminhos de sistema complexos (WSL vs Windows).

### Quando confiar na IA cegamente
- Para estilização básica com Tailwind.
- Para gerar mocks de dados e fixtures de teste.
- Para funções puras e utilitários de transformação de dados.

### Quando duvidar / verificar
- Em fluxos de autenticação e segurança.
- Em configurações de infraestrutura (Supabase, Vercel).
- Em nomes de pacotes npm sugeridos.

### Como detectar "alucinação" (IA inventando coisas)
- Quando o TypeScript começa a reclamar de propriedades que "não existem".
- Quando o `npm install` falha por pacote inexistente.
- Quando a solução proposta parece mágica demais (ex: um import que resolveria tudo sozinho).

---

## 🧠 Reflexão Final

### Eu conseguiria ter feito esse projeto sem IA?
Provavelmente sim, mas levaria semanas em vez de dias. A curva de aprendizado para integrar Groq, Supabase Auth e GitHub API simultaneamente seria muito mais dolorosa.

### Em quanto tempo eu faria sem IA?
Estimativa de 15 a 20 dias para chegar no mesmo nível de polimento e cobertura de testes.

### O que mudou na minha percepção sobre IA programadora?
Ela não substitui o programador, mas atua como um acelerador de partículas. O humano precisa continuar sendo o arquiteto e o validador. O "vibe-coding" é real, mas exige disciplina (como o TDD que usamos aqui).

### Quando eu recomendaria vibe-coding?
Para prototipagem rápida, projetos acadêmicos, MVPs e features bem isoladas em sistemas grandes.

### Quando eu **não** recomendaria?
Sistemas críticos de saúde, finanças ou segurança onde cada linha de código precisa de uma auditoria humana exaustiva e onde a IA pode introduzir vulnerabilidades sutis.

### O que eu faria diferente numa próxima vez?
Teria configurado o ambiente WSL de forma mais isolada desde o início para evitar conflitos de PATH que me tomaram tempo no Dia 1.

### Sobre o papel do "não programador" com IA
A IA democratiza a criação. O "não programador" que entende de produto e de lógica básica agora tem o poder de materializar ideias. O limite não é mais a sintaxe, mas sim a capacidade de formular o problema correto.

---

## 📎 Anexos (opcional)

- Repo oficial do projeto.
- Deploy rodando no Vercel.
- Histórico de commits (XP Style).
