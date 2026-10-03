/* Mosslet is map data, so Move, COPY and SEND CHANGES share a stable NPC anchor. */
function prepareShroomLookoutData(m,id){
  if(id!=='world')return;
  m.npcs ||= [];
  // Separate story placements keep both locations editable, without resetting
  // an editor move each time the world loads. Only one can be present at once.
  if(!m.npcs.some(n=>n.editKey==='npc:shroom-lookout'))m.npcs.push({n:'Mosslet',sk:'shroom_green',s:610,x:536,y:1368,f:'d',kf:'d',t:0,stationary:true,until:Q.FLED,
    shroomLookout:true,mainPathLookout:true,editKey:'npc:shroom-lookout',portraitAlias:'Pip',loc:'Shroom Pass',
    bio:'A mushroom villager keeping watch on the grassy verge beside the turn to Sporehollow.',
    d:['Mosslet: Yoo Hoo! Over here!']});
  if(!m.npcs.some(n=>n.editKey==='npc:shroom-lookout-home'))m.npcs.push({n:'Mosslet',sk:'shroom_green',s:610,x:1464,y:1280,f:'d',kf:'d',t:0,stationary:true,when:Q.FLED,
    shroomLookout:true,editKey:'npc:shroom-lookout-home',portraitAlias:'Pip',loc:'Sporehollow',
    bio:'Back in Sporehollow after keeping watch beside the village path.',
    d:['Mosslet: I came back once the woods went quiet. It is good to see you safe.']});
}
function prepareShroomLookout(){
  if(MAPID!=='world')return;
  for(const n of npcs)if(n.shroomLookout){n.stationary=true;n.goto=null;}
}
function talkShroomLookout(n){
  if(!n?.shroomLookout)return false;
  const heard=discussedTopics.has('Mosslet:crash');
  const lines=quest>=Q.FLED?[
    'Mosslet: I came back once the woods went quiet. It is good to see you safe.',
    'Corin: That was a dragon. It has flown away now.',
    'Mosslet: A dragon! I am glad I waited here. The Shroom King will want to hear about this.'
  ]:heard?[
    'Mosslet: The Shroom King is inside the village. Follow this path under the caps; he will hear you out.',
    'Corin: Thank you. I will go and speak with him.'
  ]:[
    'Mosslet: Yoo Hoo! You on the path! I heard something enormous come down in the woods further north. The ground shook right under my feet.',
    'Corin: Did you see what it was?',
    'Mosslet: Only the treetops moving. I was not about to run towards that noise on my own.',
    'Mosslet: You should talk to the Shroom King. Our village is through here, under the great caps.',
    'Corin: I will speak with him. Thank you.'
  ];
  faceToward(n,P.x,P.y);playScene(lines,{who:n.n,npcActor:n,after:()=>{discussedTopics.add('Mosslet:crash');saveGame();}});return true;
}
