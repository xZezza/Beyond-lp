# Beyond-lp

- This is the independent landing repository requested by the user: https://github.com/xZezza/Beyond-lp.git. Work in this directory, not Beyond-webapp.
- Use Astro static output (`dist/`), TypeScript, and pnpm 10.34.9. Keep only pnpm-lock.yaml. The hosting target is Vercel. No additional spend, accounts, database or image generation.
- English UI, approved Beyond identity, local Space Grotesk/Inter fonts, existing credited NASA/ESO imagery. Distinguish photographs, visualizations and speculation.
- The existing experience lives at https://beyond-one-topaz.vercel.app/. Links use its current root hash routes; configurable via PUBLIC_BEYOND_APP_URL. Do not assume an /explore page exists on that deployment.
- Preserve native expandable evidence notes, keyboard navigation, mobile menu, motion pause and prefers-reduced-motion. No mandatory sequence.
- Run pnpm run check, pnpm test, and pnpm run build after implementation changes.
- Connect this landing to the GitHub repository supplied by the user. Keep Vercel publication under the user’s control; repository configuration itself does not authorize a deployment.
