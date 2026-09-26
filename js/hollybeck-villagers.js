// Extracted from the user's eight-frame sheet; no title, labels or background.
DOCK_ORIGINAL_ASSETS.push({name:'hollybeck_runa_south_idle',w:24,h:30,frames:8,
  src:'assets/sprites/hollybeck-runa-south-idle.png?v=20260926-runa-stable2'});
/* Six motion frames, closed eyes, and half-closed eyes for a smooth timed blink. */
for(const person of ['sverre','runa'])for(const action of ['walk','idle']){
  for(const [row,dir]of ['d','u','e','w'].entries())DOCK_ORIGINAL_ASSETS.push({
    name:`hollybeck_${person}_${action}_${dir}`,w:24,h:30,frames:8,
    cellW:32,cellH:32,cropX:4,cropY:row*32+2,
    src:`assets/sprites/hollybeck-${person}-${action}.png?v=20260925-snow-blink3`
  });
}
function hollybeckNpcFrame(n,t,action){
  if(n.packSpr==='hollybeck_runa_south_idle'){
    // Hold the open-eye poses longer, then pass through the complete blink.
    const phase=(t%3.6+3.6)%3.6;
    return phase<.9?0:phase<1.6?1:phase<2.3?2:phase<2.42?3:phase<2.56?4:phase<2.68?5:phase<3.1?6:7;
  }
  // Blink timing is independent of footsteps; walking does not speed up blinking.
  const phase=(t+(n.t||0))%3.8;
  if(phase<.08||phase>=.18&&phase<.26)return 7;
  if(phase<.18)return 6;
  return Math.floor(t*(action==='walk'?8:(n.idleFps||4)))%6;
}
function prepareHollybeckVillagers(m,id){
  if(id!=='world')return;
  // Torvald was removed in the published layout; keep his lantern obtainable.
  const torvald=m.npcs.find(n=>n.n==='Torvald');
  if(torvald?.charm==='lamp')delete torvald.charm;
  for(const person of [
    {n:'Sverre',sprite:'sverre',x:43144,y:3280,routeSeed:0,charm:'lamp',
      d:['Sverre: Keep your scarf over your mouth on the north road. The wind steals your breath before your purse.',
        'Corin: Does it ever warm up here?', 'Sverre: Of course. Sometimes we only wear one pair of gloves.'],
      d2:['Sverre: I walk this stretch to keep the snow packed down.',
        'Sverre: Someone has to make a path before everyone starts saying there is no path.']},
    {n:'Runa',sprite:'runa',x:43304,y:3328,routeSeed:1,
      d:['Runa: Astrid says the soup is hot enough to thaw a boot.',
        'Corin: Have you tested that?', 'Runa: No. I want soup that tastes of soup.'],
      d2:['Runa: Two stitches for every tear. That is how a Hollybeck coat earns another winter.',
        'Runa: Yours could use three. Stand still a moment, Corin.']}
  ]){
    const editKey='npc:hollybeck:'+person.sprite;
    if(m.npcs.some(n=>n.editKey===editKey))continue;
    const {sprite,...npc}=person;
    m.npcs.push({...npc,editKey,packSpr:'hollybeck_'+sprite,packDirections:true,packWalk:true,
      loc:'Hollybeck',stationary:false,patrol:true,patrolSpeed:24,patrolRest:3500,
      idleFps:4,f:'d',noTalk:false,...(sprite==='runa'?{
        packSpr:'hollybeck_runa_south_idle',packDirections:false,packWalk:false,
        stationary:true,patrol:false
      }:null)});
  }
}
