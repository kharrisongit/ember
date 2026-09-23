"""Assemble the throne doorway from complete castle wall and door components."""
from pathlib import Path
import json,re,gzip,base64,io
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
p=(root/'js/generated/game-part-1.js').read_text()
s=json.loads(gzip.decompress(base64.b64decode(re.search(r'const ATLAS_GZ = "([^"]+)',p)[1])))['sprites']
a=(root/'assets/game-assets.js').read_text()
r=json.loads(re.search(r'window.EMBER_ASSETS.ROYAL_DATA = (.*);',a)[1]);s.update(r['sprites'])
pages=json.loads(re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);',a)[1])+r['pages']
def crop(name,frames=False):
 x,y,w,h,n,*_=s[name];w*=n if frames else 1
 out=Image.new('RGBA',(w,h))
 for px,py,pw,ph,url in pages:
  if px<x+w and py<y+h and px+pw>x and py+ph>y:
   out.paste(Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGBA'),(px-x,py-y))
 return out
wall=crop('royal_room_westhall')
patch=wall.crop((100,16,101,64)).resize((64,51),Image.Resampling.NEAREST)
column=wall.crop((72,16,88,64)).resize((16,51),Image.Resampling.NEAREST)
patch.paste(column,(0,0));patch.paste(column,(48,0))
ImageDraw.Draw(patch).rectangle((24,14,39,43),fill='#19121b')
floor=crop('ifloor_throne')
patch.paste(floor.crop((288,9,304,16)),(24,44))
patch.save(root/'assets/interiors/throne-door-wall.png')
crop('royal_door',True).resize((192,51),Image.Resampling.NEAREST).save(root/'assets/interiors/throne-door-frames.png')
