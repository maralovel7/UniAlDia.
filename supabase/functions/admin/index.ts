import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import pdfParse from "npm:pdf-parse@1.1.1";
import mammoth from "npm:mammoth@1.8.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};
const adminApiVersion = "2026-11-08";
const allowedMimes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type AdminCredential = { id: boolean; username: string; password_hash: string; must_change_password: boolean };

type KnowledgePayload = { title?: string; content?: string; category?: string; url?: string | null; file_url?: string | null; keywords?: string | null };

type TransitAlertPayload = {
  title?: string;
  body?: string;
  severity?: string;
  mode?: string;
  lines?: string;
  source?: string;
  source_url?: string | null;
  active?: boolean;
  starts_at?: string;
  ends_at?: string | null;
};

const ALERT_SEVERITIES = new Set(["info", "warning", "critical"]);
const ALERT_MODES = new Set(["bus", "metro", "tranvia", "general"]);
const ALERT_SOURCES = new Set(["manual", "ctan", "metro-sevilla", "tussam"]);

function sanitizeAlert(body: TransitAlertPayload): Record<string, unknown> {
  if (!body.title?.trim()) throw new Error("Invalid alert title");
  const clean: Record<string, unknown> = {
    title: body.title.trim().slice(0, 200),
    body: (body.body || "").trim().slice(0, 5000),
    severity: ALERT_SEVERITIES.has(body.severity || "") ? body.severity : "info",
    mode: ALERT_MODES.has(body.mode || "") ? body.mode : "general",
    lines: (body.lines || "").trim().slice(0, 120),
    source: ALERT_SOURCES.has(body.source || "") ? body.source : "manual",
    source_url: body.source_url?.trim() ? body.source_url.trim().slice(0, 500) : null,
    active: body.active !== false,
  };
  if (body.starts_at) clean.starts_at = body.starts_at;
  if (body.ends_at !== undefined) clean.ends_at = body.ends_at ? body.ends_at : null;
  return clean;
}

function config() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Server configuration unavailable");
  return { url, key };
}

async function db<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key, ...(init.headers || {}) },
  });
  if (!response.ok) throw new Error("Database operation failed");
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

function encode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}
function decode(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}
async function digest(bytes: ArrayBuffer): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}
async function hashToken(value: string): Promise<string> {
  return encode(await digest(new TextEncoder().encode(value).buffer));
}
async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16)), iterations = 210000): Promise<string> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, material, 256);
  return `pbkdf2$${iterations}$${encode(salt)}$${encode(new Uint8Array(bits))}`;
}
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, rawIterations, rawSalt, expected] = stored.split("$");
  const iterations = Number(rawIterations);
  if (!iterations || !rawSalt || !expected) return false;
  const actual = await hashPassword(password, decode(rawSalt), iterations);
  return actual === `pbkdf2$${iterations}$${rawSalt}$${expected}`;
}
function newToken(): string {
  return encode(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bearer(req: Request): string | null {
  const value = req.headers.get("Authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : null;
}
async function requireAdmin(req: Request): Promise<void> {
  const token = bearer(req);
  if (!token) throw new Error("UNAUTHORIZED");
  const tokenHash = await hashToken(token);
  const sessions = await db<{ id: string }[]>(`ai_admin_sessions?select=id&token_hash=eq.${encodeURIComponent(tokenHash)}&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1`);
  if (!sessions[0]) throw new Error("UNAUTHORIZED");
}
async function extractText(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  if (file.type === "application/pdf") {
    const result = await pdfParse(new Uint8Array(bytes));
    return result.text;
  }
  const result = await mammoth.extractRawText({ arrayBuffer: bytes });
  return result.value;
}
function chunks(text: string): string[] {
  const normalized = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const result: string[] = [];
  for (let start = 0; start < normalized.length; start += 1050) {
    const part = normalized.slice(start, start + 1200).trim();
    if (part) result.push(part);
  }
  return result;
}
async function embed(text: string): Promise<number[] | null> {
  const key = Deno.env.get("OPENROUTER_API_KEY");
  if (!key) return null;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: "openai/text-embedding-3-small", input: text }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data.data?.[0]?.embedding) ? data.data[0].embedding : null;
  } catch {
    return null;
  }
}
async function uploadFile(path: string, file: File): Promise<void> {
  const { url, key } = config();
  const response = await fetch(`${url}/storage/v1/object/ai-documents/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": file.type, "x-upsert": "false" },
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error("Storage upload failed");
}
async function deleteFile(path: string): Promise<void> {
  const { url, key } = config();
  await fetch(`${url}/storage/v1/object/ai-documents/${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${key}`, apikey: key, "Content-Type": "application/json" } });
}

async function bootstrap(req: Request): Promise<Response> {
  const setupToken = Deno.env.get("ADMIN_SETUP_TOKEN");
  if (!setupToken) return new Response(JSON.stringify({ error: "La inicialización administrativa necesita un secreto de servidor." }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const body = await req.json() as { setupToken?: string; username?: string; password?: string };
  if (body.setupToken !== setupToken || !body.username || !body.password || body.password.length < 12) return new Response(JSON.stringify({ error: "Datos de inicialización no válidos." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const existing = await db<AdminCredential[]>("ai_admin_credentials?select=id&limit=1");
  if (existing[0]) return new Response(JSON.stringify({ error: "La administración ya está inicializada." }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  await db("ai_admin_credentials", { method: "POST", body: JSON.stringify({ username: body.username, password_hash: await hashPassword(body.password), must_change_password: true }) });
  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const path = new URL(req.url).pathname.replace(/^\/functions\/v1\/admin/, "");
    if (path === "/bootstrap" && req.method === "POST") return await bootstrap(req);
    if (path === "/login" && req.method === "POST") {
      const body = await req.json() as { username?: string; password?: string };
      const credentials = await db<AdminCredential[]>(`ai_admin_credentials?select=*&username=eq.${encodeURIComponent(body.username || "")}&limit=1`);
      if (!credentials[0] || !body.password || !(await verifyPassword(body.password, credentials[0].password_hash))) return new Response(JSON.stringify({ error: "Usuario o contraseña incorrectos." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const token = newToken();
      await db("ai_admin_sessions", { method: "POST", body: JSON.stringify({ token_hash: await hashToken(token) }) });
      return new Response(JSON.stringify({ token, mustChangePassword: credentials[0].must_change_password }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    await requireAdmin(req);
    if (path === "/me" && req.method === "GET") {
      const rows = await db<{ username: string; must_change_password: boolean }[]>("ai_admin_credentials?select=username,must_change_password&id=eq.true&limit=1");
      return new Response(JSON.stringify({ username: rows[0]?.username || null, mustChangePassword: rows[0]?.must_change_password === true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/password" && req.method === "PUT") {
      const body = await req.json() as { password?: string };
      if (!body.password || body.password.length < 12) throw new Error("Invalid password");
      const rows = await db<AdminCredential[]>("ai_admin_credentials?select=username&id=eq.true&limit=1");
      if (!rows[0]) throw new Error("Admin is not initialized");
      await db("ai_admin_credentials?id=eq.true", { method: "PATCH", body: JSON.stringify({ password_hash: await hashPassword(body.password), must_change_password: false, updated_at: new Date().toISOString() }) });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/settings" && req.method === "GET") {
      const rows = await db<unknown[]>("agent_settings?select=system_prompt,version,updated_at&id=eq.true&limit=1");
      return new Response(JSON.stringify(rows[0] || null), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/settings" && req.method === "PUT") {
      const body = await req.json() as { system_prompt?: string };
      if (!body.system_prompt || body.system_prompt.length > 50000) throw new Error("Invalid prompt");
      await db("agent_settings?id=eq.true", { method: "PATCH", body: JSON.stringify({ system_prompt: body.system_prompt, version: 1, updated_at: new Date().toISOString() }) });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/knowledge" && req.method === "GET") {
      const rows = await db("knowledge_entries?select=*&order=updated_at.desc&limit=200");
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/knowledge" && req.method === "POST") {
      const body = await req.json() as KnowledgePayload;
      if (!body.title?.trim() || !body.content?.trim()) throw new Error("Invalid knowledge entry");
      const rows = await db("knowledge_entries", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ ...body, title: body.title.trim(), content: body.content.trim() }) });
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path.startsWith("/knowledge/") && req.method === "PUT") {
      const body = await req.json() as KnowledgePayload;
      const id = path.split("/").pop() || "";
      if (!body.title?.trim() || !body.content?.trim()) throw new Error("Invalid knowledge entry");
      await db(`knowledge_entries?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...body, title: body.title.trim(), content: body.content.trim(), updated_at: new Date().toISOString() }) });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path.startsWith("/knowledge/") && req.method === "DELETE") {
      await db(`knowledge_entries?id=eq.${encodeURIComponent(path.split("/").pop() || "")}`, { method: "DELETE" });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/documents" && req.method === "GET") {
      const rows = await db("ai_documents?select=id,filename,mime_type,file_size,status,error_message,created_at,processed_at&order=created_at.desc");
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/documents" && req.method === "POST") {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File) || !allowedMimes.has(file.type) || file.size < 1 || file.size > 10485760) throw new Error("El documento debe ser PDF o DOCX y pesar como máximo 10 MB.");
      const id = crypto.randomUUID();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
      const storagePath = `${id}/${safeName}`;
      await uploadFile(storagePath, file);
      await db("ai_documents", { method: "POST", body: JSON.stringify({ id, filename: file.name, storage_path: storagePath, mime_type: file.type, file_size: file.size, status: "processing" }) });
      try {
        const text = await extractText(file);
        const parts = chunks(text);
        for (let index = 0; index < parts.length; index += 1) {
          const embedding = await embed(parts[index]);
          await db("ai_document_chunks", { method: "POST", body: JSON.stringify({ document_id: id, chunk_index: index, content: parts[index], embedding: embedding ? `[${embedding.join(",")}]` : null }) });
        }
        await db(`ai_documents?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: "completed", processed_at: new Date().toISOString(), error_message: null }) });
      } catch (error) {
        console.error("document processing failed", error);
        await db(`ai_documents?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status: "error", error_message: "No se pudo procesar el documento." }) });
      }
      return new Response(JSON.stringify({ id, status: "completed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path.startsWith("/documents/") && req.method === "DELETE") {
      const id = path.split("/").pop() || "";
      const rows = await db<{ storage_path: string }[]>(`ai_documents?select=storage_path&id=eq.${encodeURIComponent(id)}&limit=1`);
      if (rows[0]) await deleteFile(rows[0].storage_path);
      await db(`ai_documents?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/alerts" && req.method === "GET") {
      const rows = await db("transit_alerts?select=*&order=active.desc,starts_at.desc&limit=200");
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path === "/alerts" && req.method === "POST") {
      const body = await req.json() as TransitAlertPayload;
      const clean = sanitizeAlert(body);
      const rows = await db("transit_alerts", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(clean) });
      return new Response(JSON.stringify(rows), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path.startsWith("/alerts/") && req.method === "PUT") {
      const id = path.split("/").pop() || "";
      const body = await req.json() as TransitAlertPayload;
      const clean = sanitizeAlert(body);
      await db(`transit_alerts?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ ...clean, updated_at: new Date().toISOString() }) });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (path.startsWith("/alerts/") && req.method === "DELETE") {
      await db(`transit_alerts?id=eq.${encodeURIComponent(path.split("/").pop() || "")}`, { method: "DELETE" });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "Ruta no encontrada." }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("admin request failed", error);
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 400;
    return new Response(JSON.stringify({ error: status === 401 ? "Sesión administrativa no válida." : "No se pudo completar la operación." }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
