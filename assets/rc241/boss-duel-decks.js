/* RC241 boss duel decks (pilot: Balrog, Leviathan, Lucifer).
 * Data only. Every volley name is copied verbatim from text already in the
 * game (native pattern codex rows, RC129 phase titles); every sprite is an
 * authored projectile that boss already owns. No new art, text or audio.
 *
 * Entry fields: name, src (where the name comes from), sprite, heading
 * ('dir': sprite head points screen-right and turns with its velocity;
 * 'spin': symmetric motif, slow spin), formation, count (STORY baseline),
 * spread (rad), speed (x base px/s), hang (s, >= .72), size (drawn G-space px; the hitbox is ~12%),
 * plus optional stagger/arms/gap/rows.
 */
(function(root){'use strict';
 const V='./assets/vfx/v31323/boss/';
 const f=o=>Object.freeze(o);
 const deck=list=>Object.freeze(list.map(f));
 const bosses=f({
  'dist06-boss':f({
   zone:'dist06',name:'발록 · 지옥의 문지기',label:'포기하면 편하다',
   portrait:'./assets/actors/v31356/balrog-rain-complete.webp',
   grade:'#ff4a1c',rim:'#ff2a3c',core:'#fff1d6',
   deck:deck([
    {name:'발록 화염검',src:'native pattern dist06-boss',sprite:V+'dist06-boss/balrog_gate_meteor.webp',heading:'dir',formation:'fan',count:9,spread:1.15,speed:1,hang:.9,size:81},
    {name:'소환진 붕괴',src:'native pattern dist06-boss',sprite:V+'dist06-boss/inferno-meteor.webp',heading:'spin',formation:'ring',count:16,speed:.78,hang:1,size:61},
    {name:'검은기둥 염동낙하',src:'native pattern dist06-boss',sprite:V+'dist06-boss/inferno-meteor.webp',heading:'spin',formation:'rain',count:11,speed:.95,hang:1.1,size:64},
    {name:'∞ 무한 매듭',src:'native laser card dist06-boss',sprite:V+'dist06-boss/balrog_chain_whip_wave.webp',heading:'dir',formation:'spiral',count:14,arms:2,stagger:.06,speed:.92,hang:.85,size:78},
    {name:'태양 코로나',src:'native laser card dist06-boss',sprite:V+'dist06-boss/balrog_gate_meteor.webp',heading:'dir',formation:'ring',count:12,speed:1.08,hang:.95,size:78},
    {name:'초승달 위상',src:'native laser card dist06-boss',sprite:V+'dist06-boss/balrog_chain_whip_wave.webp',heading:'dir',formation:'twin',count:10,spread:.62,speed:1.02,hang:.85,size:75},
    {name:'Ω 오메가 문자',src:'native laser card dist06-boss',sprite:V+'dist06-boss/inferno-meteor.webp',heading:'spin',formation:'wall',count:12,gap:2,speed:.9,hang:1,size:61},
    {name:'포기하면 편하다',src:'native pattern dist06-boss',sprite:V+'dist06-boss/balrog_gate_meteor.webp',heading:'dir',formation:'needle',count:9,rows:3,stagger:.07,speed:1.32,hang:.8,size:75}
   ])
  }),
  'b03-boss':f({
   zone:'ep1b03',name:'호텔 부매니저 · 레비아탄',label:'왜 모든 걸 가진 건데?',
   portrait:'./assets/generated-v31224/actors-normalized/9101cdeb2394_boss_envy_demon.webp',
   grade:'#2fbf9a',rim:'#c77dff',core:'#f6efff',
   deck:deck([
    {name:'금간 안경 파편우',src:'native pattern b03-boss',sprite:V+'b03-boss/envy_mirror_shard.webp',heading:'dir',formation:'fan',count:9,spread:1.05,speed:1,hang:.9,size:75},
    {name:'레비아탄 비교선',src:'native pattern b03-boss',sprite:V+'b03-boss/envy_mirror_shard.webp',heading:'dir',formation:'wall',count:12,gap:2,speed:.95,hang:1,size:70},
    {name:'비교거울 파편폭우',src:'native pattern b03-boss',sprite:V+'b03-boss/ep1b03_knife_glass_photo_rain.webp',heading:'spin',formation:'rain',count:11,speed:.95,hang:1.1,size:67},
    {name:'쌍성 나선',src:'native laser card b03-boss',sprite:V+'b03-boss/ep1b03_envy_cleaver_glass_cluster.webp',heading:'spin',formation:'spiral',count:14,arms:2,stagger:.06,speed:.9,hang:.85,size:64},
    {name:'질투 · 어긋난 반영',src:'RC129 envy title',sprite:V+'b03-boss/envy_mirror_shard.webp',heading:'dir',formation:'twin',count:10,spread:.7,speed:1.02,hang:.9,size:72},
    {name:'해류 소용돌이',src:'native laser card b03-boss',sprite:V+'b03-boss/ep1b03_envy_cleaver_glass_cluster.webp',heading:'spin',formation:'spiral',count:16,arms:1,stagger:.05,speed:.85,hang:.9,size:61},
    {name:'증오 · 지연된 반사',src:'RC129 envy title',sprite:V+'b03-boss/envy_mirror_shard.webp',heading:'dir',formation:'ring',count:14,stagger:.35,speed:.95,hang:.95,size:70},
    {name:'99% 종말 장막',src:'native laser card b03-boss',sprite:V+'b03-boss/ep1b03_knife_glass_photo_rain.webp',heading:'spin',formation:'wall',count:14,gap:2,rows:2,speed:.82,hang:1.1,size:64}
   ])
  }),
  'a11-boss':f({
   zone:'ep1a11',name:'루시퍼 · 가면 벗은 초천사',label:'회복을 두려워하는 자',
   portrait:'./assets/generated-v31224/actors-normalized/abf4e4f7936a_lucifer-rain.webp',
   grade:'#d9b45a',rim:'#ff3f8a',core:'#fff6e4',
   deck:deck([
    {name:'부서진 여섯 날개',src:'native pattern a11-boss',sprite:V+'a11-boss/lucifer_feather_lance.webp',heading:'dir',formation:'twin',count:12,spread:.5,speed:1.02,hang:.9,size:81},
    {name:'치료거부 성광십자',src:'native pattern a11-boss',sprite:V+'a11-boss/lucifer_judgment_sigil.webp',heading:'spin',formation:'cross',count:16,speed:.9,hang:1,size:64},
    {name:'거짓천국 조형추락',src:'native pattern a11-boss',sprite:V+'a11-boss/lucifer_judgment_sigil.webp',heading:'spin',formation:'rain',count:11,speed:.95,hang:1.1,size:64},
    {name:'십이진 방사',src:'native laser card a11-boss',sprite:V+'a11-boss/lucifer_feather_lance.webp',heading:'dir',formation:'ring',count:12,speed:1.05,hang:.95,size:81},
    {name:'거짓구원의 단일명령',src:'native pattern a11-boss',sprite:V+'a11-boss/lucifer_feather_lance.webp',heading:'dir',formation:'needle',count:9,rows:3,stagger:.07,speed:1.32,hang:.8,size:81},
    {name:'낙하 심판',src:'native finale card a11-boss',sprite:V+'a11-boss/lucifer_feather_lance.webp',heading:'dir',formation:'rain',count:12,speed:1.05,hang:1,size:78},
    {name:'몽화 · 비어 있는 꽃잎',src:'RC129 petal title',sprite:V+'a11-boss/lucifer_judgment_sigil.webp',heading:'spin',formation:'spiral',count:15,arms:3,stagger:.05,speed:.85,hang:.9,size:61},
    {name:'가면의 천상심판 · 묵시 광로',src:'native finale card a11-boss',sprite:V+'a11-boss/lucifer_feather_lance.webp',heading:'dir',formation:'wall',count:13,gap:2,speed:.95,hang:1,size:75}
   ])
  })
 });
 // Per-mode scaling of the STORY baseline and the copied RC240 hit model
 // (fraction of max HP per hit, mercy seconds, 4 s cap). Speeds are G-space px/s.
 const modes=f({
  STORY:f({count:1,speed:165,hangScale:1,dmg:.04,mercy:1.5,cap:.18}),
  HELL:f({count:1.15,speed:185,hangScale:.95,dmg:.06,mercy:1.1,cap:.24}),
  DREAM:f({count:1.25,speed:205,hangScale:.92,dmg:.08,mercy:.9,cap:.30})
 });
 // Awakening act: every 28 s (first at 14 s) for 7 s, like the RC133 persona.
 const act=f({first:14,period:28,length:7,count:1.5,speed:1.2,hang:.8});
 root.__HAPIL_BOSS_DUEL_DECKS_RC241__=Object.freeze({version:'RC241-decks-1',bosses,modes,act});
})(typeof window!=='undefined'?window:globalThis);
