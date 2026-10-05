'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),heroes=['hwando','seoha','neon','michaela','lauren','hunter','slayer','gunner'],ctx={window:null};ctx.window=ctx;
ctx.__HAPIL_SAMONG_RC91__={active:s=>s.on,art:Object.fromEntries(heroes.map(h=>[h,'./assets/rc91/awakening/'+h+'.png'])),picture:h=>({complete:true,naturalWidth:400,naturalHeight:600,src:h})};ctx.__HAPIL_INNER_FINAL_RC133__={encounter:s=>s.inner};ctx.__HAPIL_MEDIA_ART_RC133__={paths:{awakening:'./assets/rc133/art/awake-0.png'},picture:()=>({complete:true,naturalWidth:224,naturalHeight:400})};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/rc137/awakening-portraits.js'),'utf8'),ctx);const A=ctx.__HAPIL_AWAKENING_PORTRAITS_RC137__,paint={save(){},restore(){},drawImage(){},fillRect(){},fillText(){}};let checks=0;
for(const [w,h]of[[1280,900],[390,844],[844,390]])for(const hero of heroes)for(const pair of[[true,false],[false,true],[true,true]]){
 const s={on:pair[0],inner:pair[1],samongPassiveRC91:{heroId:hero,active:6},innerFinalRC133:{awake:6}};assert(A.draw(paint,s,w,h,w<600||h<320));const rows=A.snapshot(s);checks++;assert.equal(rows.length,Number(pair[0])+Number(pair[1]));assert(rows.every(r=>r.decoded&&r.card.x>=0&&r.card.y>=0&&r.card.x+r.card.width<=w&&r.card.y+r.card.height<=h));if(rows.length===2)assert(rows[1].card.x+rows[1].card.width<rows[0].card.x);if(pair[0])assert.equal(rows[0].path,'./assets/rc91/awakening/'+hero+'.png');assert.equal(A.cooldownFactor(s),pair[0]?.5:1);
 // A nearly completed awakening still paints its own raster, not an entry flash.
 s.samongPassiveRC91.active=.25;A.draw(paint,s,w,h,true);assert(A.snapshot(s).every(r=>r.decoded));checks++;
}
assert.equal(A.cooldownFactor({on:false,inner:true}),1);assert.equal(A.draw(paint,{on:false,inner:false},390,844,true),false);
console.log('RC137_AWAKENING_PORTRAITS_UNIT',JSON.stringify({status:'passed',checks,heroes:8,profiles:3,separateCards:true,attackCooldownFactor:.5,stackedReduction:false}));
