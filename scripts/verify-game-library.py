"""Verify the shipped game catalog, archive checksums, inventories and standalone previews."""
from pathlib import Path
import hashlib
import json
import struct
import zipfile

root = Path(__file__).resolve().parents[1] / "public"
base = root / "game-assets"
catalog = json.loads((base / "catalog.json").read_text("utf-8"))
referenced = {base / "catalog.json", base / "LICENSE.txt"}
models = set()

def resolve(url):
    assert url.startswith("/game-assets/")
    file = root / url[1:]
    assert file.resolve().is_relative_to(base.resolve()) and file.stat().st_size > 0
    referenced.add(file)
    return file

for pack in catalog:
    seen = set()
    listed = resolve(pack["inventory"]).read_text("utf-8").splitlines()
    assert len(listed) == len(set(listed)) == pack["files"]
    if pack["cover"]:
        resolve(pack["cover"])
    for part in pack["parts"]:
        file = resolve(part["url"])
        data = file.read_bytes()
        assert len(data) == part["bytes"] < 25 * 1024**2
        assert hashlib.sha256(data).hexdigest() == part["sha256"]
        with zipfile.ZipFile(file) as z:
            assert not z.testzip() and b"CC0 1.0" in z.read("LICENSE.txt")
            for entry in z.namelist():
                assert not Path(entry).is_absolute() and ".." not in Path(entry).parts
                if entry != "LICENSE.txt" and not entry.endswith(".meta"):
                    assert entry not in seen
                    seen.add(entry)
    assert seen == set(listed)
    assert len({item["name"] for item in pack["items"]}) == len(pack["items"]), pack["name"]
    for item in pack["items"]:
        for variant in item["variants"].values():
            file = resolve(variant["url"])
            if variant["format"] != "glb" or file in models:
                continue
            models.add(file)
            buf = file.read_bytes()
            magic, version, length, chunk, kind = struct.unpack_from("<4sIII4s",buf)
            assert (magic,version,length,kind) == (b"glTF",2,len(buf),b"JSON")
            gltf = json.loads(buf[20:20+chunk])
            assert gltf["meshes"] and gltf["scenes"]
            assert all("uri" not in rec for rec in gltf.get("buffers", []) + gltf.get("images", []))
            assert all("POSITION" in prim["attributes"] for mesh in gltf["meshes"] for prim in mesh["primitives"])
orphans = {p for p in base.rglob("*") if p.is_file()} - referenced
assert not orphans, f"Unreferenced generated files: {list(orphans)[:3]}"
print(f"Verified {len(catalog)} collections, {sum(p['files'] for p in catalog)} source files, {len(models)} distinct GLBs and {sum(len(p['parts']) for p in catalog)} archives.")
