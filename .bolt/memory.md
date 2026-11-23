# Project memory

## Product intent & audience

- News website for young adults in Seville, Spain
- Content pillars: local news, university updates, housing guides, employment guides
- Impact-focused reporting style
- Mobile-first, modern aesthetic

## Brand personality & voice

- Youth-oriented, modern, civic-minded
- User communicates in Spanish; UI copy likely Spanish

## Visual design & UX direction

- Brand name includes "Uni"; logo pairs a calendar symbol with "Uni" wordmark
- Logos appear in top-left header and bottom-left footer corners
- Footer background is dark blue; logo text must contrast (white) against it
- Calendar icon is a core brand element, kept centered and crisp in both header and footer
- Blue is a primary brand color (at least in footer)
- Tailwind CSS for styling; lucide-react for icons

## Decisions, constraints & rationale

- Framework: vite-react with `@/` path alias to `src/`
- Logo wordmark color must adapt to background context (white on dark footer, not inheriting same-color background)
- Replaced calendar symbol in both logos with a user-supplied image, centered and uniform
- Avoid installing extra UI packages unless explicitly requested

## Open questions & assumptions

- Exact brand name and full logo text beyond "Uni" not yet confirmed
- Primary/accent color palette beyond footer blue not fully defined
- Header background color and logo treatment on light backgrounds assumed to differ from footer
- Typography choices not yet specified