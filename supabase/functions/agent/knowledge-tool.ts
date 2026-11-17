import { tool } from "npm:@langchain/core@0.3.58/tools";
import { z } from "npm:zod@3.24.1";

/**
 * Tool: Búsqueda en la base de conocimiento local (Supabase).
 *
 * El agente busca primero aquí, en los datos que el administrador
 * ha guardado (horarios, requisitos, guías, enlaces a PDFs, etc.).
 * Solo si no encuentra nada relevante recurre a la búsqueda en internet.
 */
export const knowledgeSearchTool = tool(
  async ({ query }) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return "Error: no se pudo acceder a la base de conocimiento.";
    }

    // Buscar por similitud de texto en title, keywords y content
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/search_knowledge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({ search_query: query, max_rows: 5 }),
      },
    );

    if (!response.ok) {
      // Fallback: búsqueda simple por ilike en title y keywords
      const fallbackUrl =
        `${supabaseUrl}/rest/v1/knowledge_entries?select=title,content,category,url,file_url,keywords` +
        `&or=(title.ilike.%${encodeURIComponent(query)}%,keywords.ilike.%${encodeURIComponent(query)}%,content.ilike.%${encodeURIComponent(query)}%)&limit=5`;

      const fbResponse = await fetch(fallbackUrl, {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      });

      if (!fbResponse.ok) {
        return "No se pudo buscar en la base de conocimiento.";
      }

      const fbData = await fbResponse.json();
      if (!Array.isArray(fbData) || fbData.length === 0) {
        return "No se encontró información local sobre ese tema.";
      }
      return formatResults(fbData);
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return "No se encontró información local sobre ese tema.";
    }
    return formatResults(data);
  },
  {
    name: "knowledge_search",
    description:
      "Busca en la base de conocimiento local de UniAlDía (horarios de transporte, guías de vivienda, requisitos de becas, información de la universidad, etc.). Úsala SIEMPRE ANTES de buscar en internet — la información local es más fiable y rápida.",
    schema: z.object({
      query: z
        .string()
        .describe("Términos de búsqueda: el tema o pregunta del usuario"),
    }),
  },
);

function formatResults(
  rows: {
    title: string;
    content: string;
    category?: string;
    url?: string | null;
    file_url?: string | null;
    keywords?: string | null;
  }[],
): string {
  let result = `Se encontraron ${rows.length} entrada(s) en la base de conocimiento:\n\n`;
  for (const row of rows) {
    result += `### ${row.title}\n`;
    result += `Categoría: ${row.category || "General"}\n`;
    result += `Contenido: ${row.content}\n`;
    if (row.url) {
      result += `Enlace: ${row.url}\n`;
    }
    if (row.file_url) {
      result += `Archivo (PDF/imagen): ${row.file_url}\n`;
    }
    result += `\n`;
  }
  return result;
}
