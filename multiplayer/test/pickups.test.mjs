import test from 'node:test';
import assert from 'node:assert/strict';
import {newMember,canStand,findClear} from '../src/world.mjs';
import {createPickupStore,pickupCatalog,pickupNodes,collectPickup,publicInventory,pickupAvailable,nearbyPickups,grantStoryItem,RESPAWN_MS} from '../src/pickups.mjs';
const party=()=>({store:createPickupStore(),a:newMember('a','account-a',{},0),b:newMember('b','account-b',{},1)});
const place=(m,node)=>Object.assign(m.rider,findClear(node.x,node.y));
test('all actual field ingredients have reachable server locations and unique stable pickup ids',()=>{
 assert(pickupCatalog.nodes.length>600);assert.equal(pickupNodes.size,pickupCatalog.nodes.length);
 for(const n of pickupCatalog.nodes.filter(n=>n.kind==='ingredient')){assert(canStand(n.x,n.y),n.id);assert(Object.hasOwn(pickupCatalog.materials,n.item));assert(n.amount>0);}
});
test('both riders independently collect the same ingredient and cannot collect it twice',()=>{
 const {store,a,b}=party(),node=pickupCatalog.nodes.find(n=>n.kind==='ingredient'&&!n.once),now=10000;
 place(a,node);place(b,node);
 assert(collectPickup(store,a,node.id,now).ok);
 assert(!pickupAvailable(store,a.uid,node,now));assert(pickupAvailable(store,b.uid,node,now));
 assert(!nearbyPickups(store,a,now).some(n=>n.id===node.id));assert(nearbyPickups(store,b,now).some(n=>n.id===node.id));
 assert.equal(publicInventory(store,a.uid).ingredients[node.item],node.amount);assert.equal(publicInventory(store,b.uid).ingredients[node.item],undefined);
 assert(collectPickup(store,b,node.id,now).ok);assert.equal(publicInventory(store,b.uid).ingredients[node.item],node.amount);
 assert(!collectPickup(store,a,node.id,now+1).ok);assert(!collectPickup(store,b,node.id,now+1).ok);
 assert(collectPickup(store,a,node.id,now+RESPAWN_MS).ok);assert.equal(publicInventory(store,a.uid).ingredients[node.item],node.amount*2);
 assert.equal(publicInventory(store,b.uid).ingredients[node.item],node.amount);
});
test('one-time intro supplies stay available independently and survive a new session for the same account',()=>{
 const {store,a,b}=party(),node=pickupNodes.get('craft:intro:herb');place(a,node);place(b,node);
 assert(collectPickup(store,a,node.id,1000).ok);
 const again=newMember('new-session',a.uid,{},1);place(again,node);
 assert(!collectPickup(store,again,node.id,1000+RESPAWN_MS*100).ok);
 assert.equal(publicInventory(store,again.uid).ingredients.herb,2);
 assert(collectPickup(store,b,node.id,1000+RESPAWN_MS*100).ok);
});
test('story pickups grant the party once, including disconnected members and late joiners',()=>{
 const {store,a,b}=party(),node=pickupNodes.get('story:eggs');place(a,node);b.connected=false;
 assert(collectPickup(store,a,node.id,1000).ok);
 assert(publicInventory(store,a.uid).story.includes('eggs'));assert(publicInventory(store,b.uid).story.includes('eggs'));
 assert(!pickupAvailable(store,b.uid,node,1000));
 const late=newMember('late','new-account',{},1);place(late,node);
 assert(publicInventory(store,late.uid).story.includes('eggs'));assert(!collectPickup(store,late,node.id,1001).ok);
 assert.equal(publicInventory(store,late.uid).story.filter(k=>k==='eggs').length,1);
 // The same trusted server reward path handles key items from future quest events.
 assert(grantStoryItem(store,'hs_light'));assert(!grantStoryItem(store,'hs_light'));
 assert(publicInventory(store,a.uid).story.includes('hs_light'));assert(publicInventory(store,b.uid).story.includes('hs_light'));
 assert(!grantStoryItem(store,'potion'));assert(!grantStoryItem(store,'__proto__'));
 const copy=publicInventory(store,a.uid);copy.story.push('fake');copy.ingredients.herb=999;
 assert(!publicInventory(store,b.uid).story.includes('fake'));assert.equal(publicInventory(store,a.uid).ingredients.herb,undefined);
});
test('pickup requests cannot invent rewards, reach across the map, or collect while down/disconnected/in combat',()=>{
 const {store,a}=party(),node=pickupNodes.get('craft:intro:root');
 assert(!collectPickup(store,a,node.id,1000).ok);assert(!collectPickup(store,a,'hs_light',1000).ok);
 assert(!collectPickup(store,a,{id:node.id,amount:999},1000).ok);assert(!collectPickup(store,a,'__proto__',1000).ok);
 place(a,node);a.rider.hp=0;assert(!collectPickup(store,a,node.id,1000).ok);
 a.rider.hp=10;a.connected=false;assert(!collectPickup(store,a,node.id,1000).ok);
 a.connected=true;assert(!collectPickup(store,a,node.id,1000,{phase:'active'}).ok);assert(!collectPickup(store,a,node.id,1000,{phase:'countdown'}).ok);
 assert(!collectPickup(store,a,node.id,1000,{phase:'idle',paused:true}).ok);
 assert(collectPickup(store,a,node.id,1000,{phase:'idle'}).ok);assert.equal(publicInventory(store,a.uid).ingredients.root,1);
 assert(!JSON.stringify(publicInventory(store,a.uid)).includes('account-a'));
});
