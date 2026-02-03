
import { GoogleGenAI } from "@google/genai";
import { LEAGUE_INFO } from "./constants";
import { Member, Project } from "./types";

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

export const getAssistantResponseStream = async (
  userMessage: string, 
  history: ChatHistoryItem[], 
  members: Member[], 
  projects: Project[]
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const membersList = members.map(m => `- ${m.fullName}: ${m.role}`).join('\n');
  const projectsList = projects.map(p => `- ${p.title} (Orientador: ${p.advisor}): ${p.description}`).join('\n');

  const SYSTEM_INSTRUCTION = `
Você é a "Iris", assistente inteligente oficial da ${LEAGUE_INFO.name} (${LEAGUE_INFO.acronym}) da Estácio GO.
Sua missão é dar suporte total aos acadêmicos em estudos de Biomedicina, Patologia e Inovação.

DIRETRIZES:
1. EDUCAÇÃO: Ajude em dúvidas de provas, bioquímica, hematologia, etc. Resolva problemas complexos passo a passo.
2. CONTEXTO LAPIB: Use os dados abaixo sobre nossos membros e projetos se perguntarem sobre a liga.
3. PESQUISA: Use a ferramenta Google Search para fatos atualizados ou artigos científicos.
4. ESTILO: Responda em Markdown, com tom profissional, encorajador e científico.

MEMBROS ATIVOS:
${membersList || "Nenhum membro listado."}

PROJETOS CIENTÍFICOS:
${projectsList || "Nenhum projeto listado."}
`;

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
    console.error("Gemini Error:", error);
    throw error;
  }
};
