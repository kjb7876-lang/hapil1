const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let mobile=true;const win={innerWidth:375,innerHeight:812,visualViewport:null,document:{documentElement:{classList:{contains:()=>mobile}}},addEventListener(){}};win.window=win;
vm.runInNewContext(fs.readFileSync('assets/rc104/combat-viewport.js','utf8'),win);const api=win.__HAPIL_VIEWPORT_RC104__,project=(x,y)=>({x:640+(x-y)*27,y:(x+y)*13.5}),zone={map:'./map.webp'};api.recordMapRect(zone.map,{x:-152,y:-10,width:1584,height:891});
for(const points of [[[16,16],[18,17]],[[2,2],[30,30]],[[2,30],[30,2]]]){
 const s={x:points[0][0],y:points[0][1],time:1,enemies:[{x:points[1][0],y:points[1][1],hp:100,boss:true}],hostileProjectiles:[{x:12,y:13}],pendingHits:[{x:15,y:16}]};const saved=JSON.stringify(s),cam=api.camera(s,{},project,zone),{safe,protected:b}=api.last;
 assert(cam.scale>0);assert(b.left*cam.scale+cam.x>=safe.left-1e-6);assert(b.right*cam.scale+cam.x<=safe.right+1e-6);assert(b.top*cam.scale+cam.y>=safe.top-1e-6);assert(b.bottom*cam.scale+cam.y<=safe.bottom+1e-6);assert.equal(JSON.stringify(s),saved,'camera must not mutate combat');
}
const s={x:2,y:2,time:2,enemies:[]};api.camera(s,{},project,zone,{x:30,y:30});assert(api.last.protected.bottom>=810,'exit remains framed');
for(const [width,height] of [[320,568],[375,812],[430,932],[844,390]]){const v=api.view(width,height),p=api.pointer({clientX:17+width*.3,clientY:23+height*.7},{left:17,top:23,width,height});assert(Math.abs(p.x-(v.x+v.width*.3))<1e-6);assert(Math.abs(p.y-(v.y+v.height*.7))<1e-6);}
mobile=false;const cam=api.camera({time:3},null,project,zone);assert(cam.scale>.75);assert(-152*cam.scale+cam.x>=12-1e-6);assert(1432*cam.scale+cam.x<=1268+1e-6);
console.log('RC104 PASS: threats, portal, crop pointer mapping, immutable combat state, active desktop map.');
