'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const originals=[['assets/episode1a/lucifer_unmasked.webp','027725ce30dcb9e93c73abf57fe0220819a4abe2329e38dc084d071e998a5476'],['assets/episode1a/generated-v393/ep1a_false_archangel_smiling_mask.webp','9509f36960e7091857c040de00ed962d0a029bfd7686273c029884b8b25032d9']];
const replacements=[['assets/rc223/lucifer-transform-contained.webp','534242f9d7145c53b64b47389febde5123b18dd3e2da6239063497594102cb6f'],['assets/rc223/archangel-transform-contained.webp','a642c29e883072f343854d474416503f32c41c0c853ec1f484170932e8a83fd5']];
function measure(file){
 const absolute=path.join(root,file),metadata=JSON.parse(cp.execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','json',absolute],{encoding:'utf8'})),{width,height}=metadata.streams[0];
 const pixels=cp.execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-i',absolute,'-frames:v','1','-f','rawvideo','-pix_fmt','rgba','-'],{maxBuffer:16*1024*1024});
 assert.equal(pixels.length,width*height*4);let left=width,top=height,right=0,bottom=0,solid=0,transparent=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const alpha=pixels[(y*width+x)*4+3];if(alpha===0)transparent++;if(alpha<16)continue;solid++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);}
 assert(solid>0&&transparent>0,'actual decoded art has visible and transparent pixels');return{file,width,height,alphaThreshold:16,bounds:{left,top,right,bottom},margin:{left,top,right:width-right,bottom:height-bottom},solid,transparent};
}
function contained(row){const minimum=Math.ceil(Math.min(row.width,row.height)*.01);for(const [side,margin]of Object.entries(row.margin))assert(margin>=minimum,'visible '+side+' edge needs transparent safety margin: '+row.file);return true;}
const source=fs.readFileSync(path.join(root,'assets/rc210/memory-film.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [file,hash]of [...originals,...replacements])assert.equal(digest(fs.readFileSync(path.join(root,file))),hash,'exact reviewed asset '+file);
assert(source.includes("masked:'./assets/rc223/archangel-transform-contained.webp'"));assert(source.includes("lucifer:'./assets/rc223/lucifer-transform-contained.webp'"));assert(source.includes("angel:'./assets/episode1a/generated-v393/ep1a_false_archangel_smiling_mask.webp'"),'other guardian scene keeps original angel art');assert(html.includes('memory-film.js?v=22301'));
const before=originals.map(([file])=>measure(file)),after=replacements.map(([file])=>measure(file));
for(const row of before)assert.throws(()=>contained(row),/transparent safety margin/,'original clipped art is a real negative comparison');
for(const row of after){assert.equal(row.width,1254);assert.equal(row.height,1254);contained(row);}
console.log('RC223_TRANSFORM_ART_UNIT '+JSON.stringify({status:'passed',method:'actual ffmpeg RGBA decode, alpha>=16 silhouette safety margin, exact original-byte preservation and production scene wiring',originalClipping:before,containedArt:after,naturalCutscenePlayback:false}));
