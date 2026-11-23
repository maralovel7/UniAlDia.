import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import SiteLogo from '@/components/SiteLogo';
import { teamMembers } from '@/data/content';

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <SiteLogo />
          <a href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-navy transition-colors hover:text-coral"><ArrowLeft size={17} /> Volver a la portada</a>
        </div>
      </header>

      <main>
        <section className="bg-navy px-5 py-14 text-cream sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="eyebrow mb-4 text-coral-soft">Grupo 8 · Innovadores</p>
              <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.93] tracking-[-0.06em] sm:text-7xl">Conoce nuestro proyecto</h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-cream/75 sm:text-xl">UniAlDía nace para que la actualidad que afecta a los estudiantes deje de estar dispersa, sea fácil de entender y se convierta en decisiones útiles para el día a día.</p>
              <a href="#idea" className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-navy transition hover:bg-cream">Descubre la idea <ArrowUpRight size={17} /></a>
            </div>
            <img src="/images/team/WhatsApp_Image_2026-11-23_at_23.15.30.jpeg" alt="Presentación del proyecto UniAlDía" className="w-full rounded-3xl shadow-2xl shadow-black/20" />
          </div>
        </section>

        <section id="idea" className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:py-20">
          <div><p className="eyebrow text-coral">La idea principal</p><h2 className="mt-3 max-w-sm font-display text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-5xl">No solo contamos qué pasa.</h2></div>
          <div className="space-y-5 text-lg leading-relaxed text-navy/70"><p>Explicamos por qué importa, cómo puede cambiar tu rutina y qué puedes hacer con esa información. UniAlDía quiere ser el compañero que te ayuda a orientarte entre becas, universidad, vivienda, transporte, empleo y ocio.</p><p>El proyecto une actualidad, guías y comunidad en un espacio pensado desde la experiencia de quienes estudian. Queremos informar sin rodeos, con contexto y con una voz cercana.</p><div className="grid gap-3 pt-3 sm:grid-cols-3">{['Información clara', 'Contexto útil', 'Comunidad real'].map((item) => <div key={item} className="rounded-2xl bg-white p-4 text-sm font-bold text-navy shadow-sm"><CheckCircle2 size={18} className="mb-3 text-coral" />{item}</div>)}</div></div>
        </section>

        <section id="equipo" className="bg-navy px-5 py-14 text-cream sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl"><div className="mb-10 max-w-2xl"><p className="eyebrow text-coral-soft">Las personas detrás de UniAlDía</p><h2 className="mt-3 font-display text-4xl font-bold leading-none tracking-[-0.05em] sm:text-6xl">Un equipo con una misión compartida</h2><p className="mt-5 text-base leading-relaxed text-cream/65">Cada integrante aporta una mirada distinta para que la información llegue mejor, se entienda más rápido y tenga un impacto real.</p></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{teamMembers.map((member) => <article id={member.slug} key={member.name} className="scroll-mt-28 group overflow-hidden rounded-3xl bg-cream text-navy transition duration-300 hover:-translate-y-1 hover:shadow-2xl"><img src={member.image} alt={`Retrato de ${member.name}`} className="aspect-[4/3] w-full object-cover object-top" /><div className="p-5 sm:p-6"><p className="eyebrow text-coral">{member.role}</p><h3 className="mt-2 font-display text-2xl font-bold leading-tight tracking-[-0.04em]">{member.name}</h3><p className="mt-4 text-sm italic leading-relaxed text-navy/65">“{member.quote}”</p><p className="mt-4 border-t border-navy/10 pt-4 text-sm leading-relaxed text-navy/70">{member.description}</p></div></article>)}</div></div>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-2 lg:py-20"><img src="/images/project-info/Gemini_Generated_Image_pzteqfpzteqfpzte.jpg" alt="El equipo de UniAlDía trabajando" className="w-full rounded-3xl" /><div><p className="eyebrow text-coral">Nuestro compromiso</p><h2 className="mt-3 font-display text-4xl font-bold leading-[0.97] tracking-[-0.05em] sm:text-5xl">Tu compañero ya lo sabe.</h2><p className="mt-5 text-lg leading-relaxed text-navy/70">Queremos que encuentres en UniAlDía la información que necesitas para moverte por tu ciudad, aprovechar tus oportunidades y entender mejor lo que ocurre a tu alrededor.</p><a href="/" className="mt-7 inline-flex items-center gap-2 font-extrabold text-coral transition-colors hover:text-navy">Explorar la portada <ArrowUpRight size={17} /></a></div></section>
      </main>

      <footer className="bg-navy px-5 py-8 text-cream sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5"><SiteLogo footer /><span className="text-right text-xs text-cream/55">Hecho para la generación que quiere enterarse de verdad.</span></div></footer>
    </div>
  );
}
