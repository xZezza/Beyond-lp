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
