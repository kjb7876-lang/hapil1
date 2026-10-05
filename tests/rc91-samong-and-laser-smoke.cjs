// Behavioral policy tests; real native reducer/render/load order live in the browser test.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),storage=new Map();
const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};
const window={dispatchEvent(){}};
const c={window,localStorage,setTimeout(){},Event:class{},Number,Math,Object,Array,Map,Set,JSON};
vm.createContext(c);vm.runInContext(read('assets/rc128/awakening-policy.js'),c);vm.runInContext(read('assets/rc91/samong-awakening.js'),c);const api=window.__HAPIL_SAMONG_RC91__;
const fresh=mode=>({gameModeV31346:mode,activeHeroId:'slayer',hp:240,maxHp:240,time:10,enemies:[]});
assert(!api.unlocked());assert.equal(api.select('DREAM'),'STORY');assert.equal(api.select('HELL'),'STORY');
assert(!api.unlock(null,'old-dream-preference'));assert.equal(api.select('DREAM'),'STORY');
storage.set('hapilEndingCleared','true');assert.equal(api.select('DREAM'),'DREAM');storage.clear();
assert(api.unlock(null,'777'));assert.equal(api.select('DREAM'),'DREAM');assert.equal(api.select('HELL'),'STORY');
let s=fresh('STORY');s.hp=0;assert(!api.chooseRevival(s,'samong'));
s=fresh('DREAM');s.hp=0;assert(api.chooseRevival(s,'samong'));assert.equal(s.hp,120);assert.equal(api.snapshot(s).active,7);assert.equal(api.snapshot(s).cooldown,77);assert.equal(api.incomingBuff(s),.12);
for(let i=0;i<10;i++)api.advance(s,.1,true);assert.equal(api.snapshot(s).active,7,'paused time is never consumed');
for(let i=0;i<35;i++)api.advance(s,.1,false);assert(Math.abs(api.snapshot(s).active-3.5)<1e-7);assert.equal(s.time,10,'the awakening clock does not depend on world time');
const saved=JSON.parse(JSON.stringify(api.snapshot(s))),loaded=fresh('DREAM');api.restore(loaded,saved);
assert(Math.abs(api.snapshot(loaded).active-3.5)<1e-7);assert(Math.abs(api.snapshot(loaded).cooldown-73.5)<1e-7);
for(let i=0;i<35;i++)api.advance(loaded,.1,false);assert(!api.active(loaded));assert(Math.abs(api.snapshot(loaded).cooldown-70)<1e-7);
loaded.hp=0;assert(!api.chooseRevival(loaded,'samong'),'a second lethal hit during cooldown is not another revival');loaded.hp=240;
const delayed=fresh('DREAM');delayed.hp=0;api.chooseRevival(delayed,'samong');api.advance(delayed,3.5,false);assert.equal(api.snapshot(delayed).active,3.5,'slow frames consume real combat time');api.advance(delayed,3.5,false);assert.equal(api.snapshot(delayed).active,0);assert.equal(api.snapshot(delayed).cooldown,70);
for(let i=0;i<700;i++)api.advance(loaded,.1,false);loaded.hp=0;assert(!api.chooseRevival(loaded,'samong'),'RC128: cooldown expiry alone does not refill the encounter revival');loaded.hp=240;loaded.zone='rc128-next-encounter';api.advance(loaded,.01,false);loaded.hp=0;assert(api.chooseRevival(loaded,'samong'));assert.equal(api.snapshot(loaded).activations,2);
// Exactly 2x the same Story baseline; repeated ticks/load/mode selection never stack.
const mob={id:'mob',hp:70,maxHp:100,damage:10,speed:2,attackSpeed:1,defense:3};
const boss={id:'boss',boss:true,hp:700,maxHp:1000,damage:20,speed:3,attackSpeed:1};
const friend={id:'friend',friendly:true,hp:100,maxHp:100,damage:8};
const story=fresh('STORY');story.enemies=[{...mob},{...boss},{...friend}];api.scaleEnemies(story);
const dream=fresh('DREAM');dream.enemies=[{...mob},{...boss},{...friend}];api.scaleEnemies(dream);
for(let i=0;i<100;i++)api.scaleEnemies(dream);
for(let i=0;i<2;i++)for(const k of ['hp','maxHp','damage','speed','attackSpeed'])assert.equal(dream.enemies[i][k],story.enemies[i][k]*2,k);
assert.equal(dream.enemies[2].maxHp,100);const hp=dream.enemies[0].hp-=17;const ds=api.snapshot(dream),dl=fresh('DREAM');dl.enemies=[{...mob},{...boss}];api.restore(dl,ds);api.scaleEnemies(dl);assert.equal(dl.enemies[0].hp,hp);assert.equal(dl.enemies[0].maxHp,200);
dl.gameModeV31346='STORY';api.scaleEnemies(dl);assert.equal(dl.enemies[0].maxHp,100);assert.equal(dl.enemies[0].hp,hp/2);
assert.equal(api.sanitize({version:1,active:999,cooldown:-1,enemies:[]}).active,7);
// The approved duration track permits 8/9 seconds only with its saved bounded rank.
vm.runInContext(read('assets/rc133/samong-policy.js'),c);
for(const [rank,expected]of [[0,7],[1,8],[2,9],[999,9],[-1,7],['2',7],[NaN,7]]){
 const clean=api.sanitize({version:1,duration:999,active:999,cooldown:-1,grace:999,upgradesRC133:{samongDuration:rank},enemies:[]});
 assert.equal(clean.duration,expected);assert.equal(clean.active,expected);assert.equal(clean.cooldown,expected);assert.equal(clean.grace,1);
}
assert.equal(api.sanitize({version:1,active:999,duration:9,enemies:[]}).active,7,'duration alone cannot grant upgrade time');
assert.equal(api.sanitize({version:1,active:-1,duration:9,upgradesRC133:{samongDuration:2},enemies:[]}).active,0);
const upgraded=fresh('DREAM');upgraded.samongUpgradesRC133={samongDuration:2};upgraded.hp=0;
assert(api.chooseRevival(upgraded,'samong'));assert.equal(api.snapshot(upgraded).active,9);assert.equal(api.snapshot(upgraded).cooldown,77);
const upgradedSave=JSON.parse(JSON.stringify(api.snapshot(upgraded))),upgradedLoad=fresh('DREAM');api.restore(upgradedLoad,upgradedSave);
assert.equal(api.snapshot(upgradedLoad).active,9,'valid upgraded active time survives save/restore');

// Revival precedes the party reducer's knockdown normalization.
vm.runInContext(read('assets/combat-v31402/combat-core.js'),c);const core=window.__HAPIL_COMBAT_CORE_V31401__;
let down=false;core.bind({reducePlayer(world,damage){world.hp-=damage;return true;},route(world,reduce,args){const ok=reduce(world,...args);if(world.hp<=0)down=true;return ok;}});
s=fresh('DREAM');s.hp=1;assert(core.player(s,30,0,0,{}));assert.equal(s.hp,-29);assert(down);assert(api.deathPending(s));assert(api.chooseRevival(s,'samong'));assert.equal(s.hp,120);assert(api.active(s));
// Adjacent segments share one authored texture strip; no repeated muzzle caps.
vm.runInContext(read('assets/rc77/connected-laser.js'),c);const laser=window.__HAPIL_CONNECTED_LASER_V31377__,records=[];
const ctx={depth:0,circles:0,circleClips:0,circleImages:0,save(){this.depth++;},restore(){this.depth--;},translate(){},rotate(){},transform(){},arc(x,y,r,start,end){assert.equal(x,0);assert.equal(y,0);assert.equal(r,16);assert.equal(start,0);assert.equal(end,Math.PI*2);this.circlePath=true;this.circles++;},clip(){if(this.circlePath)this.circleClips++;},closePath(){},setLineDash(){},beginPath(){this.circlePath=false;this.moves=0;this.lines=0;},moveTo(){this.moves++;},lineTo(){this.lines++;},stroke(){records.push({color:this.strokeStyle,width:this.lineWidth,moves:this.moves,lines:this.lines,join:this.lineJoin});},drawImage(image){assert.equal(image.width,200);if(this.circlePath)this.circleImages++;this.images=(this.images||0)+1;}};
const curve=Array.from({length:24},(_,i)=>({a:{x:i*8,y:Math.sin(i*.22)*40},b:{x:(i+1)*8,y:Math.sin((i+1)*.22)*40}}));
laser.render(ctx,curve,{width:16,color:'#ab82ed',accent:'#eedcff',image:{complete:true,width:200,height:48}});
assert.equal(ctx.circles,25,'every endpoint/turn receives one radius-16 disk');assert.equal(ctx.circleClips,25);assert.equal(ctx.circleImages,25,'each disk draws the owner texture');assert.equal(ctx.depth,0,'clip/transform scope restored');
assert(ctx.images>48,'software round joins retain the authored bitmap at each curve turn');const curvedImages=ctx.images;assert.equal(records.length,0,'decoded curved beams use owner artwork');assert.equal(laser.paths(curve).length,1);assert.equal(laser.mesh(laser.paths(curve)[0],16).length,25);
laser.render(ctx,[curve[0]],{width:8,image:{complete:true,width:200,height:48}});assert.equal(ctx.images,curvedImages+1);
// All eight generated images are real, distinct, transparent RGBA assets.
const manifest=JSON.parse(read('assets/rc91/awakening/manifest.json'));assert.equal(manifest.heroes.length,8);const hashes=new Set();
for(const row of manifest.heroes){const bytes=fs.readFileSync(path.join(root,row.path.replace(/^\.\//,'')));assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(bytes[25],6);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),row.sha256);assert(row.transparent);hashes.add(row.sha256);assert.equal(api.art[row.hero],row.path);}
assert.equal(hashes.size,8);const html=read('index.html');assert(html.indexOf('rc91/samong-awakening.js')<html.indexOf('index-v31526.js'));assert(Number(html.match(/samong-awakening\.js\?v=(\d+)/)?.[1])>=39301);
console.log('RC91 PASS: gated two modes, one lethal revival per encounter plus 77 combat-second cooldown, seven-second buff, pause/load preservation, exact 2x stats, cooperative ordering, continuous curves, eight distinct RGBA assets.');
