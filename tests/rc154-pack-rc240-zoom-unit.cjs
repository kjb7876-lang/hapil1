'use strict';
// The RC154 core-PNG packer applies the same 844x240 envelope invariant as
// tests/rc154-mobile-layout-browser.cjs: whole body/weapon envelope without the
// RC240 phone zoom; under it, at most 24 CSS px crop per side, the hero whole and
// every actor centre inside the safe frame. Nothing looser.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const P=require('../tools/rc154-pack-visual-evidence.cjs');
let checks=0;const ok=(f,m)=>{assert.doesNotThrow(f,m);checks++;},bad=(f,m)=>{assert.throws(f,m);checks++;};
assert.equal(typeof P.wholeOrRc240Zoom,'function','packer exposes its envelope invariant');checks++;
// after-844x240-full row captured locally at 2f774ee5 (RC240 zoom 1.04, envelope cropped 7.04 CSS px at the top).
const fixture={whole:false,camera:{x:-240.0784763499862,y:-350.70104461227527,scale:1.4992850794318013,rc240ZoomRC240:1.04,rc153Safe:{left:-482,right:1762,top:24,bottom:702}},view:{k:1/3},frameClearance:{left:229.34806566756689,right:98.02926838963897,top:-7.040000000000001,bottom:75.44062497679222},actorPaint:[{id:'hwando',hero:true,paint:{left:297.5569352839543,right:410.2830891301082,top:426.3784615384615,bottom:520.9516129032259}},{id:'dist06-boss',hero:false,paint:{left:896.7965925810697,right:1139.20340741893,top:235.83309769632024,bottom:482.532556674885}}]};
const row=patch=>{const r=JSON.parse(JSON.stringify(fixture));patch?.(r);return r;};
ok(()=>P.wholeOrRc240Zoom(row()),'RC240-zoomed 844x240 row within the test allowance packs');
bad(()=>P.wholeOrRc240Zoom(row(r=>{delete r.camera.rc240ZoomRC240;})),'without the RC240 zoom a cropped envelope is refused');
bad(()=>P.wholeOrRc240Zoom(row(r=>{r.camera.rc240ZoomRC240=1;})),'zoom 1 is not the RC240 zoom');
ok(()=>P.wholeOrRc240Zoom(row(r=>{delete r.camera.rc240ZoomRC240;r.whole=true;})),'whole unzoomed row packs');
for(const side of['left','right','top','bottom']){
 ok(()=>P.wholeOrRc240Zoom(row(r=>{r.frameClearance[side]=-24;})),'24 CSS px crop allowed '+side);
 bad(()=>P.wholeOrRc240Zoom(row(r=>{r.frameClearance[side]=-24.5;})),'more than 24 CSS px crop refused '+side);
}
bad(()=>P.wholeOrRc240Zoom(row(r=>{r.actorPaint[0].paint.top=240;})),'cropped hero body/weapon refused');
bad(()=>P.wholeOrRc240Zoom(row(r=>{Object.assign(r.actorPaint[1].paint,{left:1400,right:1600});})),'actor centre outside the safe frame refused');
bad(()=>P.wholeOrRc240Zoom(row(r=>{r.actorPaint[1].paint=null;})),'fewer than two native paint envelopes refused');
const src=fs.readFileSync(path.join(__dirname,'../tools/rc154-pack-visual-evidence.cjs'),'utf8');
assert(src.includes("assert(row,'matching native layout capture metadata');wholeOrRc240Zoom(row);"),'pack() applies the invariant to every selected layout row');checks++;
console.log('RC154_PACK_RC240_ZOOM_UNIT',JSON.stringify({status:'passed',checks}));
