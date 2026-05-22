# AGENTS.md — Guia para Agentes de IA neste Projeto

> Leia este documento **antes** de qualquer ação de código. Atualize-o quando aprender algo que outro agente futuro precisaria saber.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 16) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 🎯 Contexto Crítico (memorizar)

- **Natureza:** trabalho acadêmico individual da disciplina "IA para não programadores".
- **Objetivo do trabalho:** demonstrar a **experiência de desenvolver software com IA**, não construir um produto comercial. O produto é o veículo; a jornada é o entregável.
- **Janela útil:** 4 dias (21–24 maio 2026). Apresentação em 25 maio.
- **Orçamento:** R$ 0,00 — tudo em free tier, sem domínio.
- **Stack:** Next.js 16 + React 19 + TypeScript 5 + Tailwind 4 + Supabase Free + Groq (Llama 3.3 70B) via Vercel AI SDK + shadcn/ui.
- **Documentos vivos:**
  - `docs/Ideia.md` — visão de longo prazo (referência, **não** escopo do MVP).
  - `docs/ENTREGA.md` — plano operacional dos 4 dias (**é o escopo real**).
  - `docs/JORNADA.md` — relato pessoal (entregável da apresentação — preencher diariamente).
  - `AGENTS.md` — este arquivo (evoluir conforme aprende).

---

## 🧭 Metodologia: XP + IA (inspirada em *Akita Chronicles*)

Filosofia central: a IA é **par de programação (navigator)**, o humano é o **driver**. Não é "spec → entrega completa"; é **iteração rápida com validação imediata**.

### Princípios não-negociáveis

1. **Pair programming.** Nenhuma feature entra sem humano dirigir e validar.
2. **Iteração curta > prompt monolítico.** Pequenos pedaços, validados imediatamente, somam mais que um prompt gigante esperando milagre.
3. **Commits pequenos e frequentes.** Cada feature funcionando = checkpoint. Meta informal: 10–30 commits/dia.
4. **Refactoring contínuo.** Não acumular dívida. Ver "espiral de complexidade" → refatorar **agora**, não depois.
5. **Documentação viva.** `docs/JORNADA.md` é atualizado **no mesmo dia** do trabalho, não no fim. `AGENTS.md` evolui com aprendizados.
6. **Deploy frequente.** Quebrar localmente é normal; quebrar em produção também — mas merecemos saber rápido.
7. **Iteração é normal.** Não existe "primeiro draft perfeito". 26% dos commits do Akita foram correção/refactor — isso é a regra, não exceção.

### Test-Driven Development (TDD) — obrigatório em todas as etapas

**Princípio central do projeto.** Não existe código de feature sem teste antes. Aplica-se a lógica de negócio, componentes de UI, rotas de API, utilitários — tudo.

#### Ciclo Red → Green → Refactor

1. **Red** — escrever um teste que descreve o comportamento desejado. **Ele deve falhar** quando rodado (porque o código ainda não existe ou está incompleto).
2. **Green** — implementar **o mínimo necessário** para o teste passar. Sem features extras, sem polimento prematuro.
3. **Refactor** — com o teste passando, melhorar o código (extrair função, renomear, simplificar). Rodar testes a cada mudança.

Cada ciclo termina em pelo menos 1 commit (frequentemente 3: um por etapa).

#### Tipos de teste por camada

| Camada | Ferramenta | Exemplo |
|---|---|---|
| Funções puras (utils, parsers) | **Vitest** | `extractLanguages(repo).should.equal([...])` |
| Componentes React | **Vitest + @testing-library/react** | Renderiza `<PostCard>`, busca por texto, simula clique |
| Rotas API (Route Handlers) | **Vitest** com mock de Supabase/Groq | POST `/api/generate-post` → status 200 + shape esperado |
| Chamadas externas (GitHub, Groq) | **MSW (Mock Service Worker)** | Intercepta `fetch` e devolve fixtures |
| Server actions / server components | **Vitest** com mocks de cookies/session | Testa fluxo de auth |

#### Regras de TDD neste projeto

- **Nenhum `Add` sem `Test` anterior ou no mesmo commit.** Se tem `Add user profile page`, deve existir teste de `<UserProfilePage>`.
- **Bug fix começa com teste de regressão.** Reproduz o bug em teste, vê falhar, corrige, vê passar.
- **Refactor só com testes verdes.** Sem testes passando, é mudança às cegas.
- **Cobertura > 80% nas funções de negócio** (geração de post, análise de repo, Skill Tree). UI pode ser menor.
- **`npm test` deve estar verde antes de qualquer commit `Add` ou `Fix`.**
- **Mock externos sempre** — testes não chamam GitHub/Groq reais. Determinismo > realismo nos testes.

#### Por que TDD num projeto acadêmico de 4 dias

- **A metodologia É o entregável.** A disciplina avalia processo, não só produto. TDD é demonstração concreta de disciplina técnica com IA.
- **Material rico pro `JORNADA.md`.** Cada ciclo Red→Green→Refactor com IA é um caso de estudo: quantas iterações até o teste passar? IA escreveu o teste primeiro ou tentou trapacear?
- **Reduz retrabalho.** O dia 4 (polimento) fica mais leve porque bugs aparecem cedo.
- **Força modularidade.** Código testável é código bem desenhado — IA tende a gerar Deus-componentes se não houver pressão de teste.

---

## 📝 Convenção de Commits

Usar prefixos no estilo *Akita* (curtos, em inglês, ação clara):

| Prefixo | Quando usar | Exemplo |
|---|---|---|
| `Test` | Teste novo (Red — deve falhar) | `Test post generation returns markdown` |
| `Add` | Feature nova (Green — faz teste passar) | `Add github oauth callback route` |
| `Fix` | Bug corrigido (com teste de regressão antes) | `Fix infinite loop in repo list page` |
| `Extract` | Refator: separar componente/função | `Extract PostCard component from feed` |
| `DRY` | Refator: eliminar duplicação | `DRY repeated supabase client init` |
| `Rework` | Refator: estrutura grande mudou | `Rework post generation flow to streaming` |
| `Replace` | Trocar implementação | `Replace fetch retry with native AbortSignal.timeout` |
| `Style` | CSS/visual sem mudança lógica | `Style profile page spacing` |
| `Docs` | Mudança em `.md` | `Docs update JORNADA day 2 notes` |
| `Chore` | Config, lint, deps | `Chore upgrade tailwind to 4.1` |

**Regra:** mensagem na primeira linha em inglês, no imperativo, ≤72 chars. Descrição opcional em pt-BR se precisar contexto.

---

## 🔁 Workflow de Cada Tarefa (TDD)

Repetir o ciclo **Red → Green → Refactor** para **cada pequena mudança**:

1. **Confirmar contexto.** Ler `docs/ENTREGA.md` para garantir escopo. Tarefa atômica que cabe em 1–3 commits (≤45 min).
2. **🔴 Red — Escrever o teste primeiro.** Descrever o comportamento desejado. Rodar `npm test` → **deve falhar** (se passar de primeira, o teste não vale).
3. **Commit do teste:** `Test <descrição>`.
4. **🟢 Green — Implementar o mínimo para o teste passar.** Sem polimento. Sem features extras. IA propõe → humano lê → aceitar.
5. **Rodar testes:** `npm test`. Falhou? Voltar ao passo 4 com erro completo colado no prompt.
6. **Validar manualmente também** (`npm run dev` aberto sempre — clicar e ver).
7. **Commit:** `Add <descrição>` (ou `Fix` se for correção).
8. **🔵 Refactor (opcional).** Com teste verde, melhorar o código: extrair função, renomear, simplificar. Rodar `npm test` a cada mudança.
9. **Commit refactor (se houve):** `Extract`/`DRY`/`Rework`/`Replace`.
10. **Anotar no `docs/JORNADA.md`** se foi aprendizado relevante (momento UAU, IA tentando "trapacear" no teste, falha repetida, padrão descoberto).

### Para correção de bugs (TDD-de-regressão)
1. Reproduzir o bug em um teste — **deve falhar** mostrando o bug.
2. `Test <bug que falha>` → commit.
3. Corrigir o código mínimo → teste passa.
4. `Fix <bug>` → commit.

---

## ✅ Checklists Operacionais

### Antes de cada prompt
- [ ] O problema está bem definido em 1–2 frases?
- [ ] `AGENTS.md` está atualizado com decisões recentes?
- [ ] Tarefa é pequena o suficiente para 1–3 commits?
- [ ] Há exemplo de padrão similar no código existente?
- [ ] Restrições/escopo estão claros no prompt?
- [ ] **O teste do comportamento esperado já foi escrito?**

### Após escrever o teste (Red)
- [ ] `npm test` rodou e **falhou** (se passou, teste não é válido)?
- [ ] Teste descreve comportamento, não implementação?
- [ ] Teste é determinístico (sem chamadas reais a APIs externas — usar mocks/MSW)?
- [ ] Commit `Test ...` feito?

### Após implementar (Green)
- [ ] `npm test` está **verde** (todos os testes passam, incluindo os antigos)?
- [ ] `npm run dev` roda sem erro?
- [ ] Comportamento validado manualmente (cliquei e vi)?
- [ ] Implementei só o mínimo (sem features fora do escopo do teste)?
- [ ] Segue padrões já estabelecidos no projeto?
- [ ] Não introduziu dependências novas sem justificar?
- [ ] Commit `Add`/`Fix` feito?

### Antes de refactor (Blue)
- [ ] Testes verdes antes de começar?
- [ ] Mantenho testes verdes a cada mudança?
- [ ] Não estou mudando comportamento (só estrutura)?

### Antes de pedir refactor grande ou feature complexa
- [ ] Commitei o estado atual funcionando?
- [ ] Quebrei em pedaços menores?
- [ ] Para cada pedaço já há (ou vai haver) teste?

---

## ⛔ Anti-Padrões (Não Fazer)

| Anti-padrão | Por que evitar | O que fazer |
|---|---|---|
| **Implementar antes do teste** | Quebra o ciclo TDD inteiro | Teste **primeiro**, sempre. Se já implementou, escreva o teste antes do próximo passo |
| **Commitar sem testes verdes** | Acumula bugs invisíveis | `npm test` verde antes de `git commit` em `Add`/`Fix` |
| **Teste que passa de primeira (no Red)** | Não testa nada útil — IA pode ter implementado junto | Apagar implementação, ver teste falhar, então reimplementar |
| **Teste com chamada real a GitHub/Groq** | Flaky, lento, dependente de internet | Mockar com MSW. Determinismo > realismo nos testes |
| **IA "consertando o teste" em vez do código** | Cobertura fake | Se teste falha, mudar **código**, não teste. Só mudar teste se o requisito mudou |
| Prompt gigante esperando código completo | Gera mais erro que acerto | Quebrar em passos pequenos (Red → Green → Refactor) |
| Aceitar código sem rodar | Erros se acumulam silenciosamente | Rodar testes + `dev` após cada geração |
| `npm install` em pacote sugerido pela IA sem verificar | IA inventa nomes de pacote | Conferir em `npmjs.com` antes |
| Copiar config grande sem entender | Vira dívida invisível | Pedir à IA para explicar cada bloco importante |
| "Deu erro" como prompt | IA não consegue ajudar | Colar erro completo + arquivo + linha + saída do `npm test` |
| Adiar refactoring "para depois" | Vira *espiral de complexidade* (vide `app_controller.js` do Akita) | Refactor no mesmo ciclo, com testes verdes |
| Commits gigantes no fim do dia | Impossível debuggar/reverter | Commits a cada etapa do TDD (3 por ciclo é comum) |
| Implementar fora do escopo do `docs/ENTREGA.md` | Estoura prazo | Mover ideia para `docs/Ideia.md` como roadmap |
| Esquecer de atualizar `JORNADA.md` | Perde material da apresentação | Anotar no mesmo dia, mesmo que rapidamente |
| Pular validação porque "compilou" | TypeScript compila código quebrado | Testes + clicar + ver com olho humano |
| Usar Anthropic/OpenAI direto | Fora do escopo (custo) | Groq (Llama) via Vercel AI SDK only |
| Criar feature do `Ideia.md` que não está no `ENTREGA.md` | Estoura escopo | Reforçar: `ENTREGA.md` é a verdade do MVP |

---

## 🧱 Restrições Técnicas

### Stack fixa (não trocar sem alinhamento explícito)
- **Framework:** Next.js 16 (App Router, server components default).
- **Linguagem:** TypeScript estrito.
- **UI:** Tailwind 4 + shadcn/ui. Não introduzir Material UI, Chakra, etc.
- **Banco/Auth:** Supabase (cliente JS oficial). RLS obrigatório em todas tabelas.
- **LLM:** Groq via Vercel AI SDK (`@ai-sdk/groq`). Modelo padrão: `llama-3.3-70b-versatile`.
- **GitHub API:** `fetch` nativo. Não instalar Octokit.
- **Deploy:** Vercel Hobby.

### Stack de testes (obrigatória desde o Dia 1)
- **Runner:** Vitest (mais rápido que Jest, integra nativamente com Vite/Next).
- **Componentes React:** `@testing-library/react` + `@testing-library/jest-dom`.
- **DOM virtual:** `jsdom` ou `happy-dom` (preferir `happy-dom`, mais leve).
- **Mock de APIs externas:** MSW (`msw`).
- **Cobertura:** `@vitest/coverage-v8` — meta >80% em funções de negócio.
- **Comando padrão:** `npm test` (watch mode em dev), `npm run test:ci` (single run para hooks/CI).

### Não introduzir no MVP
- Inngest, Trigger.dev, qualquer fila/worker externo (Vercel Cron basta).
- Sentry, PostHog, Metabase, Datadog (não há produção comercial).
- Mermaid, D2 ou diagramas (roadmap, não MVP).
- Anthropic, OpenAI, OpenRouter (custo + fora do escopo).
- Plugin VS Code (roadmap v2 do `Ideia.md`).

### Segurança mínima (obrigatória mesmo em acadêmico)
- `.env.local` no `.gitignore` — **verificar antes do primeiro commit**.
- Tokens GitHub do usuário ficam apenas no Supabase (não no client).
- RLS habilitado em **todas** as tabelas Supabase.
- Validação Zod em endpoints API.
- Escopos OAuth mínimos: `read:user`, `public_repo` (sem `repo` privado no MVP).

---

## 📅 Cadência diária esperada

Inspirada no padrão Akita (~34 commits/dia), adaptada para 4 dias acadêmicos:

| Momento | Ação |
|---|---|
| Início do dia | Ler `docs/ENTREGA.md` (seção do dia atual). Listar 3–5 micro-tarefas. |
| Durante | Loop do workflow de tarefas. Meta: 10–20 commits/dia. |
| Pausa para refactor | Sempre que sentir "isso aqui tá feio" → refatorar antes de empilhar. |
| Fim do dia | Atualizar `docs/JORNADA.md` com aprendizados, prompts, momentos UAU/frustrantes. |
| Antes de fechar | `git status` limpo + push pro GitHub + verificar deploy no Vercel. |

---

## 🧠 Como dialogar com o humano (você, agente)

- **Sempre confirme** mudanças que afetem mais de 1 arquivo antes de executar.
- **Pergunte** quando o escopo for ambíguo — preferível 1 pergunta que 10 minutos de refactor.
- **Reporte** quando notar dívida técnica acumulando, mesmo sem ser pedido.
- **Sugira** atualizações neste `AGENTS.md` quando descobrir um padrão repetido ou armadilha nova.
- **Recuse** com gentileza tarefas fora do escopo do `docs/ENTREGA.md` — sugira mover para `Ideia.md` como roadmap.
- **Use português** na conversa com o humano. **Código e commits em inglês.**

---

## 🔄 Evolução deste documento

Este `AGENTS.md` é **vivo**. Atualizar quando:

- Aprender algo que outro agente futuro precisaria saber.
- Descobrir uma armadilha nova (adicionar na tabela de anti-padrões).
- Mudar uma decisão técnica (atualizar restrições).
- Concluir o trabalho acadêmico (adicionar seção "lições aprendidas").

**Não inflar** com obviedades. Cada linha aqui custa atenção do agente que vai ler.
## Code style

- Functions: 4-20 lines. Split if longer.
- Files: under 500 lines. Split by responsibility.
- One thing per function, one responsibility per module (SRP).
- Names: specific and unique. Avoid `data`, `handler`, `Manager`.
  Prefer names that return <5 grep hits in the codebase.
- Types: explicit. No `any`, no `Dict`, no untyped functions.
- No code duplication. Extract shared logic into a function/module.
- Early returns over nested ifs. Max 2 levels of indentation.
- Exception messages must include the offending value and expected shape.

## Comments

- Keep your own comments. Don't strip them on refactor — they carry
  intent and provenance.
- Write WHY, not WHAT. Skip `// increment counter` above `i++`.
- Docstrings on public functions: intent + one usage example.
- Reference issue numbers / commit SHAs when a line exists because
  of a specific bug or upstream constraint.

## Tests

- Tests run with a single command: `<project-specific>`.
- Every new function gets a test. Bug fixes get a regression test.
- Mock external I/O (API, DB, filesystem) with named fake classes,
  not inline stubs.
- Tests must be F.I.R.S.T: fast, independent, repeatable,
  self-validating, timely.

## Dependencies

- Inject dependencies through constructor/parameter, not global/import.
- Wrap third-party libs behind a thin interface owned by this project.

## Structure

- Follow the framework's convention (Rails, Django, Next.js, etc.).
- Prefer small focused modules over god files.
- Predictable paths: controller/model/view, src/lib/test, etc.

## Formatting

- Use the language default formatter (`cargo fmt`, `gofmt`, `prettier`,
  `black`, `rubocop -A`). Don't discuss style beyond that.

## Logging

- Structured JSON when logging for debugging / observability.
- Plain text only for user-facing CLI output.
