# Especificação de Escopo: Central de Gestão Profissional

> ⚠️ **Aviso de contexto (2026-05-21):** este documento descreve a **visão completa de longo prazo** do produto. Para o escopo real da entrega acadêmica (4 dias, individual), veja **[ENTREGA.md](./ENTREGA.md)**. O relato pessoal do desenvolvimento está em **[JORNADA.md](./JORNADA.md)**.
>
> **Estágio atual:** Ideia em papel. Documento vivo — refinado ao longo das conversas de design. Mantido como referencial de roadmap pós-trabalho acadêmico.

Plataforma SaaS para desenvolvedores onde **Portfólio Dinâmico** e **Fórum/Showcase** atuam como pilares co-iguais. As ferramentas de IA existem para alimentar, enriquecer e facilitar a criação de conteúdo para esses dois núcleos.

---

## 🎯 Posicionamento

### Tagline interna
**"GitHub para marca pessoal."**
A vitrine que GitHub Profile deveria ser, com o alcance que LinkedIn não consegue entregar para conteúdo técnico.

### Público-alvo prioritário
**Devs pleno/sênior consolidando marca pessoal.**
Profissionais que já têm experiência e projetos, mas precisam:
- Transformar trabalho técnico em autoridade visível (LinkedIn, networking, conteúdo).
- Documentar projetos sem gastar horas escrevendo READMEs e posts.
- Receber feedback qualificado de pares sobre arquitetura e decisões técnicas.
- Manter uma vitrine que evolui sozinha conforme o trabalho do dia a dia avança.

### Decisão estratégica: dois pilares co-iguais, porta de entrada via Portfólio
Portfólio e Fórum têm peso igual *no produto*. Mas a **narrativa de aquisição é puxada pelo Portfólio** — devs sênior chegam atraídos por "ter um portfólio melhor que o GitHub Profile" e descobrem o Fórum como benefício de engajamento. O diferencial só se materializa quando os dois se retroalimentam: um post no fórum enriquece a página do projeto no portfólio, e o portfólio atrai tráfego qualificado para discussões no fórum.

---

## 🥊 Análise Competitiva

### Concorrente-alvo: GitHub Profile + LinkedIn (status quo grátis)
A maioria dos devs sênior hoje opera com essa combinação. Para justificar a troca, a plataforma precisa resolver dores reais que essa stack deixa em aberto:

| Dor real do dev sênior | Status quo (GitHub + LinkedIn) | Nossa resposta |
|---|---|---|
| "Meu GitHub Profile lista repos, mas não conta minha história." | README manual; pinned repos sem contexto. | Portfólio que **gera narrativa automática** por projeto (Auto-Readme + diagramas + Skill Tree). |
| "Recrutador não-técnico não entende o que meus repos significam." | Nada — GitHub é hostil a leigos. | **Tom Business/LinkedIn** traduz impacto sem perder substância. |
| "LinkedIn engaja, mas posts técnicos profundos morrem lá." | Posts manuais, raros, superficiais. | **Fórum nativo** para profundidade + **exportação 1-clique** pro LinkedIn. |
| "Manter os dois alinhados é trabalho dobrado." | Atualizar README, depois LinkedIn, depois esquecer. | **Uma ação ("Publicar Projeto") gera todos os artefatos.** |
| "Skills no LinkedIn são teatro; no GitHub são implícitas." | Endossos performáticos vs. invisibilidade. | **Skill Tree verificável por código real**, não auto-declarada. |
| "Não tenho onde discutir decisões arquiteturais com pares." | Twitter/X (ruído) ou Slack fechado de empresa. | **Fórum com Showcase técnico** — autoridade construída em público. |

### Mapa competitivo (referência)

| Categoria | Concorrentes | Lacuna que exploramos |
|---|---|---|
| Portfólio estático | read.cv, GitHub Profile, templates Vercel | Não evolui com o trabalho real. |
| Geração de README | README.so, readme-ai | Isolado; não conecta portfólio nem comunidade. |
| Blog/Comunidade dev | Dev.to, Hashnode, Medium | Escrita manual do zero, sem puxar código. |
| Networking profissional | LinkedIn, Polywork | Hostil a conteúdo técnico denso. |
| Tracking de skills | Wakatime, Codetime | Dashboard pessoal, não vira vitrine pública. |
| Q&A técnico | Stack Overflow | Resolve problemas, não constrói marca. |

### Os 3 diferenciais que nos protegem
1. **Loop fechado código → portfólio → comunidade → exportação.** Nenhum concorrente fecha esse ciclo; cada um cobre uma fatia.
2. **Skill Tree verificável por código real.** Combate a inflação de skills do LinkedIn e a invisibilidade do GitHub.
3. **Dual-tom técnico/business com uma fonte única.** O mesmo projeto vira deep-dive arquitetural *e* post de LinkedIn sem retrabalho.

---

## 🚀 Os Dois Pilares do Sistema

### Pilar 1: Portfólio Dinâmico (A Vitrine)
O portfólio não é um currículo estático, mas um reflexo em tempo real do trabalho do desenvolvedor.

- **Skill Tree Integrada:** árvore de habilidades verificável por código real, gerada automaticamente. Detalhes técnicos e visuais na seção dedicada [🌳 Skill Tree](#-skill-tree--mecânica-e-visualização).
- **Auto-Readme e Diagramas:** projetos importados recebem documentação técnica e diagramas de arquitetura gerados por IA, enriquecendo a apresentação sem esforço manual.
- **API Pessoal (Headless):** dados consolidados (projetos, skills, posts) disponíveis via API para devs que querem construir frontend customizado — a plataforma vira CMS pessoal.
- **Página de Projeto:** cada projeto tem uma página própria que agrega README, diagramas, skills usadas e posts do fórum relacionados.

### Pilar 2: Fórum e Hub de Discussão (A Comunidade)
Coração interativo da plataforma, focado em troca de conhecimento, networking e feedback sobre projetos reais.

- **Aba de "Showcase de Projetos":** seção dedicada para publicar, documentar e discutir projetos.
- **Fluxo de Publicação Integrado ao GitHub:**
  1. Usuário clica em "Publicar Projeto".
  2. Seleciona um repositório do GitHub sincronizado.
  3. Escolhe o **Tom do Post** gerado pela IA:
     - **Técnico (Deep Dive):** foca em arquitetura, dependências e desafios de código. Ideal para pedir revisão de comunidade sobre estrutura de banco, eficiência de algoritmo, decisões de design.
     - **Não-Técnico (Business/LinkedIn):** foca em impacto, escalabilidade e problema resolvido. Exportável direto para LinkedIn ou usado para networking de negócios.
- **Discussões transversais:** além do showcase, espaço para discussões de carreira sênior, decisões arquiteturais e tendências da indústria.

---

## 🔄 Ferramentas de IA do Sistema

### Tradutor de Contexto (feature de primeiro nível)
O motor de tradução **técnico ↔ business** é uma das peças mais visíveis da plataforma. Resolve uma dor real: muitos devs sêniores codificam bem, mas travam ao traduzir o que fizeram para uma linguagem que ressoa com gestores, recrutadores e a audiência do LinkedIn.

**Exemplo canônico:**
- **Input técnico do dev:** *"Refatorei o loop principal e mudei a estrutura de dados."*
- **Output business gerado:** *"Como otimizamos o tempo de processamento do nosso sistema em 40% alterando a estrutura base."*

**Dois modos de uso:**

1. **Modo Integrado (via Showcase do Fórum):**
   Selecione um repositório → IA lê o código → escolha o tom → gera post completo com contexto técnico extraído automaticamente. Publica no fórum e/ou exporta para LinkedIn.

2. **Modo Standalone (Gerador de Post LinkedIn):**
   Dev cola uma descrição curta/técnica do que fez (sem precisar conectar repositório). Plataforma devolve um post de LinkedIn pronto, em tom business, com hook, contexto, métrica e call-to-engagement. Útil para:
   - Trabalho de empresa que não pode ser exposto via repositório.
   - Insights soltos do dia a dia que não merecem um post inteiro de showcase.
   - Republicação de projetos antigos sem reimportar tudo.

> **Princípio de design:** o output sempre passa por revisão humana. A IA gera o rascunho, o dev valida e ajusta. A plataforma nunca posta sozinha em canais externos.

### Demais ferramentas

1. **Gerador de Diagramas:** usado nativamente ao importar projeto para o Portfólio ou criar Post Técnico no Fórum.
2. **Auto-Readme:** roda em background garantindo que nenhum projeto exposto no Portfólio fique sem contexto claro.

Todas as ferramentas de IA são **meios**, não fins. Elas existem para reduzir o atrito entre "fazer o trabalho" e "comunicar o trabalho".

---

## 🌳 Skill Tree — Mecânica e Visualização

Pilar da promessa *"verificável por código real"*. Diferente de skills auto-declaradas (LinkedIn) ou implícitas (GitHub Profile), aqui cada nível de maestria pode ser auditado clicando no card.

### Estratégia de inferência (faseada)

**Fase 1 — MVP: GitHub-only**
- **Por quê:** onboarding zero-fricção. Login no GitHub → Skill Tree populada em minutos. É o "wow moment" do produto.
- **Sinais extraídos automaticamente:**
  - Linguagens (via análise de extensões + Linguist do GitHub).
  - Frameworks/libs (via dependency files: `package.json`, `requirements.txt`, `go.mod`, `Gemfile`, `pom.xml`, `Cargo.toml`, etc.).
  - Ferramentas de infraestrutura (`Dockerfile`, manifests Kubernetes, Terraform, GitHub Actions YAML).
- **Sinais usados para calcular maestria:**
  - **Recência** — último uso/commit.
  - **Frequência** — commits e projetos por período.
  - **Diversidade** — quantos projetos distintos usaram a tecnologia.
  - **Continuidade** — anos de uso ininterrupto.

**Fase 2 — v2: Plugin de editor opcional (VS Code primeiro, depois JetBrains)**
- **Por quê entra:** incluir trabalho corporativo (código privado/local) e capturar tempo real de edição. Resolve o ponto cego de devs sêniores cuja maior parte do código não vai pro GitHub.
- **Envia só metadados:** linguagem, framework detectado, tempo de edição. **Nunca conteúdo de código.** Comunicado claramente no onboarding.
- **Reconciliação:** plugin enriquece dados do GitHub, não substitui. Dupla contagem evitada por timestamp + identidade de arquivo.

### Princípios anti-inflação
- **LOC não é métrica primária** — trivial de inflar com arquivos gerados ou copy-paste.
- **Forks de outros projetos pesam menos** que código original.
- **Arquivos gerados são ignorados** via heurística (lock files, build outputs, vendored deps).
- **Mass-commits e commits vazios** não contam.
- **Skills só promovem nível com diversidade de projetos** — usar React em 1 repo gigante ≠ usar React em 12 repos diferentes.

### Visualização (modo padrão + drill-down)

**Vista principal — Grade de cards sóbria** (default)
Cada skill vira um card com nome, anos de uso, nº de projetos e atividade recente. Estilo dashboard moderno (referência: read.cv), evita estética infantil que afasta sênior.

**Drill-down — Árvore hierárquica** (ao clicar num card)
Expande a árvore daquela tecnologia: clicar em "JavaScript" mostra React, Node.js, TypeScript como filhos com seus próprios níveis e métricas. É onde a metáfora "skill tree" vive — mas isolada num contexto onde faz sentido.

**Aba "Evolução" — Linha do tempo** (segunda aba do dashboard)
Eixo temporal mostrando quando cada skill apareceu, picos de uso e estado atual. Conta a história de carreira do dev. Exportável como imagem para LinkedIn ou portfólio narrativo.

### Privacidade e controle
- Usuário pode **ocultar skills específicas** (ex.: tecnologias legadas que não quer associar à marca atual).
- Skill Tree pode ser **pública ou privada** por padrão; ajustável por projeto.
- Por padrão, **só projetos públicos** alimentam a Skill Tree visível externamente. Projetos privados contribuem apenas para a vista interna do próprio usuário (a menos que ele opte por expor).

### Prova auditável
Cada skill no perfil público é clicável. Recrutador clica em **"React — Experiente"** e vê os 12 projetos públicos que sustentam essa classificação, com datas e contexto. É o que torna a Skill Tree defensável contra a inflação de endossos do LinkedIn.

---

## 🧱 Stack Técnica (MVP)

Decidida em 2026-05-21. Filosofia: **velocidade de validação > elegância de arquitetura**. Monolito TypeScript com extração posterior quando algum domínio se provar gargalo.

### Stack escolhida

| Camada | Tecnologia | Função no produto |
|---|---|---|
| App framework | **Next.js 15 (App Router)** | SSR/SSG para portfólio público (SEO), dashboard interno reativo, API routes |
| Linguagem | **TypeScript (strict)** | Tipagem end-to-end; reaproveitável no plugin VS Code (v2) |
| Banco + Auth + Storage | **Supabase** (Postgres gerenciado) | DB relacional, Auth GitHub OAuth, Storage de assets. JSONB para Skill Tree |
| LLM | **Anthropic Claude** (Sonnet + Haiku) | Geração de posts, READMEs, análise de código, tradutor de contexto |
| Jobs assíncronos | **Inngest** | Análise de repositórios (longa), pipelines de IA encadeadas |
| Diagramas | **Mermaid** (gerado por LLM, renderizado client-side) | Zero infra extra; formato declarativo |
| Hospedagem web | **Vercel** | Deploy automático, edge, integra com Next.js |
| Erros | **Sentry** | Frontend + serverless |
| Analytics de produto | **PostHog** | Eventos de uso, funis, retenção |
| BI / negócio | **Metabase** | Dashboards conectados ao Postgres do Supabase |
| Versionamento | **GitHub** | Repositório principal |

### Convenções iniciais
- **Estrutura:** monorepo único, folder structure padrão Next.js (sem workspaces ainda).
- **Qualidade:** ESLint + Prettier; TypeScript strict; Zod nos limites (API, forms).
- **ORM:** Drizzle (tipagem nativa, leve). Reavaliar se Supabase RLS exigir queries customizadas.
- **Testes:** Vitest para unitários; Playwright para E2E dos fluxos críticos (publicação de projeto, geração de post LinkedIn).

### Estratégia de custo com LLM
- **Claude Sonnet** — tarefas de raciocínio técnico (análise de arquitetura, posts deep-dive, geração de diagramas).
- **Claude Haiku** — tarefas leves (classificação de tom, sumarização, extração de metadados).
- **Prompt caching agressivo** — repositório lido uma vez vira cache reutilizável entre operações (Auto-Readme, post técnico, post business).
- **Streaming** em todo output longo (UX e percepção de velocidade).
- **Hard limits por usuário** desde o dia 1 (proteção contra abuso e custo descontrolado).

### Observabilidade desde o dia 1
Decisão consciente: implementar telemetria completa antes do lançamento.

- **PostHog** — eventos-chave: `signup`, `github_sync_completed`, `post_generated`, `post_published`, `linkedin_export`, `skill_drill_down`, `forum_reply`.
- **Sentry** — erros de frontend e serverless.
- **Metabase** — dashboards de negócio conectados direto ao Postgres do Supabase. Métricas iniciais: DAU, retenção 1d/7d/30d, conversão signup→primeira publicação, custo de LLM por usuário ativo.

**Por quê desde o dia 1:** decisões de produto sem dados viram opinião. Retrofitar telemetria é mais caro do que implementar correto desde o início.

### Decisões adiadas (não bloqueiam MVP)
- **Realtime no fórum** (live comments): habilitar Supabase Realtime quando comunidade tiver tração.
- **Plugin VS Code**: TypeScript + VS Code Extension API. Detalhamento em v2.
- **CDN dedicada**: Vercel cobre. Reavaliar Cloudflare se SEO/perf exigir.
- **Fallback de LLM provider**: começar com Claude only. Adicionar OpenRouter/OpenAI como fallback se disponibilidade for problema em produção.

---

## 🛠️ Jornadas Principais do Usuário (MVP)

### Jornada A — Publicação de Projeto (fluxo completo)
1. Dev sênior faz login com GitHub. Plataforma sincroniza repositórios e gera **Portfólio Base** (Skill Tree + projetos recentes + Auto-Readme).
2. Decide compartilhar um sistema de automação/backend recém-criado.
3. Navega até **Fórum > Aba de Projetos > Novo Post**.
4. Seleciona o repositório. IA lê o código e pergunta o tom desejado. Escolhe "Técnico".
5. IA gera rascunho detalhando arquitetura. Usuário revisa, adiciona comentários finais e publica.
6. Simultaneamente, o post enriquece a página desse projeto no Portfólio — vira parte permanente da vitrine.
7. *(Opcional)* Usuário também gera versão "Business" do mesmo projeto e exporta para LinkedIn.

### Jornada B — Gerador de Post para LinkedIn (standalone)
1. Dev acessa a ferramenta **"Gerar Post LinkedIn"** direto do dashboard.
2. Cola uma descrição curta do que fez (ex.: *"Refatorei o loop principal e mudei a estrutura de dados."*).
3. *(Opcional)* Adiciona métricas, contexto de negócio ou tom desejado (formal, casual, contador-de-histórias).
4. IA devolve um rascunho de post pronto: hook → contexto → solução → resultado → call-to-engagement.
5. Dev revisa, edita inline e copia para LinkedIn ou exporta via integração nativa.
6. Post é arquivado no histórico pessoal — vira insumo para futura página de "Publicações" no Portfólio.

---

## ⚠️ Riscos e Decisões em Aberto

| Tópico | Status | Observação |
|---|---|---|
| Dependência exclusiva do GitHub | Em aberto | Projetos privados, GitLab/Bitbucket e trabalho não-público ficam de fora. Avaliar suporte multi-fonte. |
| ~~Origem da Skill Tree~~ | ✅ Resolvido (2026-05-21) | Híbrida faseada: GitHub-only no MVP, plugin opcional em v2. Visualização: cards default + drill-down em árvore + aba de evolução. |
| Modelo de monetização | Não definido | Freemium? Paid tier para API headless e Auto-Readme ilimitado? |
| ~~Stack técnica~~ | ✅ Resolvido (2026-05-21) | Next.js + TS + Supabase + Claude + Vercel + Inngest. PostHog/Sentry/Metabase desde o dia 1. Detalhes na seção dedicada. |
| Privacidade de código | Crítico | IA processando código de repos privados exige garantias contratuais claras com provedor de LLM. |
| Estratégia de "cold start" do Fórum | Em aberto | Fórum vazio é fórum morto. Como populamos os primeiros 100 posts antes de ter usuários? |

---

## 📌 Próximos Passos de Refinamento

- [x] ~~Mapear concorrência direta e definir diferencial competitivo explícito.~~ (Resolvido 2026-05-21)
- [x] ~~Decidir mecanismo de inferência da Skill Tree.~~ (Resolvido 2026-05-21)
- [x] ~~Definir stack técnica (frontend, backend, banco, LLM provider).~~ (Resolvido 2026-05-21)
- [ ] Esboçar modelo de dados (usuário, projeto, post, skill).
- [ ] Definir modelo de monetização e estratégia de privacidade de código.
- [ ] Estratégia de cold-start do Fórum (sementes de conteúdo, convites curados, etc.).
