import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const window={};vm.runInNewContext(fs.readFileSync(new URL('../../js/coop-appearance.js',import.meta.url),'utf8'),{window});
const appearance=window.LDRCoopAppearance;
test('each viewer sees their own red dragon and selected hair, with a purple partner and contrasting matching hair',()=>{
 const colors=['dark','brown','copper','blond','silver'];
 for(const first of colors)for(const second of colors){
  const host={id:'host',hair:first},guest={id:'guest',hair:second};
  for(const [own,other]of [[host,guest],[guest,host]]){
   const self=appearance.forViewer(own,own),partner=appearance.forViewer(other,own);
   assert.equal(self.dragon,'red');assert.equal(self.hair,own.hair);assert.equal(partner.dragon,'purple');
   assert.notEqual(partner.hair,self.hair);assert(colors.includes(partner.hair));
   if(first!==second)assert.equal(partner.hair,other.hair);
  }
  assert.equal(host.hair,first);assert.equal(guest.hair,second);
 }
});
test('purple palette preserves alpha, gold belly, claws and dark outlines',()=>{
 const pixels=new Uint8ClampedArray([189,27,40,255,250,212,161,255,22,13,16,255,220,220,210,255,255,0,0,0]);
 const original=pixels.slice();assert.equal(appearance.purpleDragon(pixels),1);
 assert(pixels[2]>pixels[0]&&pixels[0]>pixels[1]);assert.equal(pixels[3],255);
 assert.deepEqual(pixels.slice(4),original.slice(4));
});
