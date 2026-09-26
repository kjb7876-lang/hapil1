/* Context-only skill priorities. Actual native cooldown/range/damage code remains authoritative. */
(function(root){'use strict';
 const profiles=Object.freeze({
 hwando:{label:'검흔 연계',range:[9,16],priority:['Q','R','E','W','G','Collab']},
 seoha:{label:'시간장 후 집중 사격',range:[21,28],priority:['W','Q','R','E','G','Collab']},
 neon:{label:'회복과 성광 교대',range:[15,21],priority:['W','Q','E','R','G','Collab']},
 michaela:{label:'구조 우선',range:[18,24],priority:['Q','W','R','E','G','Collab']},
 lauren:{label:'약화 표적 집행',range:[22,29],priority:['W','Q','R','G','E','Collab']},
 hunter:{label:'군집 도탄',range:[19,26],priority:['W','Q','R','E','G','Collab']},
 slayer:{label:'혈흔 추격',range:[9,16],priority:['Q','E','R','W','G','Collab']},
 gunner:{label:'원거리 복제 집중',range:[23,30],priority:['Q','R','E','G','W','Collab']}
 });for(const p of Object.values(profiles)){Object.freeze(p.range);Object.freeze(p.priority);Object.freeze(p);}
 function choose(hero,f){const p=Object.hasOwn(profiles,hero)?profiles[hero]:null,rows=[];if(!p||!f||!Number.isFinite(f.targets)||f.targets<=0||f.locked)return rows;
  for(let i=0;i<p.priority.length;i++){const key=p.priority[i];if(f.ready?.[key]===false||(['seoha','gunner'].includes(hero)&&f.ready?.[key]!==true))continue;let score=60-i*3,reason=p.label;
   if(hero==='michaela'){
    const own=f.healHpRatio??f.hpRatio,near=f.allyHealHpRatio??f.allyHpRatio,global=f.globalAllyHealHpRatio??f.allyHpRatio;
    if(key==='Q'){
     if(own>=.82&&near>=.68)continue;
     score=115;reason=(near<.68&&own>=.82)?'범위 안 동료 회복':'본인 부상 회복';
    }
    if(key==='W'){
     if(f.protected||!f.dense&&f.hpRatio>=.7)continue;
     score=100;reason=f.healingBlocked?'회복 차단 중 보호':'실제 위협 차단';
    }
    if(key==='R'){
     const restoration=own<.6||global<.5;
     if(!restoration&&(!f.dense||f.protected))continue;
     score=own<.30||global<.30?140:108;
     reason=restoration?'중상자 대정화':f.laserRisk>1.5?'레이저 위협 정화':'유효 탄막 정화';
    }
   }
   if(hero==='neon'){
    if(key==='W'){
     // Native host W heals its caster only. Companion W heals its caster and
     // living allies within seven world units; neither is a global sanctuary.
     const own=(f.healHpRatio??f.hpRatio)<.78;
     const ally=!!f.companion&&(f.allyHealHpRatio??1)<.75;
     const guard=f.dense&&!f.protected;
     if(!own&&!ally&&!guard)continue;
     score=own&&f.hpRatio<.4?140:ally?119:guard?105:106;
     reason=own?'성역 · 본인 회복':ally?'성역 · 범위 안 아군 회복':'성역 · 실제 위협 보호';
    }
    if(key==='R'&&!f.vulnerable&&!f.boss&&f.targets<3)continue;
   }
   if(hero==='gunner'){
    if(key==='W'){
     const heal=(f.wCanHealSelf!==false)&&(f.healHpRatio??f.hpRatio)<.70;
     const danger=(f.dense||f.laserRisk>1.5)&&!f.protected;
     if(!heal&&!danger)continue;
     score=heal&&(f.healHpRatio??f.hpRatio)<.35?150:heal?118:110;
     reason=heal?'재정비 · 회복 가능한 자기 HP':'재정비 · 탄막 접촉 보호';
    }
    if(key==='R'){
     if(!f.vulnerable&&(f.aligned??0)<2&&f.targets<3&&!(f.dense&&!f.protected))continue;
     score=f.vulnerable?108:(f.dense&&!f.protected)?112:96;
     reason=f.vulnerable?'지연포 · 확정 표적의 빈틈':f.dense?'지연포 · 유효 위협 차단':'지연포 · 겹친 사격선';
    }
    if(key==='Q'){
     if(f.memoryEchoNext){score=122;reason='기억 탄환 · 실제 3회 적중 복제 연결';}
     else if(f.aligned>=2){score+=22;reason='기억 탄환 · 전방 집중 사격';}
    }
   }
   if(hero==='lauren'){
    if(key==='W'){
     // Host W increases the selected target's stagger and delays readyAt.
     // The AI W is a short guard: it does not mark or stagger enemies.
     if(f.companion){if(!f.dense||f.protected)continue;score=105;reason='거짓 분리 · 탄막 중 짧은 보호';}
     else {if(f.vulnerable||f.targetStaggerRatio===null||f.targetStaggerRatio>=.7)continue;
      score=f.targetCasting?105:96;reason='거짓 분리 · 대상 경직 누적';}
    }
    if(key==='R'){
     const execute=!f.companion&&f.guaranteedLaurenExecute;
     const opening=f.vulnerable||f.boss&&f.targets>=2;
     if(!execute&&!opening)continue;
     score=execute?134:f.vulnerable?108:95;
     reason=execute?'진명 심판 · 비보스 체력 처형 조건':'진명 심판 · 확정 공격 기회';
    }
   }
   if(hero==='hunter'){
    if(key==='W'){
     // Both host and AI W select several real targets; no phantom ricochet.
     if(f.targets<2)continue;
     score=f.targets>=3?109:98;reason='바운스 화살 · 실제 다중 표적';
    }
    if(key==='R'){
     if(f.targets<3&&!f.vulnerable)continue;
     score=f.vulnerable?108:99;reason=f.vulnerable?'진홍 폭풍 · 보스 빈틈':'진홍 폭풍 · 적 군집';
    }
   }
   if(hero==='slayer'){
    if(key==='W'){
     if(f.companion){if(!f.dense||f.protected)continue;score=105;reason='피의 희생 · AI의 짧은 방어';}
     else {if(f.hpRatio<.65||f.dense||f.damageBuffActive)continue;
      score=f.vulnerable?104:96;reason='피의 희생 · 체력 여유와 공격 창';}
    }
    if(key==='R'){
     if(f.dense||!f.vulnerable&&f.targets<3)continue;
     score=f.vulnerable?112:101;reason=f.vulnerable?'피의 난도질 · 보스 빈틈':'피의 난도질 · 적 군집';
    }
    if(key==='E'&&f.dense)continue;
   }
   if(hero==='seoha'){
    if(key==='W'){
     const threatened=f.dense&&!f.protected;
     const interrupt=!f.companion&&f.targetCasting&&f.targetCastRemaining<=1.4;
     if(f.temporalWindow||(!threatened&&!interrupt))continue;
     score=116;reason=f.companion?'주변 탄환 시차 확보':interrupt?'적 시전 지연 · 반격 시간 확보':'밀집 탄막 중 단시간 보호';
    }
    if(key==='R'){
     if(!(f.vulnerable||f.temporalWindow||f.temporal||f.targets>=3||f.dense))continue;
     score=(f.temporalWindow||f.temporal)?112:f.vulnerable?102:f.dense?94:90;
     reason=f.temporalWindow?'실제 지연 구간 · 최초명령 연계':f.temporal?'시간 효과 중 최초명령':f.dense?'밀집 위협 · 최초명령':'표적 빈틈 · 최초명령';
    }
    if(key==='Q'&&(f.temporalWindow||f.temporal)){score=102;reason='실제 시간 효과 후 시간절단';}
   }
   if(hero==='hwando'&&key==='Q'&&f.aligned>=2){score+=38;reason='확정 표적 앞 직선 다중 검기';}
   if(hero==='hwando'&&key==='R'&&f.vulnerable){score+=26;reason='표적 회복 구간 집중';}
   if(hero==='hwando'&&key==='W'){if(!f.dense&&f.targets<3)continue;score+=28;reason='유효 탄막·군집 공간 확보';}
   if(key==='R'&&f.vulnerable&&!['seoha','gunner'].includes(hero)){score+=22;reason='보스 회복 구간';}
   if(key==='E'&&f.dense){score+=16;reason='위험 중 원거리 위상탄';}
   if(key==='Collab'&&!f.boss&&f.targets<3)continue;
   rows.push({key,score,reason});
  }
  return rows.sort((a,b)=>b.score-a.score);
 }
 const api=Object.freeze({version:'3.14.08-RC1',profiles,choose});root.__HAPIL_DOCTRINE_V31400__=api;root.__HAPIL_DOCTRINE_V31407__=api;root.__HAPIL_DOCTRINE_V31408__=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
