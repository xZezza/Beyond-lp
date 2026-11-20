# Beyond-lp — local verification

20 November 2026. Standalone repository, Astro 6.4.8 and pnpm 10.34.9. No React runtime, cockpit duplication, database or hosting publication.

- `pnpm run check`: zero errors, warnings or hints.
- `pnpm test`: four passing tests for default app links, optional base path, local port and invalid URL handling.
- `pnpm run build`: success, static output in `dist/`; post-build audit finds all local resources. Two non-blocking Zod annotation warnings from the installed dependency remain.
- Browser: verified desktop 1280×720 and mobile 390×844; no horizontal overflow. Native note expanded with keyboard. Motion pause toggles state. Mobile menu opens and closes after selecting a section. No console errors observed.
- The library link was clicked and successfully loaded the real app at https://beyond-one-topaz.vercel.app/#biblioteca. Its currently deployed header still uses OLTRE, while this landing uses the approved Beyond identity. Other app hash links are verified by unit tests and their rendered hrefs; they were not all navigated during this pass.
- CSS and JS honor the system reduced-motion preference; OS settings were not changed during testing. The landing is statically rendered, with native anchors and details; it does not require JavaScript to read the theory or follow links.
- Images, branding and fonts are local. Image credits are visible on the landing, with provenance metadata in public/assets/sources.json and font licenses in public/fonts.

Desktop and mobile screenshots are saved in the companion workspace: output/landing/beyond-lp-desktop.jpg and output/landing/beyond-lp-mobile.jpg.

The old combined-repository landing changes were backed up under work/migration-backup/Beyond-webapp in the companion workspace before restoring the saved cockpit on the original app’s main branch. The original application’s remote was not modified.


## Cosmic descent prototype

Branch: codex/cosmic-descent. Opening hero replaced by five scroll-linked chapters: giant black hole, Webb galaxy field, NASA/ESO Milky Way illustration, schematic Solar System, and Apollo 17 Earth. The existing theory, evidence notes and cross-project book links remain below the intro. No new dependency or generated bitmap was added.

Validation: Astro check has zero errors, warnings or hints; all eight tests pass; production build and local asset verification pass. The two existing dependency annotation warnings remain non-blocking. Four new tests cover chapter targets versus scroll geometry, clamping, reversibility and deterministic star placement.

Browser verified at 1280×720 and 390×844. The opening view, galaxy field, Milky Way, Solar System and Earth were visually inspected. Native scrolling moves through the horizon and reverses; direct chapter links and a keyboard jump to Earth work. An already-open page responds to chapter hash changes, and a reload at #earth initializes at Earth. No horizontal overflow at either viewport. Fast distant jumps use a single visible caption; old captions no longer overlap during transitions.

“Use still scenes” changes to ordinary sections with all five chapters exposed to accessibility tools. “Enable the zoom” restores the enhanced journey. “Skip the journey” and the Earth scene’s “Explore the hypothesis” reach the existing theory section; its top was verified at the intended 100px scroll margin. No console errors were observed. The OS reduced-motion preference is honored in implementation but was not changed during this test.

Review assets in the companion workspace: output/landing/descent/01-black-hole.jpg through 05-earth.jpg. A self-contained HTML review copy with inlined scripts, CSS, imagery and fonts is at output/landing/cosmic-descent-preview.html. Browser policy disallowed opening file:// URLs, so that offline copy was packaged and checked for embedded resources but not opened by the automation; browser QA used the local web preview.

This version is local on its development branch. It has not been pushed or deployed. The original Beyond application was not changed.
