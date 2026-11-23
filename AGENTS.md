# Beyond-lp

- This is the independent landing repository requested by the user: https://github.com/xZezza/Beyond-lp.git. Work in this directory, not Beyond-webapp.
- Use Astro static output (`dist/`), TypeScript, and pnpm 10.34.9. Keep only pnpm-lock.yaml. The hosting target is Vercel. No additional spend, accounts, database or image generation.
- English UI, approved Beyond identity, local Space Grotesk/Inter fonts, existing credited NASA/ESO imagery. Distinguish photographs, visualizations and speculation.
- The existing experience lives at https://beyond-one-topaz.vercel.app/. Links use its current root hash routes; configurable via PUBLIC_BEYOND_APP_URL. Do not assume an /explore page exists on that deployment.
- Preserve native expandable evidence notes, keyboard navigation, mobile menu, motion pause and prefers-reduced-motion. No mandatory sequence.
- Run pnpm run check, pnpm test, and pnpm run build after implementation changes.
- Connect this landing to the GitHub repository supplied by the user. Keep Vercel publication under the user’s control; repository configuration itself does not authorize a deployment.

## Cosmic descent landing direction

- Focus on this landing, not on publishing/updating the separate cockpit app. The user wants a giant black hole close-up, then a zoom through galaxies, the Milky Way, the Solar System and Earth.
- Use a scroll-driven cinematic intro with reversible movement and direct chapter jumps. Preserve a way to skip to the theory. Treat the inside-black-hole transition as an imagined route, not established cosmology.
- Keep native still scenes as the no-JS / reduced-motion / unavailable-canvas fallback. No scrolling hijack, new framework dependency or generated bitmap imagery. Automatic playback must stay skippable.
- Prototype on codex/cosmic-descent locally for review. The existing Vercel deployment remains the reference published version until a release is requested.

- Latest visual feedback: avoid visible photographic rectangles and black mattes. Earth must be a circular cutout, galaxies must blend through soft alpha edges into a shared star field, and chapter jumps should glide without disrupting native user scrolling.

- Historical opening request, superseded by the continuous loop below: black hole → galaxies → Milky Way → Solar System → Earth, then back to the black hole. Keep the opening black-hole headline on the left throughout this preview; after the return, hand control to manual scroll and chapters. Provide Skip intro, let native user input interrupt, and skip autoplay for reduced motion or a direct later-chapter URL.

- Latest correction: the intro must feel like a continuous video, without pauses on chapters or a final automatic stop. Loop the outward-and-returning journey until native user input or Take control switches to manual exploration. Keep the black-hole headline fixed during the loop. Use the credited NASA 4K-derived animated black hole and 3200px poster, with restrained zoom; do not enlarge the old 1024px still into a grainy hero.

- Latest refinement: nested-image zoom, not separate slides or whole-screen crossfades. Keep destinations at coherent positions within their parent scene, moving one camera through all scales. Earth must rotate about its axis using a credited global map projected on a sphere, including when manual exploration rests on Earth. Reduced-motion / still mode remains static.

- Opening copy cleanup: retain the black-hole question but remove its descriptive subtitle and Begin the descent / Skip to the idea actions, including the header Skip to the idea button and The horizon to home / Automatic preview route label. Keep the actual exploration controls available.

- Latest art direction: the interactive galaxy must have volume and perspective, not a single flat photograph. Use a procedural spiral of stars/dust in depth; keep the NASA/ESO artwork only as the still-scene fallback. At the opening, the black-hole interior should be almost opaque black, with the nested universe becoming visible only while approaching.

- Blend the distant galaxy into the wider universe: lower distant contrast, diffuse arm edges and a scattered 3D outer population shared with the surrounding field, rather than a bright isolated spiral badge.

- All eight Solar System planets must rotate. Animate axial spin and orbital travel with gentle compressed cinematic periods. The camera and Earth renderer must use the same time-dependent orbital position so the nested zoom never jumps away from the moving planet. Use illustrative procedural surfaces for the small non-Earth planets and preserve NASA attribution for Earth.

- The opening black hole must visibly animate, not just play a nearly static video. Use the earlier NASA camera excursion (9.5–12 seconds and back) while retaining its orientation; keep poster and movie crop/aspect ratio identical.

- Latest playback correction supersedes continuous looping: autoplay makes one forward trip to Earth and one return to the horizon, then hands over to manual exploration. Only explicit replay restarts it. Keep the black-hole video animated at rest.
- The user rejected the attempted aperture and inner-ring masks because they cut and distort the disc. Restore the previously accepted black-hole rendering; do not retain those visual masks. The requested entry smoothing and ring removal remain unresolved design work.

- Current bounded request (23 November): only repair the entry into the universe. Fill the black-hole centre with the existing universe texture at sufficient scale, with no small-circle clipping or cuts. Keep the accepted movie completely intact and soften its former hard exit. Do not change the camera route, later scenes, content, planetary animation or one-shot playback.

- Latest request: remove only the thin inner orange ring shown in the screenshot. Use selectively edited derived video/poster assets; preserve the accepted renderer, completed entry transition, route and timing. Do not reintroduce runtime circular or horizontal crop masks. Keep the NASA source credit and disclose the artistic media adaptation.

- Latest image-quality correction: use the full native 4537×4630 Webb field, not the 1600px copy. Draw it directly without sending it through the 1600px sprite cache. Preserve the accepted entry coverage, camera, movie and one-shot playback. Do not invent sharpness or upscale low-resolution pixels.
