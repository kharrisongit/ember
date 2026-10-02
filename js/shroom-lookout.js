/* A resident waits at the hidden eastern turn into Sporehollow. */
function prepareShroomLookout(){
  if(MAPID!=='world'||npcs.some(n=>n.shroomLookout))return;
  const town=features.find(f=>f.kind==='area'&&f.place==='Sporehollow');
  if(!town)return;
  const pathY=(town.y0+(town.road?.y??22))*TS;
  const x=(town.x0-3)*TS+8,y=pathY+16;
  const spots=[[x,y],[x+16,y],[x-16,y],[x,y+16],[x,y-16]].filter(p=>canStand(...p));
  if(!spots.length)return;
  npcs.push({n:'Mosslet',sk:'shroom_green',s:610,x:spots[0][0],y:spots[0][1],f:'d',kf:'d',t:0,stationary:true,
    shroomLookout:true,editKey:'story:shroom-lookout',portraitAlias:'Pip',loc:'Shroom Pass',
    bio:'A mushroom villager keeping watch at the hidden entrance to Sporehollow.',
    d:['Mosslet: Yoo Hoo! Over here!']});
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
