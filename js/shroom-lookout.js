/* A resident waits on the main northern path beside the Sporehollow turn. */
function prepareShroomLookout(){
  if(MAPID!=='world')return;
  const existing=npcs.find(n=>n.shroomLookout);
  if(existing?.mainPathLookout)return;
  const town=features.find(f=>f.kind==='area'&&f.place==='Sporehollow');
  if(!town)return;
  const pathY=(town.y0+(town.road?.y??22))*TS;
  const road=features.find(f=>f.kind==='route'&&f.id===3);
  if(!road)return;
  const x=road.x0*TS+8,y=pathY+16;
  const spots=[[x,y],[x+16,y],[x-16,y],[x,y+16],[x,y-16]].filter(p=>canStand(...p));
  if(!spots.length)return;
  if(existing){Object.assign(existing,{x:spots[0][0],y:spots[0][1],mainPathLookout:true,goto:null,stationary:true});return;}
  npcs.push({n:'Mosslet',sk:'shroom_green',s:610,x:spots[0][0],y:spots[0][1],f:'d',kf:'d',t:0,stationary:true,
    shroomLookout:true,mainPathLookout:true,editKey:'story:shroom-lookout',portraitAlias:'Pip',loc:'Shroom Pass',
    bio:'A mushroom villager keeping watch on the main path beside the turn to Sporehollow.',
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
