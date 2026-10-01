// Source contracts and actual HUD updater behavior; no render/geometry claims.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=read('assets/rc99/battle-layout.css'),html=read('index.html');
assert(html.lastIndexOf('battle-layout.css')>html.lastIndexOf('settings-rc61.css'),'layout overrides load last');
assert(css.includes('grid-template-columns:minmax(0,1fr) minmax(0,8fr) minmax(0,1fr)!important'),'reserved 10:80:10 tracks');
assert(css.includes('html.hapil-touch-v31366 body.rc15-playing .game>.hapil-combat-rail-v31339 {display:none!important}'),'mobile rail override must match RC28 specificity');
assert(css.includes('.topbar nav {grid-column:2!important;display:flex!important;'),'windowed desktop settings must override the <=1080px nav hide');
assert(!read('assets/rc99/battle-layout.js').includes('rc99-auto-skills'),'no redundant skill-key HUD');
assert(read('assets/rc96/resonance-hud.js').includes("document.querySelector('.combat-hud')"),'RC96 resource readout docks in footer');
assert(css.includes('overflow:auto!important;overscroll-behavior:contain'),'dense side panels scroll inside their own area');
assert(css.includes('object-fit:contain!important'),'desktop canvas retains 16:9 fitting');
assert(css.includes('[data-combat-input="manual"]'),'manual controls remain available');
class Element {
 constructor(){this.children=[];this.dataset={};this.hidden=false;this.innerHTML='';this.style={setProperty(){},getPropertyValue(){return ''}};this.classList={toggle(){}};}
 append(...children){this.children.push(...children)} prepend(e){this.children.unshift(e)} setAttribute(){} addEventListener(){}
 querySelector(selector){if(selector==='.combat-info-details')return this.children.find(e=>e.className==='combat-info-details')||null;if(selector==='.combat-info-columns')return this.content??=new Element();return null;}
}
let mobile=false,tick,mode='semi';const body=new Element(),game=new Element(),settings=new Element(),toast={textContent:"검사 피드백"};
const document={body,hidden:false,title:'',documentElement:{classList:{contains(){return mobile}}},createElement(){return new Element()},querySelector(sel){return sel==='.game'?game:sel==='.settings-layout'?settings:sel==='.game-stage>.toast'?toast:null}};
const state={time:10,hp:90,maxHp:100,activeHeroId:'hero',zone:'dist00',enemies:[{id:'boss',name:'<unsafe>',hp:900,maxHp:1000,boss:true,activePattern:'긴 공격 예고'}],targetEnemyId:'boss',skillEventsV31513:[]};
const binding={phase:'game',state:{current:state},settings:{current:{showCombatInfo:false}}};
const window={document,__HAPIL_CONTROLS_V31329__:{binding,effective:()=>mode},__HAPIL_RC15__:{zone:()=>({name:'검사 지역'}),heroes:()=>[{id:'hero',name:'영웅'}]},__HAPIL_PARTY_V31322__:{state,actors:[{heroId:'ally',hp:20}]}};
vm.runInNewContext(read('assets/rc26/ui.js'),{window,document,addEventListener(){},setInterval(fn){tick=fn},console});
const panel=body.children[0],left=panel.children[0];
assert.equal(body.children.find(e=>e.className==='combat-footer-feedback').textContent,'검사 피드백');assert.equal(panel.hidden,false);assert.equal(game.dataset.combatInput,'auto');assert(left.innerHTML.includes('&lt;unsafe&gt;'),'escape enemy text');
let details=settings.querySelector('.combat-info-details');assert(details);details.open=true;tick();assert.equal(settings.children.length,1);assert.equal(details.open,true,'HUD refresh must not collapse details');
mobile=true;tick();assert.equal(panel.hidden,true,'mobile has no side panels');assert(details.querySelector('.combat-info-columns').innerHTML.includes('긴 공격 예고'),'details available on mobile');
mode='manual';tick();assert.equal(game.dataset.combatInput,'manual');
binding.phase='title';tick();assert.equal(panel.hidden,true);
console.log('PASS: contained layout source contracts, automatic/manual mode, escaped status, mobile details, repeated updates and title cleanup');
