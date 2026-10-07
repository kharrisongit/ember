import fs from 'node:fs';
import {distance,clearLine,canStand} from './world.mjs';
export const pickupCatalog=JSON.parse(fs.readFileSync(new URL('./pickup-catalog.json',import.meta.url)));
export const pickupNodes=new Map(pickupCatalog.nodes.map(node=>[node.id,Object.freeze(node)]));
export const RESPAWN_MS=20*60*1000;
export function createPickupStore(){return {accounts:new Map(),story:new Set(),storyRevision:0};}
function account(store,uid){
  if(!store.accounts.has(uid))store.accounts.set(uid,{ingredients:Object.create(null),harvested:new Map(),revision:0});
  return store.accounts.get(uid);
}
// Story rewards have exactly one owner: the party. Only trusted server gameplay
// calls this; there is deliberately no client message that grants an item by key.
export function grantStoryItem(store,key){
  if(!Object.hasOwn(pickupCatalog.storyItems,key)||store.story.has(key))return false;
  store.story.add(key);store.storyRevision++;return true;
}
export function publicInventory(store,uid){
  const own=account(store,uid);
  return {revision:own.revision+':'+store.storyRevision,ingredients:{...own.ingredients},story:[...store.story]};
}
export function pickupAvailable(store,uid,node,now){
  if(node.kind==='story')return !store.story.has(node.item);
  const next=account(store,uid).harvested.get(node.id);
  return next===undefined||(next!==-1&&now>=next);
}
export function nearbyPickups(store,member,now,radius=800){
  return pickupCatalog.nodes.filter(n=>distance(n,member.rider)<=radius&&pickupAvailable(store,member.uid,n,now));
}
function reachable(rider,node){
  if(distance(rider,node)>36)return false;
  if(node.kind==='ingredient')return clearLine(rider,node);
  // A story object can rest on a solid prop. Reach its near edge, never through
  // a wall from an unrelated room or across a distant part of the map.
  if(canStand(node.x,node.y)&&clearLine(rider,node))return true;
  const len=Math.max(1,distance(rider,node)),edge={x:node.x+(rider.x-node.x)/len*16,y:node.y+(rider.y-node.y)/len*16};
  return canStand(edge.x,edge.y)&&clearLine(rider,edge);
}
export function collectPickup(store,member,id,now,battle){
  if(!member.connected||member.rider.hp<=0||battle?.paused||['active','countdown'].includes(battle?.phase))return {ok:false,reason:'Gather when you are safely out of battle.'};
  if(typeof id!=='string'||id.length>100)return {ok:false,reason:'That pickup is unavailable.'};
  const node=pickupNodes.get(id);
  if(!node)return {ok:false,reason:'That pickup is unavailable.'};
  if(!pickupAvailable(store,member.uid,node,now))return {ok:false,reason:node.kind==='story'?'The party already has that item.':'You already gathered this plant.'};
  if(!reachable(member.rider,node))return {ok:false,reason:'Move closer to pick that up.'};
  if(node.kind==='story'){
    if(!grantStoryItem(store,node.item))return {ok:false,reason:'The party already has that item.'};
  }else{
    const own=account(store,member.uid),current=own.ingredients[node.item]||0;
    if(current+node.amount>9999)return {ok:false,reason:'Your bag is full for that ingredient.'};
    own.ingredients[node.item]=current+node.amount;
    own.harvested.set(node.id,node.once?-1:now+RESPAWN_MS);own.revision++;
  }
  return {ok:true,id:node.id,kind:node.kind,item:node.item,amount:node.amount,
    name:node.kind==='story'?pickupCatalog.storyItems[node.item].name:pickupCatalog.materials[node.item].name};
}
