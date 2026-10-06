# Atlas Dragon website integration

The dedicated Atlas section appears on `/3d-models#atlas-dragon`. It loads only after a valid, enabled `public/models/atlas-dragon/manifest.json` is available. Its GLB viewer is lazy-loaded when a visitor opens the preview. The original 32-animal collection and custom animal renderer are unchanged.

Atlas includes a self-contained animated GLB, editable Blender source, complete ZIP, real hero render, import notes, and a scoped CC0 1.0 asset license. CC0 applies to the original Atlas assets, not website code or third-party software. Credit is appreciated, never required.

The GLB supplies animation names and durations. Idle, Walk, and Hover loop; Wave and Jump play once and stop. The viewer supports pause, timeline scrubbing, mouse/touch orbit, zoom, camera reset, and reduced-motion initial pause. Downloads remain available if WebGL fails.

## Checks

- `npm run build`
- `node scripts/verify-atlas-dragon.mjs` checks download byte counts and SHA-256, GLB header, embedded resources, animation data, and license presence.
- `node scripts/verify-animal-packs.mjs` verifies the unchanged animal library.
- Browser QA: original materials, all five clips, native scrubbing, pause/play, Wave/Jump completion, orbit/reset, desktop and 390px mobile layout.
- Asset QA: final ZIP integrity and internal hash inventory; 125 sampled poses across all 14 material primitives; no nonfinite vertices or negative floor bounds. Download responses match canonical bytes. No absolute source paths found in release ZIP entries.

Deployment uses the existing GitHub main → Cloudflare Pages `wiredupstudio` integration. No DNS changes or new credentials are required.
