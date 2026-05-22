import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = groq("llama-3.3-70b-versatile");

const SYSTEM_PROMPT = `Você é um especialista em documentação de software open source.

Dado o contexto de um repositório GitHub, gere um README.md completo e profissional em português brasileiro que inclua:
- **Título e badge de tecnologia principal**
- **Descrição clara** do que o projeto faz e qual problema resolve
- **Funcionalidades principais** em lista
- **Stack tecnológica** (Technologies)
- **Instalação** — passo a passo simples
- **Como usar** — exemplo básico de uso
- **Estrutura do projeto** (se inferível)
- **Contribuição** — como contribuir brevemente
- **Licença** — MIT por padrão se não especificado

Use markdown rico (badges, tabelas, blocos de código).
Retorne APENAS o conteúdo markdown do README, sem explicações adicionais.`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { repoName, description, languages, readme } = body as {
    repoName?: string;
    description?: string;
    languages?: string[];
    readme?: string;
  };

  if (!repoName) {
    return Response.json(
      { error: "O campo 'repoName' é obrigatório." },
      { status: 400 }
    );
  }

  const context = [
    `Repositório: ${repoName}`,
    description ? `Descrição atual: ${description}` : "",
    languages?.length ? `Tecnologias detectadas: ${languages.join(", ")}` : "",
    readme ? `README atual (referência):\n${readme.slice(0, 2000)}` : "README atual: não existe",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await streamText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `Contexto do repositório:\n\n${context}`,
    maxOutputTokens: 1000,
    temperature: 0.5,
  });

  return result.toTextStreamResponse();
}
