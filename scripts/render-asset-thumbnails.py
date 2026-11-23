"""Render the gallery's actual GLBs. Requires npm ci, Python Playwright and Chromium."""
import argparse
import base64
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
public = root / "public"
output = public / "asset-thumbnails"
output.mkdir(exist_ok=True)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--channel", help="Installed Chromium channel, e.g. msedge")
parser.add_argument("--force", action="store_true")
args = parser.parse_args()
game = json.loads((public/"game-assets/catalog.json").read_text("utf-8"))
urls = set()
tank_urls, grouped_urls, room_photos = set(), set(), {}
for pack in game:
    for item in pack["items"]:
        variants = item["variants"]
        variant = next(variants[t] for t in ("Standard", "Original", "Showcase", "Simple") if t in variants)
        if variant["format"] == "glb":
            url = variant["url"]
            urls.add(url)
            if pack["game"] == "QuestTanks" and pack["name"] == "Table Tanks":
                tank_urls.add(url)
            if pack["game"] == "QuestTanks" and len(pack["items"]) == 1 and pack["cover"]:
                room_photos[url] = public/pack["cover"][1:]
            if item["name"] in {"Island Wayfinding", "Island Vessels", "Moon Watch"}:
                grouped_urls.add(url)
for path in (public/"models/environments").glob("*/props.json"):
    for family in json.loads(path.read_text("utf-8"))["families"]:
        urls.add(family["tiers"]["Standard"]["url"])
assert len({Path(url).stem for url in urls}) == len(urls), "Conflicting preview basenames"

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".mjs": "text/javascript"}

    def log_message(self, *args):
        pass

    def translate_path(self, url):
        path = Path(super().translate_path(url))
        rel = path.relative_to(public)
        if rel.parts[:1] == ("vendor",):
            return str(root/"node_modules/three"/Path(*rel.parts[1:]))
        if rel.as_posix() == "render.mjs":
            return str(root/"scripts/thumbnail-renderer.mjs")
        return str(path)

server = ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(public)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel=args.channel, args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        page = browser.new_page()
        page.goto(f"http://127.0.0.1:{server.server_port}/game-assets/LICENSE.txt")
        page.set_content('''<script type="importmap">{"imports":{"three":"/vendor/build/three.module.js","three/addons/":"/vendor/examples/jsm/"}}</script>''')
        page.evaluate("import('/render.mjs')")
        for url in sorted(urls):
            dest = output / (Path(url).stem + ".webp")
            newer = max((public/url[1:]).stat().st_mtime, (root/"scripts/thumbnail-renderer.mjs").stat().st_mtime)
            if dest.is_file() and dest.stat().st_mtime >= newer and not args.force:
                continue
            if url in room_photos:
                # The studio renders show the furnished interior of each closed room.
                with Image.open(room_photos[url]) as photo:
                    ImageOps.fit(photo, (384, 288), method=Image.Resampling.LANCZOS).save(dest, quality=86)
                continue
            options = {"url": url, "tank": url in tank_urls, "detail": url in grouped_urls}
            data = base64.b64decode(page.evaluate("(options)=>window.renderThumbnail(options)", options))
            if data[8:12] != b"WEBP":
                raise RuntimeError("Failed to render " + url)
            dest.write_bytes(data)
        browser.close()
finally:
    server.shutdown()
print(f"Rendered or verified {len(urls)} thumbnail files.")
