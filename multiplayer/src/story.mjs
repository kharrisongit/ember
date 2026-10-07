import fs from 'node:fs';
import {canStand,clearLine,findClear,distance,facing} from './world.mjs';
import {grantStoryItem} from './pickups.mjs';
export const storyMaps=JSON.parse(fs.readFileSync(new URL('./story-maps.json',import.meta.url))).maps;
export const openingNames=new Set(['Nan Ferrow','Hettie','Elder Maddock','King Halvard','Serjeant Bram','Doran','Tolan']);
// The opening keeps the existing sequence and locations. Dialogue is adapted
// for two companions, two swords and two hatchlings; solo scripts never run.
export const chapters=[
 {id:'gear',map:'house26_bedroom',x:65,y:170,label:'Take the Travel Gear',objective:'Pick up the Travel Gear from the bedroom desk.',reward:'travelGear',lines:[
  'Rider: Map, compass, and a bag each. Nan will ask before we reach the door.',
  'Travel Gear is now in both bags. Gather ingredients separately; story items belong to the party.'
 ]},
 {id:'nan',map:'house26',x:136,y:128,label:'Talk to Nan',objective:'Go downstairs and speak to Nan.',lines:[
  "Nan Ferrow: You're up. Hettie came looking for you; she's outside trying to negotiate with the cows.",
  "Rider: We'll find her. Cows usually take longer to persuade than we do.",
  "Nan Ferrow: Save any herbs and roots you find. There are good gathering spots beside the trail north of Millwood.",
  'Nan Ferrow: Off you go, then. Leave a little of the morning for breakfast next time.'
 ]},
 {id:'hettie',map:'world',x:488,y:6672,label:'Talk to Hettie',objective:'Find Hettie on the lane outside Nan’s house.',lines:[
  "Hettie: Could I borrow two pairs of hands that aren't attached to cows?",
  "Hettie: Maddock needs six eggs. There's a basket waiting at the coop behind the mill.",
  "Hettie: Tuck them into a bag so they don't knock together. He asked for breakfast, not a puzzle.",
  "Rider: Six eggs, behind the mill, then Maddock's house. We've got it."
 ]},
 {id:'eggs',map:'world',x:184,y:6896,pickup:'eggs',objective:'Collect six brown eggs behind the mill.',lines:[
  'Rider: Six brown eggs. Let’s get them to Maddock before breakfast turns into lunch.'
 ]},
 {id:'king',map:'world',x:488,y:6130,label:'Speak to the royal guard',objective:'Follow the northern lane toward Maddock. The royal guard is blocking the road.',lines:[
  'Serjeant Bram: Stop at the verge. His Majesty has the road.',
  "Rider: We're taking these eggs to Maddock. His house is just up there.",
  'Halvard: You two. My men have heard of dragons in this valley. Tell me what you have seen.',
  "Rider: We haven't seen a dragon, Your Majesty. We've been collecting eggs.",
  'Halvard: An answer you had better remember giving me. Finish your errand. Leave the woods to my officers.',
  'The king and his guard leave the lane.'
 ]},
 {id:'maddock',map:'house22',x:128,y:100,label:'Deliver the eggs',objective:'Enter Maddock’s house beside the northern road and deliver the eggs.',consume:'eggs',lines:[
  'Maddock: Ah, my breakfast has an escort. Set the basket by the maps.',
  'Rider: That painting—are those people riding dragons?',
  'Maddock: Seven riders, with seven dragons. They kept the roads open. I remember journeys people wouldn’t dare make now.',
  'Maddock: Halvard was one of them. Fifty years ago he turned on the other six, destroyed their fellowship and took the throne. We call it Wingfall.',
  'Rider: He stopped us on the lane. He wanted to know whether we’d seen a dragon.',
  'Maddock: Here? Then something has frightened him. Be careful who hears you repeat that question.'
 ]},
 {id:'crash',map:'world',x:488,y:6000,label:'Investigate the crash',objective:'Return to the northern road outside Maddock’s house.',reward:'sword',lines:[
  'A heavy crash rolls through the woods. Birds scatter above the road.',
  'Maddock: You’re going toward that noise, aren’t you? Take these before you argue.',
  'Maddock: Two blades I’ve kept sound. One for each of you. Keep your distance, face what threatens you, and move before it strikes.',
  'Rider: Do you think that noise was a dragon?',
  'Maddock: I think Halvard had a reason to come here. Stay together. I’d like you to return with an answer, not a wound.',
  'Both companions receive a sword. If one falls, stand beside them and use Revive.'
 ]},
 {id:'skirmish',map:'world',x:488,y:5448,battle:true,objective:'Follow the northern road to the mushroom clearing. Both choose Ready for battle there.'},
 {id:'dragon',map:'world',x:488,y:380,label:'Approach the dragon',objective:'Continue north through the woods to the clearing at the end of the road.',lines:[
  'Rider: That’s coming straight at us!',
  'Rider: Easy. We’re not going to hurt you.',
  'The dragon catches its breath, then spreads its wings.',
  'Rider: Wait—there are two eggs here! Are they yours?'
 ]},
 {id:'egg',map:'world',x:488,y:336,pickup:'egg',objective:'Pick up the two dragon eggs from the stump.',lines:[
  'Rider: We can’t leave them here. If anyone knows what to do, it’s Maddock.'
 ]},
 {id:'hatch',map:'world',x:776,y:6000,label:'Show Maddock the eggs',objective:'Return to Maddock beside his house with the dragon eggs.',consume:'egg',reward:'heart',lines:[
  'Maddock: Hold still. Those bundles are moving.',
  'Rider: A dragon left two eggs in the clearing. We couldn’t just leave them there.',
  'Maddock: Down here, on the ground. Slowly now. Look at the shells—they’re hatching.',
  'The shells split. Two hatchlings push free.',
  'The hatchlings look at Maddock, then turn toward the two companions.',
  'Each hatchling crosses the space to a different companion. Smooth stones glimmer in the broken shells.',
  'Rider: They’re following us. Are we supposed to do something?',
  'Maddock: Let them come. A dragon chooses whom to trust. This is the beginning of a rider’s bond.',
  'Maddock: Halvard has hunted dragons for fifty years. He will hunt these two as well. Hiding may buy time. It will never make you safe.',
  'Maddock: To end this hunt, we must overthrow Halvard at Cinderhold, far to the east.',
  'Rider: We were bringing you eggs this morning. Now you want us to face the king?',
  'Maddock: Start with help. Take the road east to Thornwell, then Forgewick. Ask about the old rider temple. One journey at a time.',
  'Both riders receive a mysterious stone. Each dragon now follows its own rider.'
 ]},
 {id:'intro',map:'world',x:488,y:6240,label:'Listen to Aurelius',objective:'Follow the road south from Maddock’s clearing and listen to your new companion.',lines:[
  'A voice reaches you without a sound. Beside you, your companion stops too.',
  'Aurelius: If you keep looking back at us, you’re going to walk into a tree.',
  'Rider: Maddock? How did you—',
  'Aurelius: A little lower. The wings are a useful clue. I’m Aurelius.',
  'Rider: You can talk. Without making a sound.',
  'Aurelius: The bond carries our thoughts. Dragons hatch into a shared consciousness. Language comes with it, along with pieces of our kind’s memories.',
  'Aurelius: Experience is less convenient. I knew what legs were before I knew how to stand on these.',
  'Rider: Then you understood what Maddock asked of us? About overthrowing Halvard?',
  'Aurelius: I did. The stones from our shells give us a beginning. We need the Heartstones in the three rider temples before we can face him.',
  'Aurelius: Lightning in Forgewick. Ice in Sandspire. Shadow in Hollybeck. That is our order.',
  'Rider: East to Thornwell, then Forgewick. We can manage the next place on a road.',
  'Aurelius: Good. We’ll watch the trees while you consider the kingdom.'
 ]},
 {id:'complete',map:'world',objective:'Opening chapter complete. Both dragons are yours. Thornwell’s shared story is the next chapter to connect.'}
];
export const chapter=s=>chapters[s.step];
export function createStory(){return {step:0,map:'house26_bedroom',epoch:1,serial:0,scene:null,travel:null,clock:0,hasDragon:false};}
export const storyGrid=s=>storyMaps[s.map];
const partyReady=members=>members.size===2&&[...members.values()].every(m=>m.connected&&!m.loading);
export function storyHeld(s,members){return !!(s.scene||[...members.values()].some(m=>m.connected&&m.loading));}
function place(s,member,x,y,occupied=[]){
 const p=findClear(x,y,120,p=>occupied.every(o=>distance(o,p)>18),storyGrid(s));
 Object.assign(member.rider,p,{moving:false,dir:'s'});Object.assign(member.dragon,{x:p.x-22,y:p.y-24,dir:'s'});
 member.input={x:0,y:0};member.lastInput=0;member.ready=false;return p;
}
export function joinStory(s,member,members){
 const peer=[...members.values()].find(m=>m!==member),spawn=peer?.rider||{x:storyGrid(s).spawn[0],y:storyGrid(s).spawn[1]};
 place(s,member,spawn.x+(peer?24:0),spawn.y,peer?[peer.rider]:[]);member.loading=true;
}
export function mapLoaded(s,member,data){if(data?.epoch!==s.epoch||data.map!==s.map)return false;member.loading=false;return true;}
function consume(store,key){if(store.story.delete(key))store.storyRevision++;}
function finishScene(s,store,members){
 const c=chapter(s);if(c.reward)grantStoryItem(store,c.reward);if(c.consume)consume(store,c.consume);
 if(c.id==='hatch')s.hasDragon=true;
 s.step++;s.scene=null;for(const m of members.values()){m.input={x:0,y:0};m.ready=false;}
}
function startScene(s,m,members){
 s.scene={id:++s.serial,line:0,ready:new Set(),rider:m.profile.name,at:s.clock};s.travel=null;
 const c=chapter(s);
 if(members&&['hatch','dragon'].includes(c.id)){
  const occupied=[];for(const p of members.values())occupied.push(place(s,p,c.x+(occupied.length?1:-1)*(c.id==='hatch'?48:30),c.y+(c.id==='hatch'?12:48),occupied));
 }
}
function reachable(s,m,target,reach=48){
 if(distance(m.rider,target)>reach)return false;
 const len=Math.max(1,distance(m.rider,target)),edge={x:target.x+(m.rider.x-target.x)/len*18,y:target.y+(m.rider.y-target.y)/len*18};
 return clearLine(m.rider,target,storyGrid(s))||clearLine(m.rider,edge,storyGrid(s));
}
export function storyPickupAllowed(s,m,members,key){
 const c=chapter(s);
 return !storyHeld(s,members)&&s.map===c.map&&c.pickup===key&&partyReady(members)&&[...members.values()].every(p=>distance(p.rider,c)<150);
}
export function storyPickedUp(s,m){startScene(s,m);}
export function storyInteract(s,members,m,id){
 if(!partyReady(members))return 'Wait for both players to connect and finish loading.';
 if(s.scene||members.size!==2)return 'Finish the conversation first.';
 const c=chapter(s);
 if(id==='chapter:'+c.id&&s.map===c.map&&c.lines&&!c.pickup){
  if(!reachable(s,m,c,c.id==='crash'?64:52))return 'Move closer to interact.';
  if(![...members.values()].every(p=>distance(p.rider,c)<150))return 'Bring your partner closer before starting this scene.';
  startScene(s,m,members);for(const p of members.values())p.rider.dir=facing(c.x-p.rider.x,c.y-p.rider.y);return null;
 }
 const door=storyGrid(s).doors.find(d=>d.id===id);
 if(!door)return 'That interaction is unavailable.';
 const point=doorPoint(door);
 if(!reachable(s,m,point,44))return 'Move closer to the doorway.';
 if(s.step===0&&door.to!=='house26_bedroom')return 'Pick up the Travel Gear first.';
 if(s.map==='house26'&&door.to==='world'&&s.step<2)return 'Speak to Nan before leaving.';
 if(door.to==='house22'&&s.step<5)return 'Finish the egg errand and speak to the royal guard first.';
 if(![...members.values()].every(p=>distance(p.rider,point)<100))return 'Bring your partner to the doorway to travel together.';
 if(!s.travel||s.travel.id!==id)s.travel={id,ready:new Set()};s.travel.ready.add(m.uid);
 if([...members.values()].every(p=>s.travel.ready.has(p.uid))){
  s.map=door.to;s.epoch++;s.travel=null;const occupied=[];
  for(const p of members.values()){occupied.push(place(s,p,door.x+(occupied.length?24:0),door.y,occupied));p.loading=true;}
 }
 return null;
}
export function advanceStory(s,members,m,data){
 const scene=s.scene;
 if(!scene||!partyReady(members)||data?.id!==scene.id||data.line!==scene.line)return false;
 scene.ready.add(m.uid);return true;
}
export function stepStory(s,store,members,dt,battle){
 if(!partyReady(members))return;s.clock+=dt*1000;
 if(chapter(s).battle&&battle.phase==='won'){s.step++;battle.phase='idle';battle.enemies=[];battle.effects=[];}
 const scene=s.scene;if(!scene)return;
 const c=chapter(s),minimum=c.id==='dragon'?2400:c.id==='hatch'&&scene.line>=2&&scene.line<=5?1600:300;
 if(s.clock-scene.at<minimum||![...members.values()].every(m=>scene.ready.has(m.uid)))return;
 if(scene.line+1===c.lines.length)finishScene(s,store,members);
 else{scene.line++;scene.ready.clear();scene.at=s.clock;}
}
export function forgetStoryVote(s,uid){s.scene?.ready.delete(uid);s.travel=null;}
export function storyBattleAllowed(s,members,m,battle){
 return s.map==='world'&&!storyHeld(s,members)&&!s.scene&&(chapter(s).battle||s.hasDragon&&chapter(s).id==='complete')&&
  [...members.values()].every(p=>p.connected&&!p.loading&&distance(p.rider,battle.arena)<battle.arena.r+140);
}
export function doorPoint(d){return {x:d.rect.x+d.rect.w/2,y:d.dir==='u'?d.rect.y+d.rect.h+16:d.rect.y-8};}
export function storyNpcs(s){
 const index=s.step,c=chapter(s),list=[];
 for(const n of storyGrid(s).npcs){
  if(n.name==='King Halvard'){if(index===4)list.push({...n,x:488,y:6096,f:'d'});continue;}
  if(['Serjeant Bram','Doran','Tolan'].includes(n.name)){if(index<=4)list.push({...n});continue;}
  if(n.name==='Elder Maddock'&&s.map==='world'){
   if(index===6)list.push({...n,x:520,y:6000,f:'d'});
   if(index>=10)list.push({...n,x:776,y:5984,f:'d'});continue;
  }
  list.push({...n});
 }
 return list;
}
function waypoint(s){
 const c=chapter(s);if(c.x===undefined)return null;if(c.map===s.map)return {x:c.x,y:c.y,label:c.label||c.objective};
 const queue=[{map:s.map,first:null}],seen=new Set([s.map]);
 for(const entry of queue)for(const d of storyMaps[entry.map].doors){
  if(seen.has(d.to))continue;const first=entry.first||d;
  if(d.to===c.map)return {...doorPoint(first),label:'Travel together · '+storyMaps[first.to].title};
  seen.add(d.to);queue.push({map:d.to,first});
 }return null;
}
export function publicStory(s,members){
 const c=chapter(s),scene=s.scene,readyIds=set=>[...members.values()].filter(m=>set?.has(m.uid)).map(m=>m.id);
 const line=scene?c.lines[scene.line]:null,split=line?.indexOf(': '),who=split>=0?line.slice(0,split):'';
 return {step:c.id,map:s.map,epoch:s.epoch,width:storyGrid(s).width*16,height:storyGrid(s).height*16,
  objective:c.objective,hasSword:s.step>6,hasDragon:s.hasDragon,held:storyHeld(s,members),
  waiting:!partyReady(members),waypoint:waypoint(s),npcs:storyNpcs(s),
  completed:chapters.slice(0,s.step).map(c=>c.objective),
  actions:[...(c.map===s.map&&c.label&&c.lines&&!c.pickup?[{id:'chapter:'+c.id,x:c.x,y:c.y,label:c.label}]:[]),
   ...storyGrid(s).doors.map(d=>({id:d.id,...doorPoint(d),label:'Travel together · '+storyMaps[d.to].title}))],
  travel:s.travel?{id:s.travel.id,ready:readyIds(s.travel.ready)}:null,
  scene:scene?{id:scene.id,line:scene.line,total:c.lines.length,kind:c.id,x:c.x,y:c.y,
   who:who==='Rider'?scene.rider:who,text:split>=0?line.slice(split+2):line,
   elapsed:s.clock-scene.at,ready:readyIds(scene.ready)}:null};
}
