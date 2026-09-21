# Kolar Putih — Website

Official website for **Persatuan Kebajikan Kolar Putih**, a Malaysian charity
founded in 2020 supporting the homeless and orphaned children.

Live: https://kolarputih.vercel.app

## Stack

- React 18 + Vite
- React Router (client-side routing)
- Plain CSS with design tokens (`src/index.css`)
- Fraunces (display serif) + Inter (body) from Google Fonts
- Google Material Symbols Rounded for all icons

## Pages

- `/` — Home (hero, impact, photo band, numbers, mission, how we serve, donate CTA)
- `/about` — Story, vision / mission / values, committee
- `/milestone` — 2021 → 2024 journey timeline
- `/contact` — Contact details, donation info, enquiry form

## Design system

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0E0E0E` | Body text, dark sections |
| `--paper` | `#FFFFFF` | Base background |
| `--paper-2` | `#F6F5F2` | Alternate section |
| `--accent` | `#8C1D18` | Donate buttons, highlights |
| `--line` | `#E2DFD8` | Borders |
| radius | `6px` | Cards, images |
| buttons | `100px` pill | All CTAs |

The brand mark is black-and-white, so the palette is monochrome with a single
deep-red accent — no gradients, no generic purple.

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Images

All photography is real programme photography. Source JPEGs were resized and
converted to WebP (quality 80, method 6), cutting the total payload from
1,147 KB to 326 KB (**71.6% smaller**). Files live in `public/`.

`optimize.py` re-runs the conversion from pristine originals in `/tmp/kporig`.

## Deploy

Auto-deploys to Vercel on push to `main` via `.github/workflows/deploy.yml`.
Requires repo secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

Manual deploy:

```bash
npx vercel deploy --prod
```
