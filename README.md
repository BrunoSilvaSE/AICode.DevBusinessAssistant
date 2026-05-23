# Dev Business Assistant

Plataforma para desenvolvedores transformarem seu trabalho técnico em marca pessoal. Conecte o GitHub e use IA para gerar posts de impacto para o LinkedIn, montar um portfólio público completo e visualizar sua Skill Tree baseada em código real.

Construído 100% com IA (Vibe Coding) como trabalho da disciplina **IA para não programadores**.

## Funcionalidades

| Feature | Rota |
|---|---|
| Login com GitHub OAuth | `/login` |
| Dashboard com análise de perfil por IA | `/dashboard` |
| Explorador de repositórios públicos | `/repositorios` |
| Gerar post LinkedIn (tom business ou técnico) | `/repositorios/[owner]/[name]` |
| Auto-README gerado por IA | `/repositorios/[owner]/[name]` |
| Diagrama de arquitetura Mermaid | `/repositorios/[owner]/[name]` |
| Compartilhar post no LinkedIn (1 clique) | `/repositorios/[owner]/[name]` |
| Gerador de post standalone (texto livre) | `/gerador` |
| Perfil privado com Skill Tree e histórico | `/perfil` |
| Portfólio público por username | `/u/[username]` |
| Bio profissional gerada por IA | `/editar-perfil` |
| Linha do tempo completa | `/u/[username]/timeline` |
| Editor de linha do tempo | `/timeline` |
| Seleção de repos em destaque com cover | `/repos-destaque` |
| Formulário de contato no portfólio | `/u/[username]` |
| Inbox de mensagens no dashboard | `/dashboard` |

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Linguagem | TypeScript 5 (strict) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Auth + Banco | Supabase (PostgreSQL + RLS + GitHub OAuth) |
| LLM | Groq — Llama 3.3 70B via Vercel AI SDK v6 |
| Validação | Zod v4 |
| Testes | Vitest + Testing Library + happy-dom |
| Deploy | Vercel Hobby |

## Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GROQ_API_KEY, SUPABASE_SERVICE_ROLE_KEY

# 3. Rodar os testes
npm test

# 4. Iniciar servidor de dev
npm run dev
```

## Banco de dados

Rodar as migrations em `/supabase/migrations/` na ordem numérica no Supabase SQL Editor.

## Metodologia

Desenvolvido com TDD (Red → Green → Refactor) e ciclos de pair programming com IA.
73 testes automatizados cobrindo todas as rotas de API principais.
O relato completo da jornada está em [`docs/JORNADA.md`](./docs/JORNADA.md).

---
Disciplina: IA para não programadores — Maio/2026
