import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = groq("llama-3.3-70b-versatile");

const SYSTEM = `Você é um arquiteto de software especializado em criar diagramas Mermaid claros e precisos.

Dado o contexto de um repositório GitHub, gere um diagrama Mermaid representando a arquitetura ou fluxo principal do projeto.

REGRAS OBRIGATÓRIAS:
- Retorne APENAS código Mermaid válido, sem blocos de código markdown (sem \`\`\`), sem explicações
- Use flowchart TD para a maioria dos projetos web/app
- Use sequenceDiagram para APIs e fluxos de comunicação
- Use erDiagram para projetos focados em banco de dados
- Máximo de 12 nós para manter clareza
- Labels em português, nomes técnicos podem ficar em inglês
- Agrupe componentes similares com subgraph quando fizer sentido

Exemplo de output válido para um app web:
flowchart TD
    U[Usuário] --> FE[Frontend Next.js]
    FE --> API[API Routes]
    API --> DB[(Supabase DB)]
    API --> GH[GitHub API]
    API --> AI[Groq LLM]
    FE --> AUTH[Supabase Auth]`;

export async function POST(req: Request) {
  const { repoName, description, languages, readme } = await req.json().catch(() => ({}));

  if (!repoName) {
    return Response.json({ error: "repoName é obrigatório" }, { status: 400 });
  }

  const context = [
    `Repositório: ${repoName}`,
    description ? `Descrição: ${description}` : "",
    languages?.length > 0 ? `Tecnologias: ${(languages as string[]).join(", ")}` : "",
    readme ? `README (trecho):\n${(readme as string).slice(0, 2500)}` : "",
  ].filter(Boolean).join("\n");

  const result = await streamText({
    model,
    system: SYSTEM,
    prompt: context,
    maxOutputTokens: 500,
    temperature: 0.2,
  });

  return result.toTextStreamResponse();
}
