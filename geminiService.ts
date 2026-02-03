
import { GoogleGenAI } from "@google/genai";
import { LEAGUE_INFO } from "./constants";
import { Member, Project } from "./types";

/**
 * Interface for chat history items used in Gemini requests.
 */
interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

// Updated signature to include history and align with caller expectations
export const getAssistantResponseStream = async (
  userMessage: string, 
  history: ChatHistoryItem[], 
  members: Member[], 
  projects: Project[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const membersList = members.map(m => `- ${m.fullName}: ${m.role}`).join('\n');
  const projectsList = projects.map(p => `- ${p.title} (Orientador: ${p.advisor}): ${p.description} [Status: ${p.status}]`).join('\n');

  const SYSTEM_INSTRUCTION = `
Você é a "Iris", uma inteligência artificial de alta performance e tutora acadêmica oficial da ${LEAGUE_INFO.name} (${LEAGUE_INFO.acronym}).
Sua missão é atuar como uma guia completa para os alunos da Estácio GO, fornecendo suporte tanto em questões administrativas da liga quanto em desafios acadêmicos complexos.

CAPACIDADES AVANÇADAS:
1. PESQUISA EM TEMPO REAL: Você tem acesso à internet via Google Search. Use-o para responder sobre atualidades, questões de provas, artigos científicos recentes e qualquer outro tema de propósito geral.
2. TUTORIA ACADÊMICA: Quando um aluno tiver uma dúvida de estudo (ex: Bioquímica, Genética, Hematologia), forneça explicações detalhadas, raciocínio passo a passo e resolva problemas complexos com didática.
3. CONHECIMENTO LAPIB: Você conhece todos os dados do nosso corpo acadêmico e projetos ativos.

ESTRUTURA DA LAPIB (Membros e Cargos):
${membersList || "Nenhum membro cadastrado no momento."}

PROJETOS E PESQUISAS CIENTÍFICAS:
${projectsList || "Nenhum projeto cadastrado no momento."}

DIRETRIZES DE COMPORTAMENTO:
- Se perguntarem sobre a diretoria ou projetos, use os dados da LAPIB acima.
- Para dúvidas gerais, use seu conhecimento vasto e as ferramentas de pesquisa.
- Seja sempre profissional, científica, inspiradora e didática.
- Responda em Markdown.
`;

  // Map history to Gemini API format and add the latest user message
  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });
    
    return result;
  } catch (error) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};

// Updated signature to include history and align with caller expectations
export const getAssistantResponse = async (
  userMessage: string, 
  history: ChatHistoryItem[], 
  members: Member[], 
  projects: Project[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const membersList = members.map(m => `- ${m.fullName}: ${m.role}`).join('\n');
  const projectsList = projects.map(p => `- ${p.title} (Orientador: ${p.advisor}): ${p.description} [Status: ${p.status}]`).join('\n');

  const SYSTEM_INSTRUCTION = `Você é Iris, IA da LAPIB.
Contexto de Membros:
${membersList}
Contexto de Projetos:
${projectsList}
`;

  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION, 
        tools: [{ googleSearch: {} }] 
      },
    });

    const links: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((c: any) => {
        if (c.web && c.web.uri) {
          links.push({ title: c.web.title || 'Fonte Científica', uri: c.web.uri });
        }
      });
    }

    // Access text property directly
    return { text: response.text || "", links: links };
  } catch (err) {
    console.error("Gemini Error:", err);
    return { text: "Erro ao conectar com as bases científicas.", links: [] };
  }
};
