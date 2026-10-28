'use strict';

// Run the exact browser-fixture callback with the real RC153 camera and RC125
// view planner. DOM sizing, decoded paint and failure injection are controlled
// CPU inputs; this is not browser or image-rendering evidence.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const browser=fs.readFileSync('tests/rc153-combat-browser.cjs','utf8'),start=browser.indexOf('/* RC233_CSS_FIT_MATRIX_BEGIN */'),end=browser.indexOf('/* RC233_CSS_FIT_MATRIX_END */',start);
assert(start>=0&&end>start,'the actual browser fixture owns the CSS fit matrix');
const callback=browser.slice(start,end),setup=fs.readFileSync('tests/rc200-camera-epoch-bounds-unit.cjs','utf8').split('const rows=[];')[0],fixture=new Function('require',setup+';return fixture;')(require),adaptive=fs.readFileSync('assets/rc125/adaptive-battlefield.js','utf8'),viewStart=adaptive.indexOf(' function view('),viewEnd=adaptive.indexOf(' function mapRect(',viewStart);
assert(viewStart>=0&&viewEnd>viewStart);
function context(width,height,mobile,{style=null,ignoreWidth=false}={}){
 const f=fixture(width,height,mobile);f.stage(true,true);Object.assign(f.s,{x:13.8,y:24.2});Object.assign(f.boss,{x:27.5,y:13.5});
 let values=new Map(style?JSON.parse(style):[]),restores=0,reads=0;
 const canvas={style:{setProperty(key,value){if(!(ignoreWidth&&key==='width'))values.set(key,value);}},getAttribute:()=>values.size?JSON.stringify([...values]):null,setAttribute(key,value){assert.equal(key,'style');values=new Map(JSON.parse(value));restores++;},removeAttribute(key){assert.equal(key,'style');values.clear();restores++;},getBoundingClientRect(){reads++;return{width:parseFloat(values.get('width'))||width,height:parseFloat(values.get('height'))||height};}};
 f.root.document.querySelector=selector=>selector==='.game-stage > canvas'?canvas:null;
 const view=vm.runInContext('(()=>{const box={width:1280,height:720};'+adaptive.slice(viewStart,viewEnd)+'return view;})()',f.root);
 f.root.__HAPIL_ADAPTIVE_RC125__={installed:true,view};
 const measure=vm.runInContext('(()=>{'+callback+'return measureNativeBodyCssMatrixRC233;})()',f.root);
 return{...f,canvas,measure,restores:()=>restores,reads:()=>reads};
}
let checks=0;const rows=[];
for(const [width,height,mobile] of [[1280,824,false],[844,390,true]])for(const style of [null,JSON.stringify([['color','red']])]){
 const f=context(width,height,mobile,{style}),beforeStyle=f.canvas.getAttribute('style'),beforeWorld=JSON.stringify(f.s),actual=f.measure(f.L,f.s,f.boss);
 assert.equal(actual.length,9);checks++;
 assert.deepEqual(JSON.parse(JSON.stringify(actual.map(row=>[row.width,row.slot]))),[[300,'arena'],[300,'hero'],[300,'boss'],[640,'arena'],[640,'hero'],[640,'boss'],[1280,'arena'],[1280,'hero'],[1280,'boss']]);checks++;
 assert(actual.every(row=>row.widthUnit==='CSS pixels'&&row.cssHeight===height));checks++;
 assert.equal(f.canvas.getAttribute('style'),beforeStyle);assert.equal(f.restores(),1);checks+=2;
 assert.equal(JSON.stringify(f.s),beforeWorld,'the sizing callback does not edit the live world or actor');checks++;
 assert(actual.every(row=>row.css.left>=row.cssSafe.left-1e-6&&row.css.right<=Math.min(row.width,row.cssSafe.right)+1e-6&&row.css.top>=Math.max(0,row.cssSafe.top)-1e-6&&row.css.bottom<=Math.min(height,row.cssSafe.bottom)+1e-6));checks++;
 const restored=f.L.camera(f.s,f.view());assert.equal(restored.rc153View.width,f.view().width,'a subsequent native camera read observes restored layout');checks++;
 rows.push({profile:mobile?'mobile-landscape':'desktop',style:style===null?'absent':'authored',cases:actual.length,widths:[...new Set(actual.map(row=>row.width))],logicalWidths:[...new Set(actual.map(row=>row.logicalViewport.width))],restored:true});
}
for(const fault of ['css-width-refused','outside-native-body','camera-exception']){
 const f=context(844,390,true,{style:JSON.stringify([['color','red']]),ignoreWidth:fault==='css-width-refused'}),before=f.canvas.getAttribute('style');let L=f.L;
 if(fault==='outside-native-body')L={...L,camera(...args){const c=f.L.camera(...args);return{...c,x:c.x+10000};}};
 if(fault==='camera-exception')L={...L,camera(){throw Error('controlled native camera failure');}};
 assert.throws(()=>f.measure(L,f.s,f.boss),fault==='css-width-refused'?/did not establish/:fault==='outside-native-body'?/full body fit/:/controlled native camera failure/);checks++;
 assert.equal(f.canvas.getAttribute('style'),before);assert.equal(f.restores(),1);checks+=2;
}
console.log('RC233_CSS_BODY_FIT_FIXTURE_UNIT',JSON.stringify({status:'passed',checks,rows,failuresRejected:['unapplied CSS width','clipped actual body','camera exception'],scope:'Exact browser callback plus actual RC153/RC125 camera planners with synthetic CSS rectangles and native-paint callback inputs. Retains all nine CSS-width/slot checks and restores authored layout on success or failure. No Chrome/GPU/image-pixel claim.'}));
