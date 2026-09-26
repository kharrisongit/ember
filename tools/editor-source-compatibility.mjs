import assert from 'node:assert/strict';
import {loadEditorGame} from './editor-game-context.mjs';
import '../js/editor-build-data.js';
const B=globalThis.EmberBuildData;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

// Compare only the data addressed by a draft. Dialogue, art, UI and unrelated
// map changes do not invalidate a still-correct object/terrain anchor.
export function validateDraftTargets(draft,state){
  let map=state.map;
  const conflict=message=>'Editor conflict: '+message+'. Your edits have not been published.';
  for(const op of draft.operations){
    if(op.kind==='build'){map={...map,...B.apply(B.snapshot(map),op)};continue;}
    if(['actor','object','decor'].includes(op.kind)){
      let target;
      if(op.kind==='actor'){
        target=op.key.startsWith('npc:')?(map.npcs||[]).find(n=>(n.editKey||'npc:'+n.n)===op.key):
          (map.roomActors||[]).find((a,i)=>(a.editKey||'actor:'+i+':'+a.spr)===op.key);
        assert(target&&(target.spr||target.portraitOriginalName||target.n)===op.identity,conflict('the actor '+op.key+' changed'));
        assert(!target.editorDeleted||op.deleted,conflict('the actor '+op.key+' was deleted'));
      }else{
        const array=op.kind==='object'?map.objs:op.tag==='s'?map.scatter:map.sanim;
        const i=op.kind==='object'?Number(op.key)*3:op.index;
        assert(array?.[i]===op.sprite,conflict('the scenery at '+op.key+' changed'));
        const removed=op.kind==='object'?map.editorDeletedObjects?.includes(Number(op.key)):map.editorDeletedDecor?.includes(op.key);
        assert(!removed||op.deleted,conflict('the scenery at '+op.key+' was deleted'));
        target={x:array[i+1],y:array[i+2]};
      }
      assert(target.x===op.fromX&&target.y===op.fromY,conflict(op.key+' moved since this edit began'));
    }
    if(op.kind==='arena'){
      const arena=map.features?.find(f=>f.id===op.id&&f.kind==='arena');
      assert(arena&&same(arena,op.before),conflict('hunting arena '+op.id+' changed'));
    }
    if(op.kind==='door'){
      const door=map.doors?.[op.index];
      assert(door?.to===op.to,conflict('the doorway destination changed'));
      const rect=door.triggerRect||{x:door.x*16+(door.ox||0)-(door.wide?16:0),y:door.y*16+(door.oy||0),w:16+(door.wide?32:0),h:16};
      assert(same(rect,op.before)||same(rect,op.rect),conflict('the doorway moved'));
    }
    if(op.kind==='collision'){
      const [x,y]=op.key.split(',').map(Number),before=map.collisionOverrides?.[op.key]??null;
      assert(x<map.w*2&&y<map.h*2,conflict('the collision cell is outside this map'));
      assert(before===op.before||before===op.blocked,conflict('collision at '+op.key+' changed'));
    }
    if(op.kind==='paint'){
      assert(op.width===map.w&&op.height===map.h,conflict('the painted map was resized'));
      for(let i=0;i<op.values.length;i++)assert(state.terrain?.[op.start+i]===op.before[i]||state.terrain?.[op.start+i]===op.values[i],conflict('terrain at tile '+(op.start+i)+' changed'));
    }
    if(op.kind==='feature-delete')assert(op.tx<map.w&&op.ty<map.h,conflict('the removed scenery is outside this map'));
    if(op.kind==='object-add')assert(state.sprites[op.sprite],conflict('the added sprite is no longer available'));
    if(op.kind==='npc-add')assert(state.looks.includes(op.look),conflict('the NPC appearance is no longer available'));
    if(op.kind==='npc-transfer'){
      const source=state.sources[op.sourceMap]?.find(n=>(n.editKey||'npc:'+n.n)===op.sourceKey);
      assert(source&&(source.portraitOriginalName||source.n)===op.identity&&!source.editorDeleted,conflict('the transported NPC changed'));
    }
  }
}

export async function createSourceValidator(current,root=process.cwd()){
  const warnings=[];
  const {context:c,run}=await loadEditorGame(root,{...console,warn:message=>warnings.push(message)});
  return (base,draft)=>{
    c.layouts=structuredClone(current);c.layouts.maps[draft.map]=structuredClone(base);
    c.targetId=draft.map;c.targetDraft=draft;
    run(`publishedEditorLayouts=layouts;
      if(!W.maps[targetId])throw Error('Editor conflict: this map no longer exists.');
      for(const id of new Set(targetDraft.operations.filter(o=>o.kind==='npc-transfer').map(o=>o.sourceMap))){
        if(!W.maps[id])throw Error('Editor conflict: the NPC source map no longer exists.');
        prepareEditorEntities(W.maps[id],id);prepareMarketNpcCast(W.maps[id],id);applyPublishedEditorLayout(W.maps[id],id);
      }
      if(targetDraft.operations.some(o=>o.kind==='paint')){mode='play';loadMap(targetId);}
      else{
        prepareEditorEntities(W.maps[targetId],targetId);prepareMarketNpcCast(W.maps[targetId],targetId);
        applyPublishedEditorLayout(W.maps[targetId],targetId);editorPrepareMap(targetId,false);
      }
    `);
    assert(!warnings.some(w=>String(w).includes('changed anchors')),'Editor conflict: published object anchors changed in the game code.');
    const state=run(`({map:{...editorDraftBases.get(targetId).map,...editorDraftBases.get(targetId).build,collisionOverrides:W.maps[targetId].collisionOverrides},
      terrain:terrOrig,sprites:NAMES,looks:npcLineupCatalog().map(n=>n.key),sources:W.maps})`);
    state.sources=Object.fromEntries(Object.entries(state.sources).map(([id,m])=>[id,m.npcs]));
    validateDraftTargets(draft,state);
    console.log('Current game map verified: all '+draft.operations.length+' edit targets are compatible.');
  };
}
