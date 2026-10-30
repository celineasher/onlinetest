/* LifePath Arena — original career minigame */
(function(){
'use strict';
const RB=window.LifePathReimagined;if(!RB)return;
function arenaState(s){
 const x=RB.ensure(s);
 if(!x.arena||typeof x.arena!=="object")x.arena={wins:0,losses:0,knockouts:0,lastStarted:-1,bout:null};
 return x.arena;
}

function arenaScreen(s){
 const a=arenaState(s),w=s.extras?.world||{},f=w.special||{};
 const fighter=f.id==="fighter";
 if(!fighter)return `<div class="lp-arena"><div class="lp-rb-hero"><span class="lp-rb-hero-icon">🥊</span><div><strong>The Fighting Circuit</strong><small>Train, challenge rivals, and become a champion.</small></div></div><div class="lp-arena-callout"><div style="font-size:45px">🥋</div><strong>Become a professional fighter</strong><p>Start the fighter special career to enter the arena. Each match tests your choices, timing, skill and stamina.</p><button data-special="join" data-id="fighter" ${s.age<18?"disabled":""}>Start Fighter Career</button></div></div>`;
 const bout=a.bout;
 const intro=`<div class="lp-rb-hero"><span class="lp-rb-hero-icon">🥊</span><div><strong>Professional Fight Night</strong><small>${a.wins} wins · ${a.losses} losses · ${a.knockouts} knockouts</small></div></div>`;
 if(!bout||bout.finished){
  const outcome=bout?.finished?`<div class="lp-arena-callout"><div class="lp-arena-trophy">${bout.won?"🏆":"🥊"}</div><strong>${bout.won?"Victory!":"Match Over"}</strong><p>${escapeHTML(bout.summary||"The fight has ended.")}</p></div>`:"";
  return `<div class="lp-arena">${intro}${outcome}<div class="lp-arena-callout">
   <div style="font-size:46px">🥊</div><strong>Enter the Arena</strong>
   <p>Fight an opponent matched to your career skill. Jabs, hooks, counters and defense have different effects on stamina and damage. You may fight once each year.</p>
   <p>Career skill: <b>${f.skill||0}/100</b> · Entry fee: <b>$500</b></p>
   <button data-rbfight="start" ${s.age<18||a.lastStarted===s.age||s.money<500?"disabled":""}>${a.lastStarted===s.age?"Come back next year":"Fight a Rival · $500"}</button>
   </div>
   <div class="lp-rb-meter-grid"><div class="lp-rb-metric"><small>Career victories</small><strong>${a.wins}</strong></div><div class="lp-rb-metric"><small>Win rate</small><strong>${a.wins+a.losses?Math.round(a.wins/(a.wins+a.losses)*100):0}%</strong></div></div></div>`;
 }
 const player=bout.player,op=bout.opponent;
 return `<div class="lp-arena">${intro}
 <div class="lp-arena-stage">
  <div class="lp-arena-top">
   <div class="lp-fighter-card"><span class="lp-fighter-emoji">🥊</span><strong>${escapeHTML(s.name)}</strong><small>Skill ${f.skill||0}</small>
    <div class="lp-arena-label">HEALTH ${player.hp}/100</div><div class="lp-arena-bar"><i style="width:${player.hp}%"></i></div>
    <div class="lp-arena-label">STAMINA ${player.stamina}/100</div><div class="lp-arena-bar stamina"><i style="width:${player.stamina}%"></i></div>
   </div>
   <span class="lp-arena-versus">VS</span>
   <div class="lp-fighter-card"><span class="lp-fighter-emoji">🥋</span><strong>${escapeHTML(op.name)}</strong><small>Skill ${op.skill}</small>
    <div class="lp-arena-label">HEALTH ${op.hp}/100</div><div class="lp-arena-bar"><i style="width:${op.hp}%"></i></div>
    <div class="lp-arena-label">STAMINA ${op.stamina}/100</div><div class="lp-arena-bar stamina"><i style="width:${op.stamina}%"></i></div>
   </div>
  </div>
  <div class="lp-arena-round">ROUND ${bout.round} / 15</div>
 </div>
 <div class="lp-arena-message"><h2>Choose your next move</h2><p>Manage stamina and respond to your rival's attacks.</p></div>
 <div class="lp-arena-log">${bout.log.slice(-3).map(m=>`<p>• ${escapeHTML(m)}</p>`).join("")}</div>
 <div class="lp-arena-choices">
  <button class="lp-arena-action" data-rbfight="jab" ${player.stamina<5?"disabled":""}><span>🥊</span><b>Quick Jab</b><small>5 stamina · Good accuracy</small></button>
  <button class="lp-arena-action special" data-rbfight="cross" ${player.stamina<13?"disabled":""}><span>💥</span><b>Power Cross</b><small>13 stamina · Strong impact</small></button>
  <button class="lp-arena-action special" data-rbfight="hook" ${player.stamina<21?"disabled":""}><span>⚡</span><b>Heavy Hook</b><small>21 stamina · High risk/reward</small></button>
  <button class="lp-arena-action" data-rbfight="counter" ${player.stamina<10?"disabled":""}><span>🎯</span><b>Counter</b><small>10 stamina · Improved defense</small></button>
  <button class="lp-arena-action" data-rbfight="guard"><span>🛡️</span><b>Guard</b><small>Block damage · +12 stamina</small></button>
  <button class="lp-arena-action" data-rbfight="rest"><span>💨</span><b>Recover</b><small>Restore 25 stamina · Vulnerable</small></button>
 </div>
 </div>`;
}

function randArena(min,max){return Math.floor(min+Math.random()*(max-min+1))}

function clampArena(v,min=0,max=100){return Math.max(min,Math.min(max,Math.round(v)))}

function startMatch(s){
 const a=arenaState(s),w=s.extras?.world||{},f=w.special||{};
 if(!s.alive||s.age<18||f.id!=="fighter"||a.lastStarted===s.age||s.money<500)return {ok:false,message:"You cannot start this match yet."};
 const opponents=["Kai Moreno","Jayden Stone","Elena King","Marcus Vega","Mina Torres","Reed Lawson","Avery Cruz","Zara Miles","Andre Knox","Sasha Voss"];
 const opponentSkill=Math.min(96,Math.round(22+a.wins*4+randArena(5,30)));
 a.lastStarted=s.age;
 s.money-=500;
 a.bout={round:1,finished:false,won:null,player:{hp:100,stamina:100},opponent:{name:opponents[randArena(0,opponents.length-1)],hp:100,stamina:100,skill:opponentSkill},log:["The bell rings! Your opponent looks ready."],summary:"",skill:f.skill||30};
 return {ok:true,message:"The fight has started!"};
}

function resolveMatch(s,won,b,ctx,byKO){
 const a=arenaState(s),w=s.extras.world,f=w.special;
 b.finished=true;b.won=won;
 if(won){
  const purse=Math.round((9000+a.wins*6000)*(0.9+Math.random()*.55));
  a.wins++;if(byKO)a.knockouts++;
  w.winStreak=(w.winStreak||0)+1;
  w.fame=clampArena((w.fame||0)+randArena(4,11));
  f.skill=clampArena((f.skill||30)+randArena(1,4));
  f.progress=clampArena((f.progress||0)+randArena(10,19));
  s.money+=purse;
  b.summary=`You beat ${b.opponent.name} and earned ${ctx.cash(purse)}!`;
  b.log.push("The crowd erupts. You won the match!");
  ctx.log("🏆","Fighter victory",b.summary);
  ctx.stat("happiness",12);
  if(a.wins===5)ctx.achievement("promoted");
 }else{
  a.losses++;
  w.winStreak=0;
  const penalty=randArena(3,9);
  ctx.stat("health",-penalty);ctx.stat("happiness",-8);
  f.skill=clampArena((f.skill||30)+1);
  b.summary=`${b.opponent.name} won. You suffered a setback but gained experience.`;
  b.log.push("The referee ends the match. Better luck next time.");
  ctx.log("🥊","Fighter defeat",b.summary);
 }
 return {ok:true,message:won?"Victory!":"Match complete.",celebrate:won};
}

function fighterTurn(s,move,ctx){
 const a=arenaState(s),b=a.bout;
 if(!b||b.finished)return {ok:false,message:"No active match."};
 const p=b.player,o=b.opponent,f=s.extras.world.special;
 const types={
 jab:{base:9,cost:5,chance:.88},cross:{base:16,cost:13,chance:.7},hook:{base:23,cost:21,chance:.56},
 counter:{base:12,cost:10,chance:.78},guard:{base:0,cost:0,chance:1},rest:{base:0,cost:0,chance:1}
 };
 const type=types[move];if(!type)return {ok:false,message:"Unknown move."};
 if(p.stamina<type.cost)return {ok:false,message:"You need more stamina."};
 let guard=false;
 if(move==="guard"){guard=true;p.stamina=clampArena(p.stamina+12);b.log.push("You raised your guard and recovered stamina.");}
 else if(move==="rest"){p.stamina=clampArena(p.stamina+25);b.log.push("You took a moment to catch your breath.");}
 else{
  p.stamina=clampArena(p.stamina-type.cost+2);
  const skillDiff=((f.skill||30)-(o.skill||30))*.003;
  const hitChance=Math.max(.28,Math.min(.96,type.chance+skillDiff));
  const hit=Math.random()<hitChance;
  const damage=hit?Math.round((type.base+randArena(-3,6))*(move==="counter"?1.15:1)):0;
  o.hp=clampArena(o.hp-damage);
  b.log.push(hit?`Your ${move} landed for ${damage} damage!`:`Your ${move} missed.`);
 }
 if(o.hp<=0)return resolveMatch(s,true,b,ctx,true);
 const enemyMove=o.stamina<13?"rest":Math.random()<.14?"guard":Math.random()<.33?"cross":"jab";
 let opponentDamage=0;
 if(enemyMove==="rest"){o.stamina=clampArena(o.stamina+23);b.log.push(`${o.name} catches their breath.`);}
 else if(enemyMove==="guard"){o.stamina=clampArena(o.stamina+9);b.log.push(`${o.name} takes a defensive stance.`);}
 else{
  const heavy=enemyMove==="cross",cost=heavy?13:5;
  o.stamina=clampArena(o.stamina-cost+2);
  const chance=.76+(o.skill-(f.skill||30))*.002;
  const connects=Math.random()<Math.max(.35,Math.min(.95,chance));
  let raw=connects?randArena(heavy?12:5,heavy?21:13):0;
  if(guard)raw=Math.round(raw*.25);
  if(move==="counter")raw=Math.round(raw*.55);
  if(move==="rest")raw=Math.round(raw*1.2);
  opponentDamage=raw;
  p.hp=clampArena(p.hp-opponentDamage);
  b.log.push(connects?`${o.name} landed ${enemyMove} for ${opponentDamage} damage.`:`${o.name} missed a ${enemyMove}.`);
 }
 if(p.hp<=0)return resolveMatch(s,false,b,ctx,true);
 b.round++;
 if(b.round>15)return resolveMatch(s,p.hp>=o.hp,b,ctx,false);
 if(b.log.length>10)b.log=b.log.slice(-10);
 return {ok:true,message:"Round completed."};
}

function fighterEnhance(ctx){
 const s=ctx.getState();if(!s)return;
 const tab=ctx.getTab();
 if(tab==="worlds"){
  const grid=document.querySelector(".world-grid");
  if(grid)grid.insertAdjacentHTML("afterbegin",'<button class="world-entry" data-rb="fighter"><span class="world-entry-icon">🥊</span><span class="world-entry-copy"><strong>Fighter Arena</strong><small>Real turn-based combat with stamina and skill</small></span><span class="world-chevron">›</span></button>');
 }
 const side=document.querySelector(".menu-panel .menu-reset");
 if(side)side.insertAdjacentHTML("beforebegin",'<button data-rb="fighter"><span>🥊</span>Fighter Arena</button>');
 const subTitle=document.querySelector(".subhead")?.textContent?.toUpperCase()||"";
 if(tab==="career"&&subTitle.includes("FIGHT")||tab==="special"&&subTitle.includes("FIGHTER")){
  const detail=document.querySelector(".lp-detail");
  if(detail)detail.insertAdjacentHTML("afterbegin",'<div class="lp-rb-card"><button class="lp-arena-menu-btn" data-rb="fighter"><span>🥊 Play Fighter Arena</span><span>›</span></button></div>');
 }
 if(RB.screen==="fighter"){
  const sub=document.querySelector(".subpage");
  if(sub)sub.innerHTML='<div class="subhead"><button class="back-button" data-rb="close" aria-label="Return to previous screen">‹</button>FIGHTER ARENA</div>'+arenaScreen(s);
 }
}

function fighterHandle(button,ctx){
 const s=ctx.getState();if(!s||!button)return false;
 const d=button.dataset;
 if(d.rb==="fighter"){
  RB.screen="fighter";RB.owner="finances";RB.modal=null;
  if(ctx.getTab()!=="finances")ctx.setTab("finances");
  ctx.render();return true;
 }
 if(d.rbfight){
  let result=d.rbfight==="start"?startMatch(s):fighterTurn(s,d.rbfight,ctx);
  if(result.ok){ctx.save();ctx.render();if(result.celebrate)RB.celebrate(25);}
  else ctx.notice(result.message,true);
  return true;
 }
 return false;
}
const previousEnhance=RB.enhance;RB.enhance=function(ctx){previousEnhance(ctx);fighterEnhance(ctx)};
const previousHandle=RB.handle;RB.handle=function(button,ctx){if(fighterHandle(button,ctx))return true;return previousHandle(button,ctx)};
RB.fight={state:arenaState,screen:arenaScreen,turn:fighterTurn,start:startMatch};
})();