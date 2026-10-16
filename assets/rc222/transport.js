/* RC222: opt-in WebSocket relay transport. No socket is opened until create/join/resume. */
(function (root) {
  'use strict';
  const VERSION = 1, GAME = 'hapil';
  const KEYS = Object.freeze({session:'hapil.remote.rc222.session', preferences:'hapil.remote.rc222.preferences', endpoint:'hapil.remote.rc222.endpoint'});
  const ACTIONS = new Set(['attack','dash','q','w','e','r','time','guard','resonance','collab','chargeStart','chargeRelease','reviveSamong','reviveCheckpoint','autoMode']);
  const HEROES = Object.freeze([['hwando','환도영웅'],['gunner','기억사수'],['seoha','윤서하'],['neon','네온 성기사'],['michaela','미카엘라'],['lauren','라우렌'],['hunter','피의 궁수'],['slayer','피의 검사']]);
  const encoder=typeof root.TextEncoder==='function'?new root.TextEncoder():null;
  const wireBytes=value=>typeof value==='string'?(encoder?encoder.encode(value).byteLength:unescape(encodeURIComponent(value)).length):finite(value?.byteLength);
  const finite = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const clamp = v => Math.max(-1, Math.min(1, finite(v)));
  const read = (storage,key) => { try { return JSON.parse(storage?.getItem(key) || 'null'); } catch (_) { return null; } };
  const write = (storage,key,value) => { try { value == null ? storage?.removeItem(key) : storage?.setItem(key,JSON.stringify(value)); } catch (_) {} };
  function endpointURL(value) {
    if (!String(value || '').trim()) throw new Error('연결 설정에서 중계 서버 주소를 입력해 주세요. 혼자하기는 서버 없이 이용할 수 있습니다.');
    let url; try { url = new URL(String(value).trim()); } catch (_) { throw new Error('올바른 wss:// 중계 서버 주소를 입력해 주세요.'); }
    const loopback = ['localhost','127.0.0.1','[::1]','::1'].includes(url.hostname);
    if (url.protocol !== 'wss:' && !(url.protocol === 'ws:' && loopback)) throw new Error('인터넷 연결은 wss:// 주소가 필요합니다. ws://는 이 컴퓨터에서만 사용할 수 있습니다.');
    if (url.username || url.password || url.hash) throw new Error('인증 정보나 # 없이 중계 서버 주소를 입력해 주세요.');
    return url.href;
  }
  function initialEndpoint() {
    try { return new URLSearchParams(root.location?.search || '').get('relay') || root.__HAPIL_REMOTE_CONFIG_RC222__?.relayURL || root.__HAPIL_REMOTE_CONFIG__?.relayURL || read(root.localStorage,KEYS.endpoint) || ''; } catch (_) { return ''; }
  }
  class RemoteTransport {
    constructor(options = {}) {
      this.WebSocket = options.WebSocket || root.WebSocket;
      this.setTimer = options.setTimer || root.setTimeout.bind(root);
      this.clearTimer = options.clearTimer || root.clearTimeout.bind(root);
      this.now = options.now || Date.now;
      this.sessionStore = options.sessionStorage || options.sessionStore || root.sessionStorage;
      this.preferencesStore = options.localStorage || root.localStorage;
      this.endpoint = options.endpoint || initialEndpoint();
      this.adapter = options.runtimeAdapter || {};
      this.inputReader = options.readInput || (() => ({moveX:0,moveY:0,actions:[]}));
      this.listeners = new Set(options.onChange ? [options.onChange] : []);
      this.session = null; this.roster = []; this.phase = 'offline'; this.error = ''; this.socket = null;
      this.pending = new Map(); this.timers = new Map(); this.requestSeq = 0; this.inputSeq = 0; this.snapshotSeq = 0; this.receivedSeq = -1; this.epoch = 0;
      this.inputSequences = new Map(); this.lastReceive = 0; this.lastSnapshot = 0; this.lastInput = new Map(); this.retries = 0; this.retrySince = 0;
      this.latency = null; this.hostHidden = false; this.hostPaused = false; this.hidden = false; this.manualClose = false; this.started = false;
      this.bytesSent=0;this.bytesReceived=0;this.messagesSent=0;this.messagesReceived=0;
      this.loadedEpoch = -1; this.transitionEpoch = -1; this.lastZone = null; this.generation = 0; this.messageChain = Promise.resolve();
    }
    status() {
      return {connected:!!this.session && this.socket?.readyState === 1,isHost:!!this.session?.isHost,slotId:this.session?.slotId || '',roomCode:this.session?.roomCode || '',code:this.session?.roomCode || '',phase:this.phase,roster:this.roster.map(r=>({...r})),mode:this.session?.mode || 'STORY',epoch:this.epoch,latency:this.latency,bytesSent:this.bytesSent,bytesReceived:this.bytesReceived,messagesSent:this.messagesSent,messagesReceived:this.messagesReceived,stale:!!this.session&&!this.session.isHost&&this.phase==='playing'&&this.now()-this.lastSnapshot>3000,hostHidden:this.hostHidden,hostPaused:this.hostPaused,reconnecting:this.phase==='reconnecting',error:this.error,endpoint:this.endpoint,canResume:!!this.savedSession(),ready:this.roster.find(r=>r.slotId===this.session?.slotId)?.ready===true};
    }
    emit() { const state=this.status(); for(const listener of this.listeners) { try { listener(state); } catch (_) {} } return state; }
    onChange(listener) { this.listeners.add(listener); listener(this.status()); return ()=>this.listeners.delete(listener); }
    setRuntimeAdapter(adapter) { this.adapter=adapter||{}; if(this.session) { this.call('attach',this.runtimeState()); this.call('updateRoom',this.runtimeState()); } return this; }
    setInputReader(reader) { this.inputReader=reader; return this; }
    call(method,...args) { return this.adapter?.[method]?.(...args); }
    isCurrent(generation,session) { return generation===this.generation&&session===this.session; }
    runtimeState() { return {...this.status(),session:this.session ? {...this.session} : null}; }
    setEndpoint(value) { this.endpoint=value ? endpointURL(value) : ''; write(this.preferencesStore,KEYS.endpoint,this.endpoint); this.emit(); return this.endpoint; }
    savedSession() { const saved=read(this.sessionStore,KEYS.session); return saved?.sessionId && saved?.resumeToken && !saved.isHost ? saved : null; }
    persist() { write(this.sessionStore,KEYS.session,this.session ? {...this.session,endpoint:this.endpoint,savedAt:this.now()} : null); }
    timer(key,fn,delay) { this.cancelTimer(key); const id=this.setTimer(()=>{this.timers.delete(key);fn();},delay);this.timers.set(key,id); }
    cancelTimer(key) { if(this.timers.has(key))this.clearTimer(this.timers.get(key));this.timers.delete(key); }
    stopTimers() { for(const id of this.timers.values())this.clearTimer(id);this.timers.clear(); }
    send(type,data={}) {
      if(this.socket?.readyState !== 1)return false;
      const raw=JSON.stringify({v:VERSION,gameId:GAME,type,...data});this.socket.send(raw);this.bytesSent+=wireBytes(raw);this.messagesSent++;return true;
    }
    request(type,data={}) {
      const requestId=`rc222-${++this.requestSeq}`;
      return new Promise((resolve,reject)=>{
        const timer=this.setTimer(()=>{this.pending.delete(requestId);reject(new Error('중계 서버 응답 시간이 초과되었습니다.'));},10000);
        this.pending.set(requestId,{resolve,reject,timer});
        if(!this.send(type,{...data,requestId})){this.clearTimer(timer);this.pending.delete(requestId);reject(new Error('중계 서버에 연결되지 않았습니다.'));}
      });
    }
    rejectPending(message) { for(const p of this.pending.values()){this.clearTimer(p.timer);p.reject(new Error(message));}this.pending.clear(); }
    async connect() {
      const endpoint=endpointURL(this.endpoint);
      if(!this.WebSocket)throw new Error('이 브라우저는 WebSocket 연결을 지원하지 않습니다.');
      if(this.socket?.readyState===1)return;
      this.manualClose=false;const generation=++this.generation;this.messageChain=Promise.resolve();
      await new Promise((resolve,reject)=>{
        const socket=new this.WebSocket(endpoint);this.socket=socket;let opened=false;
        const connectTimer=this.setTimer(()=>{reject(new Error('중계 서버에 연결하지 못했습니다. 주소와 서버 상태를 확인해 주세요.'));socket.close();},10000);
        socket.onopen=()=>{if(generation!==this.generation){socket.close();return;}opened=true;this.clearTimer(connectTimer);this.lastReceive=this.now();resolve();};
        socket.onmessage=event=>{if(generation!==this.generation)return;this.bytesReceived+=wireBytes(event.data);this.messagesReceived++;let message;try{message=JSON.parse(event.data);}catch(_){return;}
          if(message.v!==VERSION||message.gameId!==GAME)return;
          this.lastReceive=this.now();this.messageChain=this.messageChain.then(()=>{if(generation===this.generation)return this.receive(message,generation);}).catch(error=>{if(generation!==this.generation)return;this.error=error.message;this.releaseInputs('sync-error');this.emit();});
        };
        socket.onerror=()=>{if(!opened){this.clearTimer(connectTimer);reject(new Error('중계 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'));}};
        socket.onclose=()=>{this.clearTimer(connectTimer);if(!opened)reject(new Error('중계 서버 연결이 닫혔습니다.'));if(generation===this.generation)this.disconnected();};
      });
    }
    async open(type,data) {
      if(this.session)await this.leave();
      this.error='';this.phase='connecting';this.emit();
      try { await this.connect();const reply=await this.request(type,data);return this.status(); }
      catch(error){this.error=error.message;if(!this.session){this.phase='offline';this.closeSocket();}this.emit();throw error;}
    }
    create(config={}) { return this.open('create',{nickname:String(config.nickname||config.name||'플레이어').trim().slice(0,24),heroId:config.heroId||'hwando',mode:config.mode||'STORY'}); }
    join(config={}) { const code=String(config.code||'').trim().toUpperCase();if(!code)return Promise.reject(new Error('방 코드를 입력해 주세요.'));return this.open('join',{code,nickname:String(config.nickname||config.name||'플레이어').trim().slice(0,24),heroId:config.heroId||'hwando'}); }
    async resume(saved=this.savedSession()) {
      if(!saved?.sessionId||!saved?.resumeToken)throw new Error('복원할 참가 연결이 없습니다.');
      if(saved.isHost)throw new Error('호스트의 연결이 끝난 방은 복원할 수 없습니다.');
      this.endpoint=saved.endpoint||this.endpoint;this.error='';this.phase='reconnecting';this.emit();
      try{await this.connect();await this.request('resume',{sessionId:saved.sessionId,resumeToken:saved.resumeToken});return this.status();}
      catch(error){this.error=error.message;this.emit();throw error;}
    }
    ready(ready=true) { return this.request('ready',{ready:!!ready}); }
    profile(profile) { return this.request('profile',{nickname:String(profile.nickname||'플레이어').trim().slice(0,24),heroId:profile.heroId||'hwando'}); }
    start() { if(!this.session?.isHost)return Promise.reject(new Error('호스트만 출발할 수 있습니다.'));return this.request('start'); }
    async receive(message,generation=this.generation) {
      if(generation!==this.generation)return;
      let session=this.session;
      const data=message.session||message;
      if(message.type==='error') {
        const error=new Error(message.message||message.error||message.code||'연결 요청에 실패했습니다.');
        const pending=this.pending.get(message.requestId);if(pending){this.clearTimer(pending.timer);this.pending.delete(message.requestId);pending.reject(error);}
        this.error=error.message;
        if(['room_closed','host_left','invalid_token','session_expired','room_not_found','resume_denied'].includes(message.code||message.error))this.finish(error.message);
        this.emit();return;
      }
      if(message.type==='session') {
        if(!data.sessionId||!data.resumeToken||!/^p[1-4]$/.test(data.slotId))throw new Error('중계 서버의 참가 정보가 올바르지 않습니다.');
        const continuing=this.session?.sessionId===data.sessionId;
        this.session=session={sessionId:data.sessionId,resumeToken:data.resumeToken,slotId:data.slotId,isHost:data.isHost===true,roomCode:data.roomCode||data.code,mode:data.mode||'STORY'};
        this.roster=(data.roster||[]).slice(0,4);this.phase=data.phase||'lobby';this.epoch=finite(data.epoch);this.snapshotSeq=Math.max(this.snapshotSeq,finite(data.seq));this.retries=0;this.retrySince=0;this.error='';this.hostHidden=!!(data.hostStatus?.hidden??data.hostHidden);this.hostPaused=!!(data.hostStatus?.paused??data.hostPaused);
        if(!continuing){this.started=false;this.receivedSeq=-1;this.loadedEpoch=-1;this.transitionEpoch=-1;this.lastZone=null;this.lastSentSnapshot=0;this.lastFullSnapshot=0;this.inputSeq=0;this.inputSequences.clear();}
        this.persist();await this.call('attach',this.runtimeState());if(!this.isCurrent(generation,session))return;await this.call('updateRoom',this.runtimeState());if(!this.isCurrent(generation,session))return;
        this.call('role',this.phase==='playing'?(this.session.isHost?'host':'guest'):'disconnected');
        if(data.snapshot&&!this.session.isHost)await this.applySnapshot({...data,type:'transition'},true);
        if(!this.isCurrent(generation,session))return;
        await this.syncPhase();if(!this.isCurrent(generation,session))return;this.scheduleTick();
      } else if(message.type==='room') {
        if(!this.session)return;
        this.error='';const nextRoster=(message.roster||this.roster).slice(0,4);for(const previous of this.roster)if(!nextRoster.some(row=>row.slotId===previous.slotId)){this.inputSequences.delete(previous.slotId);this.lastInput.delete(previous.slotId);this.call('releaseInputs','member-left',previous.slotId);}for(const row of nextRoster){const previous=this.roster.find(r=>r.slotId===row.slotId);if(row.connected===false||previous?.connected===false&&row.connected!==false){this.inputSequences.delete(row.slotId);this.lastInput.delete(row.slotId);this.call('releaseInputs','member-reconnect',row.slotId);}}this.roster=nextRoster;this.phase=message.phase||this.phase;this.epoch=Math.max(this.epoch,finite(message.epoch));if(message.mode)this.session.mode=message.mode;
        await this.call('updateRoom',this.runtimeState());if(!this.isCurrent(generation,session))return;await this.syncPhase();
      } else if(message.type==='input') {
        if(!this.session?.isHost||!/^p[2-4]$/.test(message.slotId)||this.phase!=='playing')return;
        const seq=finite(message.seq,-1);if(seq<=(this.inputSequences.get(message.slotId)??-1))return;
        const previous=this.inputSequences.get(message.slotId);if(previous!==undefined&&seq>previous+1)this.call('releaseInputs','input-gap',message.slotId);
        this.inputSequences.set(message.slotId,seq);this.lastInput.set(message.slotId,this.now());
        await this.call('input',message.slotId,{seq,moveX:clamp(message.moveX),moveY:clamp(message.moveY),aimX:finite(message.aimX),aimY:finite(message.aimY),actions:[...new Set((message.actions||[]).filter(a=>ACTIONS.has(a)))],guardHeld:message.guardHeld===true,attackHeld:message.attackHeld===true,attackReleased:message.attackReleased===true,autoMode:message.autoMode===true,combatMode:['manual','semi','full'].includes(message.combatMode)?message.combatMode:'manual'});
      } else if(message.type==='snapshot'||message.type==='transition') {
        if(this.session&&!this.session.isHost)await this.applySnapshot(message,message.type==='transition');
      } else if(message.type==='barrier') {
        this.error='';this.phase=message.phase||'playing';this.epoch=Math.max(this.epoch,finite(message.epoch));await this.syncPhase();
      } else if(message.type==='host_status') {
        this.hostHidden=message.hidden===true;this.hostPaused=message.paused===true;
        if(this.hostHidden||this.hostPaused)this.releaseInputs('host-paused');
        this.call('hostStatus',{hidden:this.hostHidden,paused:this.hostPaused});
      } else if(message.type==='resync_required') {this.releaseInputs('resync-required');this.call('role','disconnected');this.receivedSeq=-1;} else if(message.type==='pong') {this.latency=Math.max(0,this.now()-finite(message.sentAt,this.now()));}
      else if(['closed','room_closed','host_left'].includes(message.type)){this.finish(message.message||'호스트가 방을 닫았습니다. 방 만들기 또는 방 코드로 참가해 주세요.');return;}
      if(!this.isCurrent(generation,session))return;
      const pending=this.pending.get(message.requestId);if(pending){this.clearTimer(pending.timer);this.pending.delete(message.requestId);pending.resolve(message);}
      this.emit();
    }
    async syncPhase() {
      const generation=this.generation,session=this.session;
      if(!session)return;
      if(['loading','playing'].includes(this.phase)&&!this.started){const started=await this.call('start',this.runtimeState());if(!this.isCurrent(generation,session)||started===false)return;this.started=true;}
      this.call('role',this.phase==='playing'&&(this.session.isHost||!this.hostPaused&&!this.hostHidden)?(this.session.isHost?'host':'guest'):'disconnected');
      if(this.phase==='loading'&&this.session.isHost&&this.loadedEpoch!==this.epoch)await this.publishTransition();
    }
    async applySnapshot(message,transition) {
      const generation=this.generation,session=this.session;if(!session)return;
      const epoch=finite(message.epoch),seq=finite(message.seq,-1);
      if(epoch<this.epoch||epoch===this.epoch&&seq<=this.receivedSeq)return;
      if(epoch>this.epoch||seq>this.receivedSeq+1)this.releaseInputs('snapshot-gap');
      if(!this.started){const started=await this.call('start',this.runtimeState());if(!this.isCurrent(generation,session)||started===false)return;this.started=true;}
      let accepted;try{accepted=await this.call('snapshot',message.snapshot,{seq,epoch,full:message.full===true||message.snapshot?.rc222?.full===true||transition||message.resync===true,resync:message.resync===true,transition});}catch(_){accepted=false;}
      if(!this.isCurrent(generation,session))return;
      if(accepted===false){this.send('leave');this.finish('호스트의 전투 상태를 불러오지 못해 방에서 나왔습니다. 게임을 새로고침한 뒤 방 코드로 다시 참가해 주세요.');return false;}
      this.error='';this.epoch=epoch;this.receivedSeq=seq;this.lastSnapshot=this.now();
      if(transition||this.loadedEpoch!==epoch){this.loadedEpoch=epoch;this.send('loaded',{epoch});}
      this.call('role',this.phase==='playing'&&!this.hostPaused&&!this.hostHidden?'guest':'disconnected');
    }
    async publishTransition(zone) {
      const generation=this.generation,session=this.session;
      if(!session?.isHost)return false;
      const snapshot=await this.call('exportSnapshot',{full:true});if(!this.isCurrent(generation,session)||!snapshot)return false;
      const epoch=this.epoch+1;this.transitionEpoch=epoch;this.epoch=epoch;this.loadedEpoch=epoch;this.lastZone=zone??this.call('status')?.zone;
      this.releaseInputs('transition');this.phase='loading';this.call('role','disconnected');
      const sent=this.send('transition',{epoch,zone:this.lastZone??null,seq:++this.snapshotSeq,snapshot});
      if(sent)this.send('loaded',{epoch});this.emit();return sent;
    }
    scheduleTick() { const generation=this.generation,session=this.session;this.timer('tick',()=>{if(!this.isCurrent(generation,session))return;this.tick().catch(error=>{if(!this.isCurrent(generation,session))return;this.error=error.message;this.emit();}).finally(()=>{if(this.isCurrent(generation,session)&&this.session&&this.socket?.readyState===1)this.scheduleTick();});},50); }
    async tick() {
      const generation=this.generation,session=this.session;
      if(!session||this.socket?.readyState!==1)return;
      const now=this.now();
      if(this.session.isHost) {
        for(const [slot,last] of this.lastInput)if(now-last>300){this.call('releaseInputs','stale-input',slot);this.lastInput.delete(slot);}
        const status=this.call('status')||{};
        if(status.ended===true){await this.leave();return;}
        const hidden=this.hidden,paused=this.phase==='playing'&&!!status.paused;
        if(hidden!==this.hostHidden||paused!==this.hostPaused||!this.lastHostStatus||now-this.lastHostStatus>=1000){this.hostHidden=hidden;this.hostPaused=paused;this.lastHostStatus=now;this.send('host_status',{hidden,paused});}
        if(this.started&&this.phase==='loading'&&this.loadedEpoch!==this.epoch)await this.publishTransition(status.zone);
        if(!this.isCurrent(generation,session))return;
        if(this.phase==='playing'&&status.ready!==false) {
          const changedZone=status.zone!==undefined&&this.lastZone!==null&&status.zone!==this.lastZone;
          if(changedZone&&!hidden){await this.publishTransition(status.zone);return;}
          if(this.lastZone===null)this.lastZone=status.zone??null;
          const snapshotInterval=hidden?1000:paused?500:100;
          // Paused exports capture the current story/HUD without stepping native simulation.
          if(!(changedZone&&hidden)&&(!this.lastSentSnapshot||now-this.lastSentSnapshot>=snapshotInterval)){const full=!this.lastFullSnapshot||now-this.lastFullSnapshot>=2000;const snapshot=await this.call('exportSnapshot',{full});if(!this.isCurrent(generation,session))return;if(snapshot){this.send('snapshot',{seq:++this.snapshotSeq,epoch:this.epoch,snapshot});this.lastSentSnapshot=now;if(full)this.lastFullSnapshot=now;}}
        }
      } else if(this.phase==='playing') {
        const stale=now-this.lastSnapshot>3000;
        if(stale||this.hostHidden||this.hostPaused||this.hidden){this.releaseInputs(stale?'stale-host':'paused');this.call('role','disconnected');}
        else {this.call('role','guest');const input=this.adapter?.readInput ? this.call('readInput') : this.inputReader();this.sendInput(input||{});}
      }
      if(now-this.lastReceive>15000){this.releaseInputs('timeout');this.socket.close();return;}
      if(!this.lastPing||now-this.lastPing>=5000){this.lastPing=now;this.send('ping',{sentAt:now});}
      this.emit();
    }
    sendInput(input={}) { return this.send('input',{seq:++this.inputSeq,moveX:clamp(input.moveX),moveY:clamp(input.moveY),aimX:finite(input.aimX),aimY:finite(input.aimY),actions:[...new Set([...(input.actions||[]),...(input.attackHeld?['attack']:[]),...(input.guardHeld?['guard']:[]),...(input.attackReleased?['chargeRelease']:[])].filter(a=>ACTIONS.has(a)))],autoMode:input.autoMode===true,combatMode:['manual','semi','full'].includes(input.combatMode)?input.combatMode:'manual'}); }
    releaseInputs(reason) { this.call('releaseInputs',reason);if(this.session&&!this.session.isHost&&this.phase==='playing'&&this.loadedEpoch===this.epoch)this.sendInput({}); }
    setHidden(hidden) {this.hidden=!!hidden;this.releaseInputs('visibility');if(this.session?.isHost){this.hostHidden=this.hidden;this.send('host_status',{hidden:this.hidden,paused:this.hostPaused});}this.emit();}
    disconnected() {
      this.rejectPending('중계 서버 연결이 끊겼습니다.');this.cancelTimer('tick');this.releaseInputs('disconnect');this.call('role','disconnected');
      if(this.manualClose||!this.session)return;
      if(this.session.isHost){this.finish('호스트 연결이 끊겨 방이 닫혔습니다. 새 방을 만들어 주세요.');return;}
      this.phase='reconnecting';this.error='연결을 복원하고 있습니다. 참가 자리는 최대 60초 동안 유지됩니다.';if(!this.retrySince)this.retrySince=this.now();this.emit();this.scheduleRetry();
    }
    scheduleRetry() {
      if(this.now()-this.retrySince>=60000){this.finish('참가 연결 복원 시간이 만료되었습니다. 방 코드로 다시 참가해 주세요.');return;}
      const delay=Math.min(8000,500*2**Math.min(this.retries++,4));
      this.timer('reconnect',()=>{const saved=this.savedSession();if(!saved){this.finish('참가 연결이 만료되었습니다.');return;}this.resume(saved).catch(()=>{this.closeSocket();if(this.session)this.scheduleRetry();});},delay);
    }
    closeSocket() {this.manualClose=true;++this.generation;const socket=this.socket;this.socket=null;if(socket&&socket.readyState<2)socket.close();}
    finish(message='') {this.stopTimers();this.closeSocket();this.rejectPending(message||'방 연결이 종료되었습니다.');this.releaseInputs('leave');this.call('leave');this.session=null;this.roster=[];this.phase='offline';this.started=false;this.error=message;write(this.sessionStore,KEYS.session,null);this.emit();}
    async leave() {this.send('leave');this.finish();return this.status();}
  }
  const exported = {RemoteTransport,keys:KEYS,heroes:HEROES,endpointURL};
  if(typeof module!=='undefined'&&module.exports)module.exports=exported;
  if(root.document){const instance=new RemoteTransport();Object.assign(instance,exported);root.__HAPIL_REMOTE_RC222__=instance;root.addEventListener?.('blur',()=>instance.releaseInputs('blur'));root.document.addEventListener?.('visibilitychange',()=>instance.setHidden(root.document.hidden));}
})(typeof window!=='undefined'?window:globalThis);
