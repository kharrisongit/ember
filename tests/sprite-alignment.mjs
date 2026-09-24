import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const code=read('js/millwood-interiors.js'),game=read('js/generated/game-part-2.js');
const draws=[],door={royalDoor:true,x:312,y:64,sy:96};
const W={maps:{cinderhold:{roomActors:[door]},royal_seal:{roomActors:[]}}};
const ctx=vm.createContext({W,SPR:{throne_wall:[0,12177,328,51]},atlasImg:{},document:{createElement:()=>({getContext:()=>({})})},drawGameImage:(...a)=>draws.push(a)});
vm.runInContext(code,ctx);vm.runInContext('prepareThroneGallery();prepareThroneGallery()',ctx);
assert.equal(W.maps.cinderhold.roomActors.length,1);assert.equal(W.maps.royal_seal.roomActors.length,1);
assert.deepEqual(door,{royalDoor:true,x:312,y:64,sy:96});
const painting=W.maps.royal_seal.roomActors[0];assert(painting.editorMovable);
assert.deepEqual(draws[0].slice(2),[280,12187,26,31,0,0,26,31]);
assert.equal(draws.length,1);
const raw=execFileSync('python',['-c',"from PIL import Image;import sys;sys.stdout.buffer.write(Image.open(sys.argv[1]).convert('RGBA').tobytes())",new URL('assets/interiors/house-seated.png',root).pathname]);
ctx.source=new Uint32Array(raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength));
const result=vm.runInContext('seatedPixels2x(source,96,1080)',ctx);
assert.equal(result.length,192*2160);
let changed=0;
for(let cy=0;cy<45;cy++)for(let cx=0;cx<4;cx++){
 const palette=new Set();for(let y=0;y<24;y++)for(let x=0;x<24;x++)palette.add(ctx.source[(cy*24+y)*96+cx*24+x]);
 for(let y=0;y<48;y++)for(let x=0;x<48;x++){
  const pixel=result[(cy*48+y)*192+cx*48+x];assert(palette.has(pixel),'Colours leaked between animation cells');
  if(pixel!==ctx.source[(cy*24+(y>>1))*96+cx*24+(x>>1)])changed++;
 }
}
assert(changed>1000,'Refinement did not change pixel edges');
vm.runInContext(game.slice(game.indexOf('const FOE_ATTACK_OFFSETS='),game.indexOf('function golemFrame(')),ctx);
const offsets=vm.runInContext('FOE_ATTACK_OFFSETS',ctx);assert.equal(Object.keys(offsets).filter(k=>k.startsWith('ent')).length,12);
// Execute the actual renderer positioning with a south attack cell and compare
// its trunk baseline (74px tall) with the smaller idle cell.
const positioning=game.slice(game.indexOf('      const anchor=FOE_ATTACK_OFFSETS'),game.indexOf('      if (f.hurt > 0',game.indexOf('      const anchor=FOE_ATTACK_OFFSETS')));
for(let variant=1;variant<=3;variant++){
 Object.assign(ctx,{f:{x:200,y:200,kind:'ent'+variant},s2:[0,0,128,122],o:{nm:`ent${variant}_atk_d`}});
 assert.equal(vm.runInContext(`{${positioning};dy+74}`,ctx),200,'Ent trunk rises when its vine cell starts');
}
console.log(`PASS: throne painting relocation and layering; ${changed} refined seated pixels with isolated palettes; ent attack body baseline.`);

// Register the Ashfiend's actual opening attack pixels against its idle art,
// then exercise the renderer at both integer and fractional world positions.
const ashfiend=JSON.parse(execFileSync('python',['-c',`
import base64,gzip,io,json,re,sys
from pathlib import Path
from PIL import Image
root=Path(sys.argv[1])
source=(root/'js/generated/game-part-1.js').read_text()
atlas=json.loads(gzip.decompress(base64.b64decode(re.search(r'const ATLAS_GZ = "([^"]+)"',source)[1])))
pages=json.loads(re.search(r'window.EMBER_ASSETS.ATLAS_PAGES = (.*);',(root/'assets/game-assets.js').read_text())[1])
cache={}
def cell(spec):
 x,y,w,h=spec[:4];im=Image.new('RGBA',(w,h))
 for i,(px,py,pw,ph,src) in enumerate(pages):
  l,t,r,b=max(x,px),max(y,py),min(x+w,px+pw),min(y+h,py+ph)
  if l>=r or t>=b:continue
  if i not in cache:cache[i]=Image.open(io.BytesIO(base64.b64decode(src.split(',')[1]))).convert('RGBA')
  im.alpha_composite(cache[i].crop((l-px,t-py,r-px,b-py)),(l-x,t-y))
 return im
result={}
for direction in 'duew':
 idle,attack=[atlas['sprites']['dv2_'+state+'_'+direction] for state in ['idle','atk']]
 a,b=cell(idle),cell(attack);aa,bb=a.getbbox(),b.getbbox();pixels=[]
 for y in range(a.height):
  for x in range(a.width):
   color=a.getpixel((x,y))
   if color[3]:pixels.append((x,y,color))
 scores=[]
 for dy in range(bb[1]-aa[1]-2,bb[1]-aa[1]+3):
  for dx in range(bb[0]-aa[0]-2,bb[0]-aa[0]+3):
   score=sum(1 for x,y,c in pixels if 0<=x+dx<b.width and 0<=y+dy<b.height and b.getpixel((x+dx,y+dy))==c)
   scores.append((score,dx,dy))
 score,dx,dy=max(scores)
 assert score>len(pixels)*.5
 result[direction]={'idle':idle,'attack':attack,'shift':[dx,dy]}
print(json.dumps(result))
`,root.pathname],{encoding:'utf8'}));
for(const [dir,art] of Object.entries(ashfiend))for(const position of [200,200.2,200.5,200.8]){
 Object.assign(ctx,{f:{x:position,y:position,kind:'devil'},s2:art.idle,o:{nm:'dv2_idle_'+dir}});
 const idle=vm.runInContext(`{${positioning};[dx,dy]}`,ctx);
 Object.assign(ctx,{s2:art.attack,o:{nm:'dv2_atk_'+dir}});
 const attack=vm.runInContext(`{${positioning};[dx,dy]}`,ctx);
 assert.equal(attack[0]+art.shift[0],idle[0],dir+' attack shifts horizontally');
 assert.equal(attack[1]+art.shift[1],idle[1],dir+' attack jumps vertically');
}
console.log('PASS: actual Ashfiend attack artwork stays aligned with idle in all four directions, including fractional positions.');
