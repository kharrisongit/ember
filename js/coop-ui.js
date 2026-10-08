/* Mirror the real game's open menus as text and explicit controls. Tokens refer
 * only to currently visible controls in these allowlisted gameplay panels. */
(() => {
  'use strict';
  let dispatching=false;
  const roots=['sayname','say','reveal','bagAsk','bag','atkm','airm','itemm','camp','dead','ridingHint','equipmentHint','encounterCard','arenaReady','conversationPanel','conversationProfile','merchantShop','craftingView','fishingView','worldAtlas','savePrompt','saveSlots'];
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
          controls.push({token:key,label:label||'Slide to confirm',range,min:range?Number(slider?node.getAttribute('aria-valuemin'):node.min)||0:undefined,max:range?Number(slider?node.getAttribute('aria-valuemax'):node.max)||100:undefined,step:range?Number(node.step)||1:undefined,value:range?Number(slider?node.getAttribute('aria-valuenow'):node.value):undefined});
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
        if(item.slider){
          if(item.root.id!=='craftingView'||!node.classList.contains('craft-slider-thumb'))return false;
          if(!Crafting.slide(Math.max(0,Math.min(100,value))/100))return false;
          if(data.finish){if(value>=100)Crafting.finish();else Crafting.release();}return true;
        }
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
    let version=0,last='';const panels=new Map();
    const place=(parent,node,index)=>{if(parent.children[index]!==node)parent.insertBefore(node,parent.children[index]||null);};
    function render(data){
      if(!Array.isArray(data?.panels))return;
      const encoded=JSON.stringify(data.panels);version=data.version;if(encoded===last)return;last=encoded;
      container.classList.toggle('campaignDialogue',data.panels.every(p=>['say','sayname','reveal','ridingHint','equipmentHint','encounterCard','arenaReady'].includes(p.id)));
      container.classList.toggle('campaignFishing',data.panels.some(p=>p.id==='fishingView'));
      const scroll=container.scrollTop,seen=new Set();container.hidden=!data.panels.length;
      for(const [index,panel] of data.panels.slice(0,18).entries()){
        seen.add(panel.id);let view=panels.get(panel.id);
        if(!view){
          const section=document.createElement('section'),text=document.createElement('p');section.append(text);
          view={section,text,controls:new Map()};panels.set(panel.id,view);
        }
        const {section,text,controls}=view;place(container,section,index);
        const copy=String(panel.text||'').slice(0,14000);if(text.textContent!==copy)text.textContent=copy;
        const kept=new Set();
        for(const [i,choice] of (panel.controls||[]).slice(0,70).entries()){
          kept.add(choice.token);let control=controls.get(choice.token);
          if(control&&control.range!==!!choice.range){control.node.remove();controls.delete(choice.token);control=null;}
          if(!control){
            const node=document.createElement(choice.range?'input':'button');
            control={node,range:!!choice.range,editing:false,pointer:false,pending:null,until:0};controls.set(choice.token,control);
            if(choice.range){
              node.type='range';
              node.addEventListener('pointerdown',()=>{control.editing=true;control.pointer=true;});
              for(const event of ['pointerup','pointercancel','blur'])node.addEventListener(event,()=>{control.editing=false;});
              const update=finish=>{
                control.pending=Number(node.value);control.until=Date.now()+1000;
                send({kind:'ui',version,token:choice.token,value:control.pending,finish});
                // A short craft drag resets even when the host has already
                // returned to its previous snapshot before its next UI packet.
                if(finish&&panel.id==='craftingView'&&control.pending<100){control.pending=0;node.value='0';}
              };
              node.addEventListener('input',()=>update(false));
              node.addEventListener('change',()=>{update(control.pointer);control.pointer=false;});
              node.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();update(true);}});
            }else{node.type='button';node.addEventListener('click',()=>send({kind:'ui',version,token:choice.token}));}
          }
          const {node}=control;place(section,node,i+1);
          if(choice.range){
            for(const key of ['min','max','step'])node[key]=String(choice[key]);node.setAttribute('aria-label',choice.label);
            if(Number(choice.value)===control.pending)control.pending=null;
            if(!control.editing&&(control.pending===null||Date.now()>control.until))node.value=String(choice.value);
          }else node.textContent=String(choice.label);
        }
        for(const [key,control]of controls)if(!kept.has(key)){control.node.remove();controls.delete(key);}
      }
      for(const [id,view]of panels)if(!seen.has(id)){view.section.remove();panels.delete(id);}
      container.scrollTop=scroll;
    }
    return {render};
  }
  window.LDRCoopUI={host,guest,get dispatching(){return dispatching;}};
})();
