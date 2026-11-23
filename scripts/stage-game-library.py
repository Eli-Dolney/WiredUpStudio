"""Stage creator-owned, reusable game art. Run export-game-models.py in Blender first."""
import argparse
import hashlib
import io
import json
import re

import zipfile
from pathlib import Path
from PIL import Image

cli = argparse.ArgumentParser()
for arg in ("golf", "tanks", "cache"):
    cli.add_argument("--" + arg, required=True, type=Path)
opts = cli.parse_args()
golf, tanks, cache = opts.golf, opts.tanks, opts.cache
site = Path(__file__).resolve().parents[1]
out = site / "public/game-assets"
out.mkdir(exist_ok=True)
notice = """Wired Up Studios dedicates its original asset files in this collection to the public domain under CC0 1.0 Universal.
You may use, modify and redistribute them, including commercially. Attribution is optional.
https://creativecommons.org/publicdomain/zero/1.0/legalcode
Third-party software and trademarks retain their respective rights.
"""
(out / "LICENSE.txt").write_text(notice, encoding="utf-8")
catalog = []
GOLF, TANKS = "Putt Putt Party", "QuestTanks"

def digest(data):
    return hashlib.sha256(data).hexdigest()

def title(name):
    return re.sub(r'(?<=[a-z0-9])(?=[A-Z])', ' ', name.replace('_', ' ')).strip()

def public_file(folder, data, suffix):
    rel = Path(folder) / (digest(data)[:24] + suffix)
    dest = out / rel
    dest.parent.mkdir(exist_ok=True)
    if not dest.exists():
        dest.write_bytes(data)
    return "/game-assets/" + rel.as_posix()

def cover(path):
    if not path:
        return ""
    with Image.open(path) as img:
        img.thumbnail((1100, 680))
        buf = io.BytesIO()
        img.convert("RGB").save(buf, "WEBP", quality=86)
    return public_file("covers", buf.getvalue(), ".webp")

def collect(game, name, entries, poster=None, prefix="", meshes=False):
    # entries maps portable download paths to their local source files.
    entries = dict(sorted(entries.items()))
    if not entries:
        raise ValueError(name)
    slug = re.sub('[^a-z0-9]+', '-', name.lower()).strip('-')
    files, families, parts = [], {}, []
    seen_mesh = set()
    chunk, size = [], 0
    def finish():
        nonlocal chunk, size
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            for key, data in [("LICENSE.txt", notice.encode()), *chunk]:
                info = zipfile.ZipInfo(key, (2026, 1, 1, 0, 0, 0))
                z.writestr(info, data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)
        data = buf.getvalue()
        if len(data) >= 25 * 1024**2:
            raise ValueError(f"Archive too large: {name}")
        parts.append(dict(url=public_file("downloads", data, ".zip"), bytes=len(data),
                          filename=f"{slug}-{len(parts)+1}.zip", sha256=digest(data)))
        chunk, size = [], 0
    for key, path in entries.items():
        data = path.read_bytes()
        ext = path.suffix.lower()
        if meshes:
            # The editor saves many byte-identical procedural meshes per hole.
            geometry = digest(re.sub(rb'(?m)^  m_Name:.*$', b'  m_Name:', data))
            if geometry in seen_mesh:
                continue
            seen_mesh.add(geometry)
        # Inputs are conservatively split before compression, except mesh YAML.
        if chunk and size + len(data) > (65 if meshes else 23) * 1024**2:
            finish()
        chunk.append((key, data))
        size += len(data)
        if ext == ".meta":
            continue
        files.append(key)
        preview = None
        if ext == ".fbx":
            root = golf if path.is_relative_to(golf) else tanks
            preview = (cache / path.relative_to(root)).with_suffix(".glb")
        elif ext in {".glb", ".png", ".ogg", ".wav"} and not path.name.endswith("_Lighting.png"):
            preview = path
        if not preview:
            continue
        stem = path.stem.removeprefix(prefix + "_") if prefix else path.stem
        family, tier = stem, "Original"
        for label in ("Simple", "Standard", "Showcase"):
            if stem.endswith("_" + label):
                family, tier = stem[:-(len(label)+1)], label
                break
        item = families.setdefault(family, dict(name=title(family), variants={}))
        if tier in item["variants"]:
            # A handoff can include a prior copy of the same in-game prop.
            continue
        item["variants"][tier] = dict(url=public_file("previews", preview.read_bytes(), preview.suffix),
                                     format=preview.suffix[1:], filename=path.stem+preview.suffix)
    if chunk:
        finish()
    inventory = public_file("inventories", ("\n".join(files)+"\n").encode(), ".txt")
    catalog.append(dict(inventory=inventory, game=game, name=name, files=len(files), formats=sorted({Path(k).suffix[1:].upper() for k in files}),
                        cover=cover(poster), parts=parts, items=sorted(families.values(), key=lambda i:i["name"])))
    print(name, len(files), len(families), "previews", flush=True)

def pick(root, patterns, folder=""):
    return {str((Path(folder) / p.relative_to(root)).as_posix()): p for pat in patterns for p in root.glob(pat) if p.is_file()}

art = golf / "Assets/PuttParty"
kits = golf / "Assets/ThirdParty/MiniGolfPacks"
hand = golf / "tools/handoffs"
special = {"LastAqueduct": ("The Last Aqueduct", ["LastAqueduct", "RomeWaterworks"], hand/"LastAqueduct/Previews/The_Last_Aqueduct.jpg"),
           "SoundingKey": ("Sounding Key", ["SoundingKey", "SoundingKeyPolish", "SoundingKeySurf"], hand/"SoundingKey/Sounding_Key_18_Hole_Map.jpg"),
           "ToyRoom": ("Toy Room", ["ToyRoomMoonWatch"], hand/"ToyRoomMoonWatch/Moon Watch from the room.jpg")}
for pack in sorted(p for p in kits.iterdir() if p.is_dir() and any(p.glob("*.fbx"))):
    entries = pick(pack, ["**/*.fbx", "**/course.json", "**/vr_scale_manifest.json"])
    photo = art / "Resources/Previews" / (pack.name.lower()+".png")
    name = title(pack.name)
    if pack.name in special:
        name, folders, photo = special[pack.name]
        for folder in folders:
            root = hand / folder
            extra = pick(root, ["**/*.fbx", "*.blend", "routes.json", "branch_paths.json"], "Sources/"+folder)
            current = {p.name for p in entries.values()}
            entries.update({k:p for k,p in extra.items() if p.name not in current})
        entries.update(pick(hand/"CoursePolish", [pack.name+"_Polished.blend"], "Sources"))
    collect(GOLF, name, entries, photo, prefix=pack.name)
for prop in sorted((art/"Art/Props").iterdir()):
    if prop.is_dir():
        collect(GOLF, title(prop.name.title())+" base props", pick(prop, ["*.fbx"]))
collect(GOLF, "Course design sources", {**pick(hand/"CoursePropLibrary01", ["*.blend"], "Props"),
    **pick(hand/"CourseEnvironments01", ["*.blend"], "Landmarks"), **pick(golf/"Assets/StreamingAssets/courses", ["*.course"], "Layouts")},
    hand/"CoursePropLibrary01/Collection preview.jpg")
collect(GOLF, "Golf music and ambience", {**pick(art/"Resources/Music", ["*.ogg"]), **pick(art/"Art/Audio", ["**/*.wav"])})
materials = {}
for sub in ("Art/Textures", "Art/Branding", "Materials", "Shaders", "Resources/PuttPartyFX", "Resources/PuttPartyUI", "Resources/Previews"):
    materials.update(pick(art/sub, ["**/*.mat", "**/*.shader", "**/*.png", "**/*.physicMaterial"], "Assets/PuttParty/"+sub))
for key,path in list(materials.items()):
    meta = Path(str(path)+".meta")
    if meta.exists():
        materials[key+".meta"] = meta
collect(GOLF, "Golf materials and skies", materials)
collect(GOLF, "Procedural golf meshes", pick(art/"Generated", ["**/*.asset"]), meshes=True)
rooms = tanks/"Assets/QuestTanks/Resources/Environments"
for model in sorted(rooms.glob("*_Geometry.fbx")):
    name = model.stem.removesuffix("_Geometry")
    source = tanks/"Art/Environments"
    collect(TANKS, title(name), {**pick(rooms, [name+"_Geometry.fbx", name+"_Lighting.png"]),
            **pick(source, [name+".blend"])}, source/(name+"-diorama.png"), prefix=name)
tank_models = pick(cache/"Tanks", ["*.glb"])
if len(tank_models) != 20:
    raise ValueError("Expected 20 tank exports")
collect(TANKS, "Table Tanks", {**tank_models, **pick(tanks/"Art/Tanks", ["*.blend"])})
collect(TANKS, "Tank music and jingles", pick(tanks/"Assets/QuestTanks/Resources/Music", ["*.ogg"]))
collect(TANKS, "Tank campaign layouts", pick(tanks/"Tools/CampaignMaps", ["world*.txt"]))
collect(TANKS, "Tank shaders and artwork", {**pick(tanks/"Assets/QuestTanks/Shaders", ["*.shader"], "Shaders"),
    **pick(tanks/"Assets/QuestTanks/Branding", ["*.png"], "Artwork")})
(out/"catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, separators=(",",":")), encoding="utf-8")
