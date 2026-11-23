import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, Mail, MapPin, ShieldCheck } from 'lucide-react';
import SiteLogo from '@/components/SiteLogo';
import { cookieConsentName } from '@/components/CookieConsent';

type LegalPageProps = {
  page: 'legal' | 'cookies';
};

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="border-t border-slate-200 pt-8">
      <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0B1F4B] sm:text-3xl">{title}</h2>
      <div className="mt-5 space-y-5 text-[15px] leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function IdentityCard() {
  return (
    <div className="mt-7 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3 sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Titular</p>
        <p className="mt-2 font-semibold text-[#0B1F4B]">UniAlDía</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Domicilio</p>
        <p className="mt-2 font-semibold text-[#0B1F4B]">Américo Vespucio, 27, 41092, España</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Correo electrónico</p>
        <a href="mailto:unialdia@hotmail.com" className="mt-2 inline-flex items-center gap-2 font-semibold text-[#0B1F4B] hover:text-[#F04E4E]">
          <Mail size={16} /> unialdia@hotmail.com
        </a>
      </div>
    </div>
  );
}

function LegalNotice() {
  return (
    <>
      <Section title="Identificación y titularidad">
        <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico, se informa de los datos identificativos de UniAlDía.</p>
        <IdentityCard />
      </Section>

      <Section title="Condiciones de uso">
        <p>El acceso y uso de este sitio web otorga la condición de usuario e implica la aceptación de las presentes condiciones. Si no está conforme con ellas, debe abstenerse de utilizar el sitio.</p>
        <p>El usuario se compromete a utilizar los contenidos de forma lícita, respetando la legislación vigente y los derechos e intereses de terceros. Queda prohibido introducir contenidos ilícitos, virus o cualquier elemento que pueda dañar, sobrecargar o impedir el funcionamiento normal del sitio.</p>
      </Section>

      <Section title="Contenidos y responsabilidad">
        <p>UniAlDía obtiene la información y los materiales publicados de fuentes que considera fiables y procura mantenerlos actualizados. No obstante, no garantiza que toda la información sea exacta, completa o esté permanentemente actualizada.</p>
        <p>Los contenidos tienen finalidad exclusivamente informativa. UniAlDía no se responsabiliza de los daños que pudieran derivarse del uso de la información publicada ni del contenido, disponibilidad o tratamiento de datos realizado por páginas externas enlazadas desde este sitio.</p>
        <p>UniAlDía se reserva el derecho a modificar, suspender o restringir los contenidos y enlaces del sitio sin necesidad de aviso previo.</p>
      </Section>

      <Section title="Medidas de seguridad">
        <p>UniAlDía aplica medidas técnicas y organizativas razonables para proteger la confidencialidad, integridad y disponibilidad de la información. Aun así, ningún sistema conectado a Internet puede garantizar una seguridad absoluta frente a todos los riesgos.</p>
      </Section>

      <Section title="Política de privacidad">
        <p>Para navegar por el sitio no es necesario facilitar datos personales. Si el usuario contacta con UniAlDía por correo electrónico, los datos recibidos se utilizarán únicamente para atender la consulta y mantener la comunicación relacionada con ella.</p>
        <p>La base jurídica del tratamiento será el consentimiento del interesado o, cuando corresponda, la atención de una solicitud. Solo se solicitarán los datos necesarios, se conservarán durante el tiempo imprescindible y no se cederán a terceros salvo obligación legal o cuando resulte necesario para prestar un servicio bajo las garantías correspondientes.</p>
        <p>Los usuarios pueden solicitar el acceso, rectificación, supresión, limitación u oposición al tratamiento de sus datos escribiendo a <a href="mailto:unialdia@hotmail.com" className="font-semibold text-[#F04E4E] hover:underline">unialdia@hotmail.com</a> o a la dirección postal indicada. También pueden presentar una reclamación ante la Agencia Española de Protección de Datos.</p>
      </Section>

      <Section title="Propiedad intelectual">
        <p>Los textos, diseños, marcas, imágenes y demás contenidos de este sitio están protegidos por la normativa aplicable. No podrán reproducirse, distribuirse o transformarse sin autorización, salvo en los casos permitidos por la ley.</p>
      </Section>
    </>
  );
}

function CookiePolicy() {
  return (
    <>
      <Section title="Qué son las cookies">
        <p>Las cookies son pequeños archivos que se almacenan en el navegador para recordar información durante la navegación. Pueden facilitar el funcionamiento del sitio y mejorar la experiencia de uso, pero no permiten acceder al disco duro ni extraer información personal por sí mismas.</p>
        <p>El consentimiento para las cookies no esenciales debe ser libre, informado y revocable. Puedes cambiar tu decisión en cualquier momento desde esta página.</p>
      </Section>

      <Section title="Qué utiliza UniAlDía">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3 text-emerald-800"><ShieldCheck size={20} /><h3 className="font-bold">Cookies técnicas</h3></div>
            <p className="mt-3 text-sm leading-6 text-emerald-900/75">Son necesarias para recordar tus preferencias y permitir el funcionamiento básico de la web. No pueden desactivarse mientras utilizas esas funciones.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3 text-[#0B1F4B]"><MapPin size={20} /><h3 className="font-bold">Analítica y publicidad</h3></div>
            <p className="mt-3 text-sm leading-6 text-slate-600">En la versión actual de UniAlDía no activamos cookies de analítica, publicidad ni perfiles de navegación.</p>
          </div>
        </div>
      </Section>

      <Section title="Preferencias de cookies">
        <p>Al entrar por primera vez, te mostramos un aviso para aceptar o rechazar las cookies no esenciales. Si las rechazas, podrás seguir navegando por el sitio y solo se mantendrán las funciones estrictamente necesarias.</p>
        <button
          type="button"
          onClick={() => {
            document.cookie = `${cookieConsentName}=; Max-Age=0; Path=/; SameSite=Lax`;
            window.dispatchEvent(new Event('unialdia-cookie-preferences-reset'));
          }}
          className="inline-flex items-center rounded-full bg-[#0B1F4B] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#16366f]"
        >
          Cambiar mis preferencias
        </button>
      </Section>

      <Section title="Cookies de terceros y enlaces externos">
        <p>Las páginas o servicios externos enlazados desde UniAlDía pueden utilizar sus propias cookies y aplicar sus propias políticas de privacidad. Te recomendamos consultar sus condiciones antes de utilizarlos.</p>
        <p>UniAlDía no controla las cookies que puedan instalar esos sitios externos ni se responsabiliza de sus prácticas.</p>
      </Section>

      <Section title="Cómo desactivar o eliminar cookies">
        <p>Puedes bloquear, eliminar o configurar las cookies desde las opciones de privacidad de tu navegador. El procedimiento cambia según utilices Chrome, Firefox, Safari u otro navegador. Si desactivas las cookies técnicas, algunas funciones pueden dejar de funcionar correctamente.</p>
      </Section>
    </>
  );
}

export default function LegalPage({ page }: LegalPageProps) {
  const isCookiePage = page === 'cookies';
  const title = isCookiePage ? 'Política de cookies' : 'Aviso legal y privacidad';
  const eyebrow = isCookiePage ? 'Transparencia digital' : 'Información legal';
  const description = isCookiePage
    ? 'Te explicamos qué tecnologías utilizamos, para qué sirven y cómo puedes decidir sobre ellas.'
    : 'La información esencial sobre UniAlDía, el uso del sitio y el tratamiento responsable de los datos.';

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#0B1F4B]">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <SiteLogo />
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B1F4B] transition hover:text-[#F04E4E]">
            <ArrowLeft size={17} /> Volver a la portada
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F04E4E]">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-[#0B1F4B] sm:text-6xl">{title}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
            <span>UniAlDía</span>
            <span aria-hidden="true">·</span>
            <span>Última actualización: noviembre de 2026</span>
          </div>
        </div>

        <div className="mt-14 space-y-10">
          {isCookiePage ? <CookiePolicy /> : <LegalNotice />}
        </div>

        <div className="mt-14 flex flex-col gap-3 rounded-3xl bg-[#0B1F4B] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-serif text-2xl font-bold">¿Tienes alguna duda?</p>
            <p className="mt-2 text-sm leading-6 text-white/70">Escríbenos y te ayudaremos con cualquier consulta sobre el sitio.</p>
          </div>
          <a href="mailto:unialdia@hotmail.com" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0B1F4B] transition hover:bg-[#FFF4E6]">
            Contactar <ExternalLink size={16} />
          </a>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <SiteLogo />
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-500">
            <a href="/aviso-legal" className="transition hover:text-[#F04E4E]">Aviso legal</a>
            <a href="/cookies" className="transition hover:text-[#F04E4E]">Cookies</a>
            <a href="mailto:unialdia@hotmail.com" className="transition hover:text-[#F04E4E]">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
