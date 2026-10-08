import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.attrs={};this.dataset={};this.handlers={};this.hidden=false;this.disabled=false;this.style={};this.scrollTop=0;this.textContent='';this.isConnected=true;this.classes=new Set();this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)};}
 append(...nodes){for(const n of nodes)this.insertBefore(n,null);}
 insertBefore(n,before){if(n.parent)n.parent.children=n.parent.children.filter(c=>c!==n);const i=this.children.indexOf(before);this.children.splice(i<0?this.children.length:i,0,n);n.parent=this;n.isConnected=this.isConnected;}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;this.isConnected=false;for(const c of this.children)c.isConnected=false;}
 getClientRects(){return this.hidden?[]:[{}];}getAttribute(k){return this.attrs[k]??null;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return this.children.flatMap(n=>[n,...n.querySelectorAll()]);}contains(n){return this===n||this.querySelectorAll().includes(n);}
 addEventListener(k,f){(this.handlers[k]??=[]).push(f);}dispatchEvent(e){e.target=this;this['on'+e.type]?.(e);for(const f of this.handlers[e.type]||[])f(e);return true;}
 click(){this.dispatchEvent({type:'click',detail:0});}getBoundingClientRect(){return {left:0,top:0,width:100,height:50};}
}
const roots=new Map(),document={getElementById:id=>roots.get(id)||null,createElement:tag=>new Element(tag)};
const c=vm.createContext({console,document,getComputedStyle:()=>({visibility:'visible',display:'block'}),Event:class{constructor(type,data){this.type=type;Object.assign(this,data);}},BAG:[]});
c.window=c;c.KeyboardEvent=c.MouseEvent=c.PointerEvent=c.Event;c.LDRCoopEvents={types:n=>new Set(Object.keys(n.handlers))};
vm.runInContext(fs.readFileSync('js/coop-ui.js','utf8'),c);
const host=c.LDRCoopUI.host(),container=new Element(),sent=[],guest=c.LDRCoopUI.guest(container,d=>sent.push(d));
const frame=(version,value,text='Slide to craft')=>({version,panels:[{id:'craftingView',text,controls:[{token:'slide',range:true,min:0,max:100,step:1,value,label:'Slide'}]}]});
guest.render(frame(1,0));const slider=container.children[0].children[1];
slider.dispatchEvent({type:'pointerdown'});slider.value='75';slider.dispatchEvent({type:'input'});
guest.render(frame(2,10,'Slide to craft · updating'));
assert.equal(container.children[0].children[1],slider);assert(slider.isConnected);assert.equal(slider.value,'75','An outdated echo cannot interrupt a drag');
slider.dispatchEvent({type:'pointerup'});slider.dispatchEvent({type:'change'});assert.equal(slider.value,'0','A short release resets without waiting for a new host snapshot');guest.render(frame(3,75));assert.equal(slider.value,'0');
assert.equal(sent[1].version,2);assert.equal(sent[1].value,75);assert(sent[1].finish);
guest.render(frame(4,0));assert.equal(slider.value,'0','The release reset reaches the existing input');
guest.render({version:5,panels:[]});assert(container.hidden);assert(!slider.isConnected);
console.log('PASS: remote range controls retain their DOM node and drag value, send current versions, and disappear when closed.');
const craft=new Element();craft.id='craftingView';const thumb=new Element('button');thumb.classList.add('craft-slider-thumb');
thumb.setAttribute('role','slider');thumb.setAttribute('aria-valuenow','0');thumb.setAttribute('aria-label','Slide to craft');thumb.onpointerdown=()=>{};craft.append(thumb);roots.set(craft.id,craft);
let progress=0,finishes=0,releases=0;
c.Crafting={slide:value=>{progress=value;thumb.setAttribute('aria-valuenow',value*100);return true;},finish:()=>finishes++,release:()=>{releases++;progress=0;thumb.setAttribute('aria-valuenow','0');}};
let snap=host.capture(),token=snap.panels[0].controls[0].token;
assert(host.act({version:snap.version,token,value:75}));assert.equal(progress,.75);
assert(host.act({version:snap.version,token,value:75,finish:true}));assert.equal(progress,0);assert.equal(finishes,0);assert.equal(releases,1);
assert(host.act({version:snap.version,token,value:100,finish:true}));assert.equal(progress,1);assert.equal(finishes,1);
thumb.remove();assert(!host.act({version:snap.version,token,value:100,finish:true}));
console.log('PASS: crafting receives absolute slider progress, short releases reset, full releases confirm, and detached tokens are rejected.');
roots.clear();
for(const id of ['sound','cloudSaveDialog']){const root=new Element();root.id=id;root.textContent='Private device settings';const control=new Element('button');control.textContent='Change';control.onclick=()=>assert.fail('Guest must not mutate host settings');root.append(control);roots.set(id,root);}
assert.equal(host.capture().panels.length,0);
console.log('PASS: private account and device audio controls are excluded from host mirroring.');
const handlers={},requested=[];let music='battle',detail={};
Object.assign(c,{connection:{onMessage:(kind,fn)=>handlers[kind]=fn},hosting:false,uid:'guest',showController(){},EmberAudio:{follow(id){if(id!==null&&id!=='battle')return false;music=id;return true;}},display:{reset(){}},detail,notice(){},lastMusic:'battle',lastNotice:'',openSettings:kind=>requested.push(kind)});
const campaign=fs.readFileSync('js/coop-campaign.js','utf8');
vm.runInContext(campaign.slice(campaign.indexOf("    connection.onMessage('status',"),campaign.indexOf("    connection.onMessage('checkpoint',")),c);
handlers.status({music:null,text:'Defeated'});assert.equal(music,null);
handlers.status({recipient:'host',localPanel:'account'});assert.equal(requested.length,0);
handlers.status({recipient:'guest',localPanel:'account'});assert.equal(requested.pop(),'account');assert.equal(detail.textContent,'Defeated');
handlers.status({music:'battle'});assert.equal(music,'battle');handlers.status({music:'invalid'});assert.equal(music,'battle');
console.log('PASS: guest status accepts silence, resumes valid music, and routes settings only to the requested account.');
