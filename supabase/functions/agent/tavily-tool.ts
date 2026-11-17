import { tool } from "npm:@langchain/core@0.3.58/tools";
import { z } from "npm:zod@3.24.1";

/**
 * Tool: Búsqueda en internet con la API de Tavily.
 *
 * El agente usa esta herramienta para consultar información actual
 * en la web. La clave API vive en el servidor (variable de entorno
 * TAVILY_API_KEY), así que nunca se filtra al navegador.
 */
export const tavilySearchTool = tool(
  async ({ query, maxResults }) => {
    const apiKey = Deno.env.get("TAVILY_API_KEY");
    if (!apiKey) {
      return "Error: no se encontró la clave de Tavily en el servidor.";
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: "basic",
        include_answer: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return `Error en la búsqueda de Tavily (${response.status}): ${errorText}`;
    }

    const data = await response.json();

    // Construir un texto legible con la respuesta y los resultados
    let result = "";
    if (data.answer) {
      result += `Respuesta: ${data.answer}\n\n`;
    }
    if (data.results && Array.isArray(data.results)) {
      result += "Resultados:\n";
      for (const item of data.results) {
        result += `- ${item.title || "Sin título"}\n  ${item.url || ""}\n  ${item.content || ""}\n\n`;
      }
    }
    return result || "No se encontraron resultados.";
  },
  {
    name: "tavily_search",
    description:
      "Busca información actual en internet. Úsala cuando necesites datos recientes como noticias, precios, fechas, eventos, requisitos o cualquier información que pueda haber cambiado.",
    schema: z.object({
      query: z.string().describe("La consulta de búsqueda"),
      maxResults: z
        .number()
        .optional()
        .describe("Número máximo de resultados (por defecto 5)"),
    }),
  },
);
