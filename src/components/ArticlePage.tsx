import { ArrowLeft, ArrowUpRight, Clock3, Share2 } from 'lucide-react';
import SiteLogo from '@/components/SiteLogo';
import type { Article } from '@/data/content';

type ArticlePageProps = {
  article: Article;
};

export default function ArticlePage({ article }: ArticlePageProps) {
  return (
    <div className="min-h-screen bg-cream text-navy">
      <header className="sticky top-0 z-30 border-b border-navy/10 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-5xl items-center justify-between px-5 sm:px-8">
          <SiteLogo />
          <a href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-navy transition-colors hover:text-coral"><ArrowLeft size={17} /> Volver a UniAlDía</a>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-coral">
            <span className="rounded-full bg-coral px-3 py-1.5 text-navy">{article.category}</span>
            <span className="flex items-center gap-1.5 text-navy/50"><Clock3 size={14} /> {article.time}</span>
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.055em] text-navy sm:text-6xl">{article.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy/65 sm:text-xl">{article.standfirst}</p>
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-navy/10 pt-4 text-sm font-bold text-navy/50">
            <span>Por {article.author}</span>
            <button type="button" onClick={() => void navigator.clipboard?.writeText(window.location.href)} className="inline-flex items-center gap-2 text-navy transition-colors hover:text-coral"><Share2 size={16} /> Compartir</button>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <img src={article.image} alt="" className="aspect-[1.8] w-full rounded-3xl object-cover shadow-xl" />
        </div>

        <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
          {article.sections.map((section) => (
            <section key={section.heading} className="mb-10 last:mb-0">
              <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-navy sm:text-3xl">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-base leading-[1.75] text-navy/75 sm:text-lg">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.bullets && <ul className="mt-5 grid gap-3 rounded-2xl bg-white p-5 text-base leading-relaxed text-navy shadow-sm sm:p-6">{section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-coral" />{bullet}</li>)}</ul>}
            </section>
          ))}
        </article>

        <section className="border-y border-navy/10 bg-white px-5 py-10 sm:px-8">
          <div className="mx-auto flex max-w-3xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div><p className="eyebrow text-coral">Sigue leyendo</p><h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.04em]">Más información para tu día a día</h2></div>
            <a href="/" className="inline-flex items-center gap-2 font-extrabold text-coral transition-colors hover:text-navy">Volver a las noticias <ArrowUpRight size={17} /></a>
          </div>
        </section>
      </main>

      <footer className="bg-navy px-5 py-8 text-cream sm:px-8"><div className="mx-auto flex max-w-5xl items-center justify-between gap-5"><SiteLogo footer /><span className="text-right text-xs text-cream/55">La actualidad que te afecta.</span></div></footer>
    </div>
  );
}
