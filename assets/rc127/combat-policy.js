/* RC127. Ordinary movement has one 777 finite-mastery reference, independent of
 * hero/mode/growth/awakening. Existing blink, collision and input locks are separate.
 * Existing save keys remain valid: former speed growth now grants damage reduction.
 * Cooldown transactions change ONLY next-admission deadlines, never active attacks. */
(function(root){'use strict';
 const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const FIXED_SPEED=4.75*(1+3*.07)*(1+7*.018),MAX_REDUCTION=.75;
 const transactions=new WeakMap(),history=[];
 const READY_KEYS=Object.freeze(['readyAt','patternReadyAt','recoverUntil','themedOrdnanceAt','bossCombatPatternReadyAtV31230','bloodReadyRC16','laserReadyAtRC94','laserReadyAtV31332','episodeNextPatternAt','cosmicArsenalReadyAtV31318','finaleReadyAtV31334']);
 const metrics={speedSamples:0,cooldownCasts:0,cooldownFields:0,nestedCalls:0};
 function mode(s){return String(root.__HAPIL_MODES_V31346__?.mode(s)??s?.gameModeV31346??(s?.hellModeV31322?'HELL':'STORY')).toUpperCase();}
 function multiplier(s,a){return mode(s)==='STORY'&&a?.boss===true&&!a.friendly&&!a.neutral&&!a.visualOnly?2:1;}
 function interval(s,a,seconds){return Math.max(0,n(seconds))*multiplier(s,a);}
 function deadline(s,a,at,origin=n(s?.time)){return origin+interval(s,a,Math.max(0,n(at,origin)-origin));}
 function defense(raw={},options={}){
  const basic=clamp(n(raw.speed),0,3)*.07;
  const infinite=clamp(Math.log2(1+clamp(n(raw.infiniteSpeed),0,999999999))*.025,0,.4);
  const mastery=clamp(n(options.mastery),0,7)*.018;
  const resonance=options.awakened?clamp(n(options.awakeningMultiplier,1)-1,0,.5):0;
  const temporal=options.accelerated?clamp(n(options.accelerationMultiplier,1)-1,0,.5):0;
  const reduction=Math.min(MAX_REDUCTION,1-[basic,infinite,mastery,resonance,temporal].reduce((p,r)=>p*(1-r),1));
  return{basic,infinite,mastery,resonance,temporal,reduction,incoming:1-reduction};
 }
 function speed(s,raw={},options={}){
  if(s&&typeof s==='object'){s.rc127Defense=defense(raw,options);s.rc127MovementSpeed=FIXED_SPEED;metrics.speedSamples++;}
  return FIXED_SPEED;
 }
 function incoming(s,source){
  if(source?.selfDamage||source?.environmentDamage||source?.friendly||source?.reflected)return 1;
  return clamp(n(s?.rc127Defense?.incoming,1),1-MAX_REDUCTION,1);
 }
 function schedule(s,a,fn,label='skill'){
  if(typeof fn!=='function')throw new TypeError('RC127 scheduling requires a function');
  if(!s||!a||multiplier(s,a)!==2)return fn();
  if(transactions.has(a)){metrics.nestedCalls++;return fn();}
  const before=Object.fromEntries(READY_KEYS.map(k=>[k,n(a[k])])),now=n(s.time),serial=n(s.fxSerial);
  transactions.set(a,true);
  try{
   const result=fn();
   // A deferred/failed admission must not manufacture cooldown or consume a slot.
   const changed=READY_KEYS.filter(k=>n(a[k])>now+1e-8&&n(a[k])>before[k]+1e-8);
   const admitted=changed.length>0&&(n(s.fxSerial)>serial||!!result&&result.deferredRC95!==true);
   if(admitted){const fields={};for(const key of changed){const base=n(a[key]),next=deadline(s,a,base,now);a[key]=next;fields[key]={base,next};metrics.cooldownFields++;}
    metrics.cooldownCasts++;history.push({zone:s.zone,owner:a.id,at:now,label,fields});if(history.length>64)history.shift();
   }
   return result;
  }finally{transactions.delete(a);}
 }
 function snapshot(){return{version:'RC127',fixedSpeed:FIXED_SPEED,maxReduction:MAX_REDUCTION,metrics:{...metrics},recent:history.map(x=>({...x,fields:{...x.fields}}))};}
 root.__HAPIL_POLICY_RC127__=Object.freeze({version:'RC127',fixedSpeed:FIXED_SPEED,maxReduction:MAX_REDUCTION,readyKeys:READY_KEYS,mode,multiplier,interval,deadline,defense,speed,incoming,schedule,snapshot});
})(typeof window!=='undefined'?window:globalThis);
