# Usham Koushik Reddy — Developer Portfolio

A premium, dark-first personal portfolio built with React, TypeScript, Vite, Tailwind CSS v4, Framer Motion and lucide-react.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # preview the production build
npm run resume     # regenerate public/resume.pdf from the data in this repo
```

## Structure

```
src/
  components/
    ui/                 shadcn-style primitives (button, badge, card, form fields)
    Navbar.tsx          sticky nav, active-section highlight, mobile menu
    Hero.tsx            headline, rotating roles, CTAs, portrait
    ProfilePortrait.tsx framed headshot card
    About.tsx           bio + profile facts
    Skills.tsx          grouped skills
    Projects.tsx        reusable project cards
    GitHubSection.tsx   live GitHub profile + repositories
    LeetCodeSection.tsx live DSA stats
    Achievements.tsx    Smart India Hackathon / IIT Mandi Orion
    Certifications.tsx  certification grid
    Education.tsx       timeline
    Contact.tsx         validated form with mailto handoff
    Footer.tsx          footer + back to top
  data/                 all personal content (single source of truth)
  hooks/                theme, active section, GitHub API, LeetCode API
  pages/                Home, NotFound
  types/                shared data models
  lib/                  cn() and URL helpers
public/
  profile_clean_cutout.png  cut-out portrait used in the hero
  resume.pdf            generated resume (replace with your own export)
  favicon.svg           "KR" monogram favicon
```

## Customizing content

Everything personal lives in `src/data/`. Edit these files, not the components:

- `profile.ts` — name, roles, bio, email, social links, quick facts
- `projects.ts` — project copy, stacks, `repoUrl` / `liveUrl`
- `skills.ts`, `achievements.ts`, `certifications.ts`, `education.ts`

Links that could not be verified are `null`, and the UI renders an honest state instead of a broken button. Add a real URL and the button appears automatically.

### Portrait

`public/profile.jpg` is the uploaded headshot, shown in a framed card in the hero. Drop in a new image with the same filename (portrait orientation, ideally ≥ 1200px wide) to update it.

### Resume

`public/download` buttons point at `/resume.pdf`. A resume is generated from the verified profile data:

```bash
npm run resume
```

To use your own resume instead, overwrite `public/resume.pdf` — no code changes needed. The generator script lives in `scripts/generate-resume.mjs`.

### Certificates

`certifications.ts` has a `credentialUrl` field. Add a hosted certificate image/PDF link and the card shows a "View certificate" link; otherwise it says the copy is available on request.

## Live data

- **GitHub** — `useGithub` calls the public GitHub REST API for `koushikrddy` at runtime. If the API is rate limited or offline, the section falls back to a profile card with a link.
- **LeetCode** — `useLeetcode` calls a public LeetCode stats API. If unavailable, the card shows a snapshot verified in November 2026 and labels it as a snapshot. No numbers are invented.
- **Contact** — there is no backend. The form validates input and hands off to the visitor's email client via `mailto:`, with a copy-to-clipboard fallback. It never shows a fake "message sent" state.

## Deploy

The repo is ready for either platform:

- **Vercel** — import the repo; `vercel.json` sets the build command, output directory and SPA rewrites.
- **Netlify** — import the repo; `netlify.toml` sets the build, publish directory and SPA redirect.

Both include SPA rewrites so the custom 404 route works on refresh.

## Accessibility & performance notes

- Skip-to-content link, keyboard-visible focus rings, labelled icon buttons, `aria-current` navigation.
- `prefers-reduced-motion` is respected via Framer Motion's `MotionConfig` and per-component checks.
- No large animation libraries beyond Framer Motion, no external images besides the portrait, no blocking fonts (Google Fonts with `display=swap`).
