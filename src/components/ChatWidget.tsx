import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Loader2, Send, Sparkles, X, User } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const storageKey = 'unialdia-chat-history';
const sessionKey = 'unialdia-chat-session';
const agentUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://72207947.supabase.co'}/functions/v1/agent`;
const welcomeMessage: Message = {
  role: 'assistant',
  content: '¡Hola! Soy UniAlDía. Pregúntame lo que quieras sobre Sevilla: becas, transporte, vivienda, universidad, empleo u ocio.',
};

function loadMessages(): Message[] {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return [welcomeMessage];
    const parsed = JSON.parse(saved) as Message[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [welcomeMessage];
  } catch {
    return [welcomeMessage];
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(() => localStorage.getItem(sessionKey));
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Node && panelRef.current && !panelRef.current.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((previous) => [...previous, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const response = await fetch(agentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionToken }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json().catch(() => null) as { response?: unknown; sessionToken?: unknown; error?: unknown } | null;
      if (!response.ok || !data || typeof data.response !== 'string') throw new Error('No se pudo completar la respuesta.');
      if (typeof data.sessionToken === 'string') {
        setSessionToken(data.sessionToken);
        localStorage.setItem(sessionKey, data.sessionToken);
      }
      setMessages((previous) => [...previous, { role: 'assistant', content: data.response as string }]);
    } catch (error) {
      const message = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')
        ? 'El agente tardó demasiado en responder. Inténtalo de nuevo.'
        : 'No pude conectar con el agente ahora. Inténtalo de nuevo en unos segundos.';
      setMessages((previous) => [...previous, { role: 'assistant', content: message }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, sessionToken]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  return (
    <div ref={panelRef}>
      <button
        aria-label={open ? 'Cerrar chat' : 'Abrir chat con el agente'}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-coral text-navy shadow-lg shadow-coral/30 transition-all hover:scale-105 hover:bg-navy hover:text-cream"
      >
        {open ? <X size={24} strokeWidth={2.5} /> : <Sparkles size={24} strokeWidth={2.5} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[70vh] max-h-[560px] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-2xl">
          <div className="flex items-center gap-3 border-b border-navy/10 bg-navy px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-navy"><Bot size={20} strokeWidth={2.5} /></span>
            <div>
              <p className="font-display text-base font-bold leading-none text-cream">UniAlDía</p>
              <p className="mt-1 text-[11px] font-medium text-cream/60">Asistente con contexto y fuentes</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-cream/40 px-4 py-5">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${message.role === 'user' ? 'bg-navy text-cream' : 'bg-coral text-navy'}`}>
                  {message.role === 'user' ? <User size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
                </span>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-tr-sm bg-navy text-cream' : 'rounded-tl-sm bg-white text-navy shadow-sm'}`}>
                  {message.content.split('\n').map((line, lineIndex) => <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>{line}</p>)}
                </div>
              </div>
            ))}
            {loading && <div className="flex gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-full bg-coral text-navy"><Bot size={16} strokeWidth={2.5} /></span><div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-navy shadow-sm"><Loader2 size={16} className="animate-spin text-coral" /><span className="text-sm text-navy/60">Buscando…</span></div></div>}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-navy/10 bg-white px-4 py-3">
            <input ref={inputRef} type="text" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pregúntame algo…" disabled={loading} className="min-h-11 flex-1 rounded-full border border-navy/15 bg-cream/50 px-4 text-sm text-navy outline-none placeholder:text-navy/40 focus:border-coral disabled:opacity-50" />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Enviar mensaje" className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-coral text-navy transition hover:bg-navy hover:text-cream disabled:opacity-40"><Send size={18} strokeWidth={2.5} /></button>
          </form>
        </div>
      )}
    </div>
  );
}
