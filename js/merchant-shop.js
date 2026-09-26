/* Merchant browsing, quantity and confirmation share one full-screen shop. */
let merchantShopSelection='',merchantShopReceipt='',merchantShopLast=null;
function merchantStock(giver){
  if(/Maelis|witch/i.test(giver.n||''))return ['bomb'];
  if(giver.n==='Wren'||giver.shopTown==='Thornwell')return ['potion','birdMeat','salt'];
  return Object.keys(STOCK).filter(key=>key!=='bomb');
}
function openMerchantShop(giver){
  const keys=merchantStock(giver);if(!keys.length)return;
  if(merchantShopLast!==giver){merchantShopSelection=keys[0];merchantShopReceipt='';merchantShopLast=giver;}
  ask={quick:1,shop:giver,opts:keys.map(key=>({n:STOCK[key].n,key,go:()=>purchaseQuantity(giver,key)}))};
  ask.opts.push({n:'Talk',go:()=>beginNpcTalk(giver)},{n:'Leave',go:null});
  askPick=Math.max(0,keys.indexOf(merchantShopSelection));askDraw();
}
function hideMerchantShop(){document.getElementById('merchantShop')?.remove();document.body.classList.remove('shop-open');}
function shopItemCount(key){return ({potion:potions,elixir:elixirs,boarMeat,hareMeat,deerMeat,foxMeat,birdMeat,dragonFish,bomb:bombs,dust,bell:bells,mark:marks,saint:breaths,stone:stones,salt:salts})[key]||0;}
function drawMerchantShop(){
  const giver=ask.shop,witch=/Maelis|witch/i.test(giver.n||''),keys=merchantStock(giver);
  const detail=ask.quantity||ask.confirmation;
  const key=detail?.key||ask.opts[askPick]?.key||merchantShopSelection||keys[0];
  merchantShopSelection=key;
  const item=STOCK[key],bagItem=BAG.find(it=>it.key===key),qty=detail?.qty||1;
  let root=document.getElementById('merchantShop');
  if(!root){root=document.createElement('section');root.id='merchantShop';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');document.body.appendChild(root);}
  document.body.classList.add('shop-open');document.getElementById('bagAsk').style.display='none';
  const stockScroll=root.querySelector('.shop-stock')?.scrollTop||0;
  root.className=witch?'witch-shop':'';root.setAttribute('aria-label',giver.n+' shop');
  root.innerHTML=`<header class="shop-header"><div class="shop-portrait"></div><div><small>${witch?'HEXES & REMEDIES':'TRAVELLER’S SUPPLIES'}</small><h1>${esc(giver.n)}’s ${witch?'Cabinet':'Shop'}</h1><p>${witch?'A little luck. A little trouble.':'Something useful for the road ahead.'}</p></div><button class="shop-close" aria-label="Leave shop">×</button></header>
  <div class="shop-account"><span>${witch?'The cabinet is open':'Take your time. Have a look.'}</span><strong><span aria-hidden="true">◈</span> ${gold} <small>GOLD</small></strong></div>
  <div class="shop-main"><div class="shop-stock" aria-label="Goods for sale"></div><article class="shop-detail"><div class="shop-plinth"><canvas width="260" height="260"></canvas></div><small class="shop-kind">${witch?'FROM THE WITCH’S SHELF':'READY FOR YOUR JOURNEY'}</small><h2>${esc(item.n)}</h2><p class="shop-description">${esc(bagItem?bagTell(bagItem):'Supplies for the road.')}</p><div class="shop-price"><strong>${item.cost()} <small>gold each</small></strong><span>In pack: ${shopItemCount(key)}</span></div><div class="shop-quantity"></div><div class="shop-action"></div></article></div>
  <footer class="shop-footer"><button class="shop-talk">Talk to ${esc(giver.n)}</button><p class="shop-receipt" role="status">${esc(merchantShopReceipt||'Choose an item to take a closer look.')}</p><button class="shop-back">${detail?'Back to goods':'Leave shop'}</button></footer>`;
  paintSmallPortrait(root.querySelector('.shop-portrait'),giver.n);
  root.querySelector('.shop-close').onclick=()=>askShut();
  root.querySelector('.shop-talk').onclick=()=>{askShut();beginNpcTalk(giver);};
  root.querySelector('.shop-back').onclick=()=>detail?sellerAsk(giver):askShut();
  const stock=root.querySelector('.shop-stock');
  for(const [i,k] of keys.entries()){
    const entry=STOCK[k],held=BAG.find(it=>it.key===k),button=document.createElement('button');
    button.className='shop-card'+(k===key?' selected':'');button.setAttribute('aria-pressed',String(k===key));
    button.innerHTML=`<canvas width="96" height="96"></canvas><span>${esc(entry.n)}</span><strong>${entry.cost()} <small>gold</small></strong>`;
    drawBagIcon(button.querySelector('canvas'),held?.icon(),0);
    button.onclick=()=>{merchantShopSelection=k;openMerchantShop(giver);};stock.appendChild(button);
  }
  stock.scrollTop=stockScroll;
  const selected=stock.querySelector('.selected');if(selected){const a=selected.getBoundingClientRect(),b=stock.getBoundingClientRect();if(a.top<b.top||a.bottom>b.bottom)selected.scrollIntoView({block:'nearest'});}
  drawBagBig(root.querySelector('.shop-plinth canvas'),bagItem?.icon(),0);
  const quantity=root.querySelector('.shop-quantity'),action=root.querySelector('.shop-action');
  const addButton=(label,fn,disabled=false)=>{const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.onclick=fn;action.appendChild(b);return b;};
  if(ask.confirmation){
    quantity.innerHTML=`<p>Take ${qty} × ${esc(item.n.toLowerCase())} for <b>${qty*item.cost()} gold</b>?</p>`;
    addButton('Confirm purchase',()=>{askPick=1;askTake();});addButton('Change quantity',()=>purchaseQuantity(giver,key,qty));
  }else if(ask.quantity){
    quantity.innerHTML='<button aria-label="Decrease quantity">−</button><output aria-live="polite">'+qty+'</output><button aria-label="Increase quantity">+</button>';
    const buttons=quantity.querySelectorAll('button');buttons[0].disabled=qty<=1;buttons[1].disabled=qty>=ask.quantity.max;
    buttons[0].onclick=()=>changePurchaseQuantity(-1);buttons[1].onclick=()=>changePurchaseQuantity(1);
    addButton('Review purchase · '+qty*item.cost()+' gold',()=>confirmPurchase(giver,key,qty));
  }else{
    addButton(gold<item.cost()?'Need '+(item.cost()-gold)+' more gold':'Buy · '+item.cost()+' gold',()=>purchaseQuantity(giver,key),gold<item.cost());
  }
  if(!detail&&askPick>=keys.length){const el=root.querySelector(askPick===keys.length?'.shop-talk':'.shop-back');el.classList.add('focused');}
}
