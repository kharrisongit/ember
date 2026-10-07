/* Mirror the real game's open menus as text and explicit controls. Tokens refer
 * only to currently visible controls in these allowlisted gameplay panels. */
(() => {
  'use strict';
  let dispatching=false;
  const roots=['sayname','say','reveal','bagAsk','bag','atkm','airm','itemm','camp','dead','ridingHint','equipmentHint','encounterCard','arenaReady','conversationPanel','conversationProfile','merchantShop','craftingView','fishingView','worldAtlas','savePrompt','saveSlots','sound'];
  const visible=node=>!!node&&!node.hidden&&node.getClientRects().length>0&&getComputedStyle(node).visibility!=='hidden'&&getComputedStyle(node).display!=='none';
  function host(){
    const ids=new WeakMap(),allowed=new Map();let serial=0,version=0,previous='';
    const token=node=>{let id=ids.get(node);if(!id){id=String(++serial);ids.set(node,id);}return id;};
    function capture(){
      const panels=[];allowed.clear();
      for(const id of roots){
        const root=document.getElementById(id);if(!visible(root))continue;
        const text=(root.innerText||root.textContent||'').trim().slice(0,14000),controls=[];
        for(const node of root.querySelectorAll('*')){
          if(!visible(node)||node.disabled||node.getAttribute('aria-disabled')==='true')continue;
          const types=window.LDRCoopEvents.types(node),click=types.has('click')||typeof node.onclick==='function';
          if(!click&&typeof node.onpointerdown!=='function'&&!types.has('pointerdown')&&!types.has('mousedown')&&!types.has('touchstart')&&!types.has('input')&&!types.has('change'))continue;
          if(node.tagName==='CANVAS')continue;
          const inventoryItem=node.dataset.itemKey&&BAG.find(item=>item.key===node.dataset.itemKey);
          const label=(node.getAttribute('aria-label')||node.title||node.innerText||node.textContent||(inventoryItem?bagName(inventoryItem):'')).trim().slice(0,300);
          if(!label&&node.type!=='range')continue;
          const key=token(node),slider=node.getAttribute('role')==='slider',range=slider||node.tagName==='INPUT'&&node.type==='range';
          controls.push({token:key,label:label||'Slide to confirm',range,min:range?Number(node.min)||0:undefined,max:range?Number(node.max)||100:undefined,step:range?Number(node.step)||1:undefined,value:range?Number(slider?node.getAttribute('aria-valuenow'):node.value):undefined});
          allowed.set(key,{node,click,range,slider,root});if(controls.length>=70)break;
        }
        if(text||controls.length)panels.push({id,text,controls});
      }
      const encoded=JSON.stringify(panels),changed=encoded!==previous;if(changed){previous=encoded;version++;}
      return {version,panels,changed};
    }
    function actNative(data){
      const item=allowed.get(String(data.token));if(data.version!==version&&!item?.range)return false;if(!item||!item.root.contains(item.node)||!item.node.isConnected||!visible(item.node)||item.node.disabled)return false;
      const node=item.node;
      if(item.range){
        const value=Number(data.value);if(!Number.isFinite(value))return false;
        if(item.slider){const min=Number(node.getAttribute('aria-valuemin'))||0,max=Number(node.getAttribute('aria-valuemax'))||100;const previous=Number(node.getAttribute('aria-valuenow'))||0;const target=Math.max(min,Math.min(max,value));node.dispatchEvent(new KeyboardEvent('keydown',{key:target>=max?'End':target<=min?'Home':target>previous?'ArrowRight':'ArrowLeft',bubbles:true}));if(data.finish)node.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return true;}
        node.value=String(Math.max(Number(node.min)||0,Math.min(Number(node.max)||100,value)));node.dispatchEvent(new Event('input',{bubbles:true}));if(data.finish)node.dispatchEvent(new Event('change',{bubbles:true}));
      }else if(item.click)node.click();
      else{
        const rect=node.getBoundingClientRect(),init={bubbles:true,cancelable:true,clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2,pointerId:9001,pointerType:'mouse',button:0};
        const types=LDRCoopEvents.types(node);if(types.has('mousedown')){node.dispatchEvent(new MouseEvent('mousedown',init));node.dispatchEvent(new MouseEvent('mouseup',init));}else{node.dispatchEvent(new PointerEvent('pointerdown',init));node.dispatchEvent(new PointerEvent('pointerup',init));}
      }
      return true;
    }
    return {capture,actionKind(data){const item=allowed.get(String(data.token));return item&&data.version===version&&['say','sayname','reveal'].includes(item.root.id)?'action':null;},act(data){dispatching=true;try{return actNative(data);}finally{dispatching=false;}},reset(){previous='';}};
  }
  function guest(container,send){
    let version=0,last='';
    function render(data){
      if(!Array.isArray(data?.panels))return;
      const encoded=JSON.stringify(data.panels);version=data.version;if(encoded===last)return;last=encoded;
      container.classList.toggle('campaignDialogue',data.panels.every(p=>['say','sayname','reveal','ridingHint','equipmentHint','encounterCard','arenaReady'].includes(p.id)));
      const scroll=container.scrollTop;container.replaceChildren();container.hidden=!data.panels.length;
      for(const panel of data.panels.slice(0,18)){
        const section=document.createElement('section'),text=document.createElement('p');text.textContent=String(panel.text||'').slice(0,14000);section.append(text);
        for(const choice of (panel.controls||[]).slice(0,70)){
          const button=document.createElement(choice.range?'input':'button');
          if(choice.range){button.type='range';for(const key of ['min','max','step','value'])button[key]=String(choice[key]);button.setAttribute('aria-label',choice.label);button.addEventListener('input',()=>send({kind:'ui',version,token:choice.token,value:Number(button.value)}));button.addEventListener('change',()=>send({kind:'ui',version,token:choice.token,value:Number(button.value),finish:true}));}
          else{button.type='button';button.textContent=String(choice.label);button.addEventListener('click',()=>send({kind:'ui',version,token:choice.token}));}
          section.append(button);
        }
        container.append(section);
      }
      container.scrollTop=scroll;
    }
    return {render};
  }
  window.LDRCoopUI={host,guest,get dispatching(){return dispatching;}};
})();
