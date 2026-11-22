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

Branch `codex/cosmic-descent` opens on a nearly black horizon and automatically previews a continuous out-and-back journey. The black-hole question stays on the left during playback. Native scroll, the timeline or “Take control” hands the current position to manual exploration. Chapters remain freely selectable. The preview loops without chapter holds or an automatic final stop.

A single logarithmic camera magnifies nested coordinates: galaxy field inside the horizon, a volumetric spiral in that field, the Solar System within its arm, and Earth in its orbit. The spiral uses stars and diffuse dust distributed in three dimensions with perspective; the NASA/ESO artwork is retained only for still scenes. Earth uses a NASA global surface mosaic projected onto an inclined rotating sphere, and continues rotating when manual exploration rests there. The black hole uses an approximately 4.8 MB, 3200px video derived from NASA's 4K simulation with a high-resolution poster fallback. The original 1024px image is no longer enlarged for the hero.

`src/components/CosmicJourney.astro` supplies semantic chapters and native links. `src/scripts/cosmic-journey.ts` controls progressive enhancement; `cosmic-renderer.ts`, `galaxy-cloud.ts` and `earth-globe.ts` render one Canvas 2D view without new dependencies. `src/data/nested-camera.mjs` owns the shared spatial hierarchy. Soft alpha sprites remove photographic rectangles. Animation pauses in a hidden tab. Manual rendering idles except while the visible video or Earth needs animation.

“Use still scenes”, the system reduced-motion preference and unavailable canvas select ordinary static sections. A direct later-chapter URL skips autoplay. Without JavaScript, all content and imagery remain readable. The opening subtitle, duplicate start/skip buttons and route label have been removed at the user's request; the chapter navigation and exploration controls remain.

The route, compressed scales, spiral and lighting are illustrative. The black-hole universe is speculative; this is not a measured flight path. Provenance for photos, illustrations, the global map and the derived video is in `public/assets/sources.json`, with visible on-page credits. The prototype remains local until a release is requested.

All eight planets orbit the Sun and spin on their axes in the enhanced Solar System. Periods and other planetary surfaces are illustrative; Earth retains the NASA surface map. `orbital-motion.mjs` provides the same moving Earth coordinate to the camera and the scene. Still/reduced-motion views do not animate.
