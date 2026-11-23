import { CookieSettingsButton } from '@/components/CookieConsent';
import SiteLogo from '@/components/SiteLogo';

type LegalPageProps = {
  page: 'legal' | 'cookies';
};

type Section = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

const legalSections: Section[] = [
  {
    heading: 'Condiciones de uso',
    paragraphs: [
      'La utilización del sitio web otorga la condición de usuario e implica la aceptación de las cláusulas de este Aviso legal y de la Política de privacidad. Si no estás conforme con ellas, debes abstenerte de utilizar el sitio.',
      'El acceso a UniAlDía no supone el inicio de una relación comercial. El sitio facilita contenidos publicados por UniAlDía y sus colaboradores a través de Internet.',
      'No está permitido utilizar los contenidos con fines ilícitos o de forma que pueda dañar, inutilizar, sobrecargar o impedir el funcionamiento normal del sitio, sus equipos o los de otros usuarios.',
    ],
  },
  {
    heading: 'Medidas de seguridad',
    paragraphs: [
      'Los datos personales que se faciliten podrán almacenarse en bases de datos bajo la responsabilidad de UniAlDía. Se aplican medidas técnicas, organizativas y de seguridad destinadas a preservar su confidencialidad, integridad y calidad conforme a la normativa vigente.',
      'Internet no permite garantizar una seguridad absoluta. UniAlDía adopta medidas razonables para evitar virus y otros elementos dañinos, pero no puede asegurar que nunca se produzcan alteraciones en los sistemas o documentos del usuario.',
    ],
  },
  {
    heading: 'Contenidos y responsabilidad',
    paragraphs: [
      'UniAlDía obtiene la información y los materiales publicados de fuentes que considera fiables. Aun así, no garantiza que todos los contenidos sean exactos, completos o estén permanentemente actualizados.',
      'Los contenidos tienen una finalidad exclusivamente informativa y no constituyen una oferta de venta, una solicitud de compra ni una recomendación para realizar una operación, salvo que se indique expresamente.',
      'UniAlDía puede modificar, suspender, cancelar o restringir contenidos, enlaces o información del sitio sin necesidad de aviso previo, y no será responsable de los daños que pudieran derivarse del uso de la información publicada.',
    ],
  },
  {
    heading: 'Política de privacidad',
    paragraphs: [
      'UniAlDía trata los datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales.',
      'Para navegar por el sitio no es necesario facilitar datos personales. Si contactas con UniAlDía, te suscribes a un boletín o utilizas una función que solicite información, los datos se tratarán únicamente para responder, prestar el servicio solicitado o mejorar el funcionamiento del sitio.',
      'Puedes solicitar el acceso a tus datos, su rectificación o supresión, la limitación de su tratamiento y oponerte al mismo cuando proceda. Para ejercer tus derechos, escribe a unialdia.rrss@gmail.com. También puedes reclamar ante la Agencia Española de Protección de Datos.',
    ],
    bullets: [
      'Titular y responsable: UniAlDía.',
      'Domicilio: Américo Vespucio, 27, 41092, España.',
      'Correo electrónico: unialdia.rrss@gmail.com.',
      'No se tratan categorías de datos especialmente protegidos.',
    ],
  },
  {
    heading: 'Cambios en esta información',
    paragraphs: [
      'UniAlDía puede actualizar este Aviso legal y su Política de privacidad para adaptarlos a cambios normativos o de funcionamiento. La versión publicada en esta página será la vigente.',
    ],
  },
];

const cookieSections: Section[] = [
  {
    heading: 'Qué son las cookies',
    paragraphs: [
      'Las cookies son pequeños archivos de información que se almacenan en el navegador para recordar determinados datos y facilitar la navegación. No dañan el dispositivo ni permiten acceder por sí solas a la información almacenada en él.',
      'En la versión actual de UniAlDía se utiliza almacenamiento técnico del navegador para recordar la decisión sobre cookies y algunas preferencias de uso. No se han activado herramientas de analítica ni cookies publicitarias.',
    ],
  },
  {
    heading: 'Cookies propias y de terceros',
    paragraphs: [
      'Las tecnologías propias y técnicas permiten recordar preferencias y mantener el funcionamiento básico de determinadas funciones. No se utilizan para crear perfiles publicitarios.',
      'UniAlDía no activa actualmente cookies de analítica o redes sociales embebidas. Los enlaces a redes sociales pueden llevarte a páginas que tienen sus propias políticas de privacidad y cookies.',
      'Si en el futuro se incorporan cookies de análisis, personalización o terceros, se informará de ello y se solicitará el consentimiento antes de activarlas.',
    ],
  },
  {
    heading: 'Consentimiento y preferencias',
    paragraphs: [
      'Al entrar por primera vez en el sitio se muestra un aviso que permite aceptar las tecnologías opcionales, rechazarlas o consultar la configuración. La elección queda guardada en el navegador para no volver a mostrar el aviso en cada visita.',
      'Puedes cambiar tus preferencias en cualquier momento desde el enlace “Configurar cookies” del pie de página o desde esta página. Rechazar las tecnologías opcionales no impide navegar por UniAlDía.',
    ],
  },
  {
    heading: 'Cómo deshabilitar o eliminar cookies',
    paragraphs: [
      'También puedes bloquear, rechazar o eliminar las cookies desde la configuración de tu navegador. Las instrucciones cambian según utilices Chrome, Firefox, Safari, Edge u otro navegador, por lo que debes consultar la ayuda del navegador instalado en tu dispositivo.',
      'La eliminación del almacenamiento del navegador puede hacer que UniAlDía vuelva a preguntarte por tus preferencias.',
    ],
  },
];

function ContactCard() {
  const details = [
    ['Titular', 'UniAlDía'],
    ['Domicilio', 'Américo Vespucio, 27, 41092, España'],
    ['Correo electrónico', 'unialdia.rrss@gmail.com'],
    ['Sitio web', 'uniald-a-digital-med-vmfr.bolt.host'],
  ];

  return <div className="grid gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="bg-white px-5 py-4"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-navy/45">{label}</p><p className="mt-1 text-sm font-semibold text-navy">{value}</p></div>)}</div>;
}

export default function LegalPage({ page }: LegalPageProps) {
  const isCookies = page === 'cookies';
  const sections = isCookies ? cookieSections : legalSections;

  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-cream/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5"><SiteLogo /><a href="/" className="text-sm font-bold text-navy/60 transition hover:text-coral">Volver a UniAlDía</a></div>
      </header>
      <main>
        <section className="bg-navy px-5 py-16 text-cream sm:px-8 lg:py-24"><div className="mx-auto max-w-4xl"><p className="eyebrow mb-4 text-coral-soft">Información transparente</p><h1 className="font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] sm:text-7xl">{isCookies ? 'Política de cookies' : 'Aviso legal'}</h1><p className="mt-7 max-w-2xl text-base leading-relaxed text-cream/70 sm:text-lg">{isCookies ? 'Te explicamos qué tecnologías de almacenamiento utilizamos y cómo puedes aceptar, rechazar o cambiar tus preferencias.' : 'Consulta quién está detrás de UniAlDía, las condiciones de uso del sitio y cómo tratamos la información.'}</p></div></section>
        <section className="px-5 py-10 sm:px-8 lg:py-16"><div className="mx-auto max-w-4xl">
          <nav aria-label="Documentación legal" className="flex flex-wrap gap-2"><a href="/aviso-legal" className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${!isCookies ? 'bg-navy text-cream' : 'bg-navy/5 text-navy/65 hover:bg-coral hover:text-navy'}`}>Aviso legal</a><a href="/cookies" className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${isCookies ? 'bg-navy text-cream' : 'bg-navy/5 text-navy/65 hover:bg-coral hover:text-navy'}`}>Cookies</a></nav>
          <div className="mt-10 space-y-10">
            <section><h2 className="mb-5 font-display text-3xl font-bold tracking-[-0.04em]">Identificación y titularidad</h2><ContactCard /></section>
            {sections.map((section) => <section key={section.heading} className="border-t border-navy/10 pt-8"><h2 className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{section.heading}</h2><div className="mt-4 space-y-4 text-[0.98rem] leading-8 text-navy/70">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul className="list-disc space-y-2 pl-5">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</div></section>)}
          </div>
        </div></section>
      </main>
      <footer className="bg-navy px-5 py-10 text-cream sm:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 border-b border-cream/15 pb-7 sm:flex-row sm:items-end sm:justify-between"><div><SiteLogo footer /><p className="mt-3 text-sm text-cream/55">Información clara para navegar por UniAlDía.</p></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-cream/60"><a href="/aviso-legal" className="transition hover:text-coral-soft">Aviso legal</a><a href="/cookies" className="transition hover:text-coral-soft">Cookies</a><CookieSettingsButton className="transition hover:text-coral-soft" /><a href="/" className="transition hover:text-coral-soft">Inicio</a></div></div><p className="mx-auto max-w-7xl pt-6 text-xs text-cream/40">© 2026 UniAlDía · Textos legales</p></footer>
    </div>
  );
}
