/* HAPIL 3.14.02 outgoing adapter. Canonical formula extracted from verified 3.14.01.
 * Dynamic native dependency getters preserve late-bound legacy implementations.
 * React refs are read at the time of each attack, not copied at installation.
 */
(function(root){'use strict';
 const required=["MONGSE_objectiveDamageAllowedV31309", "HAPIL_claimCounterWindowV31303", "sr", "ir", "HAPIL_effectiveGrowthV31400", "gr", "MONGSE_infiniteStats", "MONGSE_heroOutgoingModeMultiplier31213", "HAPIL_applyCounterDamageV31303", "MONGSE_triggerEnemyBreak", "HAPIL_awardComboMilestoneV31303", "HAPIL_bindDamageHitV31315", "MONGSE_attachEffectTarget", "MONGSE_beginNarrativeAttack", "MONGSE_enemyPhase", "MONGSE_enemyActivePhase"];
 function create({P,R,Re,Ke,native}){
  if(!P||!R||!Re||typeof Ke!=='function'||!native||required.some(k=>typeof native[k]!=='function'))throw Error('Outgoing reducer dependency missing');
  return function outgoing(e,t,n,r=false,i=0,HAPIL_hitSourceV31315=null){
   const world=P.current,core=root.__HAPIL_COMBAT_CORE_V31401__;
   return core.enemy(world,e,t,HAPIL_hitSourceV31315,()=>{
    const target=world.enemies.find(x=>x.id===e.id)??e;
    const {MONGSE_objectiveDamageAllowedV31309,HAPIL_claimCounterWindowV31303,sr,ir,HAPIL_effectiveGrowthV31400,gr,MONGSE_infiniteStats,MONGSE_heroOutgoingModeMultiplier31213,HAPIL_applyCounterDamageV31303,MONGSE_triggerEnemyBreak,HAPIL_awardComboMilestoneV31303,HAPIL_bindDamageHitV31315,MONGSE_attachEffectTarget,MONGSE_beginNarrativeAttack,MONGSE_enemyPhase,MONGSE_enemyActivePhase}=native;

        if (window.__HAPIL_PARTY_V31322__?.blocksSave()) { core.mark(world, target, 'REJECTED', 'outgoing-authority'); return; }
        let a = P.current,
          o = a.enemies.find((t) => t.id === e.id);
        if (!o) { core.mark(a, target, 'REJECTED', 'target-not-present'); return; }
        if (!MONGSE_objectiveDamageAllowedV31309(a, o)) { const invulnerable=a.time<(o.invulnerableUntil??0);core.mark(a,o,invulnerable?'INVULNERABLE':'REJECTED',invulnerable?'enemy-invulnerable':'objective-or-target-protected'); return; }
        if (a.time < (o.invulnerableUntil ?? 0)) { core.mark(a, o, 'INVULNERABLE', 'enemy-invulnerable'); return; }
        if (!Number.isFinite(o.hp) || !Number.isFinite(o.maxHp)) { core.mark(a, o, 'REJECTED', 'invalid-enemy-health'); return; }
        t *= window.__HAPIL_PARTY_BUFFS_V31322__?.power(a, o, r, HAPIL_hitSourceV31315) ?? 1;
        t *= window.__HAPIL_AI_V31338__?.power(HAPIL_hitSourceV31315?.heroId??HAPIL_hitSourceV31315?.heroId31213??HAPIL_hitSourceV31315?.impactHeroIdV31315??a.activeHeroId) ?? 1;
        if (!Number.isFinite(t)) { core.mark(a, o, 'REJECTED', 'nonfinite-scaled-power'); return; }
        let MONGSE_counterRewardV31303 = HAPIL_claimCounterWindowV31303(a, o),
          s = R.current.damage ?? 0,
          c = 1 + Math.min(20, a.combo) * 0.018,
          l = o.staggerUntil > a.time ? 1.32 : 1,
          u = a.counterUntil > a.time ? 1.7 : 1,
          d = a.damageBuffUntil > a.time ? 1.55 : 1,
          f = sr(ir(HAPIL_effectiveGrowthV31400(R.current,P.current), `awakening`), a.activeHeroId, P.current),
          p = a.awakeningUntil > a.time ? f.damageMultiplier : 1,
          m = gr(a.activeHeroId, a.activeHeroMastery),
          h =
            a.activeHeroId === `slayer`
              ? 1 + (1 - a.hp / Math.max(1, a.maxHp)) * m.level * 0.035
              : 1,
          g = Math.max(
            1,
            Math.round(
              t *
                (1 + s * 0.12) *
                m.powerMultiplier *
                h *
                c *
                l *
                u *
                MONGSE_counterRewardV31303.damageMultiplier *
                d *
                p *
                MONGSE_infiniteStats(R.current).powerMultiplier *
                MONGSE_heroOutgoingModeMultiplier31213(
                  a.activeHeroId,
                  Re.current,
                ),
            ),
          ),
          _ = o.hp / o.maxHp,
          MONGSE_counterDamageV31303 = HAPIL_applyCounterDamageV31303(
            a,
            o,
            g,
            MONGSE_counterRewardV31303,
          ),
          MONGSE_gatedHp = MONGSE_counterDamageV31303.hpAfter,
          v = MONGSE_counterDamageV31303.appliedDamage;
        if (
          ((o.hp = MONGSE_gatedHp),core.computed(a,o,g),core.mark(a,o,v>0?'HIT':'REJECTED',v>0?'native-enemy-damage':'native-phase-gate',{appliedDamage:v}),window.__HAPIL_LOOP_V31365__?.afterHit(a,o,t,v,HAPIL_hitSourceV31315),
          (o.hitStarted = a.time),
          (o.hitUntil = a.time + (r ? 0.28 : 0.17)),
          (o.stagger = Math.min(
            o.maxStagger,
            Math.max(
              0,
              o.stagger +
                (r ? 34 : Math.min(26, 10 + t * 0.16)),
            ),
          )),
          o.stagger >= o.maxStagger &&
            o.staggerUntil <= a.time &&
            MONGSE_triggerEnemyBreak(a, o),
          (a.combo = Math.min(99, a.combo + 1)),
          (a.comboUntil = a.time + 2.35),
          (window.__HAPIL_LOOP_V31365__ ? void 0 : (a.resonance = Math.min(100, a.resonance + (r ? 7 : 4)))),
          HAPIL_awardComboMilestoneV31303(a),
          a.counterUntil > a.time && ((a.counterUntil = 0), (r = !0)),
          i > 0 && v > 0 && a.hp < a.maxHp)
        ) {
          let MONGSE_lifestealScale =
              a.time < Number(a.lifestealSuppressedUntil ?? 0)
                ? Number(a.lifestealMultiplier ?? 1)
                : 1,
            e = Math.min(
              a.maxHp - a.hp,
              window.__HAPIL_HELL_V31322__?.lifestealAmount(a, v, i, MONGSE_lifestealScale) ?? Math.max(1, Math.round(v * i * MONGSE_lifestealScale)),
            );
          a.time >= Number(a.lifestealSuppressedUntil ?? 0) &&
            (a.lifestealMultiplier = 1);
          ((a.hp += e),core.outgoingHeal(a,o,e),
            e >= 2 &&
              a.time - a.lastLifestealTextAt >= 0.16 &&
              ((a.lastLifestealTextAt = a.time),
              a.floatTexts.push({
                id: a.fxSerial++,
                x: a.x,
                y: a.y,
                born: a.time,
                duration: 0.72,
                text: `흡혈 +${Math.round(e)} EGO`,
                color: `#8fffc1`,
                critical: i >= 0.22,
              })));
        }
        if (
          (a.floatTexts.push({
            id: a.fxSerial++,
            x: o.x,
            y: o.y,
            born: a.time,
            duration: r ? 0.82 : 0.64,
            text: r ? `CRIT ${g}` : `${g}`,
            color: r ? `#fff1a8` : n,
            critical: r,
          }),
          a.effects.push(
            HAPIL_bindDamageHitV31315(MONGSE_attachEffectTarget(
              {
                id: a.fxSerial++,
                kind: `hit`,
                x: o.x,
                y: o.y,
                tx: o.x,
                ty: o.y,
                born: a.time,
                duration: r ? 0.58 : 0.42,
                color: n,
                accent: `#ffffff`,
                size: r ? 2.9 : 1.75,
                angle: 0,
                ultimate: r,
              },
              o,
            ), a, o, HAPIL_hitSourceV31315),
          ),
          o.boss && o.kind === `loopBoss`)
        ) {
          let e = Math.max(0, o.hp / o.maxHp);
          if (_ > 0.66 && e <= 0.66 && a.bossPhase < 2) {
            let e = MONGSE_beginNarrativeAttack(a, o, 2);
            ((a.bossPhase = 2),
              (o.currentPhase = 2),
              void 0);
          } else if (_ > 0.33 && e <= 0.33 && a.bossPhase < 3) {
            let e = MONGSE_beginNarrativeAttack(a, o, 3);
            ((a.bossPhase = 3),
              (o.currentPhase = 3),
              void 0);
          }
        } else if (o.midboss && o.narrativeMultiPhase) {
          let e = MONGSE_enemyPhase(o),
            t = MONGSE_enemyActivePhase(o);
          if (e > t) {
            ((o.currentPhase = e),
              (o.readyAt = Math.max(o.readyAt, a.time + 0.9)),
              (o.stagger = 0),
              a.effects.push({
                id: a.fxSerial++,
                kind: `burst`,
                x: o.x,
                y: o.y,
                tx: o.x,
                ty: o.y,
                born: a.time,
                duration: 0.82,
                color: `#8d72d9`,
                accent: `#e8f5ff`,
                size: 3.8,
                angle: 0,
                forceFront: !0,
              }));
            let t = MONGSE_beginNarrativeAttack(a, o, e);
            void 0;
          }
        } else if (o.boss) {
          let e = MONGSE_enemyPhase(o),
            t = MONGSE_enemyActivePhase(o);
          if (e > t) {
            let t;
            ((o.currentPhase = e),
              (a.bossPhase = e),
              (o.readyAt = Math.max(o.readyAt, a.time + 1.05)),
              (o.invulnerableUntil = Math.max(
                o.invulnerableUntil ?? 0,
                a.time + 0.35,
              )),
              (o.stagger = 0),
              a.effects.push({
                id: a.fxSerial++,
                kind: `burst`,
                x: o.x,
                y: o.y,
                tx: o.x,
                ty: o.y,
                born: a.time,
                duration: 0.9,
                color: e >= 3 ? `#8bdcff` : `#ff795e`,
                accent: `#ffffff`,
                size: o.boss ? 4.2 : 3.2,
                angle: 0,
                forceFront: !1,
              }),
              (t = MONGSE_beginNarrativeAttack(a, o, e)),
              void 0);
          }
        }
        o.hp <= 0 && Ke(o);

   },{critical:r,lifesteal:i});
  };
 }
 root.__HAPIL_OUTGOING_V31402__=Object.freeze({version:'3.14.02-RC1',installed:true,create,dependencies:Object.freeze(required)});
})(typeof window!=='undefined'?window:globalThis);
