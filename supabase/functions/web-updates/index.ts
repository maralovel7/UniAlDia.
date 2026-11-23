const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const refreshIntervalMs = 30 * 60 * 1000;
const queries = [
  "Universidad de Sevilla noticias becas ayudas estudiantes",
  "Sevilla TUSSAM metro tranvía incidencias servicio transporte",
  "convocatoria becas MEC erasmus plazos estudiantes España",
];

type TavilyResult = { title?: string; url?: string; content?: string };

type UpdateRow = {
  title: string;
  summary: string | null;
  url: string;
  source_name: string | null;
  category: string | null;
  query: string | null;
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
      Prefer: "resolution=merge-duplicates",
      ...(init.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function sourceName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function categoryForQuery(query: string): string {
  if (/transporte|tussam|metro|tranv/i.test(query)) return "Transporte";
  if (/beca|ayuda|erasmus|convocatoria/i.test(query)) return "Becas y ayudas";
  return "Actualidad";
}

async function searchWeb(query: string): Promise<UpdateRow[]> {
  const apiKey = Deno.env.get("TAVILY_API_KEY");
  if (!apiKey) return [];
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ query, max_results: 6, search_depth: "basic", topic: "general" }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    const results = Array.isArray(data.results) ? (data.results as TavilyResult[]) : [];
    return results
      .filter((item) => typeof item.url === "string" && /^https:\/\//.test(item.url) && typeof item.title === "string" && item.title.trim().length > 0)
      .map((item) => ({
        title: (item.title || "").trim().slice(0, 300),
        summary: (item.content || "").trim().slice(0, 280) || null,
        url: item.url as string,
        source_name: sourceName(item.url as string),
        category: categoryForQuery(query),
        query,
      }));
  } catch {
    return [];
  }
}

async function refreshUpdates(): Promise<void> {
  const found = (await Promise.all(queries.map(searchWeb))).flat();
  const unique = new Map<string, UpdateRow>();
  for (const row of found) {
    if (!unique.has(row.url)) unique.set(row.url, row);
  }
  const rows = [...unique.values()];
  if (rows.length === 0) return;
  await supabaseRequest("web_updates", { method: "POST", body: JSON.stringify(rows) });
  await supabaseRequest("web_updates_meta?id=eq.true", {
    method: "PATCH",
    body: JSON.stringify({ last_refresh_at: new Date().toISOString() }),
  });
}

async function loadUpdates(): Promise<UpdateRow[]> {
  return supabaseRequest<UpdateRow[]>(
    "web_updates?select=title,summary,url,source_name,category,query&order=found_at.desc&limit=24",
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const meta = await supabaseRequest<{ last_refresh_at: string | null }[]>("web_updates_meta?select=last_refresh_at&id=eq.true&limit=1");
    const last = meta[0]?.last_refresh_at ? new Date(meta[0].last_refresh_at).getTime() : 0;
    if (Date.now() - last > refreshIntervalMs) {
      await refreshUpdates();
    }
    const updates = await loadUpdates();
    return new Response(JSON.stringify({ updates }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("web-updates request failed", error);
    try {
      const updates = await loadUpdates();
      return new Response(JSON.stringify({ updates }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch {
      return new Response(JSON.stringify({ error: "No se pudieron cargar las novedades." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }
});
