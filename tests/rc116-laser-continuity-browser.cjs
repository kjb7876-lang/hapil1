'use strict';
// Compare real owner artwork against the user-approved renderer. Measure the
// transparent foreground BEFORE compositing a gallery background. Texture
// transparency is not a defect merely because a solid band would cover it.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.env.HAPIL_QA_OUTPUT || path.join(root, 'qa-results', 'laser-continuity');
const baseline = process.env.HAPIL_VISUAL_BASELINE || '19a4c1f92df16559e43ba822ae0f7b8e74a5c47a';
fs.mkdirSync(out, { recursive: true });
const harness = '\nwindow.__RC116__=()=>({L:window.__HAPIL_LASERS_V31330__,blood:window.__HAPIL_BLOOD_RC16__,join:window.__HAPIL_CONNECTED_LASER_V31377__,queue:MONGSE_queueImage});';
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    res.setHeader('Content-Type', ({'.js':'text/javascript','.html':'text/html','.css':'text/css',
      '.webp':'image/webp','.png':'image/png','.wav':'audio/wav','.woff2':'font/woff2'})[path.extname(file)] || 'application/octet-stream');
    res.end(file.endsWith('/assets/index-v31526.js') ? fs.readFileSync(file, 'utf8') + harness : fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
}).listen(0, '127.0.0.1');
async function main() {
  let browser;
  try {
    const approved = execFileSync('git', ['show', `${baseline}:assets/rc77/connected-laser.js`], {cwd:root, encoding:'utf8', maxBuffer:2*1024*1024});
    browser = await chromium.launch({executablePath:process.env.HAPIL_CHROMIUM || '/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
    const page = await browser.newPage({viewport:{width:1180,height:757}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/?qa=1`);
    await page.waitForFunction(() => {const m=window.__RC116__?.();return m?.L?.installed&&m?.blood?.installed&&m?.join?.installed;});
    await page.evaluate(() => { window.__RC116_CURRENT_JOIN__ = window.__HAPIL_CONNECTED_LASER_V31377__; });
    await page.addScriptTag({content:approved+'\nwindow.__RC116_APPROVED_JOIN__=window.__HAPIL_CONNECTED_LASER_V31377__;window.__HAPIL_CONNECTED_LASER_V31377__=window.__RC116_CURRENT_JOIN__;'});
    const result = await page.evaluate(async () => {
      const {L,blood,join,queue} = window.__RC116__();
      const reference = window.__RC116_APPROVED_JOIN__;
      const owner = L.owners.find(item => item.id === 'dist00-boss');
      if (!owner) throw Error('The real reference laser owner is missing');
      const image = queue({}, owner.beam, 'eager');
      await image.decode();
      const columns=6, galleryWidth=1180, cellHeight=140, rowsPerMode=Math.ceil(blood.types.length/columns);
      const make = (width,height) => {const c=document.createElement('canvas');c.width=width;c.height=height;return c;};
      const gallery=make(galleryWidth,cellHeight*rowsPerMode*2), transparent=make(gallery.width,gallery.height);
      const approvedGallery=make(gallery.width,gallery.height),gc=gallery.getContext('2d'),tc=transparent.getContext('2d'),ac=approvedGallery.getContext('2d');
      const rows=[];
      // Negative control: transparent artwork must not acquire a colored body.
      const empty=make(256,128),negative=make(220,100),nc=negative.getContext('2d');
      join.render(nc,[{a:{x:20,y:50},b:{x:100,y:30}},{a:{x:100,y:30},b:{x:200,y:50}}],{width:9.5,complex:true,image:empty,color:'#ff0033',alpha:1});
      const negativeData=nc.getImageData(0,0,220,100).data;
      let negativePixels=0;for(let i=3;i<negativeData.length;i+=4)if(negativeData[i])negativePixels++;
      for(let mode=0;mode<2;mode++)for(const [index,type] of blood.types.entries()) {
        const col=index%columns,gridRow=Math.floor(index/columns)+mode*rowsPerMode;
        const tileX=Math.floor(col*galleryWidth/columns),tileY=gridRow*cellHeight;
        const tileW=Math.ceil((col+1)*galleryWidth/columns)-tileX;
        const cast={id:index+1000,type,sourceId:owner.id,cx:16,cy:16,radius:type==='cataclysm'?14:12,width:.42,angle:.15,fireAt:1,activeSeconds:1.25,born:0,endAt:2.5,color:owner.color,accent:owner.accent,bloodV31516:true};
        const lines=blood.geometry(cast,1.7),points=lines.flatMap(line=>[line.a,line.b]);
        if(!points.length)throw Error('No geometry for '+type);
        const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
        const scale=Math.min(160/Math.max(1,maxX-minX),110/Math.max(1,maxY-minY));
        const project=p=>({x:tileW/2+(p.x-(minX+maxX)/2)*scale,y:cellHeight/2+(p.y-(minY+maxY)/2)*scale});
        const screen=lines.map(l=>({a:project(l.a),b:project(l.b)}));
        const current=make(tileW,cellHeight),before=make(tileW,cellHeight);
        const cc=current.getContext('2d',{willReadFrequently:true}),bc=before.getContext('2d',{willReadFrequently:true});
        const options={width:9.5,complex:true,image,color:owner.color,accent:owner.accent,alpha:1,quiet:true,low:mode===1};
        reference.render(bc,screen,options);join.render(cc,screen,options);
        const pixels=cc.getImageData(0,0,tileW,cellHeight).data,referencePixels=bc.getImageData(0,0,tileW,cellHeight).data;
        const alphaAt=(data,x,y)=>{const px=Math.floor(x),py=Math.floor(y);return px<0||py<0||px>=tileW||py>=cellHeight?0:data[(py*tileW+px)*4+3];};
        let foregroundPixels=0,referenceForegroundPixels=0,changedPixels=0;
        for(let i=0;i<pixels.length;i+=4){
          if(pixels[i+3]>20)foregroundPixels++;if(referencePixels[i+3]>20)referenceForegroundPixels++;
          // Ignore only <=3/255 channel rounding differences, not missing pixels.
          if(Math.max(...[0,1,2,3].map(k=>Math.abs(pixels[i+k]-referencePixels[i+k])))>3)changedPixels++;
        }
        const measure=data=>{
          let samples=0,centerVisible=0,sectionVisible=0,bodyVisible=0;
          for(const line of screen){const dx=line.b.x-line.a.x,dy=line.b.y-line.a.y,len=Math.hypot(dx,dy);if(len<2)continue;
            const nx=-dy/len,ny=dx/len;
            for(let d=0;d<=len;d+=2){const t=d/len;if(t<.025||t>.975)continue;const x=line.a.x+dx*t,y=line.a.y+dy*t;samples++;
              if(alphaAt(data,x,y)>20)centerVisible++;
              let visible=false;for(let offset=-9;offset<=9;offset++)if(alphaAt(data,x+nx*offset,y+ny*offset)>20){visible=true;break;}
              if(visible)sectionVisible++;
              for(const sign of [-1,1])if(alphaAt(data,x+nx*9.5*.7*sign,y+ny*9.5*.7*sign)>20)bodyVisible++;
            }
          }
          return{samples,centerCoverage:samples?centerVisible/samples:0,sectionCoverage:samples?sectionVisible/samples:0,bodyCoverage:samples?bodyVisible/(2*samples):0};
        };
        const measured=measure(pixels),referenceMeasured=measure(referencePixels);
        rows.push({type,mode:mode?'lowFx':'full',segments:lines.length,foregroundPixels,referenceForegroundPixels,changedPixels,changedPixelRatio:changedPixels/(tileW*cellHeight),...measured,reference:referenceMeasured});
        // Background is for presentation only and is never sampled above.
        gc.fillStyle=ac.fillStyle='#09111d';gc.fillRect(tileX,tileY,tileW,cellHeight);ac.fillRect(tileX,tileY,tileW,cellHeight);
        gc.drawImage(current,tileX,tileY);tc.drawImage(current,tileX,tileY);ac.drawImage(before,tileX,tileY);
      }
      return{gallery:gallery.toDataURL(),foreground:transparent.toDataURL(),approvedGallery:approvedGallery.toDataURL(),rows,negativePixels,types:blood.types,ownerId:owner.id,ownerImage:owner.beam,renderer:join.version,measurement:'transparent foreground; approved-reference regression comparison'};
    });
    for(const [key,name] of [['gallery','laser-patterns-after.png'],['foreground','laser-patterns-foreground.png'],['approvedGallery','laser-patterns-approved.png']]){
      fs.writeFileSync(path.join(out,name),Buffer.from(result[key].split(',')[1],'base64'));delete result[key];
    }
    const summary={baseline,types:result.types.length,renderedRows:result.rows.length,negativePixels:result.negativePixels,maxChangedPixelRatio:Math.max(...result.rows.map(r=>r.changedPixelRatio)),minSectionCoverage:Math.min(...result.rows.map(r=>r.sectionCoverage)),minReferenceSectionCoverage:Math.min(...result.rows.map(r=>r.reference.sectionCoverage)),worst:result.rows.slice().sort((a,b)=>b.changedPixelRatio-a.changedPixelRatio).slice(0,4),errors};
    fs.writeFileSync(path.join(out,'laser-patterns-after.json'),JSON.stringify({...result,baseline,summary,errors},null,2));
    console.log('LASER_FOREGROUND_REFERENCE '+JSON.stringify(summary));
    assert.equal(result.rows.length,result.types.length*2);assert(result.types.length>0);assert.deepEqual(errors,[]);
    assert.equal(result.negativePixels,0,'transparent art acquired an unwanted solid overlay');
    assert(result.rows.every(r=>r.foregroundPixels>0&&r.referenceForegroundPixels>0&&r.samples>0),'a laser or its reference was not rendered');
    assert(result.rows.every(r=>r.changedPixelRatio<=.001),'actual owner artwork differs from approved reference; inspect transparent PNGs');
    assert(result.rows.every(r=>r.sectionCoverage+.01>=r.reference.sectionCoverage),'new transverse gaps relative to the approved renderer');
    // Body-density metrics remain diagnostic: demanding 98% opaque samples
    // across the authored texture would reward the unwanted rectangle overlay.
  } finally {await browser?.close();server.close();}
}
main().catch(error=>{console.error(error);server.close();process.exitCode=1;});
