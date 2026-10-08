'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),Art=require('../assets/rc155/ego-art.js'),E=require('../assets/rc155/ego-guardian.js');let checks=0;
const ok=(v,m)=>{checks++;assert.ok(v,m);},eq=(a,b,m)=>{checks++;assert.deepEqual(a,b,m);};
const expected=[['analysis_output_2_walk_dodge.png',1368283,'c29ca613f90f9d0beb43868db0e1f4074d9d2f87492502179eaa639e20bf33ab',[1774,404]],['analysis_output_1_attack.png',1537843,'93d4f9256d1e36b38ad1f44e3f0e0bfc418904c4011bd6b78f5fcf96ab16394b',[1774,456]],['916b1ac1-15ea-49dc-b3b0-f91ea1b8ef81.png',3357732,'526c4ec202505562204f0fd4614cf4f4c8494bfe4acf2ecd52f30a3e51f31724',[1536,1024]],['ego_samong_awaken_cutin.png',3414508,'f2b62df647f229d81578ac3ad945517d4797a5b5df1fa4497510a1f19c7c6c8e',[1024,1536]]];
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/ego-originals-20261008/ASSET_MANIFEST.json')));
for(const [name,size,sha,dimensions]of expected){const b=fs.readFileSync(path.join(root,'assets/ego-originals-20261008',name)),row=manifest.files.find(r=>r.filename===name);eq(b.length,size,name+' exact original size');eq(crypto.createHash('sha256').update(b).digest('hex'),sha,name+' exact original SHA');eq([row.bytes,row.sha256],[size,sha],'source manifest pins '+name);eq([b.readUInt32BE(16),b.readUInt32BE(20)],dimensions,'PNG dimensions '+name);eq(b[25],6,'RGBA source '+name);}
eq(Art.assets().length,4,'four originals own all EGO artwork');
let pixels=0;
for(const kind of ['walk','attack'])for(let i=0;i<8;i++){const f=Art.frame(kind,i),[x,y,w,h]=f.rect;ok(x>=0&&x+w<=1774&&y+h<=(kind==='walk'?404:456),'half-open crop stays in source');ok(f.pivot[0]>0&&f.pivot[0]<w&&f.pivot[1]<h&&f.pivot[1]>0,'feet stay within full body/weapon crop');ok(f.coreHeight>0&&f.coreHeight<h,'body scale preserves aspect ratio');pixels+=w*h;}
for(const [name,[x,y,w,h]]of Object.entries(Art.crops)){ok(x>=0&&y>=0&&x+w<=1536&&y+h<=1024,'skill crop in source '+name);pixels+=w*h;}
ok(pixels*4<8*1024*1024,'all bounded derived frames use less than 8 MiB pixel backing');eq(Art.frame('walk',8),null,'invalid sector cannot alias a frame');eq(Art.frame('other',0),null,'invalid atlas fails closed');
const directions=[[1,-1,3],[1,1,0],[-1,1,2],[-1,-1,1],[0,-1,5],[1,0,7],[0,1,6],[-1,0,4]];
for(const [dx,dy,index]of directions)eq(Art.sector({dx,dy}),index,'native world-to-screen sector '+dx+','+dy);
const active={egoGuardianRC155:{active:true},direction:'front'};eq(Art.selected(active,{kind:'dash'}).kind,'walk','dodge uses authored walk/dodge sheet');eq(Art.selected(active,{kind:'attack'}).kind,'attack','attack uses authored attack sheet');eq(Art.selected({},{}),null,'normal heroes keep their original art');
// A dark enclosed character feature is preserved while exterior neutral matte is removed.
const rgba=new Uint8ClampedArray(7*7*4);for(let i=0;i<49;i++){rgba[i*4]=30;rgba[i*4+1]=25;rgba[i*4+2]=25;rgba[i*4+3]=255;}
for(let y=1;y<=5;y++)for(let x=1;x<=5;x++){if(x===1||x===5||y===1||y===5){const i=(y*7+x)*4;rgba[i]=180;rgba[i+1]=40;rgba[i+2]=40;}}
eq(Art.clearMatte({data:rgba},7,7),24,'flood removes only edge-connected matte');eq(rgba[(3*7+3)*4+3],255,'enclosed black cloth stays opaque');eq(rgba[3],0,'outer background becomes transparent');eq(rgba[(1*7+1)*4+3],255,'red outline stays opaque');
const native=fs.readFileSync(path.join(root,'assets/rc133/native-install.js.txt'),'utf8'),bundle=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const hook of ['Art()?.present(canvas,s)','Art()?.drawBody(ctx,path,x,y,size,o,G)','Art().withSkill(S(),e,()=>egoFx.call(this,ctx,cache,e,time,settings))','Art()?.assets()'])ok(native.includes(hook),'native transaction/presentation hook '+hook);
ok(bundle.includes('window.__HAPIL_EGO_ART_RC155__?.sprite(t,te) ?? Tn(ee, te, t.time)'),'only the main player sprite uses transformed art');ok(html.includes('assets/rc155/ego-art.js?v=15510'),'normal runtime loads EGO art');
const s={zone:'cult04'};E.recordPersonaVictory(s);eq(E.state(s).cutInPending,false,'victory frame does not start cut-in');eq(E.consumeCutIn(s),false,'untransformed victory cannot consume cut-in');
console.log('RC155_EGO_ART_UNIT',JSON.stringify({status:'passed',checks,originals:expected.length,derivedPixelBytes:pixels*4,naturalPersonaVictoryVerified:false}));
