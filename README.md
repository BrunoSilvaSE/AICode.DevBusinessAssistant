# Dev Business Assistant 🚀

Plataforma acadêmica para desenvolvedores que desejam transformar seu trabalho técnico em marca pessoal. Conecte seu GitHub e use IA para gerar posts de impacto para o LinkedIn e visualizar sua Skill Tree baseada em código real.

Este projeto foi construído 100% utilizando IA (Vibe Coding) como parte da disciplina **IA para não programadores**.

## 🛠️ Funcionalidades

- **Login com GitHub**: Autenticação segura via Supabase Auth.
- **Gerador de Post Standalone**: Tradutor técnico → business para qualquer texto.
- **Explorador de Repositórios**: Visualize seus projetos públicos com dados direto da API do GitHub.
- **Gerador de Post por Contexto**: A IA lê seu README e linguagens para gerar posts técnicos ou de negócio precisos.
- **Skill Tree Verificada**: Suas habilidades são inferidas e quantificadas a partir dos seus repositórios reais.
- **Histórico de Posts**: Todos os posts gerados são salvos e acessíveis no seu perfil.

## 🚀 Stack Tecnológica

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend/Auth**: [Supabase](https://supabase.com/)
- **LLM**: [Groq (Llama 3.3 70B)](https://groq.com/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Testes**: [Vitest](https://vitest.dev/) (TDD)
- **Hospedagem**: [Vercel](https://vercel.com/)

## 📦 Como rodar localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   GROQ_API_KEY=...
   ```
4. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Rode os testes:
   ```bash
   npm test
   ```

## 📖 Jornada de Desenvolvimento

O relato detalhado da construção deste projeto, incluindo os prompts usados, erros enfrentados e lições aprendidas com a IA, pode ser encontrado em [`docs/JORNADA.md`](./docs/JORNADA.md).

---
Projeto desenvolvido para a disciplina **IA para não programadores** (Maio/2026).
