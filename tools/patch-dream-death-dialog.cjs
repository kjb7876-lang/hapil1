'use strict';
// Continue from RC121's connected-geometry candidate. Patch only the death
// dialog's lifecycle; do not change death destinations, health, or difficulty.
const fs=require('node:fs'),assert=require('node:assert/strict');
const file='assets/index-v31526.js';let source=fs.readFileSync(file,'utf8');
const start=source.indexOf('function HAPIL_showDeathVerseRC59(state, pending) {'),end=source.indexOf('(function HAPIL_installEpisode1DeathAndMidbossDuoRC59',start);assert(start>=0&&end>start,'death-dialog boundary unavailable');
let body=source.slice(start,end);
if(!body.includes('RC121_DEATH_DIALOG')){
 const original="  document.getElementById('hapil-death-verse-rc59')?.remove();";
 assert.equal(body.split(original).length-1,1);
 body=body.replace(original,"  const previous=document.getElementById('hapil-death-verse-rc59');\n  if(previous?.finishRC121)previous.finishRC121();else previous?.remove();");
 const a=body.indexOf('  let closed=false;'),b=body.lastIndexOf('  return true;');assert(a>0&&b>a);
 const lifecycle=`  // RC121_DEATH_DIALOG: a stopped simulation cannot advance its own dialog.
  // Use visible wall time and release only the reading lock this dialog owns.
  const reading=window.__HAPIL_READING_V31342__;
  const wasReadingBlocked=reading?.blocked===true;
  const controls=()=>window.__HAPIL_CONTROLS_V31329__?.binding;
  const automatic=()=>HAPIL_isFullAutoV31329(controls()?.settings?.current??{})&&controls()?.settings?.current?.autoStoryAdvance!==false;
  const label=button.textContent,autoDelay=3;
  const autoStatus=document.createElement('p'),hold=document.createElement('button');
  autoStatus.setAttribute('aria-live','polite');
  Object.assign(autoStatus.style,{fontSize:'13px',minHeight:'20px',margin:'16px 0 8px',color:'#c9cddd'});
  hold.type='button';hold.textContent='자동 재시작 일시정지';hold.dataset.deathAutoPauseRc121='true';
  Object.assign(hold.style,{padding:'8px 16px',border:'1px solid #798194',borderRadius:'12px',background:'#171827',color:'#e8edf5',cursor:'pointer'});
  card.append(autoStatus,hold);
  let closed=false,timer=null,elapsed=0,last=performance.now(),held=false;
  const finish=event=>{
    if(closed)return;
    if(event){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();}
    closed=true;
    if(timer!==null)clearTimeout(timer);
    document.removeEventListener('keydown',onKey,true);
    root.remove();
    if(reading?.deathVerseOwnerRC121===root){
      delete reading.deathVerseOwnerRC121;
      reading.blocked=wasReadingBlocked||window.__HAPIL_STORY_RC51__?.isOpen?.()===true;
    }
    if(controls()?.state?.current===state)controls()?.input?.current?.clear?.();
  };
  root.finishRC121=finish;
  const onKey=event=>{
    if(event.key==='Enter'||event.key==='Escape'||event.key===' '||event.key==='Spacebar')finish(event);
    else {event.stopPropagation();event.stopImmediatePropagation?.();}
  };
  hold.addEventListener('click',()=>{held=!held;last=performance.now();hold.textContent=held?'자동 재시작 계속':'자동 재시작 일시정지';});
  const tick=()=>{
    if(closed)return;
    const binding=controls();
    if(!root.isConnected||binding?.state?.current!==state){finish();return;}
    const now=performance.now(),dt=Math.max(0,Math.min(.25,(now-last)/1000));last=now;
    const full=automatic(),otherModal=!!binding?.modal?.current;
    hold.hidden=!full;
    if(full&&!held&&!document.hidden&&!otherModal){elapsed+=dt;}
    else if(!full)elapsed=0;
    autoStatus.textContent=!full?'버튼 또는 Enter로 다시 시작합니다.':held?'자동 재시작을 일시정지했습니다.':otherModal?'열린 메뉴를 닫으면 자동 재시작합니다.':'완전자동 · '+Math.max(1,Math.ceil(autoDelay-elapsed))+'초 후 '+label;
    root.dataset.autoRemainingRc121=String(Math.max(0,autoDelay-elapsed));
    if(full&&!held&&!document.hidden&&!otherModal&&elapsed>=autoDelay){finish();return;}
    timer=setTimeout(tick,100);
  };
  button.addEventListener('click',finish);
  document.addEventListener('keydown',onKey,true);
  document.body.append(root);
  if(reading){reading.deathVerseOwnerRC121=root;reading.blocked=true;}
  root.focus();button.focus();tick();
`;
 body=body.slice(0,a)+lifecycle+body.slice(b);source=source.slice(0,start)+body+source.slice(end);fs.writeFileSync(file,source);
}
const html='index.html';let h=fs.readFileSync(html,'utf8');if(!h.includes('assets/index-v31526.js?v=42102')){assert.equal(h.split('assets/index-v31526.js?v=42101').length-1,1);h=h.replace('assets/index-v31526.js?v=42101','assets/index-v31526.js?v=42102');fs.writeFileSync(html,h);}
// Record the checked-out candidate, not the workflow-trigger SHA.
const test='tests/rc121-dream-regression-browser.cjs';let t=fs.readFileSync(test,'utf8');t=t.replace('testedCommit:process.env.GITHUB_SHA||null',"testedCommit:require('node:child_process').execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()");
t=t.replace('paused:b?.paused?.current??null,story:',"paused:b?.modal?.current??null,deathDialog:!!document.querySelector('#hapil-death-verse-rc59'),readingBlocked:window.__HAPIL_READING_V31342__?.blocked===true,story:");fs.writeFileSync(test,t);
console.log('RC121 death-dialog lifecycle patched; original death policy and seven/77-second awakening preserved.');
