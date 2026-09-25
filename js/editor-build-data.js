/* Data-only Build snapshots shared by the game and workflow validator. */
(function(root){
  'use strict';
  const fields=['w','h','terr','base_terr','objs','scatter','sanim','features','decks','felled','felled_rle','editorDeletedObjects','editorDeletedDecor','editorPublishedPaint'];
  const arrays=new Set(fields.slice(4).filter(k=>k!=='felled_rle'));
  const clone=v=>JSON.parse(JSON.stringify(v));
  function snapshot(m){return clone(Object.fromEntries(fields.map(k=>[k,m[k]??(arrays.has(k)?[]:k==='base_terr'?m.terr:k==='felled_rle'?'':null)])));}
  function encodeFelled(cells){
    const rows=new Map();for(const cell of cells){const [x,y]=(Array.isArray(cell)?cell:String(cell).split(',')).map(Number);if(!rows.has(y))rows.set(y,[]);rows.get(y).push(x);}
    const runs=[];for(const [y,xs]of [...rows].sort((a,b)=>a[0]-b[0])){xs.sort((a,b)=>a-b);for(let i=0;i<xs.length;i++){const start=xs[i];while(i+1<xs.length&&xs[i+1]===xs[i]+1)i++;runs.push(y+':'+start+(xs[i]===start?'':'-'+xs[i]));}}return runs.join('|');
  }
  function hash(v){const s=JSON.stringify(v);let a=2166136261,b=5381;for(let i=0;i<s.length;i++){a=Math.imul(a^s.charCodeAt(i),16777619);b=Math.imul(b,33)^s.charCodeAt(i);}return(a>>>0).toString(16)+'-'+(b>>>0).toString(16)+'-'+s.length;}
  function diff(a,b,path=[],out=[]){
    if(JSON.stringify(a)===JSON.stringify(b))return out;
    if(Array.isArray(a)&&Array.isArray(b)){
      for(let i=0;i<b.length;i++)diff(a[i],b[i],[...path,i],out);
      if(b.length<a.length)out.push({path,length:b.length});
    }else if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
      for(const k of Object.keys(a))if(!(k in b))out.push({path:[...path,k],remove:true});
      for(const k of Object.keys(b))diff(a[k],b[k],[...path,k],out);
    }else if(path.length===1&&['terr','base_terr','felled_rle'].includes(path[0])&&typeof a==='string'&&typeof b==='string'){
      // Terrain is RLE text. Extending a map usually changes just its tail;
      // transfer that span instead of every unchanged row of the overworld.
      let start=0,end=0;
      while(start<Math.min(a.length,b.length)&&a[start]===b[start])start++;
      while(end<Math.min(a.length,b.length)-start&&a[a.length-1-end]===b[b.length-1-end])end++;
      const edit={path,start,deleteCount:a.length-start-end,text:b.slice(start,b.length-end)};
      out.push(JSON.stringify(edit).length<JSON.stringify({path,value:b}).length?edit:{path,value:b});
    }else out.push({path,value:b});
    // A resized map's display terrain and base ground are identical. Reuse the
    // already-updated base instead of sending the same large string twice.
    if(!path.length&&b.terr===b.base_terr&&a.terr!==b.terr){
      const index=out.findIndex(c=>c.path.length===1&&c.path[0]==='terr');
      if(index>=0){out.splice(index,1);out.push({path:['terr'],copy:'base_terr'});}
    }
    return out;
  }
  const safeKey=k=>typeof k==='number'?Number.isInteger(k)&&k>=0&&k<4000000:typeof k==='string'&&k.length<200&&!['__proto__','constructor','prototype'].includes(k);
  function safeData(v,depth=0){
    if(depth>24)throw Error('Build data is nested too deeply');
    if(v===null||typeof v==='boolean')return;
    if(typeof v==='number'){if(!Number.isFinite(v)||Math.abs(v)>1e9)throw Error('Invalid build number');return;}
    if(typeof v==='string'){if(v.length>8000000)throw Error('Build value is too large');return;}
    if(!v||typeof v!=='object')throw Error('Invalid build value');
    if(Array.isArray(v)){if(v.length>4000000)throw Error('Build array is too large');for(const x of v)safeData(x,depth+1);}
    else for(const [k,x]of Object.entries(v)){if(!safeKey(k))throw Error('Invalid build key');safeData(x,depth+1);}
  }
  function validate(changes){
    if(!Array.isArray(changes)||changes.length>200000)throw Error('Invalid Build changes');
    for(const c of changes){
      if(!Array.isArray(c.path)||!c.path.length||c.path.length>24||!fields.includes(c.path[0])||!c.path.every(safeKey))throw Error('Invalid Build field');
      if(c.remove){if(c.path.length===1||typeof c.path.at(-1)==='number')throw Error('Invalid Build removal');}
      else if('copy'in c){if(c.path.length!==1||c.path[0]!=='terr'||c.copy!=='base_terr')throw Error('Invalid Build copy');}
      else if('text'in c){
        if(c.path.length!==1||!['terr','base_terr','felled_rle'].includes(c.path[0])||typeof c.text!=='string'||
          !Number.isInteger(c.start)||c.start<0||c.start>8000000||!Number.isInteger(c.deleteCount)||c.deleteCount<0||c.deleteCount>8000000)throw Error('Invalid Build text edit');
        safeData(c.text);
      }
      else if('length'in c){if(!Number.isInteger(c.length)||c.length<0||c.length>4000000)throw Error('Invalid Build array length');}
      else safeData(c.value);
    }
  }
  function apply(base,op){
    if(hash(base)!==op.before)throw Error('Build baseline changed. Refresh before editing this area.');
    validate(op.changes);const value=clone(base);
    for(const c of op.changes){
      let parent=value;for(const k of c.path.slice(0,-1)){if(!Object.hasOwn(parent,k))throw Error('Build path no longer exists');parent=parent[k];}
      const k=c.path.at(-1);
      if(c.remove)delete parent[k];
      else if('copy'in c)parent[k]=value[c.copy];
      else if('text'in c){
        if(typeof parent[k]!=='string'||c.start+c.deleteCount>parent[k].length||parent[k].length-c.deleteCount+c.text.length>8000000)throw Error('Invalid Build text range');
        parent[k]=parent[k].slice(0,c.start)+c.text+parent[k].slice(c.start+c.deleteCount);
      }
      else if('length'in c){if(!Array.isArray(parent[k])||c.length>parent[k].length)throw Error('Invalid Build truncation');parent[k].length=c.length;}
      else parent[k]=clone(c.value);
    }
    if(!Number.isInteger(value.w)||!Number.isInteger(value.h)||value.w<1||value.h<1||value.w>4000||value.h>4000||value.w*value.h>4000000)throw Error('Invalid map dimensions');
    for(const k of ['terr','base_terr']){
      if(typeof value[k]!=='string')throw Error('Invalid terrain');let count=0;
      for(const run of value[k].split('|')){if(!/^\d+\.\d+$/.test(run))throw Error('Invalid terrain run');const [v,n]=run.split('.').map(Number);if(v>19||n<1)throw Error('Invalid terrain run');count+=n;}
      if(count!==value.w*value.h)throw Error('Terrain size does not match map');
    }
    for(const k of ['objs','scatter','sanim'])if(!Array.isArray(value[k])||value[k].length%3||value[k].some(n=>!Number.isFinite(n)))throw Error('Invalid scenery data');
    if(hash(value)!==op.after)throw Error('Build data did not match its saved result');
    return value;
  }
  root.EmberBuildData={fields,snapshot,encodeFelled,hash,diff,validate,apply};
})(globalThis);
