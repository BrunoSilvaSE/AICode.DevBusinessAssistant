# Plano de Entrega — Trabalho Acadêmico (4 dias)

> Documento operacional. Foco: o que vai ser entregue em 4 dias. Visão completa de longo prazo está no [Ideia.md](./Ideia.md). Relato da jornada com IA está no [JORNADA.md](./JORNADA.md).

---

## 📌 Contexto

| Item | Valor |
|---|---|
| Disciplina | IA para não programadores |
| Foco do trabalho | Demonstrar a experiência de desenvolver software 100% com IA |
| Modalidade | Individual |
| Entrega | 2026-05-25 (segunda-feira) |
| Início | 2026-05-21 (quinta-feira, hoje) |
| Janela útil | ~4 dias (21–24 de maio) |
| Apresentação | Documento informal de jornada — sem defesa oral formal |
| Orçamento | **R$ 0,00** — tudo em free tier, sem domínio próprio |

---

## 🎯 Núcleo Apresentável (mínimo defensável)

Cinco entregas que, juntas, contam uma história coerente:

1. **Login com GitHub** (Supabase Auth + GitHub OAuth).
2. **Listar repositórios do usuário** (via API GitHub usando o token da sessão).
3. **Gerador de Post LinkedIn standalone** — input livre de texto → IA devolve post pronto em tom business.
4. **Gerar post a partir de um repositório** — usuário escolhe repo, IA lê README + linguagens, devolve post em tom técnico ou business.
5. **Skill Tree simples** — cards com as linguagens detectadas nos repos públicos.

Tudo o que existe no `Ideia.md` além disso vira **roadmap pós-entrega** e é mencionado no JORNADA.md como "para onde poderia crescer".

---

## 🧱 Stack do Núcleo (100% free)

| Camada | Tecnologia | Por quê |
|---|---|---|
| App | **Next.js 15 (App Router) + TypeScript** | Padrão da indústria, IA tem corpus enorme dessa stack |
| Hospedagem | **Vercel Hobby** | Deploy automático, URL `seu-projeto.vercel.app`, grátis |
| Banco + Auth | **Supabase Free** | Postgres + Auth GitHub + RLS, tudo grátis até 50k MAU |
| LLM | **Groq (Llama 3.3 70B) via Vercel AI SDK** | Grátis (30 req/min), rapidíssimo, qualidade boa para texto |
| UI | **Tailwind + shadcn/ui** | Componentes prontos, IA gera código compatível facilmente |
| GitHub API | **fetch nativo** (sem Octokit) | Menos dependências, IA conhece bem |
| Diagramas | (nenhum no núcleo) | Adiar para extensão |

**URL final esperada:** `https://[nome-projeto].vercel.app`

---

## 🛡️ Segurança Mínima (sem teatro)

| Prática | Por quê é importante |
|---|---|
| RLS habilitado em todas as tabelas Supabase | Cada usuário só vê seus próprios dados |
| Token GitHub guardado só no Supabase | Nunca exposto no client |
| Validação Zod nos endpoints API | Previne entrada maliciosa |
| `.env.local` no `.gitignore` (verificar antes do primeiro commit) | Não vazar secrets no repo |
| Não logar conteúdo de repositórios no console | Privacidade básica do código alheio |
| HTTPS automático (Vercel) | Padrão moderno |
| Escopos GitHub OAuth mínimos: `read:user`, `public_repo` | Só o necessário, sem `repo` privado |

**Não fazer (fora do escopo):** pentest, SOC 2, bug bounty, MFA próprio, audit log, DPAs, Sentry, PostHog.

---

## 📅 Cronograma dos 4 Dias

### Dia 1 — Quinta 21/05 — Fundação
**Meta:** consigo logar com GitHub e ver "Olá, [meu nome]" deployado no Vercel.

- [ ] `npx create-next-app@latest` com TS, App Router, Tailwind
- [ ] Instalar shadcn/ui e configurar tema
- [ ] Criar repositório GitHub e fazer primeiro commit
- [ ] Criar projeto no Supabase
- [ ] Criar OAuth App no GitHub (callback URL apontando para Supabase)
- [ ] Configurar Auth GitHub no Supabase
- [ ] Implementar tela de login + callback
- [ ] Landing page mínima (1 hero, 1 CTA "Entrar com GitHub")
- [ ] Deploy inicial no Vercel
- [ ] **Marco do dia:** login funcionando em produção

### Dia 2 — Sexta 22/05 — Tradutor de Contexto
**Meta:** dois geradores de post funcionando ponta a ponta.

- [ ] Conta no Groq + API key
- [ ] Instalar Vercel AI SDK + provider Groq
- [ ] Página `/gerador` — Tradutor standalone (textarea de input → botão → output streaming)
- [ ] Página `/repositorios` — lista repos públicos do usuário (API GitHub)
- [ ] Página `/repositorios/[owner]/[name]` — detalhe com README e linguagens
- [ ] Botão "Gerar Post Técnico" e "Gerar Post Business" no detalhe do repo
- [ ] Prompt engineering: ajustar até output ficar bom
- [ ] **Marco do dia:** dois fluxos de geração funcionando

### Dia 3 — Sábado 23/05 — Portfólio + Skill Tree
**Meta:** portfólio navegável com Skill Tree e histórico de posts.

- [ ] Tabela `posts` no Supabase (user_id, repo, tom, conteúdo, criado_em)
- [ ] Salvar posts gerados no banco
- [ ] Página `/perfil` ou `/[username]` — perfil público do usuário
- [ ] Skill Tree simples: agregar linguagens de todos os repos em cards
- [ ] Histórico de posts gerados na página de perfil
- [ ] RLS nas tabelas (revisar)
- [ ] **Marco do dia:** portfólio público acessível por link

### Dia 4 — Domingo 24/05 — Polimento + JORNADA.md
**Meta:** tudo pronto, sem retrabalho de última hora na segunda.

- [ ] UI polish (cores consistentes, tipografia, espaçamentos, dark mode opcional)
- [ ] Mensagens de erro decentes (não deixar tela em branco)
- [ ] Testar todos os fluxos como usuário novo
- [ ] Limpar console.logs
- [ ] README.md decente no repo do projeto
- [ ] **Escrever JORNADA.md completo** (relato dos 4 dias)
- [ ] Deploy final estável
- [ ] **Marco do dia:** entrega pronta

---

## 🌱 Extensões (se sobrar tempo)

Em ordem de "menor esforço / maior impacto na apresentação":

1. **Diagrama Mermaid gerado por IA** para um projeto selecionado (~2h).
2. **Auto-Readme sob clique** — botão que gera um README turbinado para o repo (~2h).
3. **Comentários simples por post** (caixa de texto + lista) — protótipo de fórum (~3h).
4. **Exportar Skill Tree como imagem** via `html2canvas` (~2h).
5. **Dark mode toggle** (~1h, mas valoriza UI).

---

## 🚫 Anti-Padrões do Vibe-Coding (cuidados práticos)

- **Não rodar `npm install` de pacotes que a IA inventou** — verificar no `npmjs.com` antes (IA alucina nomes).
- **Não copiar configs gigantes sem entender** — pedir à IA para explicar cada parte importante.
- **Não pular leitura de erros** — colar o erro inteiro pra IA, nunca só "deu erro".
- **Commits frequentes** — a cada feature funcionando. Se IA quebrar tudo, dá pra voltar com `git reset`.
- **Revisar arquivos antes de aceitar** — IA às vezes muda código que estava funcionando ao "ajudar" em outra parte.
- **Salvar prompts importantes** — abrir um buffer/nota e copiar prompts bons. Vão para o JORNADA.md.
- **Não esquecer de testar manualmente** — IA escreve código que compila mas pode não funcionar. Clique e veja.

---

## 📝 Próximos Passos Imediatos (agora)

1. Criar conta no Vercel se ainda não tem.
2. Criar conta no Supabase.
3. Criar conta no Groq (groq.com).
4. Rodar `npx create-next-app@latest` no diretório do projeto.
5. Começar a preencher o `JORNADA.md` desde o primeiro prompt.
