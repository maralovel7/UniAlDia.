import { ChatOpenAI } from "npm:@langchain/openai@0.6.9";
import { AIMessage, HumanMessage, SystemMessage } from "npm:@langchain/core@0.3.58/messages";

import { AGENT_SYSTEM_PROMPT } from "./prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const maxMessageLength = 8000;
const agentSourceVersion = "2026-11-08";

type ChatMessage = { role: "user" | "assistant"; content: string };

type KnowledgeRow = {
  title: string;
  content: string;
  category?: string;
  url?: string | null;
  file_url?: string | null;
};

type DocumentRow = {
  content: string;
  source_page: number | null;
  filename: string;
  storage_path: string;
};

function getSupabaseConfig() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("El servicio de datos no está disponible.");
  return { url, key };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      apikey: key,
      ...(init.headers || {}),
    },
  });
  if (!response.ok) throw new Error("No se pudo consultar el servicio de datos.");
  return response.json() as Promise<T>;
}

async function hashToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function ensureSession(sessionToken: string | undefined): Promise<{ token: string; id: string }> {
  const token = sessionToken && /^[A-Za-z0-9_-]{32,64}$/.test(sessionToken) ? sessionToken : createSessionToken();
  const tokenHash = await hashToken(token);
  const existing = await supabaseRequest<{ id: string; expires_at: string }[]>(
    `chat_sessions?select=id,expires_at&token_hash=eq.${tokenHash}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1`,
  );
  if (existing[0]) {
    await supabaseRequest(`chat_sessions?id=eq.${existing[0].id}`, {
      method: "PATCH",
      body: JSON.stringify({ updated_at: new Date().toISOString() }),
    });
    return { token, id: existing[0].id };
  }
  const created = await supabaseRequest<{ id: string }[]>("chat_sessions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ token_hash: tokenHash }),
  });
  if (!created[0]) throw new Error("No se pudo iniciar la conversación.");
  return { token, id: created[0].id };
}

async function loadHistory(sessionId: string): Promise<ChatMessage[]> {
  const rows = await supabaseRequest<ChatMessage[]>(
    `chat_messages?select=role,content&session_id=eq.${sessionId}&order=created_at.desc&limit=12`,
  );
  return rows.reverse();
}

async function saveMessage(sessionId: string, message: ChatMessage): Promise<void> {
  await supabaseRequest("chat_messages", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, role: message.role, content: message.content }),
  });
}

async function loadSystemPrompt(): Promise<string> {
  try {
    const rows = await supabaseRequest<{ system_prompt: string }[]>("agent_settings?select=system_prompt&id=eq.true&limit=1");
    return rows[0]?.system_prompt || AGENT_SYSTEM_PROMPT;
  } catch {
    return AGENT_SYSTEM_PROMPT;
  }
}

async function searchKnowledge(query: string): Promise<string | null> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/rpc/search_knowledge`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({ search_query: query, max_rows: 5 }),
  });
  if (!response.ok) return null;
  const rows = await response.json() as KnowledgeRow[];
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows.map((row) => [
    `### ${row.title}`,
    `Categoría: ${row.category || "General"}`,
    row.content,
    row.url ? `Fuente web: ${row.url}` : "",
    row.file_url ? `Archivo: ${row.file_url}` : "",
  ].filter(Boolean).join("\n")).join("\n\n");
}

async function createEmbedding(text: string): Promise<number[] | null> {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) return null;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "openai/text-embedding-3-small", input: text }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data.data?.[0]?.embedding) ? data.data[0].embedding : null;
  } catch {
    return null;
  }
}

async function searchDocuments(query: string): Promise<string | null> {
  const { url, key } = getSupabaseConfig();
  const embedding = await createEmbedding(query);
  if (embedding) {
    const semanticResponse = await fetch(`${url}/rest/v1/rpc/match_document_chunks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
      body: JSON.stringify({ query_embedding: `[${embedding.join(",")}]`, match_count: 8 }),
    });
    if (semanticResponse.ok) {
      const semanticRows = await semanticResponse.json() as DocumentRow[];
      if (Array.isArray(semanticRows) && semanticRows.length > 0) {
        return semanticRows.map((row) => `### Documento: ${row.filename}${row.source_page ? ` · página ${row.source_page}` : ""}\n${row.content}`).join("\n\n");
      }
    }
  }
  const response = await fetch(`${url}/rest/v1/rpc/search_document_chunks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({ search_query: query, max_rows: 8 }),
  });
  if (!response.ok) return null;
  const rows = await response.json() as DocumentRow[];
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows.map((row) => `### Documento: ${row.filename}${row.source_page ? ` · página ${row.source_page}` : ""}\n${row.content}`).join("\n\n");
}

function needsCurrentSources(query: string): boolean {
  return /ahora|actual|hoy|reciente|últim|noticia|evento|precio|tarifa|horario|incidencia|retras|corte|línea|autobús|bus|metro|tussam|consorcio|transporte|beca|plazo|convocatoria|fecha/i.test(query);
}

function needsTransportApi(query: string): boolean {
  return /tussam|autobús|bus|metro|consorcio|transporte|parada|línea|llegada|próximo tren|incidencia/i.test(query);
}

async function searchOfficialTransport(query: string): Promise<string | null> {
  if (!needsTransportApi(query)) return null;
  const apiKey = Deno.env.get("APIKEYCONSORCIO");
  if (!apiKey) return "La API oficial de transporte no está configurada en el servidor.";

  try {
    const response = await fetch("https://api.ctan.es/v1/Consorcios/1/paradas/", {
      headers: { Accept: "application/json", Authorization: `Bearer ${apiKey}`, apikey: apiKey, "X-Api-Key": apiKey },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return `La API oficial del Consorcio no respondió (${response.status}).`;
    const data: unknown = await response.json();
    const text = JSON.stringify(data);
    const terms = query.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length > 2);
    const matches = Array.isArray(data)
      ? data.filter((item: unknown) => terms.some((term) => JSON.stringify(item).toLocaleLowerCase().includes(term))).slice(0, 8)
      : [];
    return [
      "DATOS DIRECTOS DE LA API OFICIAL CTAN (Área de Sevilla):",
      matches.length > 0 ? JSON.stringify(matches) : text.slice(0, 5000),
      "La API CTAN ofrece datos de red, paradas, horarios, noticias e incidencias del transporte metropolitano. No conviertas estos datos programados en una predicción de llegada en tiempo real si la respuesta no incluye esa información.",
      "Fuente: https://api.ctan.es",
    ].join("\n");
  } catch {
    return "No se pudo consultar la API oficial de transporte en este momento.";
  }
}

async function searchMetroOfficial(query: string): Promise<string | null> {
  if (!/metro|próximo tren|estación/i.test(query)) return null;
  try {
    const response = await fetch("https://www.metro-sevilla.es/proximos", { signal: AbortSignal.timeout(10000) });
    const html = await response.text();
    const visibleText = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return [
      "PORTAL OFICIAL DE METRO DE SEVILLA:",
      visibleText.slice(0, 6000) || "El portal no devolvió datos visibles en esta consulta.",
      "La página oficial permite consultar los próximos trenes seleccionando una estación. No se ha encontrado un endpoint público documentado para convertirla en una API de llegadas.",
      "Fuente: https://www.metro-sevilla.es/proximos",
    ].join("\n");
  } catch {
    return "No se pudo consultar el portal oficial de Metro de Sevilla en este momento.";
  }
}

async function loadActiveAlerts(query: string): Promise<string | null> {
  if (!needsTransportApi(query)) return null;
  const { url, key } = getSupabaseConfig();
  try {
    const response = await fetch(`${url}/rest/v1/transit_alerts?select=title,body,severity,mode,lines,source_url,starts_at,ends_at&active=eq.true&order=starts_at.desc&limit=10`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const rows = await response.json() as { title: string; body: string; severity: string; mode: string; lines: string; source_url: string | null; starts_at: string; ends_at: string | null }[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const formatted = rows.map((row, index) => [
      `Aviso ${index + 1} [${row.severity}] (${row.mode === "bus" ? "Bus" : row.mode === "metro" ? "Metro" : row.mode === "tranvia" ? "Tranvía" : "General"})${row.lines ? ` · Líneas: ${row.lines}` : ""}`,
      row.title,
      row.body,
      row.source_url ? `Fuente: ${row.source_url}` : "",
    ].filter(Boolean).join("\n")).join("\n\n");
    return `AVISOS DE TRANSPORTE ACTIVOS (gestionados por el equipo, prioritarios):\n${formatted}`;
  } catch {
    return null;
  }
}

function sourceQuery(query: string): string {
  if (/tussam|autobús|bus/i.test(query)) return `${query} site:tussam.es OR site:sevilla.org`;
  if (/metro/i.test(query)) return `${query} site:metro-sevilla.es OR site:metrodesevilla.org`;
  if (/consorcio|tarifa|transporte metropolitano/i.test(query)) return `${query} site:ctas.es`;
  if (/universidad|beca|erasmus|sicue|facultad/i.test(query)) return `${query} site:us.es OR site:juntadeandalucia.es OR site:boe.es`;
  return query;
}

async function searchInternet(query: string): Promise<string | null> {
  const apiKey = Deno.env.get("TAVILY_API_KEY");
  if (!apiKey) return null;
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query: sourceQuery(query), max_results: 5, search_depth: "advanced", include_answer: true, include_domains: ["tussam.es", "metro-sevilla.es", "ctas.es", "us.es", "juntadeandalucia.es", "boe.es"] }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    const answer = typeof data.answer === "string" ? `Respuesta de internet (contrástala con la fuente): ${data.answer}\n\n` : "";
    const formatted = results.map((item: { title?: string; url?: string; content?: string }) => `- ${item.title || "Resultado"}\n  Fuente oficial o web: ${item.url || ""}\n  ${(item.content || "").slice(0, 700)}`).join("\n");
    return answer + formatted || null;
  } catch {
    return null;
  }
}

function createModel() {
  return new ChatOpenAI({
    model: "openrouter/free",
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: Deno.env.get("OPENROUTER_API_KEY") ?? "",
      defaultHeaders: { "HTTP-Referer": "https://unialdia.app", "X-Title": `UniAlDía ${agentSourceVersion}` },
    },
    temperature: 0.5,
    maxRetries: 2,
  });
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part: { text?: string }) => part.text || "").join("").trim();
  return "";
}

async function runAgent(message: string, history: ChatMessage[]): Promise<string> {
  const contextQuery = [...history.filter((item) => item.role === "user").slice(-3).map((item) => item.content), message].join("\n");
  const [knowledge, documents, transportApi, metroPortal, activeAlerts] = await Promise.all([
    searchKnowledge(contextQuery),
    searchDocuments(contextQuery),
    searchOfficialTransport(contextQuery),
    searchMetroOfficial(contextQuery),
    loadActiveAlerts(contextQuery),
  ]);
  const internet = needsCurrentSources(contextQuery) ? await searchInternet(contextQuery) : null;
  const context = [activeAlerts, knowledge && `BASE DE CONOCIMIENTO PROPIA:\n${knowledge}`, documents && `DOCUMENTOS RAG DEL EQUIPO:\n${documents}`, transportApi, metroPortal, internet && `FUENTES EXTERNAS ACTUALIZADAS:\n${internet}`].filter(Boolean).join("\n\n---\n\n") || "No se encontró información verificada. Indícalo claramente y no inventes datos.";
  const systemPrompt = await loadSystemPrompt();
  const response = await createModel().invoke([
    new SystemMessage(`${systemPrompt}\n\nCLASIFICACIÓN Y FUENTES:\n- Decide si la consulta necesita información propia, documentos RAG, fuentes externas o una combinación.\n- Para transporte, horarios, incidencias, precios, convocatorias y noticias, prioriza la información externa más reciente cuando exista.\n- Para procedimientos internos y documentación subida por el equipo, prioriza el RAG.\n- Si las fuentes se contradicen, indícalo y prioriza la fuente oficial más reciente.\n- Si el CONTEXTO incluye una sección "AVISOS DE TRANSPORTE ACTIVOS", esa información es prioritaria y la has de mencionar primero cuando la pregunta sea sobre transporte, incidencias o servicio. Son avisos verificados por el equipo.\n\nCONTEXTO RECUPERADO:\n${context}\n\nNo afirmes que tienes datos en tiempo real si las fuentes no los ofrecen. Cita los enlaces disponibles y explica con claridad qué dato no se ha podido verificar.`),
    ...history.slice(-10).map((item) => item.role === "user" ? new HumanMessage(item.content) : new AIMessage(item.content)),
    new HumanMessage(message),
  ]);
  return contentToText(response.content) || "No pude generar una respuesta útil. Inténtalo de nuevo.";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const body = await req.json() as { message?: unknown; sessionToken?: unknown };
    if (typeof body.message !== "string" || body.message.trim().length === 0 || body.message.length > maxMessageLength) {
      return new Response(JSON.stringify({ error: "La pregunta no es válida." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const session = await ensureSession(typeof body.sessionToken === "string" ? body.sessionToken : undefined);
    const history = await loadHistory(session.id);
    const userMessage: ChatMessage = { role: "user", content: body.message.trim() };
    await saveMessage(session.id, userMessage);
    const answer = await runAgent(userMessage.content, history);
    await saveMessage(session.id, { role: "assistant", content: answer });
    return new Response(JSON.stringify({ response: answer, sessionToken: session.token }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("agent request failed", error);
    return new Response(JSON.stringify({ error: "No se pudo completar la respuesta." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
