"""Run inside Blender with -- <golf-root> <tanks-root> <output-cache>."""
import bpy
import sys
from pathlib import Path

golf, tanks, cache = map(Path, sys.argv[sys.argv.index("--") + 1:])
art = golf / "Assets/PuttParty/Art/Props"
packs = golf / "Assets/ThirdParty/MiniGolfPacks"
handoffs = golf / "tools/handoffs"
rooms = tanks / "Assets/QuestTanks/Resources/Environments"

def export(target):
    target.parent.mkdir(parents=True, exist_ok=True)
    result = bpy.ops.export_scene.gltf(filepath=str(target), export_format="GLB", use_selection=True,
        export_animations=False, export_cameras=False, export_lights=False, export_extras=False)
    if result != {"FINISHED"}:
        raise RuntimeError(str(target))

sources = sorted({*packs.rglob("*.fbx"), *art.rglob("*.fbx"), *handoffs.rglob("*.fbx"), *rooms.glob("*.fbx")})
for path in sources:
    root = golf if path.is_relative_to(golf) else tanks
    target = (cache / path.relative_to(root)).with_suffix(".glb")
    if target.exists() and target.stat().st_mtime >= path.stat().st_mtime:
        continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.wm.fbx_import(filepath=str(path))
    if path.parent == rooms:
        # The full 4K bake ships in the download. Embed a lighter copy in the viewer.
        atlas = rooms / path.name.replace("_Geometry.fbx", "_Lighting.png")
        mat = bpy.data.materials.new("Room lighting")
        mat.use_nodes = True
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = bpy.data.images.load(str(atlas))
        tex.image.scale(1024, 1024)
        tex.image.pack()
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        for obj in bpy.context.scene.objects:
            if obj.type == "MESH":
                obj.data.materials.clear()
                obj.data.materials.append(mat)
    bpy.ops.object.select_all(action="SELECT")
    export(target)

source = tanks / "Art/Tanks/TableTanks.blend"
bpy.ops.wm.open_mainfile(filepath=str(source))
kinds = ["Player", "Sentry", "Scout", "Ricochet", "Rocket", "Miner", "Skirmisher", "Sniper", "Guardian", "Burst", "Bulwark", "Orbiter", "Lander"]
bosses = ["Ironclad", "Rocket Marshal", "Siege Engine", "Toybox King", "Star Dreadnought", "Santa Sleigh"]
for obj in list(bpy.context.scene.objects):
    if obj.type != "MESH" or obj.parent or "hull" not in obj.name:
        continue
    if obj.name.startswith("boss"):
        name = bosses[int(obj.name.rsplit("_", 1)[1])]
    elif obj.name.startswith("santa"):
        name = "Santa Skin"
    else:
        name = kinds[int(obj.name.rsplit("_", 1)[1])]
    bpy.ops.object.select_all(action="DESELECT")
    obj.location = (0, 0, 0)
    for part in [obj, *obj.children_recursive]:
        part.select_set(True)
    export(cache / "Tanks" / (name + ".glb"))
print("GAME_MODEL_EXPORT_COMPLETE", len(sources), flush=True)
