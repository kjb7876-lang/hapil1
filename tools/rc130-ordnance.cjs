'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const file=path.resolve(__dirname,'../assets/index-v31526.js');let text=fs.readFileSync(file,'utf8');
const anchor="function draw(ctx,cache,e,time,settings={}){if(!accepts(e))return false;\nif(e.bloodiedFlightRC43&&window.__HAPIL_BLOODIED_FLIGHT_RC43__?.draw";
if(!text.includes('function paintOrdnanceRC130(')){
 assert.equal(text.split(anchor).length-1,1,'Exact native owner-ordnance renderer anchor');
 const replacement="function draw(ctx,cache,e,time,settings={}){const paint=()=>paintOrdnanceRC130(ctx,cache,e,time,settings);return window.__HAPIL_PRESENTATION_RC130__?window.__HAPIL_PRESENTATION_RC130__.projectile(ctx,e,paint):paint();}\nfunction paintOrdnanceRC130(ctx,cache,e,time,settings={}){if(!accepts(e))return false;\nif(e.bloodiedFlightRC43&&window.__HAPIL_BLOODIED_FLIGHT_RC43__?.draw";
 text=text.replace(anchor,replacement);fs.writeFileSync(file,text);
}
console.log('RC130 owner-ordnance bitmap path bounded; authored geometry, timing and damage unchanged.');
