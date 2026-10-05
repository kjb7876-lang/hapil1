'use strict';
// Read-only lossless image validation. No raster file is edited by this check.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),M=JSON.parse(fs.readFileSync(path.join(root,'qa/rc137/art-manifest.json'))),hash=b=>crypto.createHash('sha256').update(b).digest('hex');let checks=0;
const ok=(v,m)=>{checks++;assert(v,m);},decode=(p,size)=>{const b=cp.execFileSync('ffmpeg',['-v','error','-i',path.join(root,p.replace(/^\.\//,'')),'-f','rawvideo','-pix_fmt','rgba','pipe:1'],{maxBuffer:16e6});ok(b.length===size[0]*size[1]*4,'source RGBA dimensions '+p);return b;};
ok(Object.keys(M.owners).length===71,'71 native ranked identities');ok(M.cells.length===26,'26 new distinct motifs');
const pixels=decode(M.source.path,M.source.size);ok(hash(fs.readFileSync(path.join(root,M.source.path)))===M.source.sha256,'ImageGen atlas preserved byte-for-byte');
const hashes=new Set(),owners=new Set();for(const c of M.cells){
 const [x,y,w,h]=c.rect,[sw,sh]=M.source.size;ok([x,y,w,h].every(Number.isSafeInteger)&&x>=0&&y>=0&&w>0&&h>0&&x+w<=sw&&y+h<=sh,'bounded half-open source rectangle '+c.owner);
 const crop=Buffer.alloc(w*h*4);for(let row=0;row<h;row++)pixels.copy(crop,row*w*4,((row+y)*sw+x)*4,((row+y)*sw+x+w)*4);
 ok(hash(crop)===c.pixelSha256,'all decoded source pixels '+c.owner);ok(!hashes.has(c.pixelSha256),'unique motif '+c.owner);hashes.add(c.pixelSha256);ok(!owners.has(c.owner),'one cell per owner');owners.add(c.owner);
 let l=w,t=h,r=0,b=0;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(crop[(yy*w+xx)*4+3]>16){l=Math.min(l,xx);r=Math.max(r,xx+1);t=Math.min(t,yy);b=Math.max(b,yy+1);}
 ok(JSON.stringify([l,t,r,b])===JSON.stringify(c.alphaCore),'inspected alpha core '+c.owner);ok(l>0&&t>0&&r<w&&b<h,'no alpha core clipped by cell edge '+c.owner);
 ok(JSON.stringify(M.owners[c.owner].frame)===JSON.stringify(c.rect),'native frame uses exact inspected rectangle');
}
const designs=Object.values(M.owners).map(o=>o.frame?'cell:'+o.frame.join(','):'original:'+o.original);ok(new Set(designs).size===71,'different owners have different original designs or exact atlas cells');
for(const source of [M.winter,M.independentBodiesSource]){ok(hash(fs.readFileSync(path.join(root,source.path.replace(/^\.\//,''))))===source.sha256,'unchanged ImageGen humanoid '+source.path);decode(source.path,source.size);}
for(const [id,b]of Object.entries({...M.independentBodies,'mb-ep1b06b':M.winter})){const [l,t,r,bottom]=b.bbox;ok(r>l&&bottom>t&&b.coreHeight===bottom-t,'humanoid core height '+id);ok(b.pivot[0]===(l+r)/2&&b.pivot[1]===bottom,'consistent foot pivot '+id);ok(b.motion.startsWith('static idle only'),'static replacements do not claim motion-set completion');}
const native=fs.readFileSync(path.join(root,'assets/rc133/native-install.js.txt'),'utf8'),bundle=fs.readFileSync(path.join(root,'assets/index-v31526.js'),'utf8');ok(bundle.includes(native),'canonical native integration synchronized');
console.log('RC137_ART_UNIT',JSON.stringify({status:'passed',checks,owners:71,newMotifs:26,staticHumanoids:3,sourceEditing:false}));
