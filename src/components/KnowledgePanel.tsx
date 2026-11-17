import { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  Search,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

type KnowledgeEntry = {
  id?: string;
  title: string;
  content: string;
  category: string;
  url: string | null;
  file_url: string | null;
  keywords: string | null;
};

const CATEGORIES = [
  'Transporte',
  'Vivienda',
  'Becas',
  'Universidad',
  'Empleo',
  'Ocio',
  'General',
];

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export default function KnowledgePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let query = supabase
        .from('knowledge_entries')
        .select('*')
        .order('updated_at', { ascending: false });
      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,keywords.ilike.%${search.trim()}%,category.ilike.%${search.trim()}%`,
        );
      }
      const { data, error: fetchError } = await query.limit(100);
      if (fetchError) throw fetchError;
      setEntries(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudieron cargar las entradas: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (open) {
      void fetchEntries();
    }
  }, [open, fetchEntries]);

  const handleSave = async () => {
    if (!editing || !editing.title.trim() || !editing.content.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editing.id) {
        const { error: updateError } = await supabase
          .from('knowledge_entries')
          .update({
            title: editing.title,
            content: editing.content,
            category: editing.category,
            url: editing.url || null,
            file_url: editing.file_url || null,
            keywords: editing.keywords || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('knowledge_entries')
          .insert({
            title: editing.title,
            content: editing.content,
            category: editing.category,
            url: editing.url || null,
            file_url: editing.file_url || null,
            keywords: editing.keywords || null,
          });
        if (insertError) throw insertError;
      }
      setEditing(null);
      await fetchEntries();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta entrada?')) return;
    try {
      const { error: deleteError } = await supabase
        .from('knowledge_entries')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      await fetchEntries();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(`No se pudo eliminar: ${msg}`);
    }
  };

  const startNew = () => {
    setEditing({
      title: '',
      content: '',
      category: 'General',
      url: '',
      file_url: '',
      keywords: '',
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] max-h-[700px] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy/10 bg-navy px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-navy">
              <Database size={20} strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold leading-none text-cream">
                Base de conocimiento
              </h2>
              <p className="mt-1 text-[11px] font-medium text-cream/60">
                Información que el bot usa para responder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-cream transition hover:bg-coral hover:text-navy"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {editing ? (
          /* Edit form */
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/60">
                  Título
                </label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  placeholder="Ej: Horarios línea 27 - Metrocentro"
                  className="w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-2.5 text-sm text-navy outline-none focus:border-coral"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/60">
                  Categoría
                </label>
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                  className="w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-2.5 text-sm text-navy outline-none focus:border-coral"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/60">
                  Contenido
                </label>
                <textarea
                  value={editing.content}
                  onChange={(e) =>
                    setEditing({ ...editing, content: e.target.value })
                  }
                  placeholder="Escribe aquí la información completa: horarios, requisitos, precios, direcciones…"
                  rows={10}
                  className="w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-3 text-sm text-navy outline-none focus:border-coral"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/60">
                    Enlace web (opcional)
                  </label>
                  <input
                    type="url"
                    value={editing.url || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, url: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-2.5 text-sm text-navy outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/60">
                    Enlace a PDF/imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={editing.file_url || ''}
                    onChange={(e) =>
                      setEditing({ ...editing, file_url: e.target.value })
                    }
                    placeholder="https://...pdf"
                    className="w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-2.5 text-sm text-navy outline-none focus:border-coral"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-navy/60">
                  Palabras clave (separadas por comas)
                </label>
                <input
                  type="text"
                  value={editing.keywords || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, keywords: e.target.value })
                  }
                  placeholder="tranvia, T1, horarios, plaza nueva"
                  className="w-full rounded-xl border border-navy/15 bg-cream/30 px-4 py-2.5 text-sm text-navy outline-none focus:border-coral"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-coral/10 px-4 py-2.5 text-sm font-medium text-coral">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editing.title.trim() || !editing.content.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-sm font-extrabold text-navy transition hover:bg-navy hover:text-cream disabled:opacity-40"
                >
                  <Save size={17} strokeWidth={2.5} />
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="inline-flex items-center gap-2 rounded-xl border border-navy/15 px-5 py-2.5 text-sm font-bold text-navy transition hover:bg-navy/5"
                >
                  <X size={17} strokeWidth={2.5} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* List view */
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Search + Add */}
            <div className="flex items-center gap-3 border-b border-navy/10 px-6 py-3">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar entradas…"
                  className="w-full rounded-full border border-navy/15 bg-cream/30 py-2.5 pl-10 pr-4 text-sm text-navy outline-none focus:border-coral"
                />
              </div>
              <button
                onClick={startNew}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-coral px-4 py-2.5 text-sm font-extrabold text-navy transition hover:bg-navy hover:text-cream"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Nueva entrada</span>
              </button>
            </div>

            {error && (
              <p className="mx-6 mt-3 rounded-lg bg-coral/10 px-4 py-2.5 text-sm font-medium text-coral">
                {error}
              </p>
            )}

            {/* Entries list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <p className="py-10 text-center text-sm text-navy/40">
                  Cargando…
                </p>
              ) : entries.length === 0 ? (
                <p className="py-10 text-center text-sm text-navy/40">
                  No hay entradas. Crea la primera con "Nueva entrada".
                </p>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="group rounded-2xl border border-navy/10 bg-cream/20 p-4 transition hover:border-navy/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-md bg-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cream">
                              {entry.category}
                            </span>
                          </div>
                          <h3 className="font-display text-base font-bold leading-tight text-navy">
                            {entry.title}
                          </h3>
                          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-navy/60">
                            {entry.content}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            {entry.url && (
                              <a
                                href={entry.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-coral hover:underline"
                              >
                                <ExternalLink size={13} /> Enlace
                              </a>
                            )}
                            {entry.file_url && (
                              <a
                                href={entry.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-coral hover:underline"
                              >
                                <FileText size={13} /> PDF/Imagen
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 gap-1">
                          <button
                            onClick={() => setEditing(entry)}
                            aria-label="Editar"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-navy/5 text-navy transition hover:bg-navy hover:text-cream"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => entry.id && handleDelete(entry.id)}
                            aria-label="Eliminar"
                            className="grid h-8 w-8 place-items-center rounded-lg bg-navy/5 text-navy transition hover:bg-coral hover:text-navy"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
