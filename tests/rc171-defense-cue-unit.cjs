'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const combat=require('../assets/rc47/combat-expansion.js');
const s={time:1,fxSerial:1,effects:[],floatTexts:[]},hero={hp:100,x:13.8,y:24.2},incoming={damage:10,sourceId:'u203-boss',x:24,y:14,sprite:'enemy-beam.webp'};
assert.equal(combat.absorbed(s,hero,incoming),true);
const cue=s.effects[0];assert.equal(cue.heroHitVfxV31315,true);assert.equal(cue.visualOnly,true);assert.equal(cue.ownerType,'hero');assert.equal(cue.sourceId,incoming.sourceId);assert.equal(cue.sprite,undefined);assert.equal(incoming.heroHitVfxV31315,undefined);
const src=fs.readFileSync(require.resolve('../assets/index-v31526.js'),'utf8');
const bind=src.slice(src.indexOf('function bind(e,s=state){'),src.indexOf('function bind(e,s=state){')+160);
const terminal=src.slice(src.indexOf("function terminal(s,e,reason='end',force=false){"),src.indexOf("function terminal(s,e,reason='end',force=false){")+160);
// Execute actual native guard prefixes: neither cue binding nor expiration may
// reach the enemy art owner/terminal resolver. The source remains untouched.
const scope={cue,s,window:{},state:s};vm.createContext(scope);
vm.runInContext(bind.slice(0,bind.indexOf('if(e?.echoBolt'))+'throw Error("enemy owner reached")} result=bind(cue,s)',scope);assert.equal(scope.result,cue);
vm.runInContext(terminal.slice(0,terminal.indexOf('if(e?.echoBolt'))+'throw Error("enemy terminal reached")} terminal(s,cue)',scope);
assert.equal(s.effects.length,1);assert.equal(hero.hp,100);
console.log('RC171 defense cue owner and native expiration guard passed');
