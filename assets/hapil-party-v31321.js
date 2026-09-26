/* HAPIL 3.13.21 — independent party controls and authoritative-room transport. */
(() => {
  'use strict';
  const W = window, DOC = W.document;
  const HEROES = Object.freeze([
    ['hwando', '환도영웅', '#f5f5ff'], ['gunner', '기억사수', '#79ffec'],
    ['seoha', '윤서하', '#a6caff'], ['neon', '네온 성기사', '#7dffbd'],
    ['michaela', '미카엘라', '#ffb6d9'], ['lauren', '라우렌', '#d5b5ff'],
    ['hunter', '피의 궁수', '#ad294c'], ['slayer', '피의 검사', '#962435']
  ]);
  const HERO_IDS = new Set(HEROES.map(h => h[0]));
  const SESSION = 'hapil.party.session.v31321', PREFS = 'hapil.party.preferences.v31321';
  const finite = (v, d = 0) => Number.isFinite(Number(v)) ? Number(v) : d;
  const bound = v => Math.max(-1, Math.min(1, finite(v)));
  const validHero = v => HERO_IDS.has(v) ? v : 'hwando';
  const readStore = (store, key) => { try { return JSON.parse(store.getItem(key) || 'null'); } catch { return null; } };
  const writeStore = (store, key, value) => { try { value == null ? store.removeItem(key) : store.setItem(key, JSON.stringify(value)); } catch {} };
  const isPlaying = phase => ['playing', 'started', 'running', 'active'].includes(phase);
  const actionState = names => {
    const s = new Set(names || []);
    return {attack:s.has('attack'), dash:s.has('dash'), skill:s.has('q'), skill1:s.has('q'), skill2:s.has('w'), skill3:s.has('e'), ultimate:s.has('r'), time:s.has('time')};
  };
  const slotRoster = (roster, isHost, selfSlot) => (Array.isArray(roster) ? roster : []).slice(0, 8).map((r, i) => ({
    slotId:String(r.slotId || `p${i+1}`), heroId:validHero(r.heroId), name:String(r.name || `동료 ${i+1}`).slice(0,24),
    control:r.kind === 'ai' ? 'ai' : r.slotId === 'p1' ? 'host' : r.kind === 'local' && isHost ? 'local' : 'remote',
    connected:r.connected !== false, self:r.slotId === selfSlot
  }));
  function getStatus(api) { try { return typeof api?.status === 'function' ? api.status() : api?.status || {}; } catch { return {}; } }
  class PartyTransport {
    constructor(options = {}) {
      this.fetch = options.fetch || W.fetch.bind(W); this.getApi = options.getApi || (() => W.__HAPIL_PARTY_V31321__); this.getHellApi=options.getHellApi||(()=>W.__HAPIL_HELL_V31321__);this.previousHell=null;this.supportHeroId=null;
      this.onChange = options.onChange || (()=>{}); this.readInput = options.readInput || (()=>({moveX:0,moveY:0,actions:[]}));
      this.setTimer = options.setTimer || W.setTimeout.bind(W); this.clearTimer = options.clearTimer || W.clearTimeout.bind(W);
      this.sessionStore = options.sessionStore || W.sessionStorage; this.now = options.now || (()=>Date.now());
      this.session = null; this.phase = 'offline'; this.generation = 0; this.timers = new Set(); this.controllers = new Set();
      this.snapshotSeq = 0; this.sentSnapshotSeq = 0; this.inputSeq = 0; this.eventCursor = 0; this.failureCount = 0;
      this.roster = []; this.rosterKey = ''; this.pendingInput = null; this.appliedRole = ''; this.apiIdentity = null; this.launchRequested = false; this.lastError = ''; this.lastPoll = 0; this.paused = false; this.restorePending = false;
    }
    emit() { this.onChange(this.status()); }
    status() { return {connected:!!this.session, isHost:!!this.session?.isHost, slotId:this.session?.slotId || '', roomId:this.session?.roomId || '', code:this.session?.code || '', phase:this.phase, paused:this.paused, roster:this.roster, error:this.lastError, lastPoll:this.lastPoll, reconnecting:this.failureCount>0}; }
    async request(endpoint, body, query = '', auth = true) {
      const controller = new AbortController(); this.controllers.add(controller);
      const timer = this.setTimer(()=>controller.abort(), 5000);
      try {
        const headers = {'Content-Type':'application/json'};
        if(auth && this.session?.token) headers.Authorization = `Bearer ${this.session.token}`;
        const r = await this.fetch(`/api/party/${endpoint}${query}`, {method:body == null?'GET':'POST', headers, body:body == null?undefined:JSON.stringify(body), cache:'no-store', credentials:'same-origin', signal:controller.signal});
        let data; try { data = await r.json(); } catch { throw Error('파티 서버 응답을 읽지 못했습니다. LAN 실행 파일로 게임을 열어 주세요.'); }
        if(!r.ok || data.ok === false) { const e = Error(String(({party_disabled:'일반 실행 모드에서는 파티 서버가 열리지 않습니다. START_PARTY_LAN 실행 파일로 다시 열어 주세요.',join_denied:'방 코드가 맞는지 확인해 주세요.',room_started:'이미 출발한 방입니다. 기존 참가자는 이전 연결 복원을 사용해 주세요.',room_full:'파티가 가득 찼습니다. AI와 로컬 2P를 포함해 최대 8명입니다.',host_paused:'호스트 연결을 기다리고 있습니다.',input_backlog:'전투 입력을 동기화하고 있습니다.',client_rate:'연결 요청 간격을 조정하고 있습니다.',invalid_token:'이전 연결이 만료되었습니다. 새 파티에 참가해 주세요.',room_closed:'호스트가 방을 닫았습니다.'})[data.error] || data.message || data.error || `연결 오류 (${r.status})`)); e.status = r.status; throw e; }
        return data;
      } finally { this.clearTimer(timer); this.controllers.delete(controller); }
    }
    stopLoops() { this.generation++; this.timers.forEach(t=>this.clearTimer(t)); this.timers.clear(); this.controllers.forEach(c=>c.abort()); this.controllers.clear(); }
    schedule(kind, delay, generation) {
      if(generation !== this.generation || !this.session) return;
      const timer = this.setTimer(async()=>{ this.timers.delete(timer); if(generation !== this.generation || !this.session)return;
        let next = delay;
        try { await this[kind](); if(generation !== this.generation)return; if(kind==='pollOnce') { this.failureCount=0; this.lastError=''; } }
        catch(e) { if(generation !== this.generation)return; next = Math.min(2500, 150 * 2 ** Math.min(4, ++this.failureCount)); this.lastError = e.name === 'AbortError' ? '서버 응답을 기다리는 중입니다.' : String(e.message); this.paused=true; this.releaseRemoteInputs(); this.applyRole('disconnected'); this.emit(); if([401,403,404,410].includes(e.status)) { this.stopLoops(); this.phase='disconnected'; this.session=null; writeStore(this.sessionStore,SESSION,null); this.restoreLocal(); this.emit(); return; } }
        this.schedule(kind, next, generation);
      }, delay); this.timers.add(timer);
    }
    restoreLocal() {this.getApi()?.leave?.();if(typeof this.previousHell==='boolean')this.getHellApi()?.setEnabled?.(this.previousHell);this.previousHell=null;}
    applyRole(role) { const api=this.getApi(); if(!api)return; if(this.appliedRole!==role||this.apiIdentity!==api){api.setNetworkRole?.(role);this.appliedRole=role;this.apiIdentity=api;} }
    async launchGame() { const api=this.getApi(); if(!this.launchRequested&&typeof api?.startGame==='function'){await api.startGame();this.launchRequested=true;} }
    releaseRemoteInputs() { const api=this.getApi(); for(const r of this.roster) if(r.slotId!=='p1'&&r.kind!=='ai')api?.setInput?.(r.slotId,{seq:++this.inputSeq,moveX:0,moveY:0,actions:actionState([])}); }
    attach(data, restoring = false) {
      if(!data?.roomId || !data?.token || !data?.slotId) throw Error('파티 접속 정보가 불완전합니다.');
      this.stopLoops();if(data.isHost!==true&&this.previousHell===null)this.previousHell=typeof data.previousHell==='boolean'?data.previousHell:!!this.getHellApi()?.enabled?.();this.session={roomId:data.roomId,code:data.code||data.roomId,token:data.token,slotId:data.slotId,isHost:data.isHost===true,previousHell:this.previousHell};
      this.supportHeroId=data.supportHeroId||null;this.phase=data.phase||'lobby'; this.snapshotSeq=0; this.sentSnapshotSeq=finite(data.snapshotSeq); this.eventCursor=0; this.inputSeq=0;
      this.failureCount=0; this.lastError=''; this.paused=false; this.restorePending=restoring; this.rosterKey='';this.pendingInput=null;this.appliedRole='';this.apiIdentity=null;this.launchRequested=false;
      writeStore(this.sessionStore,SESSION,{...this.session,phase:this.phase,origin:W.location?.origin});
      this.applyRole(!this.session.isHost||restoring?'guest':'host');this.syncRoster(data.roster || []); this.applyRole(restoring||!isPlaying(this.phase)?'disconnected':this.session.isHost?'host':'guest');
      this.schedule('pollOnce', 0, this.generation); this.schedule('inputOnce', 50, this.generation); this.schedule('snapshotOnce', 84, this.generation); this.emit(); return this.status();
    }
    syncRoster(roster) {
      if(!Array.isArray(roster)||!roster.length)return;
      this.roster=roster.slice(0,8); const normalized=slotRoster(this.roster,!!this.session?.isHost,this.session?.slotId),key=JSON.stringify([normalized,this.supportHeroId]);
      if(!this.getApi())return;if(key===this.rosterKey)return; this.rosterKey=key;
      const config={mode:'network',roster:normalized};if(this.session?.isHost&&!this.restorePending){config.hell=!!this.hell;if(this.supportHeroId)config.supportHeroId=this.supportHeroId;}this.getApi()?.configure?.(config);
    }
    async create(config) { if(this.session)await this.leave(); const data=await this.request('create',config,'',false); this.hell=!!data.hell; return this.attach(data); }
    async join(config) { if(this.session)await this.leave(); const data=await this.request('join',config,'',false); this.hell=!!data.hell; return this.attach(data); }
    resume(saved) { if(saved?.origin && saved.origin !== W.location?.origin)throw Error('이 방을 만든 게임 서버 주소에서 다시 연결해 주세요.'); return this.attach(saved,true); }
    async begin() { if(!this.session?.isHost)throw Error('호스트만 출발할 수 있습니다.'); const data=await this.request('begin',{roomId:this.session.roomId}); this.phase=data.phase||'playing'; this.hell=!!(data.hell??this.hell); this.syncRoster(data.roster||this.roster);await this.launchGame();this.applyRole('host'); this.emit(); return data; }
    async pollOnce() {
      if(!this.session)return; const s=this.session, generation=this.generation;
      const query=`?roomId=${encodeURIComponent(s.roomId)}&since=${this.snapshotSeq}&eventSince=${this.eventCursor}`;
      const data=await this.request('poll',null,query); if(generation!==this.generation)return;
      const api=this.getApi(); if(!api)return;
      this.supportHeroId=data.supportHeroId||this.supportHeroId;this.phase=data.phase||this.phase; this.hell=!!(data.hell??this.hell); this.paused=!!data.paused||data.hostConnected===false; this.lastPoll=this.now();
      this.syncRoster(data.roster||this.roster);
      if(data.snapshot && finite(data.snapshotSeq)>this.snapshotSeq && (!s.isHost||this.restorePending)) {
        const accepted=api.applySnapshot?.(data.snapshot);if(accepted===false)throw Error('호스트 전투 상태를 검증하지 못했습니다. 다시 동기화하고 있습니다.'); this.snapshotSeq=finite(data.snapshotSeq); this.sentSnapshotSeq=Math.max(this.sentSnapshotSeq,this.snapshotSeq);
        if(this.restorePending){this.restorePending=false;}
      } else if(!this.restorePending) this.snapshotSeq=Math.max(this.snapshotSeq,finite(data.snapshotSeq));
      if(this.restorePending && this.phase==='lobby') this.restorePending=false;
      if(isPlaying(this.phase))await this.launchGame();
      this.applyRole(this.paused||this.restorePending||!isPlaying(this.phase)?'disconnected':s.isHost?'host':'guest');
      if(s.isHost && !this.restorePending && !this.paused) {
        const eventActions=new Map(); for(const e of data.actionEvents||[]) {if(finite(e.cursor)<=this.eventCursor)continue; const names=eventActions.get(e.slotId)||[]; names.push(e.action); eventActions.set(e.slotId,names);}
        for(const input of data.inputs||[]) {if(input.slotId==='p1'||this.roster.some(r=>r.slotId===input.slotId&&r.kind==='local'))continue; api.setInput?.(String(input.slotId),{seq:++this.inputSeq,moveX:bound(input.moveX),moveY:bound(input.moveY),actions:actionState(eventActions.get(input.slotId)||[])}); eventActions.delete(input.slotId);}
        for(const [slotId,names] of eventActions)api.setInput?.(slotId,{seq:++this.inputSeq,moveX:0,moveY:0,actions:actionState(names)});
        this.eventCursor=Math.max(this.eventCursor,finite(data.eventCursor));
      } else if(this.paused)this.releaseRemoteInputs();
      this.emit();
    }
    async inputOnce() {
      if(!this.session||this.session.isHost||!isPlaying(this.phase)||this.paused||this.restorePending)return;
      if(!this.pendingInput){const input=this.readInput();this.pendingInput={roomId:this.session.roomId,seq:++this.inputSeq,moveX:bound(input.moveX),moveY:bound(input.moveY),aimX:finite(input.aimX),aimY:finite(input.aimY),actions:(input.actions||[]).filter(a=>['attack','q','w','e','r','dash','time'].includes(a))};}
      const pending=this.pendingInput;await this.request('input',pending);if(this.pendingInput===pending)this.pendingInput=null;
    }
    async snapshotOnce() {
      if(!this.session?.isHost||!isPlaying(this.phase)||this.paused||this.restorePending)return;
      const api=this.getApi(); if(!getStatus(api).ready)return; const snapshot=api?.exportSnapshot?.(); if(!snapshot)return;
      const seq=++this.sentSnapshotSeq;snapshot.seq=seq;await this.request('snapshot',{roomId:this.session.roomId,seq,snapshot});
    }
    async leave() {
      const s=this.session; this.stopLoops(); this.releaseRemoteInputs(); this.session=null;this.pendingInput=null; this.phase='offline'; this.roster=[]; this.rosterKey='';this.restorePending=false;
      writeStore(this.sessionStore,SESSION,null);
      try {if(s)await this.request('leave',{roomId:s.roomId,token:s.token},'',false);} catch {}
      this.restoreLocal(); this.emit();
    }
  }
  const P2_MOVE = {KeyI:[0,-1],KeyJ:[-1,0],KeyK:[0,1],KeyL:[1,0]}, P2_ACTION={KeyU:'attack',KeyH:'dash',KeyO:'q',Digit7:'q',Digit8:'w',Digit9:'e',KeyP:'r'};
  const GUEST_MOVE = {ArrowUp:[0,-1],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowRight:[1,0]}, GUEST_ACTION={KeyA:'attack',KeyS:'dash',Space:'dash',KeyQ:'q',KeyW:'w',KeyE:'e',KeyR:'r',KeyD:'time'};
  function inputFor(keys, moveMap, actionMap) {let x=0,y=0;const actions=[]; for(const k of keys){if(moveMap[k]){x+=moveMap[k][0];y+=moveMap[k][1];}if(actionMap[k])actions.push(actionMap[k]);}const length=Math.hypot(x,y);return{moveX:length>1?x/length:x,moveY:length>1?y/length:y,actions:[...new Set(actions)]};}
  function hudRows(status, actors, state, selfSlot='p1', localTwo=false, showAll=false) {
    const slots=Array.isArray(status?.slots)?status.slots:[], time=finite(state?.time);
    return slots.filter(r=>showAll||r.slotId===selfSlot||localTwo&&['p1','p2'].includes(r.slotId)).map(r=>{const a=(actors||[]).find(a=>a.slotId===r.slotId)||r, h=HEROES.find(h=>h[0]===r.heroId)||HEROES[0];
      const primary=r.slotId==='p1', raw=primary?['Q','W','E','R'].map(k=>state?.cooldowns?.[k]??0):[...(a.skillReady||[0,0,0]),a.ultimateReady||0];
      return{slotId:r.slotId,name:r.name||h[1],heroName:h[1],color:h[2],self:r.slotId===selfSlot,localTwo:r.slotId==='p2'&&localTwo,hp:Math.max(0,Math.ceil(finite(r.hp))),maxHp:Math.max(1,Math.ceil(finite(r.maxHp,1))),down:r.down===true||finite(r.hp)<=0,control:r.control,cooldowns:raw.slice(0,4).map(t=>Math.max(0,Math.ceil(finite(t)-time))),reviveIn:Math.max(0,Math.ceil(finite(a.downUntil)-time))};
    });
  }
  const exported = {version:'3.13.21',PartyTransport,heroes:HEROES,slotRoster,actionState,inputFor,hudRows,keys:{p2Move:P2_MOVE,p2Action:P2_ACTION,guestMove:GUEST_MOVE,guestAction:GUEST_ACTION}};
  W.__HAPIL_PARTY_UI_V31321__=exported;
  if(!DOC?.createElement||!DOC.body)return;
  let open=false,busy=false,localMode=false,inputSeq=0,lastLocal='',lastStatusKey='',focusBefore=null,network;
  const held=new Set(),edges=new Set();
  const api=()=>W.__HAPIL_PARTY_V31321__, hellApi=()=>W.__HAPIL_HELL_V31321__;
  const inputBlocked=()=>{const s=getStatus(api());return open||DOC.hidden||s.inputBlocked===true||s.paused===true||s.disconnected===true;};
  const pref=readStore(W.localStorage,PREFS)||readStore(W.localStorage,'hapil.party.preferences.v31320')||{};
  const el=(tag,attrs={},text)=>{const n=DOC.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='className')n.className=v;else if(k==='checked')n.checked=!!v;else n.setAttribute(k,v);}if(text!=null)n.textContent=text;return n;};
  const launcher=el('button',{id:'hapil-party-launcher',type:'button','aria-haspopup':'dialog','aria-controls':'hapil-party-dialog'},'파티 · 난이도');
  const backdrop=el('div',{id:'hapil-party-backdrop',hidden:''});
  const panel=el('section',{id:'hapil-party-dialog',role:'dialog','aria-modal':'true','aria-labelledby':'hapil-party-title',tabindex:'-1'});
  const header=el('header'),title=el('h2',{id:'hapil-party-title'},'함께 싸우는 파티'),close=el('button',{type:'button','aria-label':'파티 설정 닫기'},'닫기');header.append(title,close);panel.append(header);
  const lead=el('p',{className:'hapil-party-lead'},'한 화면에서 함께 전투하거나, 같은 게임 서버에 접속해 최대 8명으로 출발하세요. AI 동료도 한 자리를 사용합니다. 보조 영웅은 별도 지원·콜라보 역할이며 파티 정원을 차지하지 않습니다.');panel.append(lead);
  const form=el('div',{className:'hapil-party-form'});
  const field=(label,node)=>{const n=el('label',{className:'hapil-party-field'});n.append(el('span',{},label),node);return n;};
  const mode=el('select',{'aria-label':'플레이 방식'});[['solo','혼자 · AI 동료'],['local','한 컴퓨터 2인'],['host','LAN / 온라인 방 만들기'],['join','LAN / 온라인 참가']].forEach(([v,t])=>mode.append(el('option',{value:v},t)));mode.value=['solo','local','host','join'].includes(pref.mode)?pref.mode:'solo';
  const name=el('input',{type:'text',maxlength:'24',placeholder:'플레이어',autocomplete:'nickname'});name.value=String(pref.name||'플레이어').slice(0,24);
  const selectHero=value=>{const s=el('select');HEROES.forEach(([id,n])=>s.append(el('option',{value:id},n)));s.value=validHero(value);return s;};
  const hero=selectHero(pref.hero||'hwando'),p2Hero=selectHero(pref.p2Hero||'gunner');
  hero.setAttribute('aria-label','대표 영웅');
  const support=el('select',{'aria-label':'보조 영웅'});
  const partners={hwando:'gunner',gunner:'hwando',seoha:'michaela',michaela:'seoha',neon:'lauren',lauren:'neon',hunter:'slayer',slayer:'hunter'};
  function refreshSupport(preferred=support.value||api()?.supportHeroId||pref.supportHeroId){const rows=api()?.supportOptions?.(hero.value)??HEROES.filter(h=>h[0]!==hero.value).map(h=>({id:h[0],name:h[1],recommended:partners[hero.value]===h[0]})).sort((a,b)=>Number(b.recommended)-Number(a.recommended));support.replaceChildren();for(const row of rows)support.append(el('option',{value:row.id},row.name+(row.recommended?' · 콜라보 추천':'')));support.value=rows.some(r=>r.id===preferred)?preferred:rows[0]?.id||'';}
  refreshSupport();
  const localHost=el('input',{type:'checkbox',checked:!!pref.localHost}),localLabel=el('label',{className:'hapil-party-check'});localLabel.append(localHost,el('span',{},'호스트 컴퓨터에서 2명 플레이'));
  const hell=el('input',{type:'checkbox',checked:!!pref.hell}),hellLabel=el('label',{className:'hapil-party-check hapil-party-hell'});hellLabel.append(hell,el('span',{},'헬 모드 — 흡혈 70% 감소 · 적 체력/공격력/탄막/수 2배'));
  const roomCode=el('input',{type:'text',maxlength:'16',placeholder:'방 코드',autocomplete:'off',spellcheck:'false'});
  const p2Field=field('두 번째 플레이어',p2Hero),codeField=field('참가할 방 코드',roomCode);
  const supportField=field('보조 영웅 · 지원 / 콜라보',support);
  form.append(field('플레이 방식',mode),field('이름',name),field('내 영웅',hero),supportField,p2Field,localLabel,codeField,hellLabel);panel.append(form);
  const aiBox=el('div',{className:'hapil-party-ai'}),aiHeader=el('div',{className:'hapil-party-ai-header'}),aiCount=el('span',{},'AI 동료'),addAi=el('button',{type:'button'},'+ 동료 추가'),aiRows=el('div');aiHeader.append(aiCount,addAi);aiBox.append(aiHeader,aiRows);panel.append(aiBox);
  const aiSelects=[];
  function addAiRow(value){if(aiSelects.length>=7)return;const row=el('div',{className:'hapil-party-ai-row'}),s=selectHero(value),remove=el('button',{type:'button','aria-label':'AI 동료 제거'},'빼기');row.append(el('span',{},'AI'),s,remove);aiSelects.push(s);aiRows.append(row);remove.addEventListener('click',()=>{aiSelects.splice(aiSelects.indexOf(s),1);row.remove();renderForm();});renderForm();}
  const controls=el('p',{className:'hapil-party-controls'},'1P: 방향키 이동 · A 공격 · S/Space 대시 · Q/W/E 스킬 · R 궁극기\n2P: I/J/K/L 이동 · U 공격 · H 대시 · 7/8/9 스킬(O = 7) · P 궁극기\n다른 컴퓨터 참가자: 1P 키 사용. 공격은 가까운 적을 향합니다.');panel.append(controls);
  const networkHelp=el('p',{className:'hapil-party-help'},'LAN 실행 파일로 서버를 열고, 동료도 호스트의 게임 주소에 접속한 뒤 방 코드를 입력하세요. 인터넷에서는 외부에서 접속 가능한 호스트 주소가 필요합니다.');panel.append(networkHelp);
  const diagnostic=el('button',{type:'button'},'전투 진단 저장');diagnostic.addEventListener('click',()=>{const data=api()?.diagnostics?.();if(!data)return;const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=el('a',{href:url,download:'HAPIL-combat-diagnostic.json'});DOC.body.append(link);link.click();link.remove();W.setTimeout(()=>URL.revokeObjectURL(url),1000);});
  const buttons=el('div',{className:'hapil-party-buttons'}),apply=el('button',{type:'button',className:'hapil-party-primary'},'적용하고 돌아가기'),begin=el('button',{type:'button',className:'hapil-party-primary',hidden:''},'파티 출발'),leave=el('button',{type:'button',hidden:''},'방 나가기');buttons.append(apply,begin,leave,diagnostic);panel.append(buttons);
  const statusBox=el('div',{className:'hapil-party-status',role:'status','aria-live':'polite'}),roomInfo=el('div',{className:'hapil-party-room',hidden:''}),roomLabel=el('strong'),copy=el('button',{type:'button'},'방 주소 복사'),lobby=el('ul',{className:'hapil-party-lobby'});roomInfo.append(roomLabel,copy,lobby);panel.append(statusBox,roomInfo);
  const resumeSaved=readStore(W.sessionStorage,SESSION),resume=el('button',{type:'button',hidden:resumeSaved?'':undefined},'이전 연결 복원');if(resumeSaved){resume.removeAttribute('hidden');buttons.append(resume);}
  backdrop.append(panel);DOC.body.append(launcher,backdrop);
  const toast=el('div',{id:'hapil-party-connection',role:'status',hidden:''});DOC.body.append(toast);
  function say(message,error=false){statusBox.textContent=String(message);statusBox.classList.toggle('is-error',!!error);}
  function clearControls(){held.clear();edges.clear();lastLocal='';if(localMode)api()?.setInput?.('p2',{seq:++inputSeq,moveX:0,moveY:0,actions:actionState([])});}
  function setOpen(value){open=!!value;clearControls();backdrop.hidden=!open;launcher.setAttribute('aria-expanded',String(open));if(open){refreshSupport(api()?.supportHeroId||support.value);focusBefore=DOC.activeElement;W.dispatchEvent(new Event('blur'));panel.focus();renderForm();}else focusBefore?.focus?.();}
  function renderForm(){const connected=!!network?.session,m=mode.value;const count=1+(m==='local'||m==='host'&&localHost.checked?1:0)+aiSelects.length;aiCount.textContent=`AI 동료 · 총 ${count}/8명`;addAi.disabled=count>=8||connected;aiSelects.forEach(s=>s.disabled=connected);for(const b of aiRows.querySelectorAll('button'))b.disabled=connected;p2Field.hidden=!(m==='local'||m==='host'&&localHost.checked);localLabel.hidden=m!=='host';codeField.hidden=m!=='join';hellLabel.hidden=m==='join';supportField.hidden=m==='join';aiBox.hidden=m==='join';networkHelp.hidden=!['host','join'].includes(m);controls.hidden=m==='solo'&&aiSelects.length===0;for(const n of[mode,name,hero,support,p2Hero,localHost,hell,roomCode])n.disabled=connected||busy;apply.hidden=connected;apply.disabled=busy||count>8;apply.textContent=m==='host'?'방 만들기':m==='join'?'방 참가':'적용하고 돌아가기';}
  function networkChange(st){renderForm();roomInfo.hidden=!st.connected;leave.hidden=!st.connected;begin.hidden=!(st.connected&&st.isHost&&st.phase==='lobby');resume.hidden=st.connected||!resumeSaved;begin.disabled=busy;roomLabel.textContent=`방 코드 ${st.code} · ${st.phase==='lobby'?'출발 대기':isPlaying(st.phase)?'전투 중':'연결 상태 확인'}`;const key=JSON.stringify([st.roster,st.phase,st.paused,st.error]);if(key!==lastStatusKey){lastStatusKey=key;lobby.replaceChildren();for(const r of st.roster){const h=HEROES.find(h=>h[0]===r.heroId);lobby.append(el('li',{},`${r.slotId} · ${r.name||h?.[1]||'동료'} · ${h?.[1]||r.heroId} · ${r.kind==='ai'?'AI':r.kind==='local'?'같은 컴퓨터':r.connected===false?'연결 대기':'접속'}`));}if(st.error)say(`재연결 중: ${st.error}`,true);else if(st.connected)say(st.phase==='lobby'?(st.isHost?'동료 접속을 확인하고 파티 출발을 누르세요.':'호스트가 출발하면 같은 전투에 합류합니다.'):st.paused?'호스트 연결을 기다리고 있습니다.':'파티 전투가 진행 중입니다.');}
    toast.hidden=!st.connected||!st.reconnecting&&!st.paused;toast.textContent=st.reconnecting?'파티 서버 재연결 중 · 입력 대기':st.paused?'호스트 연결 대기':'';
    if(st.connected){localMode=st.isHost&&st.roster.some(r=>r.kind==='local');if(!st.isHost)hell.checked=!!network.hell;}
  }
  network=new PartyTransport({onChange:networkChange,readInput:()=>{if(inputBlocked())return{moveX:0,moveY:0,actions:[]};const v=inputFor(held,GUEST_MOVE,GUEST_ACTION);const actions=[...edges];edges.clear();if(v.actions.includes('attack'))actions.push('attack');return{moveX:v.moveX,moveY:v.moveY,actions:[...new Set(actions)]};}});
  exported.transport=network;exported.open=()=>setOpen(true);exported.close=()=>setOpen(false);
  function savePrefs(){writeStore(W.localStorage,PREFS,{mode:mode.value,name:name.value.trim(),hero:hero.value,supportHeroId:support.value,p2Hero:p2Hero.value,localHost:localHost.checked,hell:hell.checked,aiHeroes:aiSelects.map(s=>s.value)});}
  async function operation(fn){if(busy)return;busy=true;renderForm();begin.disabled=true;try{await fn();}catch(e){say(e.message||String(e),true);}finally{busy=false;renderForm();begin.disabled=false;}}
  apply.addEventListener('click',()=>operation(async()=>{if(!api())throw Error('게임을 불러오는 중입니다. 잠시 후 다시 눌러 주세요.');savePrefs();const config={name:name.value.trim()||'플레이어',heroId:hero.value,supportHeroId:support.value,hell:hell.checked,localPlayers:mode.value==='local'||mode.value==='host'&&localHost.checked?2:1,localHeroId:p2Hero.value,aiHeroes:aiSelects.map(s=>s.value)};if(mode.value==='host'){await network.create(config);hellApi()?.setEnabled?.(hell.checked);say('방을 만들었습니다. 동료를 기다린 뒤 파티 출발을 누르세요.');return;}if(mode.value==='join'){const code=roomCode.value.trim().toUpperCase();if(!code)throw Error('호스트가 알려 준 방 코드를 입력해 주세요.');await network.join({code,name:config.name,heroId:config.heroId});return;}localMode=mode.value==='local';const roster=[{slotId:'p1',heroId:hero.value,control:'host',name:config.name}];if(localMode)roster.push({slotId:'p2',heroId:p2Hero.value,control:'local',name:'플레이어 2'});for(const s of aiSelects)roster.push({slotId:`p${roster.length+1}`,heroId:s.value,control:'ai',name:HEROES.find(h=>h[0]===s.value)?.[1]});api().setNetworkRole?.('local');api().configure({mode:localMode?'local2':'solo',roster,hell:hell.checked,supportHeroId:support.value});hellApi()?.setEnabled?.(hell.checked);await api().startGame?.();setOpen(false);}));
  begin.addEventListener('click',()=>operation(async()=>{await network.begin();setOpen(false);}));leave.addEventListener('click',()=>operation(async()=>{await network.leave();localMode=false;clearControls();say('파티에서 나왔습니다.');}));
  resume.addEventListener('click',()=>operation(async()=>{network.resume(resumeSaved);say('이전 방의 전투 상태를 복원하는 중입니다.');}));
  copy.addEventListener('click',()=>operation(async()=>{const url=new URL(W.location.href);url.searchParams.set('party',network.session.code);url.hash='';try{await W.navigator.clipboard.writeText(url.toString());say('방 주소를 복사했습니다.');}catch{const text=el('textarea',{readonly:'','aria-label':'복사할 방 주소'});text.value=url.toString();roomInfo.append(text);text.select();say('표시된 주소를 복사해 동료에게 전달하세요.');}if(['localhost','127.0.0.1','::1'].includes(W.location.hostname))say('현재 주소는 이 컴퓨터 전용입니다. LAN 실행 창에 나온 IP 주소로 먼저 게임을 열고 복사해 주세요.');}));
  hero.addEventListener('change',()=>refreshSupport());mode.addEventListener('change',renderForm);localHost.addEventListener('change',renderForm);addAi.addEventListener('click',()=>addAiRow(HEROES[(aiSelects.length+1)%HEROES.length][0]));launcher.addEventListener('click',()=>setOpen(!open));close.addEventListener('click',()=>setOpen(false));backdrop.addEventListener('pointerdown',e=>{if(e.target===backdrop)setOpen(false);});
  const editing=target=>!!target?.closest?.('input,textarea,select,[contenteditable="true"]');
  function keyEvent(e,down){const isGuest=!!network.session&&!network.session.isHost;const maps=isGuest?[GUEST_MOVE,GUEST_ACTION]:[P2_MOVE,P2_ACTION];const owned=!!(maps[0][e.code]||maps[1][e.code]);
    if(open){if(e.code==='Escape'&&down){e.preventDefault();e.stopImmediatePropagation();setOpen(false);return;}if(e.code==='Tab'&&down){const nodes=[...panel.querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(n=>!n.disabled&&!n.hidden&&n.offsetParent!==null);if(nodes.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&DOC.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&DOC.activeElement===last){e.preventDefault();first.focus();}}}e.stopImmediatePropagation();return;}
    if(editing(e.target)){clearControls();e.stopImmediatePropagation();return;}
    if(down&&(e.ctrlKey||e.metaKey||e.altKey))return;
    if(isGuest&&['KeyF','KeyG','KeyT','Tab'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();return;}
    if(!(isGuest||localMode)||!owned)return;
    if(inputBlocked()){clearControls();e.preventDefault();e.stopImmediatePropagation();return;}
    e.preventDefault();e.stopImmediatePropagation();if(down){held.add(e.code);if(!e.repeat&&maps[1][e.code])edges.add(maps[1][e.code]);}else held.delete(e.code);
  }
  W.addEventListener('keydown',e=>keyEvent(e,true),true);W.addEventListener('keyup',e=>keyEvent(e,false),true);W.addEventListener('blur',clearControls);DOC.addEventListener('visibilitychange',clearControls);DOC.addEventListener('focusin',e=>{if(editing(e.target)){clearControls();W.dispatchEvent(new Event('blur'));}});
  W.setInterval(()=>{if(!localMode||network.session&&!network.session.isHost)return;const value=inputBlocked()?{moveX:0,moveY:0,actions:[]}:inputFor(held,P2_MOVE,P2_ACTION),key=JSON.stringify(value);lastLocal=key;api()?.setInput?.('p2',{seq:++inputSeq,moveX:value.moveX,moveY:value.moveY,actions:actionState(value.actions)});},50);
  W.addEventListener('pagehide',()=>{clearControls();if(network.session)writeStore(W.sessionStorage,SESSION,{...network.session,phase:network.phase,origin:W.location.origin});});
  for(const h of Array.isArray(pref.aiHeroes)?pref.aiHeroes.slice(0,7):[])addAiRow(validHero(h));
  try{const code=new URL(W.location.href).searchParams.get('party');if(code){mode.value='join';roomCode.value=code.slice(0,16);setOpen(true);}}catch{}
  const hud=el('aside',{id:'hapil-party-hud','aria-label':'파티 영웅 상태',hidden:''}),hudHead=el('div',{className:'hapil-party-hud-head'}),hudTitle=el('strong',{},'내 동료'),hudFold=el('button',{type:'button','aria-label':'파티 상태 접기'},'접기'),hudBody=el('div',{className:'hapil-party-hud-body'}),hudList=el('div'),hudHelp=el('p',{className:'hapil-party-hud-help'}),hudMore=el('button',{type:'button'},'동료 보기');
  hudHead.append(hudTitle,hudFold);hudBody.append(hudList,hudHelp,hudMore);hud.append(hudHead,hudBody);DOC.body.append(hud);
  let hudClosed=finite(W.innerWidth,1280)<600,hudAll=false,hudKey='';
  hudBody.hidden=hudClosed;hudFold.textContent=hudClosed?'펼치기':'접기';
  hudFold.addEventListener('click',()=>{hudClosed=!hudClosed;hudBody.hidden=hudClosed;hudFold.textContent=hudClosed?'펼치기':'접기';hudFold.setAttribute('aria-expanded',String(!hudClosed));});
  hudMore.addEventListener('click',()=>{hudAll=!hudAll;hudKey='';updateHud();});
  const textIfChanged=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
  function updateHud(){const core=api(),state=core?.state,status=getStatus(core),slots=status.slots||[],self=network.session&&!network.session.isHost?network.session.slotId:'p1';
    hud.hidden=!status.ready||!(slots.length>1||network.session&&!network.session.isHost);if(hud.hidden)return;
    const localTwo=localMode,rows=hudRows(status,core?.actors||[],state,self,localTwo,hudAll),others=Math.max(0,slots.length-rows.length),live=slots.filter(s=>finite(s.hp)>0&&!s.down).length;
    textIfChanged(hudTitle,network.session&&!network.session.isHost?`내 영웅 · ${self.toUpperCase()}`:localTwo?'1P · 2P 전투 상태':`내 영웅 · 동료 ${slots.length-1}명`);
    hudMore.hidden=slots.length<=(localTwo?2:1);textIfChanged(hudMore,hudAll?'다른 동료 접기':`동료 ${others}명 보기 · ${live}/${slots.length} 생존`);
    textIfChanged(hudHelp,network.session&&!network.session.isHost?'내 스킬은 이 패널 기준 · 방향키/A/S/QWE/R':localTwo?'2P: IJKL 이동 · U 공격 · H 대시 · 789/P 스킬':'파티·난이도 버튼에서 동료를 구성하세요.');
    const key=JSON.stringify(rows);if(key===hudKey)return;hudKey=key;hudList.replaceChildren();
    for(const r of rows){const card=el('div',{className:`hapil-party-hud-row${r.self?' is-self':''}${r.down?' is-down':''}`}),label=el('div',{className:'hapil-party-hud-name'}),tag=r.self?'내 영웅':r.localTwo?'2P':r.control==='ai'?'AI':r.slotId.toUpperCase(),nameLabel=el('span',{title:`${r.name} · ${r.heroName}`},`${tag} · ${r.heroName}`),hp=el('span',{},r.down?(r.reviveIn?`부활 ${r.reviveIn}초`:'쓰러짐'):`${r.hp}/${r.maxHp}`);nameLabel.style?.setProperty?.('color',r.color);label.append(nameLabel,hp);const bar=el('progress',{max:String(r.maxHp),value:String(r.hp),'aria-label':`${tag} ${r.heroName} 체력`});bar.style?.setProperty?.('accent-color',r.color);card.append(label,bar);
      if(r.self||r.localTwo||localTwo&&r.slotId==='p1'){const cds=el('div',{className:'hapil-party-hud-cds'}),keys=r.localTwo?['7','8','9','P']:['Q','W','E','R'];r.cooldowns.forEach((t,i)=>cds.append(el('span',{className:!t&&!r.down?'is-ready':''},`${keys[i]} ${r.down?'—':t?`${t}s`:'준비'}`)));card.append(cds);}hudList.append(card);
    }
  }
  W.setInterval(updateHud,150);exported.updateHud=updateHud;
  renderForm();exported.installed=true;
})();
