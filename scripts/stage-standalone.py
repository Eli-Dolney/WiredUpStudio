"""Stage standalone downloads from the Net & Tame assets/models folder."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from shutil import copyfile
import sys

source = Path(sys.argv[1])
out = Path(__file__).resolve().parents[1] / 'public/models/standalone'
out.mkdir(exist_ok=True)
decor = {'Acacia', 'Blossom', 'Broadleaf', 'Pine', 'RockCluster'}
formats = {'.bbmodel', '.mtl', '.obj'}
originals = [p for p in source.iterdir() if p.suffix in formats]
parks = [p for p in (source / 'parks').iterdir() if p.suffix in {'.bbmodel', '.json'}]
for slug, files in {
    'sunmane-lion': list((source/'mythic').glob('*.*')),
    'hero-lion': list((source/'hero').glob('*.*')),
    'decor': [p for p in originals if p.stem in decor] + [p for p in parks if p.stem.startswith('Park')] + [source/'ZooPalette.png'],
    'classic-animals': [p for p in originals if p.stem not in decor] + [p for p in parks if not p.stem.startswith('Park')] + [source/'ZooPalette.png'],
    'capture-nets': [p for folder in ('nets','nets-scoop') for p in (source/folder).iterdir() if p.suffix in {'.bbmodel','.json'}],
}.items():
    with ZipFile(out / (slug+'.zip'), 'w', ZIP_DEFLATED) as archive:
        for file in sorted(files):
            archive.write(file, file.relative_to(source))
for slug, preview in [('hero-lion','hero/previews/Lion_three_quarter.png'),('sunmane-lion','mythic/previews/SunmaneLion-Studio.png')]:
    copyfile(source / preview, out / (slug+'.png'))
