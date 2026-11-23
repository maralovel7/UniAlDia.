type SiteLogoProps = {
  footer?: boolean;
};

export default function SiteLogo({ footer = false }: SiteLogoProps) {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="UniAlDía, inicio">
      <span className="logo-mark"><img src="/images/unialdia-calendar.png" alt="" aria-hidden="true" /></span>
      <span className={`text-[1.75rem] font-black tracking-[-0.07em] ${footer ? 'text-cream' : 'text-navy'}`}>Uni<span className="text-coral">AlDía</span></span>
    </a>
  );
}
