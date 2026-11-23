const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const refreshIntervalMs = 30 * 60 * 1000;
const queries = [
  "becas ayudas estudiantes universitarios Sevilla MEC erasmus plazo",
  "universidad de Sevilla US UPO Loyola Pablo de Olavide noticias estudiantes",
  "Sevilla transporte TUSSAM metro tranvía cambios afectan estudiantes",
  "Sevilla alquiler pisos habitaciones estudiantes precios vivienda",
  "prácticas empleo estudiantes Sevilla ofertas empresas",
];

// Dominios de medios de comunicación y fuentes oficiales que preferimos mostrar.
const MEDIA_DOMAINS = [
  'abc.es', 'sevilla.abc.es', 'elmundo.es', 'eldiario.es', 'elcorreo.com', 'elperiodico.com',
  'lavanguardia.com', '20minutos.es', 'ideal.es', 'diariosevilla.com', 'lavoz.net',
  'diariodesevilla.es', 'sevillareport.com', 'rtve.es', 'lasexta.com', 'antena3.com',
  'cadenaser.com', 'ondacero.es', 'europapress.es', 'andaluciainformacion.es',
  'elconfidencial.com', 'larazon.es', 'elpais.com', 'sevilla.org', 'tussam.es',
  'us.es', 'upo.es', 'uloyola.es', 'upo.es', 'juntadeandalucia.es',
];

type TavilyResult = { title?: string; url?: string; content?: string; published_date?: string };

type UpdateRow = {
  title: string;
  summary: string | null;
  url: string;
  source_name: string | null;
  category: string | null;
  query: string | null;
  found_at: string | null;
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

function isRecent(title: string, publishedDate?: string): boolean {
  const currentYear = new Date().getFullYear();
  if (publishedDate) {
    const ts = new Date(publishedDate).getTime();
    if (!Number.isNaN(ts)) return Date.now() - ts <= 14 * 24 * 60 * 60 * 1000;
  }
  // Descarta titulares que mencionan un año pasado explícitamente (p. ej. "becas 2024").
  return !/(19|20)\d{2}/.test(title) || title.includes(String(currentYear));
}

function isMediaSource(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return MEDIA_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

async function searchWeb(query: string): Promise<UpdateRow[]> {
  const apiKey = Deno.env.get("TAVILY_API_KEY");
  if (!apiKey) return [];
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        query,
        max_results: 8,
        search_depth: "advanced",
        topic: "news",
        days: 14,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    const results = Array.isArray(data.results) ? (data.results as TavilyResult[]) : [];
    return results
      .filter((item) => typeof item.url === "string" && /^https:\/\//.test(item.url) && typeof item.title === "string" && item.title.trim().length > 0)
      .filter((item) => isRecent(item.title || '', item.published_date))
      .map((item) => ({
        title: (item.title || "").trim().slice(0, 300),
        summary: (item.content || "").trim().slice(0, 280) || null,
        url: item.url as string,
        source_name: sourceName(item.url as string),
        category: categoryForQuery(query),
        query,
        found_at: item.published_date || new Date().toISOString(),
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
  const media = [...unique.values()].filter((row) => row.url && isMediaSource(row.url));
  const rows = (media.length >= 6 ? media : [...media, ...[...unique.values()].filter((row) => !isMediaSource(row.url))]).slice(0, 18);
  if (rows.length === 0) return;
  await supabaseRequest("web_updates", { method: "POST", body: JSON.stringify(rows) });
  await supabaseRequest("web_updates_meta?id=eq.true", {
    method: "PATCH",
    body: JSON.stringify({ last_refresh_at: new Date().toISOString() }),
  });
}

async function loadUpdates(): Promise<UpdateRow[]> {
  return supabaseRequest<UpdateRow[]>(
    "web_updates?select=title,summary,url,source_name,category,query,found_at&order=found_at.desc&limit=24",
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
