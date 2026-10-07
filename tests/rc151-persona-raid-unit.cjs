'use strict';
// Regression checks for authored Persona projectiles and the real red heel
// projectile contract. These test the runtime selectors, not browser paint.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');let checks=0;
function ok(value,message){checks++;assert(value,message);}

const projectileSource=fs.readFileSync(path.join(root,'assets/combat-v31402/projectile-pipeline.js'),'utf8'),window={};window.window=window;const sandbox={window,globalThis:window};vm.runInNewContext(projectileSource,sandbox,{filename:'projectile-pipeline.js'});
const queue=(cache,asset)=>asset.startsWith('./missing-')?null:cache[asset]??(cache[asset]={src:asset,currentSrc:asset,complete:true,naturalWidth:128,naturalHeight:96}),pipeline=window.__HAPIL_PROJECTILE_PIPELINE_V31402__.create({queue,bindBitmap(){},angle(){return 0},project(x,y){return{x,y}}}),cache={};
function draw(p){let drawn='';const ctx={globalAlpha:1,save(){},restore(){},translate(){},rotate(){},drawImage(image){drawn=image.currentSrc??image.src}};assert.equal(pipeline.drawImageOnly(ctx,cache,p,1,{projectileLodSmartR1:2}),true,'projectile is drawn');return drawn;}
const jelly='./assets/rc64/projectiles/danmaku-jellybean.webp';
for(const skill of ['small-orb','eye','diamond','clock','star','eclipse','lance','shield','vortex'])for(const red of [false,true]){
 const sprite=red?'./assets/rc133/art/'+skill+'.png':'./assets/rc134/persona-skills/'+skill+'.png?v=43402',p={x:4,y:7,born:0,danmakuV31316:true,bodySpawned31219:true,danmakuArtV31316:jelly,rc126CommonSprite:jelly,rc133InnerShot:true,rc133Skill:skill,rc150RedPersonaShot:red,visualScaleV31224:red?1.2:1,sprite,fallbackSprite:sprite};
 const actual=draw(p);ok(actual===sprite,'Persona '+(red?'red':'normal')+' '+skill+' draws its dedicated image');ok(p.bitmapPathV31355===sprite&&!p.bitmapFallbackV31355,'Persona '+skill+' does not select common jellybean art');
}
const ordinary={x:1,y:2,born:0,danmakuV31316:true,bodySpawned31219:true,danmakuArtV31316:jelly,rc126CommonSprite:jelly,sprite:'./assets/vfx/native/orb.webp'};
ok(draw(ordinary)===jelly,'non-Persona native danmaku retains its existing common-art priority');
const noPersonaArt={x:1,y:2,born:0,danmakuV31316:true,bodySpawned31219:true,danmakuArtV31316:jelly,rc126CommonSprite:jelly,rc133InnerShot:true,sprite:'./missing-persona-skill.png'};
ok(draw(noPersonaArt)==='./assets/vfx/v31323/salvage/frost/envy_mirror_shard.webp','missing Persona art fails closed to the existing frost fallback, never jellybean');

const raidWindow={setInterval(){return 1},__HAPIL_MODES_V31346__:{mode:s=>s.gameModeV31346}};raidWindow.window=raidWindow;const raidSandbox={window:raidWindow,globalThis:raidWindow,setInterval(){return 1}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/rc25/raid.js'),'utf8'),raidSandbox,{filename:'raid.js'});
const kinds=['hostileProjectiles','pendingHits','impactQueue','telekineticCasts','spatialRiftCasts','narrativeCasts'],items=kinds.map((_,index)=>({id:index+1,sourceId:index%2?'mb-ep1b05':'b05-boss',born:0,x:index,y:index,damage:1,radius:.4}));
const state={time:1,hp:240,maxHp:240,x:0,y:0,zone:'ep1b05',gameModeV31346:'STORY',enemies:[{id:'b05-boss',boss:true,hp:100,maxHp:100}],hostileProjectiles:[items[0]],pendingHits:[items[1]],impactQueue:[items[2]],telekineticCasts:[items[3]],spatialRiftCasts:[items[4]],narrativeCasts:[items[5]]};
raidWindow.__HAPIL_RAID_RC24__.tick(state,0);const heel='./assets/rc24/lust-heel.png';
const justEmitted={sourceId:'b05-boss',sprite:'./assets/vfx/bosses/v3102/ep1b05_lust_heel_lipstick_cluster.webp',born:1};raidWindow.__HAPIL_RAID_RC24__.markProjectile(state,justEmitted);ok(justEmitted.sprite===heel&&justEmitted.lustKindRC24==='heel','new native b05 shot receives the isolated shoe image at construction time');
const integratedCore=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8');ok(integratedCore.includes('MONGSE_markBossProjectile31213=function(s,shot,...args)')&&integratedCore.includes('window.__HAPIL_RAID_RC24__?.markProjectile?.(s,shot)'),'native boss-visual repair and constructor call the immediate raid image selector');ok(integratedCore.includes("const isolatedHeel='./assets/rc24/lust-heel.png';for(const id of ['b05-boss','mb-ep1b05'])"),'owned-ordnance rendering contract admits the isolated heel asset for both native owners');ok(integratedCore.includes("next=isolatedHeel&&wanted!=='telegraph'?isolatedHeel:row.assets.includes(p)?p:clean(route[wanted]??route.projectile)"),'render-time owner repair cannot restore the lipstick-cluster sprite over the isolated heel');
for(const [index,h]of items.entries()){
 ok(h.sprite===heel&&h.image===heel&&h.projectileSprite===heel&&h.impactSprite===heel,'High Heel asset forced for hostile queue '+kinds[index]);
 ok(h.lustKindRC24==='heel'&&h.color==='#fa315d'&&h.radius>=2.05,'High Heel metadata/radius retained '+kinds[index]);
}
const heelBytes=fs.readFileSync(path.join(root,'assets/rc24/lust-heel.png'));
ok(heelBytes.subarray(1,4).toString()==='PNG','dedicated heel file is a PNG');
ok(crypto.createHash('sha256').update(heelBytes).digest('hex')==='756be6a2f7a812a3f02477540935bfbe823ac80230a248c5fdcb250b76417167','inspected dedicated heel asset bytes remain unchanged');
console.log('RC151_PERSONA_RAID_UNIT',JSON.stringify({status:'passed',checks,personaVariants:18,redVariants:9,raidQueues:kinds.length,heelSha256:hash(heelBytes)}));
