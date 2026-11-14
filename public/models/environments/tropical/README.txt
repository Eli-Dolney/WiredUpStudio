TROPICAL — THEMED ENVIRONMENT PACK
Stilt huts, palms, tiki gates, lagoon boardwalks, rock grottoes, and island silhouettes.

10 visual families in Simple, Standard and Showcase tiers.
58 component meshes, 3 hole geometry kits, one three-hole district.
Components include tier variants, collision guides and course pieces.
Included holes: Lagoon Split, Tiki Terrace, Waterfall Grotto.

CONTENTS
FBX + GLB pack: all component exports, complete hole assemblies, district,
portable manifests and this guide. GLB meshes can be opened and edited in Blender.
Unity pack: the same FBX models and placement metadata under Assets/ThirdParty/.
Native Blender source libraries and production tool scripts are not in these web ZIPs.

IMPORT
Keep assembled holes at their exported scale. Sources use metres and Blender
Z-up; FBX applies the Unity axis conversion. Preserve TEE/CUP marker transforms.
Cup diameter is 0.108m; depth is 0.1m. Shrinking a whole hole shrinks its cup.
Use a vertex-color material: the palette is stored on the meshes, not textures.
Hide all Collision, FloorCollision and RailCollision guide renderers.
Build/weld putting contact surfaces for your physics system; avoid duplicated
floor or rail contacts. Do not close tunnels with a single convex collider.
Choose individual kits OR the district to avoid duplicate course geometry.
Simple/Standard/Showcase are design variants, not automatic runtime LODGroups.
Wire scoring, cup triggers, friction, ball resets and player navigation in your game.
District connectors are layout guides, not validated player walk/teleport paths.

VALIDATION AND LIMITS
Geometry, specified symmetry, source/export round trips, open passages and cup
dimensions were checked. FBX files were imported in isolated desktop Unity.
These checks do not prove ball physics, final pars, navigation, headset stereo,
Quest frame timing, memory or thermal performance. Test your complete scene.
Water in the web GLB preview is static vertex-colored geometry.
Moving props are posed geometry. Runtime mechanics require game implementation.
Original low-poly production geometry was built in Blender, not ComfyUI.

LICENSE
CC0 1.0 Universal. See LICENSE.txt. Credit appreciated, never required.
