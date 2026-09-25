import fs from'node:fs';import zlib from'node:zlib';import vm from'node:vm';import assert from'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),code=read('js/generated/game-part-2.js');
const W=JSON.parse(zlib.gunzipSync(Buffer.from(read('js/generated/game-part-1.js').match(/const W_GZ = "([^"]+)/)[1],'base64')));
const c=vm.createContext({W,SPR:{school_src_Reader1:[0,0,32,80,12]},TS:16,MD:null,npcs:[],actorLayouts:{}}),run=s=>vm.runInContext(s,c);
run(code.slice(code.indexOf('function restoreSchoolCast('),code.indexOf('function applyWorld(')));
run(code.slice(code.indexOf('function libraryActorDepth('),code.indexOf('function tavernActorDepth(')));
run(code.slice(code.indexOf('function editorActorInfo('),code.indexOf('function pickEditorActor(')));
run('restoreSchoolCast()');const layouts=JSON.parse(read('assets/interiors/remaining/layouts.json'));
for(const id of ['school','school2'])for(const[fidx,f]of layouts[id].objects.entries())W.maps[id].roomActors.push({n:f.name.replaceAll('-',' '),editKey:'remaining:'+id+':'+fidx,x:f.x+f.w/2,y:f.y+f.h,sy:f.sortY??f.y+f.h,extractedCanvas:{width:f.w,height:f.h},exactFurniture:true});
run(read('js/published-editor-layouts.js'));c.saved=JSON.parse(read('assets/editor-layouts.json'));run('publishedEditorLayouts=saved;applyPublishedEditorLayout(W.maps.school,"school");applyPublishedEditorLayout(W.maps.school2,"school2")');
for(const[id,spr,x,y]of [['school','library_reader_red',273,207],['school','school_anim_5',185,212],['school','school_anim_6',256,243],['school2','school2_anim_3',79,175],['school2','school2_anim_6',96,182],['school2','school2_anim_4',249,176]]){
 const actors=W.maps[id].roomActors,a=actors.find(o=>o.spr===spr);assert.deepEqual([a.x,a.y],[x,y],'Published reader alignment');
 const table=actors.filter(o=>o.n==='reading table'&&Math.abs(o.x-x)<34).sort((p,q)=>Math.abs(p.y-y)-Math.abs(q.y-y))[0];
 assert(c.libraryActorDepth(a,actors)>table.sy,'Reader visible above own desk');
 const chair=actors.filter(o=>o.n==='chair').sort((p,q)=>Math.hypot(p.x-x,p.y-y)-Math.hypot(q.x-x,q.y-y))[0];assert(Math.abs(chair.x-x)<=6,'Reader centered on chair');
 assert(c.libraryActorDepth(a,actors)>chair.sy,'Chair cannot obscure reader');
 const before=c.libraryActorDepth(a,actors);table.x+=500;assert.equal(c.libraryActorDepth(a,actors),a.sy??a.y,'Moving desk away releases depth');table.x-=500;assert.equal(c.libraryActorDepth(a,actors),before);
}
console.log('PASS: six published library/study reader positions align with current chairs and draw above their desks; moving furniture remains independent.');
