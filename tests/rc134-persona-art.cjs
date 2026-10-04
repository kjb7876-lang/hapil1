'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/rc134/persona-skills/manifest.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');let checks=0;
const ok=(v,m)=>{checks++;assert(v,m);},decode=p=>cp.execFileSync('ffmpeg',['-v','error','-i',path.join(root,p),'-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:16e6});
ok(manifest.sources.length===2,'exactly the two latest source PNGs');ok(manifest.outputs.length===9,'nine independent designs');const sources=new Map();
for(const s of manifest.sources){ok(hash(fs.readFileSync(path.join(root,s.path)))===s.sha256,'preserved original '+s.path);sources.set(s.path,{...s,pixels:decode(s.path)});}
const crops={ 'small-orb':[2,63,49,112],eye:[195,429,353,506],diamond:[300,8,353,96],clock:[470,400,568,564],star:[579,138,670,261],eclipse:[1086,403,1293,587],lance:[189,521,369,590],shield:[673,401,839,554],vortex:[934,676,1110,807] };
for(const r of manifest.outputs){
 const s=sources.get(r.source),[x0,y0,x1,y1]=r.sourceRect,[w,h]=r.size;ok(!!s&&s.sha256===r.sourceSha256,'exact source '+r.key);ok(JSON.stringify(r.sourceRect)===JSON.stringify(crops[r.key]),'reviewed label-excluding design bounds '+r.key);ok(x1-x0===w&&y1-y0===h,'no resizing '+r.key);
 const expected=Buffer.alloc(w*h*4);for(let y=0;y<h;y++)s.pixels.copy(expected,y*w*4,((y+y0)*s.size[0]+x0)*4,((y+y0)*s.size[0]+x1)*4);
 for(const [a,b,c,d]of r.alphaOnlyRectMasks){ok(a>=0&&b>=0&&c<=w&&d<=h,'bounded adjacent-row exclusion');for(let y=b;y<d;y++)for(let x=a;x<c;x++)expected[(y*w+x)*4+3]=0;}
 if(r.key==='vortex')ok(JSON.stringify(r.alphaOnlyRectMasks)===JSON.stringify([[0,114,50,131],[162,114,176,131]]),'only inspected adjacent portal roofs are alpha-masked');ok(r.key==='vortex'||r.alphaOnlyRectMasks.length===0,'no unreviewed alpha edits');const pixels=decode(r.path);ok(pixels.equals(expected),'every output RGBA pixel reconstructed '+r.key);ok(hash(pixels)===r.rgbaSha256,'decoded RGBA digest '+r.key);ok(hash(fs.readFileSync(path.join(root,r.path)))===r.sha256,'PNG bytes '+r.key);
}
const media=fs.readFileSync(path.join(root,'assets/rc133/media-art.js'),'utf8'),native=fs.readFileSync(path.join(root,'assets/rc133/native-install.js.txt'),'utf8'),bundle=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8');
ok(media.includes('skillMap:personaSkills')&&media.includes('traitSkills:personaTraitSkills'),'hidden art config uses only new cropped skills');ok(native.includes('.personaAwakening)'),'old generated awakening eclipse retired from hidden drawing');ok(bundle.includes(native),'native snippet exactly synchronized');
console.log('RC134_PERSONA_ART',JSON.stringify({status:'passed',checks,sources:2,outputs:9,scope:'lossless decoded pixels and exact source identity; independently inspected designs, not invented animation frames'}));
