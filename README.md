# Beyond landing

Landing indipendente di Beyond, in inglese: un’introduzione visiva all’ipotesi dell’universo nato in un buco nero, approfondimenti apribili, fonti e collegamenti a viaggio e biblioteca. L’ipotesi è dichiaratamente speculativa.

Repository: https://github.com/xZezza/Beyond-lp.git
Cartella: /Users/gaiaghezzi/Desktop/Progetti/Beyond/Beyond-lp
App collegata: https://beyond-one-topaz.vercel.app/

## Stack e comandi

Astro statico e TypeScript, pnpm 10.34.9. Interazioni con JavaScript e controlli HTML nativi. Font, logo e immagini sono locali. Nessun React, backend o database.

```sh
pnpm install --frozen-lockfile
pnpm run dev
pnpm run check
pnpm test
pnpm run build
```

Anteprima locale: http://127.0.0.1:4174/. Output: `dist/`. Il controllo della build verifica anche i riferimenti alle risorse locali.

## Vercel

- Project Name: `beyond-lp` (minuscolo).
- Root Directory: `./`.
- Application Preset: Astro.
- Build Command: `pnpm run build`.
- Output Directory: `dist`.
- Install Command: rilevamento automatico, override disattivato.
- Node.js: 24.x.
- Environment Variables: `ENABLE_EXPERIMENTAL_COREPACK=1` per rispettare la versione pnpm indicata in package.json.

Non occorre l’adapter Vercel per questo sito statico. Documentazione: https://vercel.com/docs/frameworks/frontend/astro e https://vercel.com/docs/package-managers.

## Collegamenti tra i due progetti

`src/data/app-links.mjs` punta al sito Beyond esistente e conserva le sue rotte hash (`#biblioteca`, `#scoperta/buco-nero`, `#mappa`, ecc.). Non viene copiata una seconda app nella landing.

Per cambiare destinazione, impostare `PUBLIC_BEYOND_APP_URL` su Vercel prima della build, oppure copiare `.env.example` in `.env` per l’anteprima locale. In assenza della variabile si usa l’indirizzo Beyond confermato dall’utente. La variabile è pubblica e non deve contenere segreti. Se l’app cambia le proprie rotte, aggiornare anche questo modulo.

## File principali

- `src/pages/index.astro`: testi, struttura, approfondimenti e collegamenti.
- `src/layouts/LandingLayout.astro`: pagina HTML e metadati.
- `src/styles/landing.css`: grafica responsive e movimento ridotto.
- `public/assets/sources.json`: provenienza delle tre immagini.
- `public/brand/`: wordmark approvato con simbolo originale incorporato.
- `public/fonts/`: Space Grotesk e Inter, con licenze OFL.

## Fonti scientifiche

- Popławski, cosmologia con torsione: https://arxiv.org/abs/2509.11468.
- Shamir, analisi JADES: https://arxiv.org/abs/2502.18781.
- Patel e Desmond, analisi delle direzioni di rotazione: https://arxiv.org/abs/2404.06617.
- FAQ cosmologiche di Ned Wright / UCLA: https://www.astro.ucla.edu/~wright/cosmology_faq.html.

Le comparazioni di densità e raggio non sono presentate come due prove indipendenti; lo studio JADES non viene generalizzato a tutte le galassie.

La landing e l’app hanno repository, installazioni e pubblicazioni indipendenti. Il codice non contiene token o dati del diario. Non sono stati acquistati servizi né attivata una pubblicazione dall’agente.


## Cinematic descent prototype

Branch `codex/cosmic-descent` replaces the initial hero with a scroll-driven journey: black hole → galaxy field → illustrated Milky Way → illustrated Solar System → Earth. The theory, evidence notes, library links and image credits remain below it.

`src/components/CosmicJourney.astro` supplies semantic chapter content and native links. `src/scripts/cosmic-journey.ts` progressively enhances it; `cosmic-renderer.ts` draws a single Canvas 2D view. No new runtime dependency is added. The frame loop only runs while the scroll position settles or the canvas resizes; it does not run continuously at rest. Pointer/touch scrolling remains native.

The five chapter links jump freely in either direction. “Skip the journey” leads directly to the theory. “Use still scenes” switches to ordinary sections; the system reduced-motion preference and missing canvas use the same alternative. Without JavaScript the chapter text and imagery remain readable.

The black-hole-to-universe transition and route are imaginative, with compressed scales. Webb and Apollo 17 images have visible credits; the spiral galaxy and planetary arrangement are illustrations. This prototype is prepared locally and is not automatically published.
