import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('js/hollybeck-temple.js');
const assets=read('js/generated/game-part-1.js');
const plans=JSON.parse(read('assets/interiors/hollybeck-temple/layout.json'));
const SPR={};
for(const [i,name] of ['dragon75_flame_r','dragon75_flame_l','dragon75_saw','dragon75_rail'].entries()){
  const asset=JSON.parse(assets.match(new RegExp('\\{"name":"'+name+'"[^\\n]*?\\}'))[0]);
  SPR[name]=[96,64+i*48,asset.w,asset.h,asset.frames];
}
const MD={templeHazards:[]},draws=[],stack=[];
let matrix=[1,1,0,0],clip=null;
const ctx={
  save(){stack.push({matrix:matrix.slice(),clip});},
  restore(){({matrix,clip}=stack.pop());},
  beginPath(){},rect(x,y,w,h){clip=[x,y,w,h];},clip(){},
  translate(x,y){matrix[2]+=x*matrix[0];matrix[3]+=y*matrix[1];},
  scale(x,y){matrix[0]*=x;matrix[1]*=y;}
};
const sheetOf=sp=>sp;
function drawGameImage(ctx,sp,sx,sy,sw,sh,dx,dy,dw,dh){
  draws.push({sp,sx,sy,sw,sh,dx,dy,dw,dh,matrix:matrix.slice(),clip:clip.slice()});
}
const render=new Function('MD','ctx','SPR','sheetOf','drawGameImage',source+';return drawHollybeckTraps;')(MD,ctx,SPR,sheetOf,drawGameImage);
let frames=0,vents=0;
for(const plan of Object.values(plans))for(const hall of plan.hazards.filter(h=>h.type==='flame')){
  for(const [i,y] of hall.lines.entries()){
    const a={type:'flame',dir:i%2?-1:1,minX:hall.cross[0],maxX:hall.cross[1],y,frame:0};
    MD.templeHazards=[a];draws.length=0;render();assert.equal(draws.length,0,'resting vent has no separate flame/nozzle');
    vents++;
    for(let frame=1;frame<=8;frame++){
      a.frame=frame;draws.length=0;render();assert.equal(draws.length,1);
      const d=draws[0],sp=SPR.dragon75_flame_r,[mx,my,tx,ty]=d.matrix;
      assert.equal(d.sp,sp,'both directions use the same animation sheet');
      assert.equal(d.sx,sp[0]+frame*sp[2]+16,'exclude the baked-in nozzle from every frame');
      assert.equal(d.sy,sp[1]);assert.equal(d.sw,sp[2]-16);assert.equal(d.sh,sp[3]);
      assert.equal(d.dw,d.sw);assert.equal(d.dh,d.sh,'keep native pixel size');
      const origin=tx+d.dx*mx,top=ty+d.dy*my;
      assert.equal(origin,a.dir>0?a.minX:a.maxX,'flame starts at its wall vent');
      assert.equal(mx,a.dir,'flame travels into the hallway');assert.equal(my,1);
      assert.equal(top,y-16);assert.equal(top+d.dh,y+16,'retain bottom animation pixels');
      assert.deepEqual(d.clip,[a.minX,y-16,a.maxX-a.minX,32]);
      assert(d.clip[1]<=top&&d.clip[1]+d.clip[3]>=top+d.dh,'clip covers full animation height');
      assert.equal(stack.length,0);assert.deepEqual(matrix,[1,1,0,0],'restore transforms for following actors');
      frames++;
    }
  }
}
// A left flame must not mirror or displace the next saw or flame.
MD.templeHazards=[
  {type:'flame',dir:-1,minX:128,maxX:192,y:320,frame:6},
  {type:'saw',minX:544,maxX:608,x:570,y:400,frame:4},
  {type:'flame',dir:1,minX:128,maxX:192,y:480,frame:3}
];
draws.length=0;render();assert.equal(draws.length,4);
const saw=draws[2];assert.equal(saw.sp,SPR.dragon75_saw);assert.deepEqual(saw.matrix,[1,1,0,0]);
assert.equal(saw.dx,Math.round(570-SPR.dragon75_saw[2]/2));assert.equal(saw.dy,384);
assert.equal(saw.sx,SPR.dragon75_saw[0]+4*SPR.dragon75_saw[2]);
assert.equal(draws[3].matrix[0],1);
assert(vents>0);console.log(`PASS: ${frames} animation frames across ${vents} vents stay attached to their walls, preserve full frame height, exclude duplicate nozzles, and leave saw transforms intact.`);
