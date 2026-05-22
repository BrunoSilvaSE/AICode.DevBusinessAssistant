import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const model = groq("llama-3.3-70b-versatile");

const PROMPTS = {
  business: `Você é um especialista em marketing de conteúdo para LinkedIn focado em profissionais de tecnologia.

Dado um texto técnico descrevendo um trabalho de desenvolvimento, gere um post de LinkedIn em português brasileiro que:
- Começa com um hook que prende atenção (1 frase impactante)
- Contextualiza o problema resolvido em linguagem de negócio (sem jargão técnico)
- Mostra o impacto/resultado em métricas ou benefícios concretos
- Termina com um call-to-engagement (pergunta ou provocação)
- Tom: profissional, acessível, inspirador
- Tamanho: 150-250 palavras
- Usa emojis com moderação (2-4 no máximo)
- NÃO usa hashtags em excesso (máximo 3 no final)

Retorne APENAS o texto do post, sem explicações adicionais.`,

  technical: `Você é um desenvolvedor sênior escrevendo para a comunidade técnica no LinkedIn.

Dado um texto descrevendo um trabalho de desenvolvimento, gere um post de LinkedIn em português brasileiro que:
- Começa com o problema técnico enfrentado
- Descreve a solução com detalhes de arquitetura/implementação relevantes
- Menciona trade-offs e decisões de design
- Convida discussão técnica da comunidade
- Tom: técnico, direto, colaborativo
- Tamanho: 150-250 palavras
- Pode usar termos técnicos apropriados
- Máximo 3 hashtags técnicas no final

Retorne APENAS o texto do post, sem explicações adicionais.`,
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // useCompletion (AI SDK) sends the text as `prompt`; direct calls may use `input`.
  const { prompt, input, tone = "business" } = body as {
    prompt?: string;
    input?: string;
    tone?: string;
  };
  const text = prompt ?? input;

  if (!text || text.trim().length < 10) {
    return Response.json(
      { error: "O campo 'prompt' é obrigatório e deve ter ao menos 10 caracteres." },
      { status: 400 }
    );
  }

  if (tone !== "business" && tone !== "technical") {
    return Response.json(
      { error: "O campo 'tone' deve ser 'business' ou 'technical'." },
      { status: 400 }
    );
  }

  const systemPrompt = PROMPTS[tone as keyof typeof PROMPTS];

  const result = await streamText({
    model,
    system: systemPrompt,
    prompt: `Texto do desenvolvedor:\n\n${text.trim()}`,
    maxOutputTokens: 500,
    temperature: 0.7,
  });

  return result.toTextStreamResponse();
}
