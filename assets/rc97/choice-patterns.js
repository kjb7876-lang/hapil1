/* RC97: grammar and route choice; native rendering, contact and time control remain authoritative. */
(()=>{'use strict';
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),memory=new WeakMap();
 const titles={obsession:'집착 · 남겨진 발자국',greed:'탐욕 · 중심으로 삼킨 흐름',rage:'분노 · 밀려오는 파동',envy:'질투 · 어긋난 반영',order:'복종의 격자',petal:'충동 · 피어나는 침범'};
 const orderIds=new Set(['b08-boss','b09-boss','u203-boss','mb-kair01-v31231','mb-hando03']);
 const hash=id=>Array.from(String(id)).reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,7);
 function profile(a){const id=String(a?.id??''),text=String(window.__HAPIL_LASERS_V31330__?.owners?.find(o=>o.id===id)?.name??a?.name??''),fixed={'b06-boss':'greed','b06b-boss':'greed','b04-boss':'greed','b05-boss':'obsession','b03-boss':'envy','b07-boss':'rage','dist06-boss':'rage'};let family;
  if(fixed[id])family=fixed[id];else if(orderIds.has(id)||/감독|교정|연산|컨트롤러|최초명령|장부|회장|통제|봉인/.test(text))family='order';
  else if(/맘몬|탐욕|탐식|베엘제붑|포식|금고/.test(text))family='greed';
  else if(/서윤|색욕|집착|갈망|의존|세이렌/.test(text))family='obsession';
  else if(/사탄|발록|분노|화염|핏빛/.test(text))family='rage';
  else if(/레비아탄|질투|비교|거울/.test(text))family='envy';else family='petal';
  return{family,title:titles[family],seed:hash(id)};
 }
 function mem(s){let m=memory.get(s);if(!m||m.zone!==s.zone||s.time<m.time){m={zone:s.zone,time:s.time,clock:-Infinity,samples:[],cycle:-1,selected:1,blocked:1};memory.set(s,m);}m.time=s.time;return m;}
 function beforeTick(s,api,delta=.1){const m=mem(s),R=window.__HAPIL_COMBAT_FLOW_RC95__;if(m.clock===s.time)return;m.clock=s.time;
  const dt=clamp(n(delta),0,.1),freeze=api.locked(s)?dt:Math.max(0,Math.min(s.time,n(s.timeStopUntil))-(s.time-dt));
  if(freeze>0){const f=R.frame(s);f.startedAt+=freeze;s.rc95CombatFlow={version:1,zone:s.zone,startedAt:f.startedAt};}
  const p=R.phase(s);if(p.cycle!==m.cycle){m.blocked=m.selected;m.cycle=p.cycle;}
  m.selected=clamp(Math.round(((s.x+s.y)*.5-10)/6),0,2);
  if(!m.samples.length||s.time-m.samples[m.samples.length-1].at>=.18)m.samples.push({at:s.time,x:s.x,y:s.y});while(m.samples.length>8)m.samples.shift();
 }
 function lead(s,owners){const live=(s.bossLaserCastsV31330??[]).find(c=>c.endAt>s.time),owner=owners.find(a=>a.id===live?.sourceId);if(owner)return owner;
  const bosses=owners.filter(a=>a.boss),list=bosses.length?bosses:owners;return list[window.__HAPIL_COMBAT_FLOW_RC95__.phase(s).cycle%list.length];
 }
 function volley(s,a,p,count){const z=profile(a),m=mem(s),beat=n(a.rc95BulletCycle),sign=p.cycle%2?-1:1,history=m.samples.find(q=>q.at>=s.time-.7)??m.samples[0]??s;
  const aim=Math.atan2((z.family==='obsession'?history.y:s.y)-a.y,(z.family==='obsession'?history.x:s.x)-a.x),mixed=p.index===2;
  const speed=(s.gameModeV31346==='HELL'?6.3:5.1)*(z.family==='greed'?.85:1),shots=[];
  for(let i=0;i<count;i++){let x=a.x,y=a.y,angle=aim+(count===1?0:i/(count-1)-.5)*(mixed?.85:1.5),curve=0;
   if(!mixed){switch(z.family){
    case 'obsession':angle+=sign*Math.sin(beat*.38)*.20;curve=sign*.10;break;
    case 'greed':{const u=i/count*Math.PI*2+sign*beat*.16,r=7.5+(beat%2)*1.2;x=clamp(a.x+Math.cos(u)*r,2,30);y=clamp(a.y+Math.sin(u)*r,2,30);angle=Math.atan2(a.y-y,a.x-x);break;}
    case 'rage':angle+=Math.sin(beat*.45)*.24;break;
    case 'envy':angle=aim+sign*(i-(count-1)/2)*.22+(beat%2?.28:-.28);break;
    case 'order':angle=sign*Math.PI/4+(i-(count-1)/2)*.24+Math.floor(beat/4)*.18;break;
    default:angle=i/count*Math.PI*2+sign*beat*.21+(z.seed%17)*.035;curve=sign*.065;
   }}
   if(Math.hypot(x-s.x,y-s.y)<(z.family==='greed'&&!mixed?2.4:.8))continue;
   shots.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,curve,radius:.28,damage:a.boss?(mixed?12:10):(mixed?10:8),homingMode31212:'none',frozenUntil:s.time,life:7,patternKind:'rc95-volley',label:a.name+' · '+z.title,status:'none',rc97Grammar:z.family});
  }return shots;
 }
 function selectCard(s,a,cards,p){const family=profile(a).family,wanted=family==='order'?['hash','sun','three']:family==='obsession'?['spiral','sweep','claw']:family==='greed'?['orbit-cross','clock','spiral']:family==='rage'?['fan-sweep','sweep','three']:family==='envy'?['plus','slash','two']:['hexagram','spiral','star'];
  const preferred=cards.filter(c=>wanted.includes(c.laserTypeV31331??c.laserTypeV31330)),list=preferred.length?preferred:cards;return list[(p.cycle+n(a.rc95LaserCycle))%Math.max(1,list.length)];
 }
 function prepareLaser(s,a,c,p){const z=profile(a),m=mem(s),blocked=m.blocked,available=[0,1,2].filter(v=>v!==blocked),flip=p.cycle%2;
  if(z.family==='order'||c.width<=2.4)c.rc97Choice={version:1,family:z.family,cycle:p.cycle,blocked,broad:10+6*available[flip],narrow:10+6*available[1-flip]};if(z.family==='order')c.width=Math.min(c.width,1.6);
  c.patternTitleRC97=z.title;a.shmupPatternPlanV31365={family:z.family,phase:p.index+1,label:z.title,announcedAt:s.time};
 }
 function validPlan(c){const p=c.rc97Choice;if(!p)return true;return p.version===1&&Object.hasOwn(titles,p.family)&&Number.isInteger(p.cycle)&&p.cycle>=0&&p.cycle<1e7&&Number.isInteger(p.blocked)&&p.blocked>=0&&p.blocked<=2&&[10,16,22].includes(p.broad)&&[10,16,22].includes(p.narrow)&&p.broad!==p.narrow&&p.broad!==10+6*p.blocked&&p.narrow!==10+6*p.blocked;}
 const plane=p=>({u:p.x-p.y,v:(p.x+p.y)*.5}),world=(u,v)=>({x:v+u*.5,y:v-u*.5});
 function clip(a,b){let lo=0,hi=1;for(const key of ['x','y']){const d=b[key]-a[key];if(Math.abs(d)<1e-9){if(a[key]<1.1||a[key]>30.9)return null;continue;}const t=[(1.1-a[key])/d,(30.9-a[key])/d].sort((a,b)=>a-b);lo=Math.max(lo,t[0]);hi=Math.min(hi,t[1]);}if(lo>=hi)return null;const at=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});return{a:at(lo),b:at(hi)};}
 function geometry(c,original){ // RC121 continuous grammar; retain authored grid, never cut safe bands.
  if(!c.rc97Choice||!validPlan(c))return original;const p=c.rc97Choice;let lines=original;
  if(p.family==='order'){lines=[];const spacing=Math.max(4,6.4-Math.min(p.cycle,6)*.4),v=10+6*p.blocked;
   for(const u of [-spacing,0,spacing]){const l=clip(world(u,1.1),world(u,30.9));if(l)lines.push({...l,width:c.width});}
   for(const y of [v-spacing,v,v+spacing]){const l=clip(world(-31,y),world(31,y));if(l)lines.push({...l,width:c.width});}
  }
  return lines;
 }
 window.__HAPIL_CHOICE_RC97__=Object.freeze({installed:true,version:'RC121',profile,beforeTick,lead,volley,selectCard,prepareLaser,validPlan,geometry});
})();
