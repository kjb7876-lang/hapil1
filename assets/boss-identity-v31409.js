/* Two named Kair bosses: native descriptors drive both warning and hit logic.
 * All other boss records and every native damage value remain untouched.
 */
(function(root){'use strict';
 const expected=Object.freeze({
  'dist00-boss':['검은 뿌리 직선 찌르기','기억 수액 낙하'],
  'kair-great-03':['자비로운 단일결론','최초명령 교차식','붕괴시간로'],
  'k103-boss':['자비로운 단일결론','최초명령 교차식','붕괴시간로']
 });
 const signatures=Object.freeze({
  'dist00-boss':Object.freeze({name:'뿌리의 문지기',
   signatureA:'검은 뿌리 직선 찌르기',signatureB:'기억 수액 낙하',
   transformation:'체력 절반에서 날개를 뿌리가 덮고 직선 공격이 교차 봉쇄로 변함',
   finalSynthesis:'교차 뿌리와 안전한 수액 중심을 번갈아 압박'}),
  'kair-great-03':Object.freeze({name:'아르벨리아, 유예의 수문장',
   signatureA:'유예의 열린 시간방',signatureB:'단일 초침 → 겹친 초침 교차',
   transformation:'2페이즈부터 초침이 교차',
   finalSynthesis:'기존 보스 전역 광로·낙하 종결식 유지'}),
  'k103-boss':Object.freeze({name:'세이렌 모르',
   signatureA:'조류의 열린 숨구멍',signatureB:'파도 부채 → 공명의 교차 음파',
   transformation:'2페이즈부터 원형 낙인과 교차 음파',
   finalSynthesis:'기존 보스 전역 광로·낙하 종결식 유지'})
 });
 const tag=(id,p)=>({...p,bossIdentityV31409:id});
 function patterns(actor,phase,rows){
  const id=actor?.id,anchors=expected[id];
  if(!anchors||!Array.isArray(rows)||!actor?.boss||actor.hp<=0||
     actor.visualOnly||actor.protectedNarrativeTargetV31307||!Number.isFinite(phase)||phase<1||
     !anchors.every((name,i)=>rows[i]?.name===name))return rows;
  const next=rows.slice();
  if(id==='dist00-boss'){
   if(phase>=2){
    next[0]=tag(id,{...rows[0],name:'뿌리의 교차 봉인',shape:'cross',windup:1.42,radius:7.8,width:.78,color:'#3a2939',accent:'#e7c8e8'});
    next[1]=tag(id,{...rows[1],name:'검은 수액의 안전핵',shape:'donut',anchor:'boss',windup:1.3,radius:5.3,innerRadius:2.1,color:'#5a382f',accent:'#e3d3b1'});
   }else{
    next[0]=tag(id,{...rows[0],name:'검은 뿌리 직선 찌르기',shape:'line',windup:1.8,radius:8.2,width:.66,color:'#3a2939',accent:'#d9aedd'});
    next[1]=tag(id,{...rows[1],name:'기억 수액 낙하',shape:'circle',anchor:'target',windup:1.55,radius:1.55,repeats:2,gap:.56,color:'#5a382f',accent:'#e3d3b1'});
   }
  }else if(id==='kair-great-03'){
   next[0]=tag(id,{...rows[0],name:'유예의 열린 시간방',shape:'safe',windup:1.75,radius:2.4});
   next[1]=tag(id,{...rows[1],name:phase>=2?'겹친 초침 교차':'단일 초침 예고',
    shape:phase>=2?'cross':'line',windup:phase>=2?1.28:1.45});
   next[2]=tag(id,{...rows[2],name:'되감긴 시간로',shape:'donut',windup:1.35});
  }else{
   next[0]=tag(id,{...rows[0],name:'조류의 열린 숨구멍',shape:'safe',windup:1.8,radius:2.35});
   next[1]=tag(id,{...rows[1],name:phase>=2?'공명의 교차 음파':'세이렌 파도 부채',
    shape:phase>=2?'cross':'cone',windup:phase>=2?1.3:1.48});
   next[2]=phase>=2?tag(id,{...rows[2],name:'돌아온 물결의 낙인',
    shape:'circle',anchor:'target',radius:2.3,windup:1.35}):tag(id,rows[2]);
  }
  return next;
 }
 function forMode(s,actor,p){
  if(p?.bossIdentityV31409!==actor?.id||!s)return p;
  const mode=root.__HAPIL_MODES_V31346__?.mode?.(s);
  if(mode==='STORY')return {...p,windup:p.windup+.24,cooldown:p.cooldown+.5};
  if(mode==='HELL')return {...p,windup:Math.max(.95,p.windup-.12),
   cooldown:Math.max(3.8,p.cooldown-.28)};
  // DREAM retains the existing mirror and memory system. Do not label these
  // area attacks reflected unless a real projectile or laser takes that path.
  return p;
 }
 const api=Object.freeze({version:'3.14.09-dev',installed:true,signatures,patterns,forMode});
 root.__HAPIL_BOSS_IDENTITY_V31409__=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
