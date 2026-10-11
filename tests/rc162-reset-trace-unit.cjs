'use strict';
const assert=require('node:assert/strict'),{assertResetDamageTrace:verify}=require('./rc162-native-feedback.cjs');let checks=0;
const fresh=()=>({after:{ledgerSequence:8,enemies:[{id:'mob',hp:691,maxHp:691}]},observation:{resumed:{enemies:[{id:'mob',hp:684.5,maxHp:691}]},ledger:{events:[{epoch:1,sequence:8,targetId:'mob',kind:'OUTGOING',result:'HIT',hpBefore:200,hpAfter:0,hpLoss:200},{epoch:2,sequence:9,targetId:'mob',kind:'OUTGOING',result:'HIT',hpBefore:691,hpAfter:684.5,hpLoss:6.5}]}}});
verify(fresh());checks++;
for(const mutate of [d=>d.observation.ledger.events.push({...d.observation.ledger.events[1]}),d=>d.observation.ledger.events.pop(),d=>d.observation.ledger.events[1].hpBefore=690,d=>d.observation.ledger.events[1].hpLoss=7,d=>d.observation.resumed.enemies[0].hp=678,d=>d.observation.resumed.enemies[0].maxHp=700]){const d=fresh();mutate(d);assert.throws(()=>verify(d));checks++;}
const d=fresh();d.observation.ledger.events.push({epoch:2,sequence:10,targetId:'mob',kind:'OUTGOING',result:'HIT',hpBefore:684.5,hpAfter:678,hpLoss:6.5});d.observation.resumed.enemies[0].hp=678;verify(d);checks++;
console.log('RC162_RESET_TRACE_UNIT',JSON.stringify({status:'passed',checks,scope:'journal sequence boundary and exact calibrated HP accounting, including duplicate/missing damage negatives'}));
