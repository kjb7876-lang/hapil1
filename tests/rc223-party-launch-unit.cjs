'use strict';

// Source-backed regression for the same-task Party configure -> launch path.
// The production native `configure` and React `setLeader` bodies, plus the
// launch callback, are extracted from the shipped bundle and run in a VM with
// controlled game/render dependencies.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
let acorn;
for(const prefix of [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,process.env.NODE_PATH,'/tmp/rc221-deps/node_modules','/tmp/hapil1-rc221-runtime/node_modules'].filter(Boolean)){
  try{acorn=require(path.join(prefix,'acorn'));break;}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
}
acorn??=require('acorn');

const root=path.resolve(__dirname,'..');
const bundle=fs.readFileSync(process.env.RC223_PARTY_LAUNCH_SOURCE||path.join(root,'assets/index-v31526.js'),'utf8');
const ast=acorn.parse(bundle,{ecmaVersion:'latest',sourceType:'script'});
let checks=0;
const eq=(actual,expected,message)=>{assert.equal(actual,expected,message);checks++;};
const ok=(actual,message)=>{assert.ok(actual,message);checks++;};
function walk(node,visit){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')visit(node);
  for(const [key,value]of Object.entries(node)){
    if(key==='start'||key==='end'||key==='loc')continue;
    if(Array.isArray(value))for(const child of value)walk(child,visit);
    else if(value&&typeof value==='object'&&typeof value.type==='string')walk(value,visit);
  }
}
function find(predicate){let result=null;walk(ast,node=>{if(!result&&predicate(node))result=node;});return result;}
const atDeclaration=find(node=>node.type==='VariableDeclarator'&&node.id?.name==='at'&&node.init?.type==='CallExpression'&&node.init.arguments?.[0]?.type==='ArrowFunctionExpression');
const configureDeclaration=find(node=>node.type==='FunctionDeclaration'&&node.id?.name==='configure'&&bundle.slice(node.start,node.end).includes('window.__HAPIL_RUN_V31400__.prepare(config,world)'));
const cleanRosterDeclaration=find(node=>node.type==='FunctionDeclaration'&&node.id?.name==='cleanRoster');
const launchAssignment=find(node=>node.type==='AssignmentExpression'&&node.left?.type==='MemberExpression'&&node.left.property?.name==='__HAPIL_PARTY_LAUNCH_V31322__'&&node.right?.type==='ObjectExpression');
ok(!!atDeclaration,'actual React launch callback is located');
ok(!!configureDeclaration,'actual native Party configure function is located');
ok(!!cleanRosterDeclaration,'actual native Party roster sanitizer is located');
ok(!!launchAssignment,'actual launch API object is located');
const setLeaderProperty=launchAssignment.right.properties.find(property=>property.type==='Property'&&property.key?.name==='setLeader');
ok(!!setLeaderProperty,'actual synchronous setLeader method is located');
const launchSource=bundle.slice(atDeclaration.init.arguments[0].start,atDeclaration.init.arguments[0].end);
const configureSource=bundle.slice(configureDeclaration.start,configureDeclaration.end);
const cleanRosterSource=bundle.slice(cleanRosterDeclaration.start,cleanRosterDeclaration.end);
const setLeaderSource=bundle.slice(setLeaderProperty.value.start,setLeaderProperty.value.end);

const heroes=[
  {id:'hwando',name:'Hwando',portrait:'hwando.png',sprite:'hwando-sprite.png'},
  {id:'slayer',name:'Slayer',portrait:'slayer.png',sprite:'slayer-sprite.png'},
  {id:'gunner',name:'Gunner',portrait:'gunner.png',sprite:'gunner-sprite.png'},
];
const inputRoster=[
  {slotId:'p1',heroId:'slayer',control:'host',name:'Player 1'},
  {slotId:'p2',heroId:'gunner',control:'local',name:'Player 2'},
];

function fixture({renderHero='hwando',leader='slayer',invalidRef=false}={}){
  const updates=[],calls={preloaded:[],runInit:[],configFor:[],nativePartyConfig:[],partyMode:[]},state={activeHeroId:'hwando',zone:'',enemies:[]};
  const window={__MONGSE_DEPLOYING__:false,setTimeout};
  const context={
    console:{warn(){},error(...args){throw new Error(args.map(String).join(' '));}},
    window,Image:class{constructor(){this.complete=true;this.naturalWidth=1;this.src='';}},
    F:heroes,L:{current:'hwando'},a:value=>updates.push(value),
    N:{dist00:{map:'dist00-map.png'}},fn:{},MONGSE_ACTION4:{},MONGSE_HWANDO_ACTION4:{},MONGSE_HERO_ACTIONS3126:{},
    MONGSE_corePlayableRosterV31235:()=>heroes,
    MONGSE_assetUrl:value=>value,
    HAPIL_scopeGenerationRC222:()=>1,
    HAPIL_setLaunchRC52:value=>{context.launchStatus=typeof value==='function'?value(context.launchStatus??{}):value;},
    HAPIL_waitForLaunchRC61:async()=>{},
    MONGSE_modeChoiceRefV31353:{current:'STORY'},
    MONGSE_unlockAudio(){},
    P:{current:null},oi:()=>state,Pe:{current:{}},Ve:{current:null},
    windowLaunchState:null,
    MONGSE_seenInterludeSources31229:{current:new Set()},MONGSE_interludeBypass:{current:''},MONGSE_interludeRef:{current:null},
    Le:{current:[]},Be:{current:0},ze:{current:{autoCombat:false}},Re:{current:false},
    ii(){},_:()=>{},u(){},p(){},t(){},M(){},B(){},
    MONGSE_setModeChoiceV31353(){},
    MONGSE_partyTestRenderHero:renderHero,
  };
  context.window.__HAPIL_SAMONG_RC91__={select:()=> 'STORY'};
  context.window.__HAPIL_RECOVERY_V31369__={prepareMap:async()=>true};
  context.window.__HAPIL_MODES_V31346__={set:(mode)=>calls.partyMode.push(mode)};
  context.window.__HAPIL_DEVELOPER_MAPS_RC133__={frontier:()=>({}),beginRun(){}};
  context.window.__HAPIL_POLICY_V31400__={partner:id=>{calls.preloaded.push(id);return `${id}-support`;}};
  context.window.__HAPIL_RUN_V31400__={
    prepare:config=>config,
    init:(world,id)=>{calls.runInit.push(id);world.runInitHero=id;},
    configFor:(world,id)=>{
      calls.configFor.push(id);
      return {mode:'local2',roster:inputRoster.map((row,index)=>({...row,heroId:index===0?id:row.heroId}))};
    },
  };
  vm.createContext(context);
  vm.runInContext(`${cleanRosterSource};${configureSource};`,context);
  const launchSetter=vm.runInContext(`(${setLeaderSource})`,context);
  context.window.__HAPIL_PARTY_LAUNCH_V31322__={setLeader:launchSetter};
  context.IDS=heroes.map(hero=>hero.id);
  context.hero=id=>heroes.find(hero=>hero.id===id);
  context.world=state;
  context.role='offline';context.mode='solo';context.enabled=false;context.roster=[];context.actors=[];
  context.inputs=new Map();context.strikes=[];context.syncRoster=()=>{};context.status=()=>({role:context.role,mode:context.mode,enabled:context.enabled,roster:context.roster.map(row=>({...row}))});
  context.supportOptions=()=>[];
  context.window.__HAPIL_HELL_V31322__={setEnabled(){}};
  context.window.__HAPIL_PARTY_V31322__={configure:config=>{calls.nativePartyConfig.push(config);return context.configure(config);}};
  const atFactory=vm.runInContext('(i => ('+launchSource+'))',context);
  const at=atFactory(renderHero); // Deliberately preserve the stale React render closure.
  context.L.current=invalidRef?'not-a-supported-hero':'hwando';
  return{context,at,calls,updates,state,window,renderHero,leader};
}

async function run(){
  // Native configure invokes the actual extracted setLeader, updating L.current
  // synchronously while the already-rendered launch callback still closes over
  // Hwando. There is no await between configure and invoking the callback.
  const race=fixture();
  const configureResult=race.context.configure({mode:'local2',roster:inputRoster});
  eq(configureResult.roster[0].heroId,'slayer','native configure accepts Slayer as the selected P1 leader');
  eq(configureResult.roster[1].heroId,'gunner','native configure preserves the local P2 Gunner slot');
  eq(race.context.L.current,'slayer','actual setLeader updates the live hero ref before React rerenders');
  eq(race.updates.at(-1),'slayer','actual setLeader requests the React state update');
  await race.at();
  eq(race.calls.runInit[0],'slayer','launch initializes the synchronously selected leader, not its stale closure');
  eq(race.state.activeHeroId,'slayer','world active hero matches the same-task selected leader');
  eq(race.calls.preloaded[0],'slayer','support selection is derived from the same launch hero snapshot');
  eq(race.calls.configFor[0],'slayer','run policy configuration receives the same launch hero snapshot');
  const finalRoster=race.context.roster;
  eq(finalRoster.length,2,'native launch configuration retains both selected human slots');
  eq(finalRoster[0].heroId,'slayer','final native P1 roster is Slayer');
  eq(finalRoster[1].heroId,'gunner','final native P2 roster is Gunner');
  eq(finalRoster[1].control,'local','final native P2 remains locally controlled');

  // Ordinary launch, where state and ref already agree, preserves the selected
  // hero. An invalid ref falls back to the original selected render value.
  const normal=fixture({renderHero:'gunner'});normal.context.L.current='gunner';await normal.at();
  eq(normal.calls.runInit[0],'gunner','normal render/ref launch keeps the selected hero');
  eq(normal.state.activeHeroId,'gunner','normal launch keeps activeHeroId aligned');
  const invalid=fixture({renderHero:'slayer',invalidRef:true});await invalid.at();
  eq(invalid.calls.runInit[0],'slayer','an invalid live ref falls back to the original selected hero');
  eq(invalid.state.activeHeroId,'slayer','fallback hero remains consistent in the launched world');

  const report={
    sourceCommit:require('node:child_process').execFileSync('git',['rev-parse','--short','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
    bundleSha256:crypto.createHash('sha256').update(bundle).digest('hex'),
    extracted:{launch:'React variable at',nativeConfigure:'Party function configure',setLeader:'Party launch API method setLeader'},
    race:{staleRenderHero:race.renderHero,synchronouslyConfiguredLeader:'slayer',p1:finalRoster[0].heroId,p2:finalRoster[1].heroId,p2Control:finalRoster[1].control},
    checks,
  };
  console.log('RC223_PARTY_LAUNCH_UNIT',JSON.stringify(report));
}
run().catch(error=>{console.error(error);process.exitCode=1;});
