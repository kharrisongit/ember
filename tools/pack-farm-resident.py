"""Register the generated 4x4 Edwin idle sheet to the NPCs' 2x pixel grid."""
import json, sys
from pathlib import Path
import numpy as np
from scipy.ndimage import label, find_objects
from PIL import Image

source=Image.open(sys.argv[1]).convert('RGBA')
pixels=np.array(source)
labels,count=label(pixels[:,:,3]>=180,np.ones((3,3)))
poses=[]
for number,region in enumerate(find_objects(labels),1):
    if region is None or np.count_nonzero(labels[region]==number)<1000:continue
    y,x=region;poses.append([x.start,y.start,x.stop-x.start,y.stop-y.start,number])
assert len(poses)==16, f'Expected 16 complete poses, found {len(poses)}'
poses.sort(key=lambda p:p[1]);ordered=[]
for row in range(4):ordered.extend(sorted(poses[row*4:row*4+4],key=lambda p:p[0]))
scale=54/max(p[3] for p in ordered)
output=Image.new('RGBA',(256,256))
for index,(x,y,w,h,number) in enumerate(ordered):
    tile=pixels[y:y+h,x:x+w].copy();tile[labels[y:y+h,x:x+w]!=number]=0
    tile[:,:,3]=np.where(tile[:,:,3]>=180,255,0)
    tile=Image.fromarray(tile).resize((round(w*scale),round(h*scale)),Image.Resampling.NEAREST)
    output.paste(tile,(index%4*64+(64-tile.width)//2,index//4*64+60-tile.height))
out=Path(__file__).resolve().parents[1]/'assets/sprites/farm';out.mkdir(exist_ok=True)
output.save(out/'edwin.png',optimize=True)
(out/'packing.json').write_text(json.dumps({'source':source.size,'boxes':ordered,'scale':scale,'cell':[64,64],'draw':[32,32],'rows':['d','u','e','w']},indent=2)+'\n')
print('Packed Edwin: 16 complete idle poses, 256x256, hard alpha.')
