'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),file='assets/index-v31526.js';let s=fs.readFileSync(file,'utf8');
function replace(a,b){if(s.includes(b))return;assert.equal(s.split(a).length-1,1,'Finale patch site changed: '+a.slice(0,70));s=s.replace(a,b);}
replace('function safe(c,a){return Math.abs(perpendicular(a,c))<=2;}',"function safe(c,a){return (c.kind==='rain'||!beamContact(c,a))&&!(c.drops??[]).some((_,i)=>fallContact(c,a,i));} // RC121: safety comes from actual geometry, never a reserved strip.");
replace("// A fixed open corridor is preserved by both stages. It is never painted as damaging.\n   if(settings.showAttackTelegraphs===true&&c.kind!=='rain'&&now<phaseEnd(c)){const l=L.clip(local(-52,-2,c),local(52,-2,c)),r=L.clip(local(-52,2,c),local(52,2,c));for(const g of[l,r].filter(Boolean))line(ctx,core(g.a),core(g.b),1.5,c.accent,opacity*.42,[5,9]);}","// RC121: removed the obsolete safe-strip borders; actual beam warnings follow geo below.");
fs.writeFileSync(file,s);console.log('RC121 finale warning/contact geometry synchronized');
