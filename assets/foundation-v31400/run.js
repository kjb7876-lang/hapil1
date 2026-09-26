/* Run policy is locked per world. No hidden bonus writes to permanent progression. */
(function(root){'use strict';
 const P=root.__HAPIL_POLICY_V31400__;if(!P)throw Error('HAPIL player policy missing');
 const worlds=new WeakMap(),views=new WeakMap(),restorePending=new WeakSet(),rings=new WeakMap();let current=null;
 const DEFAULT={aiEnabled:false,aiHeroes:[],humanPlayers:1,humanHeroes:[],origin:'new'};let draft={...DEFAULT};
 try{const x=JSON.parse(localStorage.getItem('hapil.run-draft.v31400')||'{}');draft={...P.normalizePolicy(x,DEFAULT),origin:'new'};}catch{}
 const C=()=>root.__HAPIL_CONTROLS_V31329__,Party=()=>root.__HAPIL_PARTY_V31322__;
 const same=(a,b)=>a.aiEnabled===b.aiEnabled&&a.humanPlayers===b.humanPlayers&&JSON.stringify(a.aiHeroes)===JSON.stringify(b.aiHeroes)&&JSON.stringify(a.humanHeroes)===JSON.stringify(b.humanHeroes);
 const nowState=()=>C()?.binding?.state?.current;
 function get(s=current){if(!s)return null;let p=worlds.get(s);if(!p){p=P.normalizePolicy(s.runPolicyV31400,{aiEnabled:true,origin:'legacy'});worlds.set(s,p);s.runPolicyV31400=p;}return p;}
 function select(value){draft={...P.normalizePolicy({...draft,...value},DEFAULT),origin:value.origin==='network'?'network':'new'};try{localStorage.setItem('hapil.run-draft.v31400',JSON.stringify(draft));}catch{}root.dispatchEvent?.(new CustomEvent('hapil-run-options-v31400'));return {...draft,aiHeroes:[...draft.aiHeroes]};}
 function init(s,hero,config=draft){if(!s)throw Error('Run requires a world');const p=P.normalizePolicy(config,{...DEFAULT});worlds.set(s,p);s.runPolicyV31400=p;s.activeHeroId=P.safe(hero);current=s;return p;}
 function serialize(s){const p=get(s);return p?{...p,aiHeroes:[...p.aiHeroes]}:null;}
 function restore(s,raw){if(!s||!raw)return;const p=P.normalizePolicy(raw.runPolicyV31400,{aiEnabled:true,origin:'legacy'});worlds.set(s,p);s.runPolicyV31400=p;s.legacyRosterV31400=P.legacy(raw);restorePending.add(s);}
 function inherit(s,old){const p=get(old);if(p)init(s,old.activeHeroId,{...p,origin:'practice'});}
 function configFor(s,hero=s.activeHeroId){const p=get(s),h=P.safe(hero),others=p.aiEnabled?p.aiHeroes:[];return{mode:p.origin==='network'?'network':p.humanPlayers>1?'local2':'solo',roster:[{slotId:'p1',heroId:h,control:'host'},...(p.humanHeroes??[]).slice(0,p.humanPlayers-1).map((id,i)=>({slotId:'p'+(i+2),heroId:id,control:p.origin==='network'?'remote':'local'})),...others.filter(x=>x!==h).slice(0,8-p.humanPlayers).map((id,i)=>({slotId:'p'+(i+1+p.humanPlayers),heroId:id,control:'ai'}))],supportHeroId:P.partner(h),runPolicyV31400:serialize(s)};}
 function prepare(config,world){
  const b=C()?.binding,s=b?.state?.current??world,rows=config.roster??[],hero=rows[0]?.heroId??s?.activeHeroId??'hwando';
  if(!P.has(hero)||rows.some(r=>!P.has(r.heroId)))throw Error('배신자·미등록 캐릭터는 아군으로 선택할 수 없습니다.');
  if(config.mode==='network'){
   const humans=rows.filter(r=>r.control!=='ai'),ais=rows.filter(r=>r.control==='ai'&&r.slotId!=='story68');
   const np=P.normalizePolicy({aiEnabled:ais.length>0,aiHeroes:ais.map(r=>r.heroId),humanPlayers:humans.length,humanHeroes:humans.slice(1).map(r=>r.heroId),origin:'network'});
   if(b?.phase!=='game')select(np);
   if(s&&(b?.phase!=='game'||get(s)?.origin==='network'||Party()?.status?.role==='guest')){worlds.set(s,np);s.runPolicyV31400=np;}
   else if(s)throw Error('진행 중 싱글플레이를 협동 세션으로 바꿀 수 없습니다.');
   return {...config,runPolicyV31400:np,supportHeroId:P.partner(hero)};
  }
  if(!s||b?.phase!=='game')return{...config,supportHeroId:P.partner(hero)};
  const p=get(s),story=s?.gameModeV31346==='STORY'||root.__HAPIL_MODES_V31346__?.mode?.(s)==='STORY';
  if(config.runPolicyV31400&&!same(p,P.normalizePolicy(config.runPolicyV31400)))throw Error('AI와 솔로 보너스는 새 게임 시작 때만 변경할 수 있습니다.');
  const manual=rows.slice(1).filter(r=>r.control==='ai'&&r.slotId!=='story68').map(r=>r.heroId),humans=rows.filter(r=>r.control!=='ai'&&r.slotId!=='story68');
  if(!s.practiceV31329&&(manual.some(id=>!p.aiHeroes.includes(id))||!p.aiEnabled&&manual.length||humans.length>p.humanPlayers||humans.slice(1).some(r=>!p.humanHeroes.includes(r.heroId))))throw Error('진행 중 파티 구성은 잠겨 있습니다. 새 게임에서 AI/동료를 선택하세요.');
  return{...config,roster:rows.filter(r=>r.control!=='ai'||p.aiEnabled||story&&r.slotId==='story68'),supportHeroId:P.partner(hero)};
 }
 function receive(s,raw){if(!s)return;const p=P.normalizePolicy({...raw,origin:'network'},{aiEnabled:false,humanPlayers:2,origin:'network'});worlds.set(s,p);s.runPolicyV31400=p;}

 function attach(s){current=s;get(s);announce(s);if(restorePending.has(s)){restorePending.delete(s);const party=Party();if(party?.status?.role!=='guest')party?.configure(configFor(s));}return get(s);}
 function growth(raw,s=current){if(!raw||typeof raw!=='object')raw={};const p=get(s),b=P.bonus(p);if(!b)return raw;
  const sig=JSON.stringify(Object.keys(raw).sort().map(k=>[k,raw[k]]));let m=views.get(raw);if(!m||m.signature!==sig){m={signature:sig,view:P.effective(raw,p)};views.set(raw,m);}return m.view;
 }
 function record(s,type,detail={}){if(!s)return;let r=rings.get(s);if(!r){r={sequence:0,events:[],counts:{}};rings.set(s,r);}r.counts[type]=(r.counts[type]??0)+1;r.events.push({sequence:++r.sequence,time:Number(s.time)||0,zone:s.zone,type,...detail});if(r.events.length>256)r.events.shift();}
 function ai(s){return get(s)?.aiEnabled===true;}
 function diagnostics(s=current){const p=get(s),r=rings.get(s);return{policy:p,soloBonus:P.bonus(p),canonicalHeroes:P.ids,collabHeroId:P.partner(s?.activeHeroId),counts:{...r?.counts},events:(r?.events??[]).slice()};}
 function announce(s){if(!s?.legacyRosterV31400||s.migrationNotifiedV31400)return;s.migrationNotifiedV31400=true;C()?.binding?.notify?.('배신자 영웅 선택을 환도로 이전했습니다. 이전 전용 성장 기록은 별도 보존됩니다.');}
 const api=Object.freeze({version:'3.14.00',installed:true,policy:P,get,init,receive,select,draft:()=>({...draft,aiHeroes:[...draft.aiHeroes]}),serialize,restore,inherit,configFor,prepare,attach,growth,ai,record,diagnostics,announce});root.__HAPIL_RUN_V31400__=api;
})(window);
