'use strict';
// Fork the existing comprehensive native test, preserving its checks except
// the escape-lane contract explicitly reversed by the user's RC121 request.
const fs=require('node:fs'),assert=require('node:assert/strict');let s=fs.readFileSync('tests/rc108-laser-topology-browser.cjs','utf8');
function one(a,b){assert.equal(s.split(a).length-1,1,a.slice(0,80));s=s.replace(a,b);}
one('// escape lanes, warning/fire/expiry/cancel, and portrait dual-view frame stability.','// RC121: one connected graph WITHOUT escape strips; warning/fire/expiry/cancel and portrait stability.');
one("if(!lines.length||top.isolated(lines)>=0)","if(!lines.length||top.isolated(lines)>=0||top.components(lines).length!==1)");
const a=s.indexOf('    // Choice lanes are tested'),b=s.indexOf('    fixtures.push(',a);assert(a>=0&&b>a);
s=s.slice(0,a)+`    // Both former escape strips now use the same connected render/contact graph.
    for(const family of ['rage','order']){
     const cc={...c,rc97Choice:{version:1,family,cycle:0,blocked:0,broad:16,narrow:22},width:1.6},at=c.fireAt+c.activeSeconds*.5,lines=L.geometry(cc,at);
     check(lines,'continuous choice '+family+' '+type);
     if(top.bands(cc).length)problems.push({kind:'obsolete-safe-band',type,family});
     for(const l of lines){const mid={x:(l.a.x+l.b.x)/2,y:(l.a.y+l.b.y)/2};if(!L.contact(cc,mid,at))problems.push({kind:'connector-not-damaging',type,family,mid});row.safe++;}
    }
`+s.slice(b);
one("check(lines,'finale '+owner.id+' '+kind);", "check(lines,'finale '+owner.id+' '+kind);if(!F.beamContact(c,{x:c.cx,y:c.cy})||F.safe(c,{x:c.cx,y:c.cy}))problems.push({kind:'finale-center-corridor-remains',id:owner.id,kind});");
one("const native={shape:'line'", "const cross=top.normalize({width:.5},[{a:{x:4,y:4},b:{x:28,y:28},width:.5},{a:{x:4,y:28},b:{x:28,y:4},width:.5}],true);check(cross,'cross intersection');if(cross.flatMap(l=>[l.a,l.b]).filter(p=>Math.hypot(p.x-16,p.y-16)<1e-5).length!==4)problems.push({kind:'cross-not-shared-vertex'});const single=top.normalize({width:.5},[{a:{x:4,y:16},b:{x:28,y:16},width:.5}],true);check(single,'single joined ray');if(single.some(l=>l.a.y!==16||l.b.y!==16))problems.push({kind:'single-ray-artificial-fork'});\n   const native={shape:'line'");
s=s.replaceAll('RC108_TOPOLOGY','RC121_TOPOLOGY');fs.writeFileSync('tests/rc121-connected-topology-browser.cjs',s);console.log('Generated RC121 native connectivity/contact/lifecycle/viewport regression');
