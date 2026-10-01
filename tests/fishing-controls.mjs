// Real browser input and responsive layout. Set EMBER_CHROMIUM for a local binary.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const runtime=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const {chromium}=await import(runtime?pathToFileURL(runtime+'/playwright/index.mjs').href:'playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.EMBER_CHROMIUM||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];
page.on('pageerror',e=>errors.push(e.message));
const source=fs.readFileSync('js/generated/game-part-2.js','utf8');
await page.setContent('<style>'+fs.readFileSync('css/fishing.css','utf8')+'</style><canvas id="cv" width="390" height="500"></canvas><button id="before">Before fishing</button>');
await page.addScriptTag({content:`
const cv=document.getElementById('cv'),ctx=cv.getContext('2d'),VW=390,VH=500,DPR=1;
let fishing=null,fishingPole=true,dragonFish=0,saves=0;const FISH_TAU=Math.PI*2,DRAGON_FISH_HEAL=35;
const P={moving:false},waterInReach=()=>true,fishingSafe=()=>true,fishingRegion=()=>({tier:2,reward:2});
let running=false,padDx=0,padDy=0,ask=null,glassShieldHeld=false;
function clearPadInputs(){}function askShut(){}function saveGame(){saves++;}
function actionButton(){fishingAction();}function askBack(){}function askStep(){}function askTake(){}
${fs.readFileSync('js/fishing.js','utf8')}
${source.slice(source.indexOf('let gameplayStarted = false'),source.indexOf('\nlet padDx = 0'))}
${source.slice(source.indexOf('function endFishing(){'),source.indexOf('function tryFishing(){'))}
gameplayStarted=gameplayReady=true;
window.tick=n=>{for(let i=0;i<n;i++)stepFishing(.05);drawFishing();};
startFishing();drawFishing();
`});
const button=page.locator('.fishing-action');
let box=await button.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
await page.mouse.down();await page.mouse.up();
assert.equal(await page.evaluate(()=>fishing.phase),'cast');
await page.evaluate(()=>{for(let i=0;i<100&&fishing.phase!=='hook';i++)stepFishing(.05);drawFishing();});
await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>fishing.phase),'reel');
await page.keyboard.down('a');await page.evaluate(()=>tick(15));
assert(await page.evaluate(()=>fishing.held&&fishing.progress>.1));
await page.keyboard.up('a');assert.equal(await page.evaluate(()=>fishing.held),false);
const before=await page.evaluate(()=>fishing.tension);await page.evaluate(()=>tick(8));assert(await page.evaluate(()=>fishing.tension)<before);
// Hold and release on an actual touch pointer, including cancellation.
const session=await page.context().newCDPSession(page);
box=await button.boundingBox();const touch={x:box.x+box.width/2,y:box.y+box.height/2};
await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[touch]});
assert.equal(await page.evaluate(()=>fishing.held),true);await page.evaluate(()=>tick(5));
await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
assert.equal(await page.evaluate(()=>fishing.held),false);
await page.keyboard.down('Space');await page.evaluate(()=>dispatchEvent(new Event('blur')));
assert.equal(await page.evaluate(()=>fishing.held),false);await page.keyboard.up('Space');
for(const size of [{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
 await page.setViewportSize(size);await page.evaluate(()=>drawFishing());
 const layout=await page.evaluate(()=>{const v=document.getElementById('fishingView'),c=v.querySelector('canvas').getBoundingClientRect(),b=v.querySelector('.fishing-action').getBoundingClientRect();return {x:c.x,y:c.y,w:c.width,h:c.height,bottom:b.bottom,right:b.right,scroll:v.scrollHeight,client:v.clientHeight};});
 assert(layout.h>170,'Water scene remains large');assert(layout.bottom<=size.height&&layout.right<=size.width,'Touch controls fit the viewport');assert(layout.scroll<=layout.client,'No clipped scrolling inside the full-screen view');
 if(process.env.EMBER_FISHING_SCREENSHOTS)await page.screenshot({path:process.env.EMBER_FISHING_SCREENSHOTS+'-'+size.width+'.png'});
}
await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>fishing),null);assert(await page.locator('#fishingView').isHidden());
await page.evaluate(()=>startFishing());await page.keyboard.press('b');assert.equal(await page.evaluate(()=>fishing),null);
await page.evaluate(()=>startFishing());await page.locator('.fishing-leave').focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>fishing),null);
assert.deepEqual(errors,[]);await browser.close();
console.log('PASS: real pointer, touch cancel, A/Space hold/release, blur, Escape/B, portrait/landscape/tablet layout and no browser errors.');
