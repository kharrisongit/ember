"""Pack generated 3x3 sheets, preserving alpha and anchoring stationary bases.
Run from the repository root. Sources and crop/anchor metadata are kept in assets.
"""
import json
import io
import os
from pathlib import Path
from PIL import Image

ROOT=Path('assets/crafting/animations')
manifest=json.loads((ROOT/'manifest.json').read_text())
for kind,spec in manifest['sheets'].items():
    source=Image.open(ROOT/spec['source']).convert('RGBA')
    frames=[]
    for box,anchor in zip(spec['boxes'],spec['anchors']):
        crop=source.crop(box)
        size=tuple(round(v*spec['scale']) for v in crop.size)
        crop=crop.resize(size,Image.Resampling.NEAREST)
        cell=Image.new('RGBA',(192,192))
        cell.alpha_composite(crop,(round(96-anchor[0]*spec['scale']),round(182-anchor[1]*spec['scale'])))
        frames.append(cell)
    atlas=Image.new('RGBA',(576,576))
    for i,cell in enumerate(frames):atlas.alpha_composite(cell,(i%3*192,i//3*192))
    encoded=io.BytesIO();atlas.save(encoded,format='WEBP',lossless=True,method=6)
    target=ROOT/(kind+'.webp');temporary=target.with_suffix('.tmp')
    with temporary.open('wb') as output:
        output.write(encoded.getvalue());output.flush();os.fsync(output.fileno())
    temporary.replace(target)
    print(kind,(ROOT/(kind+'.webp')).stat().st_size)
