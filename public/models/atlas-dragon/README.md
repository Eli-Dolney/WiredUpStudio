# Atlas Dragon · Low-Poly Character Pack

Version 1.0 · 6 October 2026

A faceted 3D interpretation of Atlas: amethyst scales, turquoise circuit markings, large expressive eyes, articulated wings and tail, and an amber chest lantern.

## Files

- `models/Atlas_Dragon.glb` — recommended for the website and glTF-compatible applications. One skinned character mesh, embedded PBR material colors, a 22-bone skeleton and all five animation clips. No external textures or files are required.
- `source/Atlas_LowPoly.blend` — editable Blender 4.3.2 scene, mesh, UVs, materials, rig, animation actions and optional studio lighting. The studio collection is hidden in the modeling viewport and is not part of the exported character.
- `models/Atlas_Dragon.fbx` — rigged, animated interchange version. Reimport tested in Blender; application-specific retargeting and material adjustments may still be needed.
- `models/Atlas_Dragon_Static.obj` and `.mtl` — static rest-pose geometry only. Keep these two files together. OBJ does not include bones, skinning or animations.
- `previews/` — real model renders from four directions.
- `manifest.json`, `validation.json`, `roundtrip-validation.json` — inventory and verification information.

## Animation clips

| Clip | Length | Playback |
| --- | ---: | --- |
| Idle | 3 seconds | Loop; breathing, head motion, tail and subtle wing motion |
| Walk | 1 second | Loop; in-place diagonal quadruped gait, with ground-contact compensation |
| Wave | 3 seconds | One shot; raises and waves the right forepaw, then returns to rest |
| Jump | 2 seconds | One shot; anticipation, vertical hop and landing |
| Hover | 2 seconds | Loop; floating pose with rhythmic wing flaps and tail motion |

Actions are authored at 24 fps and exported with sampled skeletal transforms. GLB animation names are exactly `Idle`, `Walk`, `Wave`, `Jump` and `Hover`. Blender action ranges begin at frame 1; GLB clips begin at time 0.

Cross-fade between clips rather than instantly switching where possible. In particular, Hover begins already airborne. Walk stays in place; apply travel to the character's scene node in your application. Jump moves vertically within its clip and returns to its initial height. Loop Idle, Walk and Hover; play Wave and Jump once and return to Idle.

## Geometry and materials

- 3,752 triangles; 2,084 authoring vertices
- 22 deform bones; all character vertices weighted
- Flat-shaded, intentionally faceted surfaces
- 14 material slots with embedded base colors, metallic/roughness values and emissive accents
- One UV map for future texture work; no texture images required
- Ground-level origin; Blender Z-up, facing -Y; standard glTF Y-up export
- Approximately 4.14 units wingtip-to-wingtip and 3.63 units high at rest. Scale the complete rig/scene node uniformly to suit your project.

The mesh includes distinct intersecting shells for scales, eyes, claws, circuit inlays and lantern hardware. It is a real-time character asset, not a single watertight 3D-print model. Retain flat shading to preserve the intended look. Emission is included, but bloom/glow depends on the viewer's renderer.

## Blender

Open the `.blend` file and press Space to play the active Idle action. Select `Atlas_Rig` to edit the skeleton or choose another action in the Dope Sheet's Action Editor. Named NLA tracks retain the five clips and are muted by default so they do not stack over the active action. The studio collection can be revealed for lighting and camera adjustments.

## Verification

The GLB and FBX were reimported into Blender and sampled across their five clips. Skeleton counts, finite vertex positions, material presence and animation durations were checked. The OBJ/MTL pair was also reimported. Degenerate faces were removed; all mesh vertices have normalized skin weights. Side, front and rear inspection informed crest placement and wing tessellation fixes.

These checks do not constitute testing in every game engine. GLB is the canonical web version. FBX material conversion differs by application, and OBJ is intentionally static.

## License

Atlas is released under CC0 1.0 Universal. You may use, copy, modify and redistribute the assets, including in commercial projects. Credit appreciated, never required.

See `LICENSE.txt` and https://creativecommons.org/publicdomain/zero/1.0/ for the dedication and its limitations. Patent, trademark and third-party rights are not granted by CC0. The assets are provided as-is, without warranties.

## Roblox Studio

Roblox Studio import has not been tested. The FBX is included as an interchange option; check scale, materials, skinning and each animation in your Studio project before shipping.
