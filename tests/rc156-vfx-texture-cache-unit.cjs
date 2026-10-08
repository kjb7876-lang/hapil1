'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {prepare}=require('../qa/rc156/retained-vfx-textures.js'),{create}=require('../qa/rc156/combat-vfx-pilot.js'),files=require('../qa/rc156/vfx-art-manifest.json').files;
let checks=0;const ok=(v,m)=>{checks++;assert.ok(v,m);},eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);},origin='http://127.0.0.1:156/';
const bundle=fs.readFileSync(path.join(__dirname,'../assets/index-v31526.js'),'utf8'),start=bundle.indexOf('function MONGSE_queueImage(e, t, n ='),end=bundle.indexOf('function MONGSE_makeRenderState31220(',start);
ok(start>=0&&end>start,'actual native queue and prune source');
let tick=0,decodes=0;
class NativeImageFixture{
 constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;this.src='';}
 async decode(){const row=files.find(row=>new URL(row.file,origin).href===this.src);if(!row)throw Error('Unrecognized source');this.complete=true;this.naturalWidth=row.width;this.naturalHeight=row.height;decodes++;}
}
const context={Image:NativeImageFixture,performance:{now:()=>++tick},navigator:{deviceMemory:4},window:{matchMedia:()=>({matches:true})},MONGSE_assetUrl:file=>new URL(file,origin).href};
vm.createContext(context);vm.runInContext(bundle.slice(start,end),context);
const queue=context.MONGSE_queueImage,prune=context.MONGSE_pruneImageCache;
(async()=>{
 const cache={},pool=await prepare({queue,cache,files,origin}),gunner=files.find(row=>row.file.endsWith('/gunner-a.webp')).file,held=pool.image(gunner);
 eq(decodes,4,'each original decoded before trial');eq(pool.snapshot(cache).map(row=>row.nativeCacheRetained),[true,true,true,true],'native cache initially owns all four decoded originals');
 for(let i=0;i<300;i++)queue(cache,'./assets/cache-fixture-'+i+'.webp');
 eq(prune(cache,new Set(),280),24,'real native pressure pruning is unchanged');eq(cache[gunner],undefined,'native prune removes the oldest gunner texture key');eq(pool.image(gunner),held,'private trial retains the actual decoded image');eq(pool.snapshot(cache).map(row=>row.nativeCacheRetained),[false,false,false,false],'retained originals survive deletion without reinserting native cache keys');
 const cold=queue(cache,gunner);ok(cold!==held&&!cold.complete&&cold.naturalWidth===0,'native requeue after pruning returns a cold image: exact missing-flight reproduction');
 const s={zone:'cult04',activeHeroId:'gunner'},r={strikeId:7,x:1,y:1,tx:2,ty:2,born:100,at:100.5},effect={deliveryHeroV31322:'gunner',deliveryKeyV31322:'A',deliveryRoutesV31322:[r]},project=(x,y)=>({x,y});
 const adapter={enabled:true,project,plans:()=>[{route:r,end:{x:20,y:20}}],anchor:()=>({x:10,y:10})};
 let nativeCalls=0,paints=0;const ctx={globalAlpha:1,save(){},restore(){},translate(){},rotate(){},drawImage(im){assert.strictEqual(im,held);paints++;}};
 const old=create({...adapter,image:file=>queue(cache,file)});old.drawEffect(()=>nativeCalls++,ctx,cache,effect,100.3,{reducedMotion:true},s);eq(old.snapshot(s).totals.missingAssets,1,'previous dynamic adapter genuinely misses the cold flight texture');
 const fixed=create({...adapter,image:pool.image}),before=JSON.stringify(s),nativeCacheImage=cache[gunner];fixed.drawEffect(()=>nativeCalls++,ctx,cache,effect,100.3,{reducedMotion:true},s);
 eq(fixed.snapshot(s).totals.missingAssets,0,'retained adapter paints the original despite native eviction');eq(paints,1,'original gunner texture painted exactly once');eq(nativeCalls,2,'both native dispatches execute once');eq(cache[gunner],nativeCacheImage,'private paint does not reinsert or replace the native cold entry');eq(JSON.stringify(s),before,'retained paint preserves combat state');eq(pool.image('./assets/foreign-boss.webp'),null,'unknown source cannot quietly substitute an owner');
 const reject=async(options,pattern,label)=>{checks++;await assert.rejects(prepare(options),pattern,label);};
 const original=file=>({src:new URL(file,origin).href,complete:true,naturalWidth:files.find(row=>row.file===file).width,naturalHeight:files.find(row=>row.file===file).height});
 await reject({queue:()=>null,cache:{},files,origin},/did not return/,'missing source fails closed');
 await reject({queue:(_,file)=>({...original(file),src:origin+'assets/foreign.webp'}),cache:{},files,origin},/replaced/,'native alias cannot silently replace declared trial source');
 await reject({queue:(_,file)=>({...original(file),src:new URL(file,'http://127.0.0.1:157/').href}),cache:{},files,origin},/replaced/,'different origin is refused');
 await reject({queue:(_,file)=>({...original(file),complete:false}),cache:{},files,origin},/not ready/,'incomplete texture refused');
 await reject({queue:(_,file)=>({...original(file),naturalWidth:1}),cache:{},files,origin},/not ready/,'wrong original dimensions refused');
 await reject({queue:(_,file)=>original(file),cache:{},files:[files[0],files[0],files[2],files[3]],origin},/Invalid/,'duplicate original refused');
 await reject({queue:(_,file)=>original(file),cache:{},files,origin:'invalid'},/Invalid/,'invalid origin refused');
 const browser=fs.readFileSync(path.join(__dirname,'rc156-vfx-pilot-browser.cjs'),'utf8');ok(browser.includes('image:textures.image'),'actual browser adapter uses held originals');ok(!browser.includes("image:(file,c)=>Q.queue"),'no owner-scoped queue during private paint');ok(browser.includes("totals.missingAssets===0"),'actual browser missing-asset assertion remains mandatory');ok(browser.includes('RC156_TEXTURE_CACHE'),'actual cache eviction/readiness diagnostics retained');
 console.log('RC156_VFX_TEXTURE_CACHE_UNIT',JSON.stringify({status:'passed',checks,actualNativePrune:true,reproducedColdTexture:true,originalReferences:4,browserVerified:false}));
})().catch(error=>{console.error(error);process.exitCode=1;});
