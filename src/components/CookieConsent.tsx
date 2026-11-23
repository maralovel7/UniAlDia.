import { useEffect, useState } from 'react';
import { Check, Cookie, X } from 'lucide-react';

export const cookieConsentName = 'unialdia-cookie-consent';

type CookieChoice = 'accepted' | 'rejected';

function readCookieChoice(): CookieChoice | null {
  const entry = document.cookie.split('; ').find((item) => item.startsWith(`${cookieConsentName}=`));
  const choice = entry?.split('=')[1];
  return choice === 'accepted' || choice === 'rejected' ? choice : null;
}

function saveCookieChoice(choice: CookieChoice) {
  document.cookie = `${cookieConsentName}=${choice}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(() => readCookieChoice() === null);

  useEffect(() => {
    const handleReset = () => setIsVisible(true);
    window.addEventListener('unialdia-cookie-preferences-reset', handleReset);
    return () => window.removeEventListener('unialdia-cookie-preferences-reset', handleReset);
  }, []);

  const choose = (choice: CookieChoice) => {
    saveCookieChoice(choice);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6" role="dialog" aria-label="Preferencias de cookies">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(11,31,75,0.22)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4E6] text-[#F04E4E] sm:flex">
            <Cookie size={22} strokeWidth={1.8} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#F04E4E]">Tu privacidad importa</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#0B1F4B]">Usamos cookies técnicas</h2>
              </div>
              <button
                type="button"
                onClick={() => choose('rejected')}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#0B1F4B]"
                aria-label="Cerrar aviso de cookies"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Son necesarias para recordar tu preferencia y mantener la web funcionando. No activamos cookies de analítica ni publicidad en esta versión. Puedes aceptar o rechazar las cookies no esenciales y consultar todos los detalles en nuestra política.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => choose('accepted')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0B1F4B] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#16366f]"
              >
                <Check size={17} />
                Aceptar cookies
              </button>
              <button
                type="button"
                onClick={() => choose('rejected')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-[#0B1F4B] transition hover:border-[#0B1F4B] hover:bg-slate-50"
              >
                Rechazar cookies no esenciales
              </button>
              <a href="/cookies" className="text-center text-sm font-semibold text-[#F04E4E] underline-offset-4 hover:underline sm:ml-auto">
                Leer política de cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
