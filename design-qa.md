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


## Continuous nested journey revision — 22 November 2026

User feedback: replace separate image slides with an image-within-image zoom, remove photo mattes, keep a continuous preview, improve black-hole resolution, rotate Earth, simplify the opening copy, give the galaxy volume, and start with an almost opaque dark horizon.

Implemented one hierarchical camera and continuous 20-second out-and-back loop. No lead-in, chapter holds or final automatic stop. Real muted NASA video supplies the black hole, with a 3200px poster fallback. Its child field is nearly invisible initially and reveals while approaching. The interactive galaxy is a perspective-projected 3D distribution of 12,000 star/dust particles, including diffuse outskirts and reduced distant contrast; the still fallback retains the credited artwork. Earth is a rotating orthographic sphere from NASA's June 2004 global surface mosaic, without an opaque photo square.

Opening descriptive subtitle, Begin the descent, Skip to the idea (including the header button), and the route label were removed. The fixed headline, chapter links, native scrubber, takeover and static alternative remain.

Browser QA used the existing localhost preview at 1280×800 and 390×844. Checked nested field/galaxy views, the volumetric spiral, the dark opening with cleaned copy, and the Earth globe. Two screenshots taken with unchanged scroll show different continents, confirming animation at rest. Autoplay remained active across repeated cycles and retained the horizon caption; Take control/chapter navigation switched to manual. The still-scene toggle exposed all chapters, and enabling zoom restored the canvas. Mobile has no horizontal overflow. Viewport override was reset. An intermediate missing-import error was fixed before the final checks; no new console errors after a fresh final page load. OS motion preference was not changed.

Validation: 17 passing tests, including camera continuity, monotonic magnification, nested destination centres and Earth's orbital alignment. Astro check and static build/resource audit pass. Existing non-blocking dependency annotation warnings remain. Updated review screenshots: `output/landing/smooth/black-hole-dark.jpg`, `galaxy-volume.jpg`, `earth-rotation-a.jpg`, `earth-rotation-b.jpg`, and `mobile-earth.jpg` in the companion workspace. A new self-contained HTML review artifact includes local fonts, textures and the video. File-protocol browser automation remains unavailable; visual QA used localhost.

Not pushed or deployed. The separate Beyond cockpit app is unchanged.


## Animated Solar System follow-up — 22 November 2026

All eight planets now orbit and spin with individual illustrative periods. Venus and Uranus use opposite axial rotation; the other small planets have rotating procedural surfaces, with visible cloud bands and Jupiter's illustrative red spot. Earth retains NASA map data. The same time-dependent Earth position drives its orbit and the nested zoom camera.

19 tests pass, including every planet's movement, closed elliptical trajectories, continuity across orbit wrap and the camera following Earth at several orbital phases. Astro check and build/resource audit pass. At 1280×800, two captures at unchanged scroll show all planets changing position; the jump to Earth reaches the moving planet and keeps it centred. No new console errors after a fresh load. Temporary viewport override was reset. Screenshots are in `output/landing/smooth/solar-orbits-a.jpg` and `solar-orbits-b.jpg`. Static/reduced-motion mode remains still. No deployment.


## Opening black-hole motion follow-up — 22 November 2026

The previous 28–36 second NASA segment had a nearly fixed viewpoint, so it looked static despite playing. Replaced it with the visible camera excursion at 9.5–12 seconds and its reverse. Matching 3200×2334 poster and movie crops preserve the aspect ratio and keep the viewpoint on the same side of the disc. This is an illustrative edited loop; accretion is not physically reversed. Added muted inline autoplay and reset video time when the journey starts/replays. Static mode remains paused. Astro check, all 19 tests, and the production build/resource audit pass.

Updated the previously shared standalone HTML aliases as well as the latest review file. The user explicitly requested the local preview opened from the beginning, so its server is retained for viewing. No deployment.


## One-shot preview and visual rollback — 22 November 2026

Autoplay now makes exactly one trip to Earth and back, rests at the horizon and switches to manual exploration. Explicit Replay still works. The black-hole video keeps animating at rest. The two playback tests now assert completion and no automatic restart.

The user rejected the attempted horizon aperture and ring removal: their masks introduced visible cuts in the accretion disc. Restored the previously accepted renderer in full and removed those experimental helpers/tests. This rollback does not claim to solve the requested entry smoothing or inner-ring removal; those remain design work.

Validation after rollback: Astro check has no errors, warnings or hints; all 19 tests and the static build/resource audit pass. The renderer is identical to the last accepted commit, so none of the experimental cuts remain. Small browser anchor realignments near the top no longer interrupt autoplay; native input still takes control.


## Entry-only correction — 23 November 2026

Bounded change: enlarge the existing universe texture enough to fill the entire black-hole centre while entering, eliminate the small circular image clip, and replace the abrupt movie cutoff with a continuous easing of the intact disc light. No aperture, ring-removal mask, video edit or disc crop was added. The original camera, captions, later 3D galaxy, planetary animation and one-shot playback are unchanged. Once the native field is sufficiently large, its exact original framing is restored.

Two new tests verify corner coverage at the moving camera centre, nondecreasing image magnification, original later-scene framing, and continuity across the former .30 cutoff. All 21 tests pass; Astro check has no errors/warnings/hints; production build/resource audit pass, with the existing dependency annotation warnings. Browser inspection covered entry positions .18 and .295 on desktop and .19 on 390×844 mobile, with no horizontal overflow. The video remains intact without the rejected horizontal mask cuts. Review captures are in `output/landing/entry/`. Updated standalone preview aliases contain this version. No publication.
