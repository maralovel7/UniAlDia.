import { useEffect, useState } from 'react';
import { Bot, Database, FileText, KeyRound, LogOut, Plus, Save, Send, Settings, Trash2, TriangleAlert, Upload, X } from 'lucide-react';

type Tab = 'prompt' | 'knowledge' | 'documents' | 'alerts' | 'test';
type KnowledgeEntry = { id?: string; title: string; content: string; category: string; url: string | null; file_url: string | null; keywords: string | null };
type DocumentRow = { id: string; filename: string; status: string; file_size: number; error_message: string | null; created_at: string };
type TransitAlert = {
  id?: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  mode: 'bus' | 'metro' | 'tranvia' | 'general';
  lines: string;
  source: 'manual' | 'ctan' | 'metro-sevilla' | 'tussam';
  source_url: string | null;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at?: string;
};

type ApiOptions = { method?: string; body?: BodyInit; contentType?: boolean };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://72207947.supabase.co';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const apiBase = `${supabaseUrl}/functions/v1/admin`;
const agentUrl = `${supabaseUrl}/functions/v1/agent`;

async function api<T>(path: string, token: string | null, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token || ''}` };
  if (options.contentType !== false) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${apiBase}${path}`, { method: options.method || 'GET', headers, body: options.body });
  const data = await response.json().catch(() => null) as { error?: string } & T;
  if (!response.ok) throw new Error(data?.error || 'No se pudo completar la operación.');
  return data;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('unialdia-admin-token'));
  const [mustChange, setMustChange] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('prompt');
  const [prompt, setPrompt] = useState('');
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [alerts, setAlerts] = useState<TransitAlert[]>([]);
  const [editingAlert, setEditingAlert] = useState<TransitAlert | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>([]);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeEntry | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testAnswer, setTestAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const loadAdminData = async (adminToken: string) => {
    const account = await api<{ mustChangePassword: boolean }>('/me', adminToken);
    setMustChange(account.mustChangePassword);
    if (account.mustChangePassword) return;
    const settings = await api<{ system_prompt: string }>('/settings', adminToken);
    setPrompt(settings.system_prompt);
    const rows = await api<DocumentRow[]>('/documents', adminToken);
    setDocuments(rows);
    setAlerts(await api<TransitAlert[]>('/alerts', adminToken));
    setKnowledge(await api<KnowledgeEntry[]>('/knowledge', adminToken));
  };

  useEffect(() => {
    if (token) void loadAdminData(token).catch(() => setToken(null));
  }, [token]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setLoginError('');
    try {
      const data = await api<{ token: string; mustChangePassword: boolean }>('/login', null, { method: 'POST', body: JSON.stringify({ username, password }) });
      sessionStorage.setItem('unialdia-admin-token', data.token);
      setToken(data.token);
      setMustChange(data.mustChangePassword);
      setPassword('');
    } catch {
      setLoginError('Usuario o contraseña incorrectos.');
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || newPassword.length < 12) return;
    setBusy(true);
    try {
      await api('/password', token, { method: 'PUT', body: JSON.stringify({ password: newPassword }) });
      setMustChange(false);
      setNewPassword('');
      setNotice('Contraseña actualizada.');
    } catch {
      setNotice('No se pudo cambiar la contraseña.');
    } finally {
      setBusy(false);
    }
  };

  const savePrompt = async () => {
    if (!token) return;
    setBusy(true);
    try {
      await api('/settings', token, { method: 'PUT', body: JSON.stringify({ system_prompt: prompt }) });
      setNotice('Las instrucciones se han guardado y ya se aplican al agente.');
    } catch {
      setNotice('No se pudieron guardar las instrucciones.');
    } finally {
      setBusy(false);
    }
  };

  const saveKnowledge = async () => {
    if (!token || !editingKnowledge?.title.trim() || !editingKnowledge.content.trim()) return;
    setBusy(true);
    try {
      await api(editingKnowledge.id ? `/knowledge/${editingKnowledge.id}` : '/knowledge', token, { method: editingKnowledge.id ? 'PUT' : 'POST', body: JSON.stringify(editingKnowledge) });
      setKnowledge(await api<KnowledgeEntry[]>('/knowledge', token));
      setEditingKnowledge(null);
      setNotice('Entrada guardada.');
    } catch {
      setNotice('No se pudo guardar la entrada.');
    } finally {
      setBusy(false);
    }
  };

  const deleteKnowledge = async (id: string) => {
    if (!token || !window.confirm('¿Eliminar esta entrada?')) return;
    setBusy(true);
    try {
      await api(`/knowledge/${id}`, token, { method: 'DELETE' });
      setKnowledge((current) => current.filter((entry) => entry.id !== id));
    } catch {
      setNotice('No se pudo eliminar la entrada.');
    } finally {
      setBusy(false);
    }
  };

  const saveAlert = async () => {
    if (!token || !editingAlert?.title.trim()) return;
    setBusy(true);
    try {
      await api(editingAlert.id ? `/alerts/${editingAlert.id}` : '/alerts', token, { method: editingAlert.id ? 'PUT' : 'POST', body: JSON.stringify(editingAlert) });
      setAlerts(await api<TransitAlert[]>('/alerts', token));
      setEditingAlert(null);
      setNotice('Aviso guardado.');
    } catch {
      setNotice('No se pudo guardar el aviso.');
    } finally {
      setBusy(false);
    }
  };

  const toggleAlert = async (alert: TransitAlert) => {
    if (!token || !alert.id) return;
    setBusy(true);
    try {
      await api(`/alerts/${alert.id}`, token, { method: 'PUT', body: JSON.stringify({ ...alert, active: !alert.active }) });
      setAlerts(await api<TransitAlert[]>('/alerts', token));
    } catch {
      setNotice('No se pudo actualizar el aviso.');
    } finally {
      setBusy(false);
    }
  };

  const deleteAlert = async (id: string) => {
    if (!token || !window.confirm('¿Eliminar este aviso de transporte?')) return;
    setBusy(true);
    try {
      await api(`/alerts/${id}`, token, { method: 'DELETE' });
      setAlerts((current) => current.filter((alert) => alert.id !== id));
    } catch {
      setNotice('No se pudo eliminar el aviso.');
    } finally {
      setBusy(false);
    }
  };

  const uploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;
    setBusy(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await api('/documents', token, { method: 'POST', body: form, contentType: false });
      setDocuments(await api<DocumentRow[]>('/documents', token));
      setNotice('Documento procesado y añadido al conocimiento del agente.');
    } catch {
      setNotice('No se pudo procesar el documento. Usa un PDF o DOCX de hasta 10 MB.');
    } finally {
      event.target.value = '';
      setBusy(false);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!token || !window.confirm('¿Eliminar este documento y sus fragmentos?')) return;
    setBusy(true);
    try {
      await api(`/documents/${id}`, token, { method: 'DELETE' });
      setDocuments((current) => current.filter((document) => document.id !== id));
    } catch {
      setNotice('No se pudo eliminar el documento.');
    } finally {
      setBusy(false);
    }
  };

  const runTest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!testInput.trim()) return;
    setBusy(true);
    setTestAnswer('');
    try {
      const response = await fetch(agentUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}) }, body: JSON.stringify({ message: testInput }) });
      const data = await response.json() as { response?: string };
      if (!response.ok || !data.response) throw new Error();
      setTestAnswer(data.response);
    } catch {
      setTestAnswer('No se pudo ejecutar la prueba.');
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('unialdia-admin-token');
    setToken(null);
  };

  if (!token) return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-navy">
      <form onSubmit={login} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-coral"><KeyRound size={21} /></span><div><p className="font-display text-xl font-bold">UniAlDía Admin</p><p className="text-sm text-navy/55">Acceso privado del agente</p></div></div>
        <label className="mb-2 block text-sm font-bold">Usuario<input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 outline-none focus:border-coral" required /></label>
        <label className="mb-5 block text-sm font-bold">Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-navy/15 px-4 py-3 outline-none focus:border-coral" required /></label>
        {loginError && <p className="mb-4 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">{loginError}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-navy px-4 py-3 font-bold text-cream transition hover:bg-coral hover:text-navy disabled:opacity-50">{busy ? 'Comprobando…' : 'Entrar'}</button>
      </form>
    </main>
  );

  if (mustChange) return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-navy">
      <form onSubmit={changePassword} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"><KeyRound className="mb-4 text-coral" size={30} /><h1 className="font-display text-2xl font-bold">Cambia la contraseña provisional</h1><p className="my-4 text-sm leading-relaxed text-navy/60">Debes establecer una contraseña nueva de al menos 12 caracteres antes de acceder al panel.</p><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={12} placeholder="Nueva contraseña" className="mb-4 w-full rounded-xl border border-navy/15 px-4 py-3 outline-none focus:border-coral" required /><button disabled={busy} className="w-full rounded-xl bg-coral px-4 py-3 font-bold text-navy disabled:opacity-50">Guardar contraseña</button></form>
    </main>
  );

  return (
    <main className="min-h-screen bg-cream text-navy">
      <header className="bg-navy px-5 py-5 text-cream sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-coral text-navy"><Bot size={21} /></span><div><h1 className="font-display text-xl font-bold">Panel de inteligencia artificial</h1><p className="text-xs text-cream/55">UniAlDía · administración privada</p></div></div><button onClick={logout} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-cream/70 transition hover:bg-cream/10 hover:text-cream"><LogOut size={16} /> Salir</button></div></header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav className="mb-6 flex flex-wrap gap-2">{([['prompt', 'Instrucciones', Settings], ['knowledge', 'Conocimiento', Database], ['documents', 'Documentos', FileText], ['alerts', 'Avisos transporte', TriangleAlert], ['test', 'Probar agente', Bot]] as const).map(([value, label, Icon]) => <button key={value} onClick={() => setTab(value)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${tab === value ? 'bg-navy text-cream' : 'bg-white text-navy hover:bg-coral'}`}><Icon size={16} />{label}</button>)}</nav>
        {notice && <div className="mb-5 flex items-center justify-between rounded-xl bg-coral/15 px-4 py-3 text-sm font-bold"><span>{notice}</span><button onClick={() => setNotice('')}><X size={16} /></button></div>}
        {tab === 'prompt' && <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">Instrucciones del agente</h2><p className="mt-1 text-sm text-navy/55">El siguiente mensaje se aplicará a las nuevas conversaciones.</p></div><button onClick={() => void savePrompt()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-3 text-sm font-extrabold disabled:opacity-50"><Save size={17} />Guardar</button></div><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={24} className="w-full rounded-2xl border border-navy/15 bg-cream/30 p-4 font-mono text-sm leading-relaxed outline-none focus:border-coral" /></section>}
        {tab === 'knowledge' && <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">Base de conocimiento</h2><p className="mt-1 text-sm text-navy/55">Entradas rápidas para horarios, guías, enlaces y datos públicos.</p></div><button onClick={() => setEditingKnowledge({ title: '', content: '', category: 'General', url: '', file_url: '', keywords: '' })} className="inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-3 text-sm font-extrabold"><Plus size={17} />Nueva entrada</button></div>{editingKnowledge && <div className="mb-6 grid gap-3 rounded-2xl bg-cream/50 p-4"><input value={editingKnowledge.title} onChange={(event) => setEditingKnowledge({ ...editingKnowledge, title: event.target.value })} placeholder="Título" className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><select value={editingKnowledge.category} onChange={(event) => setEditingKnowledge({ ...editingKnowledge, category: event.target.value })} className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral"><option>General</option><option>Transporte</option><option>Becas</option><option>Universidad</option><option>Vivienda</option><option>Empleo</option><option>Ocio</option></select><textarea value={editingKnowledge.content} onChange={(event) => setEditingKnowledge({ ...editingKnowledge, content: event.target.value })} placeholder="Contenido" rows={8} className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><input value={editingKnowledge.url || ''} onChange={(event) => setEditingKnowledge({ ...editingKnowledge, url: event.target.value })} placeholder="Enlace web opcional" className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><input value={editingKnowledge.keywords || ''} onChange={(event) => setEditingKnowledge({ ...editingKnowledge, keywords: event.target.value })} placeholder="Palabras clave" className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><div className="flex gap-2"><button onClick={() => void saveKnowledge()} disabled={busy} className="rounded-xl bg-coral px-4 py-2.5 font-bold disabled:opacity-50"><Save size={16} className="mr-2 inline" />Guardar</button><button onClick={() => setEditingKnowledge(null)} className="rounded-xl border border-navy/15 px-4 py-2.5 font-bold">Cancelar</button></div></div>}<div className="space-y-3">{knowledge.map((entry) => <div key={entry.id} className="flex items-start justify-between gap-4 rounded-2xl border border-navy/10 p-4"><div><span className="rounded-md bg-navy px-2 py-1 text-[10px] font-bold uppercase text-cream">{entry.category}</span><h3 className="mt-2 font-bold">{entry.title}</h3><p className="mt-1 line-clamp-2 text-sm text-navy/55">{entry.content}</p></div><div className="flex shrink-0 gap-1"><button onClick={() => setEditingKnowledge(entry)} className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-cream">Editar</button><button onClick={() => entry.id && void deleteKnowledge(entry.id)} className="rounded-lg p-2 hover:bg-coral"><Trash2 size={16} /></button></div></div>)}</div></section>}
        {tab === 'documents' && <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">Documentos y conocimiento</h2><p className="mt-1 text-sm text-navy/55">PDF y DOCX · máximo 10 MB · se extraen, fragmentan y buscan desde el agente.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-coral px-4 py-3 text-sm font-extrabold"><Upload size={17} />Subir documento<input type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" onChange={uploadDocument} className="hidden" disabled={busy} /></label></div><div className="space-y-3">{documents.length === 0 && <p className="rounded-xl bg-cream/50 p-5 text-sm text-navy/55">Todavía no hay documentos.</p>}{documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-4 rounded-2xl border border-navy/10 p-4"><div className="flex min-w-0 items-center gap-3"><FileText className="flex-shrink-0 text-coral" size={20} /><div className="min-w-0"><p className="truncate font-bold">{document.filename}</p><p className="text-xs text-navy/50">{document.status === 'completed' ? 'Procesado' : document.status === 'error' ? 'Error de procesamiento' : 'Procesando…'}</p></div></div><button onClick={() => void deleteDocument(document.id)} aria-label={`Eliminar ${document.filename}`} className="rounded-lg p-2 text-navy/50 transition hover:bg-coral hover:text-navy"><Trash2 size={17} /></button></div>)}</div></section>}
        {tab === 'alerts' && <section className="rounded-3xl bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="font-display text-2xl font-bold">Avisos de transporte</h2><p className="mt-1 text-sm text-navy/55">Incidencias, retrasos y actualizaciones de servicio que el agente muestra a los usuarios.</p></div><button onClick={() => setEditingAlert({ title: '', body: '', severity: 'warning', mode: 'general', lines: '', source: 'manual', source_url: '', active: true, starts_at: new Date().toISOString().slice(0, 16), ends_at: '' })} className="inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-3 text-sm font-extrabold"><Plus size={17} />Nuevo aviso</button></div>{editingAlert && <div className="mb-6 grid gap-3 rounded-2xl bg-cream/50 p-4"><input value={editingAlert.title} onChange={(event) => setEditingAlert({ ...editingAlert, title: event.target.value })} placeholder="Título del aviso (p. ej. Línea C1 desviada por obras)" className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><div className="grid gap-3 sm:grid-cols-3"><select value={editingAlert.severity} onChange={(event) => setEditingAlert({ ...editingAlert, severity: event.target.value as TransitAlert['severity'] })} className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral"><option value="info">Info</option><option value="warning">Aviso</option><option value="critical">Crítico</option></select><select value={editingAlert.mode} onChange={(event) => setEditingAlert({ ...editingAlert, mode: event.target.value as TransitAlert['mode'] })} className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral"><option value="general">General</option><option value="bus">Bus (TUSSAM)</option><option value="metro">Metro</option><option value="tranvia">Tranvía</option></select><select value={editingAlert.source} onChange={(event) => setEditingAlert({ ...editingAlert, source: event.target.value as TransitAlert['source'] })} className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral"><option value="manual">Redacción manual</option><option value="tussam">TUSSAM</option><option value="metro-sevilla">Metro de Sevilla</option><option value="ctan">Consorcio (CTAN)</option></select></div><input value={editingAlert.lines} onChange={(event) => setEditingAlert({ ...editingAlert, lines: event.target.value })} placeholder="Líneas afectadas (p. ej. C1, C2, L1)" className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><textarea value={editingAlert.body} onChange={(event) => setEditingAlert({ ...editingAlert, body: event.target.value })} placeholder="Descripción del aviso, motivos, alternativas recomendadas…" rows={4} className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><input value={editingAlert.source_url || ''} onChange={(event) => setEditingAlert({ ...editingAlert, source_url: event.target.value })} placeholder="Enlace oficial opcional" className="rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-bold">Inicio<input type="datetime-local" value={editingAlert.starts_at ? editingAlert.starts_at.slice(0, 16) : ''} onChange={(event) => setEditingAlert({ ...editingAlert, starts_at: event.target.value })} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /></label><label className="text-sm font-bold">Fin (opcional)<input type="datetime-local" value={editingAlert.ends_at ? editingAlert.ends_at.slice(0, 16) : ''} onChange={(event) => setEditingAlert({ ...editingAlert, ends_at: event.target.value })} className="mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-4 py-3 outline-none focus:border-coral" /></label></div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={editingAlert.active} onChange={(event) => setEditingAlert({ ...editingAlert, active: event.target.checked })} className="h-4 w-4 rounded border-navy/30" />Activo (visible para el agente)</label><div className="flex gap-2"><button onClick={() => void saveAlert()} disabled={busy} className="rounded-xl bg-coral px-4 py-2.5 font-bold disabled:opacity-50"><Save size={16} className="mr-2 inline" />Guardar aviso</button><button onClick={() => setEditingAlert(null)} className="rounded-xl border border-navy/15 px-4 py-2.5 font-bold">Cancelar</button></div></div>}{alerts.length === 0 && <p className="rounded-xl bg-cream/50 p-5 text-sm text-navy/55">No hay avisos de transporte registrados.</p>}<div className="space-y-3">{alerts.map((alert) => <div key={alert.id} className={`rounded-2xl border p-4 ${alert.active ? (alert.severity === 'critical' ? 'border-coral/40 bg-coral/5' : alert.severity === 'warning' ? 'border-amber-400/40 bg-amber-50' : 'border-sky-400/40 bg-sky-50') : 'border-navy/10 bg-cream/30 opacity-60'} ${alert.severity === 'warning' ? 'text-amber-950' : ''}`}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase ${alert.severity === 'critical' ? 'bg-coral text-navy' : alert.severity === 'warning' ? 'bg-amber-500 text-white' : 'bg-sky-500 text-white'}`}>{alert.severity === 'critical' ? 'Crítico' : alert.severity === 'warning' ? 'Aviso' : 'Info'}</span><span className="rounded-md bg-navy px-2 py-1 text-[10px] font-bold uppercase text-cream">{alert.mode === 'bus' ? 'Bus' : alert.mode === 'metro' ? 'Metro' : alert.mode === 'tranvia' ? 'Tranvía' : 'General'}</span>{alert.lines && <span className="text-xs font-bold text-navy/70">Líneas: {alert.lines}</span>}{!alert.active && <span className="text-[10px] font-bold uppercase text-navy/40">Inactivo</span>}</div><h3 className="mt-2 font-bold">{alert.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-navy/70">{alert.body}</p>{alert.source_url && <a href={alert.source_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-bold text-coral hover:underline">Fuente oficial</a>}</div><div className="flex shrink-0 flex-col items-end gap-2"><button onClick={() => void toggleAlert(alert)} className="rounded-lg px-2 py-1 text-xs font-bold hover:bg-cream">{alert.active ? 'Desactivar' : 'Activar'}</button><div className="flex gap-1"><button onClick={() => setEditingAlert(alert)} className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-cream">Editar</button><button onClick={() => alert.id && void deleteAlert(alert.id)} className="rounded-lg p-2 hover:bg-coral"><Trash2 size={16} /></button></div></div></div></div>)}</div></section>}
        {tab === 'test' && <section className="rounded-3xl bg-white p-6 shadow-sm"><h2 className="font-display text-2xl font-bold">Prueba del agente real</h2><p className="mt-1 mb-5 text-sm text-navy/55">Esta prueba usa el mismo agente público, sus fuentes y el prompt guardado.</p><form onSubmit={runTest} className="flex gap-2"><input value={testInput} onChange={(event) => setTestInput(event.target.value)} placeholder="Escribe una pregunta de prueba…" className="min-h-12 flex-1 rounded-xl border border-navy/15 px-4 outline-none focus:border-coral" /><button disabled={busy || !testInput.trim()} className="grid h-12 w-12 place-items-center rounded-xl bg-coral disabled:opacity-50"><Send size={18} /></button></form>{testAnswer && <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-cream/50 p-5 text-sm leading-relaxed">{testAnswer}</div>}</section>}
      </div>
    </main>
  );
}
