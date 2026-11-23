import { useEffect, useState } from 'react';
import { Check, ChevronDown, Cookie, Settings2, X } from 'lucide-react';

const CONSENT_KEY = 'unialdia-cookie-consent';

type ConsentChoice = 'accepted' | 'rejected' | 'customized';

function saveConsent(choice: ConsentChoice) {
  window.localStorage.setItem(CONSENT_KEY, choice);
}

export function CookieSettingsButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event('unialdia-open-cookie-settings'))} className={className}>
      Configurar cookies
    </button>
  );
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [optionalCookies, setOptionalCookies] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem(CONSENT_KEY) === null);
    const openSettings = () => {
      setVisible(true);
      setExpanded(true);
    };
    window.addEventListener('unialdia-open-cookie-settings', openSettings);
    return () => window.removeEventListener('unialdia-open-cookie-settings', openSettings);
  }, []);

  if (!visible) return null;

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    setVisible(false);
  };

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[60] overflow-hidden rounded-2xl border border-navy/15 bg-cream shadow-[0_20px_60px_rgba(11,31,75,0.22)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[min(100%-3rem,460px)]" aria-label="Preferencias de cookies">
      <div className="flex items-start gap-3 border-b border-navy/10 px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coral text-navy"><Cookie size={20} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-navy">Tu privacidad importa</p>
          <p className="mt-1 text-xs leading-relaxed text-navy/65">Usamos almacenamiento técnico para recordar tus preferencias. No activamos analítica ni publicidad sin tu permiso.</p>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Ocultar configuración' : 'Mostrar configuración'} className="rounded-lg p-2 text-navy/50 transition hover:bg-navy/10 hover:text-navy">
          {expanded ? <X size={17} /> : <ChevronDown size={17} />}
        </button>
      </div>

      {expanded && (
        <div className="border-b border-navy/10 bg-white/55 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-navy">Cookies técnicas</p>
              <p className="mt-1 text-xs leading-relaxed text-navy/55">Necesarias para guardar tu elección y el funcionamiento básico. Siempre activas.</p>
            </div>
            <span className="rounded-full bg-navy/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-navy/60">Activas</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-navy/10 pt-4">
            <div>
              <p className="text-sm font-bold text-navy">Cookies opcionales</p>
              <p className="mt-1 text-xs leading-relaxed text-navy/55">No se usan actualmente. Solo se activarán si las autorizas.</p>
            </div>
            <button type="button" role="switch" aria-checked={optionalCookies} onClick={() => setOptionalCookies(!optionalCookies)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${optionalCookies ? 'bg-coral' : 'bg-navy/15'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${optionalCookies ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <button type="button" onClick={() => choose('customized')} className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 text-xs font-extrabold text-cream transition hover:bg-coral hover:text-navy">
            <Settings2 size={15} /> Guardar preferencias
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:justify-end">
        <a href="/cookies" className="mr-auto self-center text-xs font-bold text-navy/60 underline decoration-navy/20 underline-offset-4 transition hover:text-coral">Leer política de cookies</a>
        <button type="button" onClick={() => choose('rejected')} className="min-h-10 rounded-xl border border-navy/15 px-4 text-xs font-extrabold text-navy transition hover:border-navy hover:bg-navy/5">Rechazar</button>
        <button type="button" onClick={() => choose('accepted')} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-coral px-4 text-xs font-extrabold text-navy transition hover:bg-navy hover:text-cream"><Check size={15} /> Aceptar</button>
      </div>
    </aside>
  );
}
