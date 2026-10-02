/* Mosslet is map data, so Move, COPY and SEND CHANGES share a stable NPC anchor. */
function prepareShroomLookoutData(m,id){
  if(id!=='world')return;
  m.npcs ||= [];
  if(m.npcs.some(n=>n.shroomLookout))return;
  m.npcs.push({n:'Mosslet',sk:'shroom_green',s:610,x:536,y:1368,f:'d',kf:'d',t:0,stationary:true,
    shroomLookout:true,mainPathLookout:true,editKey:'npc:shroom-lookout',portraitAlias:'Pip',loc:'Shroom Pass',
    bio:'A mushroom villager keeping watch on the grassy verge beside the turn to Sporehollow.',
    d:['Mosslet: Yoo Hoo! Over here!']});
}
function prepareShroomLookout(){
  if(MAPID!=='world')return;
  const existing=npcs.find(n=>n.shroomLookout);
  if(existing){existing.stationary=true;existing.goto=null;}
}
function talkShroomLookout(n){
  if(!n?.shroomLookout)return false;
  const heard=discussedTopics.has('Mosslet:crash');
  const lines=heard?[
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
