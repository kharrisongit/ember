// Run against a served checkout with Playwright installed. Do not replace the
// frame loop or fast-forward typewriter/scene state: visible speech is the gate.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const imported=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const playwright=imported.default||imported;
const engine=process.env.PLAYWRIGHT_BROWSER||'chromium';
const browser=await playwright[engine].launch({headless:true,
  executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined});
const page=await browser.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});
page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',error=>errors.push(error.message));
const screenshot=async name=>{
  if(!process.env.CONVERSATION_ARTIFACTS)return;
  await fs.mkdir(process.env.CONVERSATION_ARTIFACTS,{recursive:true});
  await page.screenshot({path:`${process.env.CONVERSATION_ARTIFACTS}/${engine}-${name}.png`});
};
try{
  await page.goto(process.env.CONVERSATION_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:120000});
  await page.waitForFunction(()=>document.body.classList.contains('boot-ready'),null,{timeout:120000});
  await page.evaluate(()=>{
    document.getElementById('boot').style.display='none';mode='play';gameplayStarted=true;
    scene=null;sayNpc=null;ask=null;P.act=null;quest=Q.ARMED;charm.spore=true;bagOwned=true;
    EmberRiding.skip();EmberArenaEntry.reset();EmberEquipmentTutorial.skip();
    EmberFriendship.restore({tutorialSeen:false});Crafting.giveKit();loadMap('world',true);
    const king=npcs.find(n=>n.n==='The Shroom King');P.x=king.x;P.y=king.y+30;
    cam.x=P.x-VW/cam.z/2;cam.y=P.y-VH/cam.z/2;openNpcTopics(king);
  });
  await page.getByRole('button',{name:'Got it — let’s talk'}).tap();
  await page.getByRole('button',{name:'Chat with The Shroom King'}).tap();
  await page.getByRole('button',{name:/^A lesson for the road/}).tap();
  // This assertion fails on the abandoned full-screen deck, even though its
  // hidden speech is typing normally and the topic callback did execute.
  await page.waitForFunction(()=>getComputedStyle(document.getElementById('bagAsk')).display==='none');
  await page.waitForFunction(()=>sayEl.textContent.includes('Three mushrooms')&&sayEl.getBoundingClientRect().height>0);
  assert(await page.locator('#say').isVisible());
  await screenshot('lesson');
  await page.waitForFunction(()=>typeDone());
  await page.locator('#say').tap();
  await page.waitForFunction(()=>typeWho==='Corin'&&typeDone());
  await page.locator('#say').tap();
  await page.waitForFunction(()=>Crafting.active());
  await page.locator('.craft-close').tap();
  await page.evaluate(()=>openNpcTopics(npcs.find(n=>n.n==='The Shroom King')));
  await page.getByRole('button',{name:'Chat with The Shroom King'}).tap();
  await page.getByRole('button',{name:/^The royal nap/}).tap();
  await page.waitForFunction(()=>typeWho==='The Shroom King'&&typeDone());
  assert(await page.locator('.conversationNpcSpeech #say').isVisible());
  await page.getByRole('button',{name:'Next',exact:true}).tap();
  await page.waitForFunction(()=>ask?.replyChoices);
  await page.locator('.deckReply').nth(1).tap();
  await page.waitForFunction(()=>typeWho==='Corin'&&typed>0);
  assert(await page.locator('.conversationCorinSpeech #say').isVisible());
  await page.waitForFunction(()=>typeWho==='The Shroom King'&&typeDone());
  await screenshot('reply');
  await page.getByRole('button',{name:'Next',exact:true}).tap();
  await page.getByRole('button',{name:'Chat with The Shroom King'}).waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>window.__lastFrameError||''),'');
  assert.deepEqual(errors,[]);
  console.log(`PASS (${engine} touch): tutorial, visible crafting lesson, recipe book, reopened story, reply and naturally timed answer.`);
}catch(error){await screenshot('failure');throw error;}
finally{await browser.close();}
