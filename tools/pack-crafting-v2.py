"""Repack generated crafting layers without painting or synthesizing any artwork.
Crop rectangles, registration anchors and output sizes are recorded in manifest-v2.json.
"""
import io,json,os
from pathlib import Path
from PIL import Image
ROOT=Path('assets/crafting/animations')
manifest=json.loads((ROOT/'manifest-v2.json').read_text())
for name,spec in manifest['sheets'].items():
    source=Image.open(ROOT/spec['source']).convert('RGBA')
    cell=spec['cell']; cols=spec['columns']; rows=(len(spec['boxes'])+cols-1)//cols
    atlas=Image.new('RGBA',(cols*cell,rows*cell))
    for i,(box,anchor) in enumerate(zip(spec['boxes'],spec['anchors'])):
        piece=source.crop(box)
        piece=piece.resize(tuple(round(v*spec['scale']) for v in piece.size),Image.Resampling.NEAREST)
        frame=Image.new('RGBA',(cell,cell))
        frame.alpha_composite(piece,(round(cell/2-anchor[0]*spec['scale']),round(cell-10-anchor[1]*spec['scale'])))
        atlas.alpha_composite(frame,((i%cols)*cell,(i//cols)*cell))
    data=io.BytesIO();atlas.save(data,format='WEBP',lossless=True,method=6)
    target=ROOT/spec['file']; tmp=target.with_suffix('.tmp')
    with tmp.open('wb') as out:out.write(data.getvalue());out.flush();os.fsync(out.fileno())
    tmp.replace(target)
    with Image.open(target) as check:check.load()
    print(name,atlas.size,len(data.getvalue()))
