/* Small event-capable DOM for exercising real game controls in the VM. */
export function gameDom(){
  const nodes=new Map(),captures=new Map();let drawing;
  class Element{
    constructor(tag='div'){
      this.tagName=tag.toUpperCase();this.children=[];this.listeners=new Map();this.attrs={};this.style={setProperty(){}};
      this.dataset={};this.className='';this.width=800;this.height=600;this.hidden=false;this.disabled=false;
      const classes=()=>new Set(this.className.split(/\s+/).filter(Boolean));
      this.classList={contains:k=>classes().has(k),add:k=>{const s=classes();s.add(k);this.className=[...s].join(' ');},
        remove:k=>{const s=classes();s.delete(k);this.className=[...s].join(' ');},toggle:(k,on)=>{on??=!classes().has(k);this.classList[on?'add':'remove'](k);return on;}};
    }
    set id(v){this._id=v;nodes.set(v,this);}get id(){return this._id;}
    set innerHTML(v){this.replaceChildren();for(const m of String(v).matchAll(/<(\w+)[^>]*\bid=["']([^"']+)["'][^>]*>/g)){const n=new Element(m[1]);n.id=m[2];this.appendChild(n);}}get innerHTML(){return '';}
    set textContent(v){this._text=v;this.replaceChildren();}get textContent(){return this._text||'';}
    append(...children){for(const c of children)this.appendChild(c);}
    appendChild(c){if(c.parentNode)c.parentNode.children=c.parentNode.children.filter(n=>n!==c);c.parentNode=this;this.children.push(c);return c;}
    replaceChildren(...children){for(const c of this.children)c.parentNode=null;this.children=[];this.append(...children);}
    after(...children){this.parentNode?.append(...children);}
    remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);this.parentNode=null;}
    matches(selector){return selector.split(',').some(s=>{s=s.trim();if(s.startsWith('#'))return this.id===s.slice(1);if(s.startsWith('.'))return s.slice(1).split('.').every(k=>this.classList.contains(k));return this.tagName.toLowerCase()===s;});}
    closest(selector){for(let n=this;n;n=n.parentNode)if(n.matches(selector))return n;return null;}
    querySelectorAll(selector){return this.children.flatMap(c=>[...(c.matches(selector)?[c]:[]),...c.querySelectorAll(selector)]);}
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    setAttribute(k,v){this.attrs[k]=String(v);if(k==='id')this.id=v;}getAttribute(k){return this.attrs[k];}
    removeAttribute(k){delete this.attrs[k];}
    addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(fn);}
    getContext(){return drawing;}getBoundingClientRect(){return {width:800,height:600,left:0,top:0};}
    pause(){}play(){return Promise.resolve();}load(){}scrollIntoView(){}focus(){}showModal(){this.open=true;}close(){this.open=false;}
  }
  const body=new Element('body');
  const element=id=>{if(!nodes.has(id)){const n=new Element();n.id=id;body.appendChild(n);}return nodes.get(id);};
  const deck=element('deck');
  for(const id of ['btnL','btnR','btnItems','act','btnB','dpad'])deck.appendChild(element(id));
  for(const [menu,rows]of [['airm','airRows'],['atkm','atkRows'],['itemm','itemRows']])element(menu).appendChild(element(rows));
  const document=ctx=>{drawing=ctx;return {body,head:new Element('head'),documentElement:new Element('html'),
    createElement:tag=>new Element(tag),getElementById:element,querySelectorAll:s=>body.querySelectorAll(s),querySelector:s=>body.querySelector(s),
    addEventListener:(type,fn)=>{if(!captures.has(type))captures.set(type,[]);captures.get(type).push(fn);}};};
  const dispatch=(target,type,properties={})=>{
    const e={target,type,key:'',detail:1,pointerId:1,isPrimary:true,clientX:0,clientY:0,...properties,touches:type==='touchstart'?[{clientX:0,clientY:0}]:[],preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;},stopImmediatePropagation(){this.stopped=true;}};
    for(const fn of captures.get(type)||[]){fn(e);if(e.stopped)return e;}
    for(let node=target;node;node=node.parentNode){for(const fn of node.listeners.get(type)||[])fn(e);if(e.stopped)break;}
    return e;
  };
  const touch=target=>{dispatch(target,'pointerdown');const down=dispatch(target,'touchstart');dispatch(target,'touchend');if(!down.defaultPrevented)dispatch(target,'click');};
  return {document,element,dispatch,touch};
}
