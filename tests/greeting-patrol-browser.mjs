// Exercise the post-Nan patrol deadlock through touch controls and the real frame loop.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const imported=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const playwright=imported.default||imported;
const browser=await playwright.chromium.launch({headless:true,
  executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const screenshot=async name=>{
  if(!process.env.CONVERSATION_ARTIFACTS)return;
  await fs.mkdir(process.env.CONVERSATION_ARTIFACTS,{recursive:true});
  await page.screenshot({path:`${process.env.CONVERSATION_ARTIFACTS}/hettie-${name}.png`});
};
try{
  await page.goto(process.env.CONVERSATION_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>document.body.classList.contains('boot-ready'),null,{timeout:120000});
  const blocked=await page.evaluate(()=>{
    document.getElementById('boot').style.display='none';mode='play';gameplayStarted=true;BOOT.waiting=false;
    document.body.classList.remove('boot-ready');document.body.classList.add('game-started');
    scene=null;sayNpc=null;ask=null;P.act=null;quest=Q.DONE;bagOwned=true;
    templeCompass.owned=true;templeCompass.mapGiven=true;templeCompass.meatGiven=true;templeCompass.morningMet=true;
    dragonIntroDone=true;dragon.on=false;dragonOff=true;thornwellRoyal.stage=7;brambleQuest=3;
    EmberRiding.skip();EmberArenaEntry.reset();EmberEquipmentTutorial.skip();
    EmberFriendship.restore({tutorialSeen:true});loadMap('world',true);
    P.x=30*TS;P.y=416*TS;P.dir='u';
    const hettie=npcs.find(n=>n.n==='Hettie');
    Object.assign(hettie,{x:P.x,y:P.y-20,stationary:false,scriptWalking:false,nanSceneAside:false,
      hettieDeparted:true,goto:[P.x,P.y+64],home:[P.x,P.y+64],patrol:[24,415,30,420]});
    cam.x=P.x-VW/cam.z/2;cam.y=P.y-VH/cam.z/2;
    return !npcStepClearsPlayer(hettie,hettie.x,hettie.y+2);
  });
  assert(blocked,'Corin blocks Hettie’s real patrol');
  await page.locator('#act').tap();
  await page.waitForFunction(()=>scene?.conversationGreeting&&!scene.arriving&&typeWho==='Hettie'&&typeDone());
  assert(await page.locator('#say').isVisible());
  await screenshot('greeting');
  await page.locator('#say').tap();
  await page.waitForFunction(()=>typeWho==='Corin'&&typeDone());
  await page.locator('#say').tap();
  await page.getByRole('button',{name:/^Talk\b/}).tap();
  await page.locator('.conversationGoodbye').tap();
  await page.waitForFunction(()=>!sceneHold()&&!ask&&!sayNpc);
  const startX=await page.evaluate(()=>P.x);
  await page.keyboard.down('ArrowRight');
  await page.waitForFunction(x=>P.x>x+8,startX);
  await page.keyboard.up('ArrowRight');
  assert(await page.evaluate(()=>!scene&&!ask&&!sayNpc),'Walking away cannot reveal delayed speech');
  assert.equal(await page.evaluate(()=>window.__lastFrameError||''),'');
  assert.deepEqual(errors,[]);
  console.log('PASS (Chromium touch): blocked post-Nan Hettie greets, finishes, opens Talk and releases movement without teleporting.');
}catch(error){
  console.error(await page.evaluate(()=>({scene:scene&&{who:scene.who,arriving:scene.arriving},typeWho,
    ask:ask?.conversationPrompt,position:[P.x,P.y],frameError:window.__lastFrameError})));
  await screenshot('failure');throw error;
}
finally{await browser.close();}
