'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const root={setTimeout:()=>{},document:{hidden:false}};root.window=root;vm.createContext(root);
for(const file of ['assets/rc138/battle-arena.js','assets/rc175/boss-policy.js'])vm.runInContext(fs.readFileSync(file,'utf8'),root);
const R=root.__HAPIL_BATTLE_ARENA_RC138__;R.bind({combat:['arena'],clear:()=>true});
root.__HAPIL_LASERS_V31330__={installed:true,owners:[{id:'boss',color:'#bb2244'}],tick:()=>{},draw:()=>{}};root.__HAPIL_BLOOD_RC16__={draw:()=>{}};
let calls=0;root.__HAPIL_NATIVE_ARENA_RC138__={bodyDamage:(s,d,x,y,p)=>{assert(!R.bodyPacket(s,p));calls++;s.hp-=d;}};
vm.runInContext(fs.readFileSync('assets/rc32/boss-and-mobile.js','utf8'),root);
const tick=(s,t)=>{s.time=t;root.__HAPIL_LASERS_V31330__.tick(s,.1);};
function state(){const s={zone:'arena',time:0,hp:240,x:16,y:16,fxSerial:1,enemies:[{id:'boss',hp:100,boss:true}],bossBlackHoleNextRC32:{boss:999},bossBlackHolesRC32:[{id:2,sourceId:'boss',zone:'arena',fireAt:0,endAt:10,x:16,y:16,radius:5,color:'#bb2244',label:'boss'}]};root.__HAPIL_CONTROLS_V31329__={binding:{state:{current:s},phase:'game',modal:{current:null},blocked:()=>false}};calls=0;return s;}
let s=state();assert(R.enabled(s));assert(R.locked(s),'real RC138 exit lock is active in combat');tick(s,0);tick(s,.5);assert.equal(calls,1);assert.equal(s.hp,239);assert(R.locked(s));
for(const reason of ['pause','modal','phase','blocked','hidden','reading','zone','death','outside','ownerDeath','end']){s=state();tick(s,0);tick(s,.4);assert.equal(calls,0);
 if(reason==='pause')s.paused=true;if(reason==='modal')root.__HAPIL_CONTROLS_V31329__.binding.modal.current={};if(reason==='phase')root.__HAPIL_CONTROLS_V31329__.binding.phase='menu';if(reason==='blocked')root.__HAPIL_CONTROLS_V31329__.binding.blocked=()=>true;if(reason==='hidden')root.document.hidden=true;if(reason==='reading')root.__HAPIL_READING_V31342__={blocked:true};if(reason==='zone')s.zone='next';if(reason==='death')s.hp=0;if(reason==='outside')s.x=30;if(reason==='ownerDeath')s.enemies[0].hp=0;if(reason==='end')s.bossBlackHolesRC32[0].endAt=.45;
 tick(s,.5);assert.equal(calls,0,reason);if(['zone','death','ownerDeath','end'].includes(reason))assert.equal(s.bossBlackHolesRC32.length,0,reason+' removes area');
 if(['pause','modal','phase','blocked','hidden','reading','outside'].includes(reason)){s.paused=false;s.x=16;root.document.hidden=false;delete root.__HAPIL_READING_V31342__;const b=root.__HAPIL_CONTROLS_V31329__.binding;b.phase='game';b.modal.current=null;b.blocked=()=>false;tick(s,.6);assert.equal(calls,0,reason+' discards stale partial contact');tick(s,1.1);assert.equal(calls,1,reason+' resumes after a fresh half second');}
 root.document.hidden=false;delete root.__HAPIL_READING_V31342__;
}
console.log('RC176_ARENA_INTEGRATION passed: actual RC138 + RC32 + boss policy; exit-locked combat DOT active, real pause/modal/phase/hidden/reading and zone/death/outside/ownerDeath/end fixtures suppress damage; resumed contacts start fresh. Native damage adapter is a fixture, not real browser combat.');
