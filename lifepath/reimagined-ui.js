/* LifePath Reimagined — original interactive UI layer */
(function(){
'use strict';
const RB=window.LifePathReimagined;
if(!RB)return;
RB.screen=null;RB.owner=null;RB.modal=null;RB.lastTab=null;RB.prevMoney=null;RB.prevAge=null;RB.prevAchievements=null;RB.initialized=false;RB.audio=null;
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function formatAmount(n){
 if(!Number.isFinite(n))return "$0";
 const absolute=Math.abs(n),suffix=absolute>=1e12?"T":absolute>=1e9?"B":absolute>=1e6?"M":absolute>=1e4?"K":"";
 const denominator=suffix==="T"?1e12:suffix==="B"?1e9:suffix==="M"?1e6:suffix==="K"?1e3:1;
 const value=absolute/denominator;
 return (n<0?"−":"")+"$"+(suffix?value.toFixed(value>=100?0:value>=10?1:2):Math.round(value).toLocaleString("en-US"))+suffix;
}

function makeAvatar(s){
 const seed=String(s.name||"LifePath").split("").reduce((a,c)=>a+c.charCodeAt(0),0);
 const skin=["#eac19b","#d7a879","#f5d2ac","#b98359","#f1b68a","#d7ac88"][seed%6];
 const hair=["#352921","#5b3827","#171c2c","#814f2f","#2c241d","#7b5a41"][seed%6];
 const cloth=["#1e8bba","#4a6eca","#8f69a5","#1c9b85","#cd7451"][seed%5];
 const aged=s.age>=65,adult=s.age>=18;
 const beard=adult&&seed%4===0;
 const glasses=adult&&seed%7===0;
 const style=seed%4;
 const hairSVG=aged?
 `<path d="M22 39 Q20 8 50 10 Q82 6 80 43 L74 32 Q58 20 34 32 L26 44 Z" fill="#9d9da5"/>`:
 style===0?`<path d="M20 41 Q14 12 44 11 Q65 3 80 25 L77 45 68 33 Q49 27 35 34 L23 45Z" fill="${hair}"/>`:
 style===1?`<path d="M23 43 Q17 10 52 10 Q85 9 79 44 L69 29 Q53 19 32 34Z" fill="${hair}"/>`:
 style===2?`<path d="M20 47 Q17 19 35 15 Q42 4 55 14 Q71 6 80 27 L80 50 73 34 31 34 25 50Z" fill="${hair}"/>`:
 `<path d="M19 45 Q16 16 43 13 Q71 2 83 29 L76 52 66 29 36 34 26 48Z" fill="${hair}"/>`;
 const wrinkle=aged?`<path d="M32 55l8 1M60 56l8-1M40 29h20" stroke="#a8775f" stroke-width="1.1" opacity=".7" fill="none"/>`:"";
 const beardSVG=beard?`<path d="M35 68q15 23 30 0-7 16-15 16t-15-16" fill="${hair}" opacity=".9"/>`:"";
 const glassesSVG=glasses?`<rect x="29" y="45" width="19" height="14" rx="5" stroke="#324a60" stroke-width="2.7" fill="#effcff38"/><rect x="52" y="45" width="19" height="14" rx="5" stroke="#324a60" stroke-width="2.7" fill="#effcff38"/><path d="M48 50h4" stroke="#324a60" stroke-width="2.7"/>`:"";
 return `<svg class="lp-avatar" viewBox="0 0 100 100" role="img" aria-label="Portrait of ${escapeHTML(s.name)}" xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="lp-bg-${seed}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f7e2bd"/><stop offset="1" stop-color="#d7f0f2"/></linearGradient></defs>
 <rect width="100" height="100" rx="21" fill="url(#lp-bg-${seed})"/>
 <path d="M13 101Q19 78 40 76L50 80 60 76Q82 79 88 101Z" fill="${cloth}"/>
 <path d="M44 72L44 82 50 86 56 82 56 72" fill="${skin}"/>
 <ellipse cx="50" cy="48" rx="28" ry="33" fill="${skin}"/><ellipse cx="22" cy="53" rx="5" ry="9" fill="${skin}"/><ellipse cx="78" cy="53" rx="5" ry="9" fill="${skin}"/>
 ${hairSVG}${wrinkle}
 <path d="M33 45q7-4 14 0M54 45q7-4 14 0" fill="none" stroke="${hair}" stroke-width="2.4" stroke-linecap="round"/>
 <ellipse cx="40" cy="53" rx="3" ry="3.5" fill="#27333c"/><ellipse cx="61" cy="53" rx="3" ry="3.5" fill="#27333c"/>
 <path d="M50 56L47 64Q50 66 53 64" fill="none" stroke="#af765c" stroke-width="1.4" stroke-linecap="round"/>
 <path d="M41 70Q50 76 59 70" fill="none" stroke="#813f46" stroke-width="2" stroke-linecap="round"/>
 ${beardSVG}${glassesSVG}</svg>`;
}

function uiButton(icon,title,subtitle,action,disabled=false,extra=""){
 return `<button class="lp-rb-btn" data-rba="${action}" ${extra} ${disabled?"disabled":""}><span>${icon}</span><b>${escapeHTML(title)}</b><small>${escapeHTML(subtitle)}</small></button>`;
}

function businessScreen(s){
 const x=RB.ensure(s),b=x.business;
 const sub=()=>{
  if(!b?.active){
   return `<div class="lp-rb-hero"><span class="lp-rb-hero-icon">🚀</span><div><strong>Build your empire</strong><small>Launch a company, create products, hire employees, and make real decisions.</small></div></div>
   <div class="lp-rb-card"><h3>Start your entrepreneurial journey</h3><p>Your business is simulated each year. Product pricing, quality, marketing, capacity, and staff costs determine your profits.</p></div>
   <div class="lp-rb-section">Choose a business</div>
   ${RB.sectors.map(sec=>`<button class="lp-row" data-rba="launch" data-id="${sec.id}"><span class="lp-row-icon">${sec.icon}</span><span class="lp-row-text"><span class="lp-row-name">${escapeHTML(sec.name)}</span><span class="lp-row-description">${escapeHTML(sec.flavor)} · ${formatAmount(sec.cost)} startup</span></span><span class="lp-row-arrow">›</span></button>`).join("")}
   <div class="lp-tip"><strong>A smart founder knows the numbers.</strong> Every product has its own costs and price sensitivity. Expanding too fast can bankrupt you.</div>`;
  }
  const report=b.lastReport;
  const profits=b.history.slice(-10).map(h=>h.profit);
  const max=Math.max(1,...profits.map(v=>Math.abs(v)));
  const sparkline=profits.length?`<div style="display:flex;align-items:flex-end;gap:6px;height:86px;margin:15px 0 5px;padding:9px;background:#f2f8fc;border-radius:9px">${profits.map((p,i)=>`<div title="Age ${b.history.slice(-10)[i].year}: ${formatAmount(p)}" style="flex:1;min-width:5px;height:${Math.max(4,Math.round(Math.abs(p)/max*65))}px;background:${p>=0?"linear-gradient(#36d382,#039d61)":"linear-gradient(#fdad81,#ea684a)"};border-radius:4px 4px 0 0;transition:height .6s"></div>`).join("")}</div>`:"<p>Your first annual report appears after your next birthday.</p>";
  return `<div class="lp-rb-hero"><span class="lp-rb-hero-icon">${b.icon}</span><div><strong>${escapeHTML(b.name)}</strong><small>${escapeHTML(b.industry)} · ${b.years} years operating</small></div></div>
  <div class="lp-rb-meter-grid">
   <div class="lp-rb-metric"><small>Company valuation</small><strong>${formatAmount(RB.calcCompany(b))}</strong></div>
   <div class="lp-rb-metric"><small>Company cash</small><strong>${formatAmount(b.cash)}</strong></div>
   <div class="lp-rb-metric"><small>Employees</small><strong>${b.employees}</strong></div>
   <div class="lp-rb-metric"><small>Facilities</small><strong>${b.facilities}</strong></div>
  </div>
  <div class="lp-rb-card"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h3>Company performance</h3><span class="lp-rb-pill">${b.brand}% reputation</span></div>
   <p>Team morale ${b.morale}%</p><div class="lp-rb-meter"><i style="width:${b.morale}%"></i></div>
   ${sparkline}
   <p style="font-size:10px">Annual profit history · green = profit · orange = loss</p>
  </div>
  ${report?`<div class="lp-rb-report"><strong>📊 Latest annual report · Age ${report.year}</strong><p>Revenue: ${formatAmount(report.revenue)} · Production: ${formatAmount(report.materials)}</p><p>Payroll: ${formatAmount(report.wages)} · Rent: ${formatAmount(report.rent)}</p><p><b>Operating ${report.profit>=0?"profit":"loss"}: ${formatAmount(report.profit)}</b> · ${report.units.toLocaleString()} units sold</p><p>Market: ${report.market}% of expected demand ${report.marketEvent?"· Market disruption":""}</p></div>`:""}
  <div class="lp-rb-section">Products & pricing</div>
  ${b.products.map((p,i)=>`<div class="lp-rb-product">
    <div class="lp-rb-product-top"><span>${["📦","✨","🛍️","💠"][i%4]}</span><div><strong>${escapeHTML(p.name)}</strong><small>Price ${formatAmount(p.price)} · Unit cost ${formatAmount(p.cost)} · ${(p.annualSales||0).toLocaleString()} sold last year</small></div><span class="lp-rb-pill">${p.quality}% quality</span></div>
    <div class="lp-rb-product-actions"><button data-rba="priceup" data-index="${i}">↑ Price</button><button data-rba="pricedown" data-index="${i}">↓ Price</button><button data-rba="research" data-index="${i}">🔬 Improve</button><button data-rba="marketing" data-index="${i}">📣 Promote</button></div>
    <div class="lp-rb-meter"><i style="width:${p.quality}%"></i></div>
   </div>`).join("")}
  <div class="lp-rb-card"><h3>Manage your company</h3><div class="lp-rb-grid">
   ${uiButton("✨","New product","Develop a new offering · $18K","product",b.products.length>=4)}
   ${uiButton("🤝","Hire staff","Add two employees · $4K","hire")}
   ${uiButton("🧑‍💼","Reduce staff","Cut operating costs","fire",b.employees<=1)}
   ${uiButton("🏗️","Expand","Increase production capacity","expand")}
   ${uiButton("💛","Team morale","Invest in your employees","morale")}
   ${uiButton("💵","Take dividend","Withdraw up to $15,000","dividend",b.cash<25000)}
  </div></div>
  <div class="lp-rb-card"><h3>Exit strategy</h3><p>Your company value depends on retained cash, facilities, reputation, staff and products. Selling ends the business and pays out most of its estimated valuation.</p>
  <button class="btn danger" data-rba="sell">Sell ${escapeHTML(b.name)}</button></div>`;
 };
 return `<div class="lp-rb-screen">${sub()}</div>`;
}

function goalsScreen(s){
 const x=RB.ensure(s),progress=RB.milestones(s);
 return `<div class="lp-rb-screen">
 <div class="lp-rb-hero"><span class="lp-rb-hero-icon">🏆</span><div><strong>Your life challenges</strong><small>Meaningful milestones with rewards that you can actually earn.</small></div></div>
 <div class="lp-rb-meter-grid">
  <div class="lp-rb-metric"><small>Goals completed</small><strong>${progress.completed} / ${progress.total}</strong></div>
  <div class="lp-rb-metric"><small>Rewards claimed</small><strong>${progress.claimed}</strong></div>
 </div>
 <div class="lp-rb-section">Your objectives</div>
 ${RB.goals.map(g=>{
 const value=RB.goalProgress(s,g.id),percent=Math.max(0,Math.min(100,(value/g.target)*100));
 const complete=value>=g.target,claimed=!!x.goalClaims[g.id];
 const shown=g.target>=10000?formatAmount(value):String(Math.round(value));
 const threshold=g.target>=10000?formatAmount(g.target):String(g.target);
 return `<div class="lp-rb-product">
  <div class="lp-rb-product-top"><span>${g.icon}</span><div><strong>${escapeHTML(g.title)}</strong><small>${escapeHTML(g.desc)} · Reward ${formatAmount(g.reward)}</small></div><span class="lp-rb-pill">${claimed?"CLAIMED":complete?"READY":Math.round(percent)+"%"}</span></div>
  <div class="lp-rb-meter"><i style="width:${percent}%"></i></div>
  <div style="display:flex;justify-content:space-between;align-items:center;color:#7393a8;font-size:11px"><span>${shown} / ${threshold}</span><button class="btn ${complete&&!claimed?"primary":"ghost"}" data-rbgoal="${g.id}" ${!complete||claimed||!s.alive?"disabled":""}>${claimed?"✓ Claimed":complete?"Claim reward":"In progress"}</button></div>
 </div>`;
 }).join("")}
 </div>`;
}

function journalScreen(s){
 const x=RB.ensure(s),logs=(s.log||[]).slice(0,160);
 let last=null;
 const entries=logs.map(it=>{
  const group=last!==it.age;last=it.age;
  return `${group?`<div class="lp-rb-section">Age ${it.age}</div>`:""}
   <div class="lp-rb-product" style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:23px">${it.icon}</span><div><strong style="display:block;color:#155c8c;font-size:12px">${escapeHTML(it.title)}</strong><span style="display:block;color:#718596;font-size:11px;line-height:1.45">${escapeHTML(it.desc)}</span></div></div>`;
 }).join("");
 return `<div class="lp-rb-screen"><div class="lp-rb-hero"><span class="lp-rb-hero-icon">📖</span><div><strong>${escapeHTML(s.name)}'s life story</strong><small>Age ${s.age} · ${escapeHTML(s.place)} · ${s.alive?"Still writing the story":"A completed lifetime"}</small></div></div>
 <div class="lp-rb-meter-grid"><div class="lp-rb-metric"><small>Lifetime events</small><strong>${s.log?.length||0}</strong></div><div class="lp-rb-metric"><small>Years lived</small><strong>${s.age}</strong></div></div>
 ${entries||'<div class="lp-rb-card">No story events yet.</div>'}</div>`;
}

function settingsScreen(s){
 const x=RB.ensure(s);
 return `<div class="lp-rb-screen"><div class="lp-rb-hero"><span class="lp-rb-hero-icon">⚙️</span><div><strong>Game settings</strong><small>Personalize the feel of LifePath.</small></div></div>
 <div class="lp-rb-section">Experience</div>
 <button class="lp-row" data-rbsetting="sound"><span class="lp-row-icon">🔊</span><span class="lp-row-text"><span class="lp-row-name">Sound effects</span><span class="lp-row-description">Short original interface tones · ${x.preferences.sound?"On":"Off"}</span></span><span class="lp-row-arrow">${x.preferences.sound?"✓":"○"}</span></button>
 <button class="lp-row" data-rbsetting="animations"><span class="lp-row-icon">✨</span><span class="lp-row-text"><span class="lp-row-name">Animations</span><span class="lp-row-description">Screen transitions and celebration effects · ${x.preferences.animations?"On":"Off"}</span></span><span class="lp-row-arrow">${x.preferences.animations?"✓":"○"}</span></button>
 <div class="lp-rb-section">Your save</div>
 <div class="lp-rb-card"><h3>Auto-saved progress</h3><p>LifePath saves your character locally in this browser. Export a backup from your Character Profile.</p>
 <div class="lp-rb-grid">
 ${uiButton("👤","Character profile","Review your life","profile")}
 ${uiButton("📖","My story","Read your timeline","journal")}
 </div></div>
 <div class="lp-tip">LifePath is an independent browser life simulation and is not affiliated with BitLife or Candywriter.</div>
 </div>`;
}

function renderCustom(s,screen){
 if(screen==="business")return {title:"YOUR BUSINESS",html:businessScreen(s)};
 if(screen==="goals")return {title:"LIFE CHALLENGES",html:goalsScreen(s)};
 if(screen==="journal")return {title:"LIFE JOURNAL",html:journalScreen(s)};
 if(screen==="settings")return {title:"SETTINGS",html:settingsScreen(s)};
 return null;
}

function makeModal(s){
 const modal=RB.modal;
 if(!modal)return "";
 if(modal.type==="launch"){
  const sector=RB.sectors.find(x=>x.id===modal.sector)||RB.sectors[0];
  return `<div class="lp-rb-modal" role="dialog" aria-modal="true" aria-label="Create a company"><div class="lp-rb-dialog">
  <div style="font-size:39px">${sector.icon}</div><h2>Start a ${escapeHTML(sector.name)}</h2>
  <p>Set your company's name. The initial investment is ${formatAmount(sector.cost)}. You have ${formatAmount(s.money)} in cash.</p>
  <label for="lp-business-name">BUSINESS NAME</label>
  <input class="lp-rb-input" id="lp-business-name" maxlength="34" placeholder="Enter a brand name" value="${escapeHTML(s.name.split(" ")[0]+"'s "+sector.name)}"/>
  <p>${escapeHTML(sector.flavor)}</p>
  <div class="lp-rb-dialog-actions"><button data-rbm="close">Cancel</button><button class="primary" data-rbm="start" ${s.money<sector.cost?"disabled":""}>Launch · ${formatAmount(sector.cost)}</button></div>
  </div></div>`;
 }
 if(modal.type==="sell"){
  const b=RB.ensure(s).business;
  return `<div class="lp-rb-modal" role="dialog" aria-modal="true" aria-label="Sell your company"><div class="lp-rb-dialog"><div style="font-size:44px">🤝</div><h2>Sell your business?</h2><p>This ends your current company. Estimated proceeds: ${formatAmount(RB.calcCompany(b)*.84)}.</p><div class="lp-rb-dialog-actions"><button data-rbm="close">Keep it</button><button class="primary" data-rbm="confirm-sell">Sell company</button></div></div></div>`;
 }
 return "";
}

function enhance(ctx){
 const s=ctx.getState(),app=document.getElementById("app");
 if(!app)return;
 if(!s){
  RB.screen=null;RB.owner=null;RB.lastTab=null;
  const head=document.querySelector(".create-head h1");
  if(head)head.textContent="One life. Endless possibilities.";
  const welcome=document.querySelector(".create-head p");
  if(welcome)welcome.textContent="Build your story from the beginning. Every decision echoes through your future.";
  return;
 }
 const x=RB.ensure(s),tab=ctx.getTab();
 if(RB.screen&&RB.owner&&RB.owner!==tab){RB.screen=null;RB.owner=null;RB.modal=null;}
 if(RB.lastTab!==tab){
  const body=document.querySelector(".app-main");
  if(body)body.scrollTop=0;
 }
 RB.lastTab=tab;
 // Refresh the original, procedurally drawn character artwork with every render.
 const portrait=document.querySelector(".character-portrait");
 if(portrait)portrait.innerHTML=makeAvatar(s);
 const brand=document.querySelector(".game-header .brand");
 if(brand)brand.innerHTML='<span class="brand-icon">✦</span>LifePath';
 const world=document.querySelector(".header-world-btn");
 if(world)world.textContent="🌎 EXPLORE";
 const bal=document.querySelector(".money-detail strong");
 if(bal&&RB.prevMoney!==null&&RB.prevMoney!==undefined&&RB.prevMoney!==s.money &&x.preferences.animations){
  animateMoney(bal,RB.prevMoney,s.money,ctx.cash);
 }
 RB.prevMoney=s.money;
 const side=document.querySelector(".menu-panel");
 if(side){
  const reset=side.querySelector(".menu-reset");
  if(reset)reset.insertAdjacentHTML("beforebegin",
   '<button data-rb="goals"><span>🏆</span>Life Challenges</button>'+
   '<button data-rb="business"><span>🏢</span>Business Studio</button>'+
   '<button data-rb="journal"><span>📖</span>Life Journal</button>'+
   '<button data-rb="settings"><span>⚙️</span>Game Settings</button>');
 }
 const worldGrid=tab==="worlds"?document.querySelector(".world-grid"):null;
 if(worldGrid)worldGrid.insertAdjacentHTML("afterbegin",
  '<button class="world-entry" data-rb="business"><span class="world-entry-icon">🏢</span><span class="world-entry-copy"><strong>Business Studio</strong><small>Products, staff, supply and demand</small></span><span class="world-chevron">›</span></button>'+
  '<button class="world-entry" data-rb="goals"><span class="world-entry-icon">🏆</span><span class="world-entry-copy"><strong>Life Challenges</strong><small>Complete milestones and earn rewards</small></span><span class="world-chevron">›</span></button>');
 if(tab==="finances"&&!RB.screen){
  const main=document.querySelector(".subpage");
  const stack=main?.querySelector(".stack");
  if(stack)stack.insertAdjacentHTML("afterbegin",'<div class="lp-rb-card"><h3>🚀 Build a Business Empire</h3><p>Run your own company with dynamic product demand, employees, pricing, and yearly reports.</p><button class="large-cta" data-rb="business">🏢 Open Business Studio ›</button></div>');
 }
 if(tab==="life"){
  const home=document.querySelector(".life-view");
  if(home){
   const cur=RB.milestones(s);
   const w=s.extras.world||{};
   const header=`<div class="lp-story-strip"><div class="lp-story-icon">✦</div>
    <div><strong>${s.age<18?"Your journey is just beginning":s.age<60?"Write your own story":"Every year makes a legacy"}</strong>
    <span>${cur.completed} / ${cur.total} goals · ${w.fame||0} fame · ${s.log?.length||0} memories</span></div>
    <button data-rb="goals">GOALS ›</button></div>`;
   home.insertAdjacentHTML("afterbegin",header);
  }
 }
 // Replace current secondary page only when a new expanded game mode is active.
 if(RB.screen){
  const r=renderCustom(s,RB.screen),sub=document.querySelector(".subpage");
  if(r&&sub){sub.innerHTML=`<div class="subhead"><button class="back-button" data-rb="close" aria-label="Return to Assets">‹</button>${r.title}</div>${r.html}`;}
 }
 // Accessible modal focus and popup enhancements.
 const nativeModal=document.querySelector(".modal-layer .modal");
 if(nativeModal)nativeModal.classList.add("lp-animated-dialog");
 if(RB.modal){
  app.insertAdjacentHTML("beforeend",makeModal(s));
 }
 if(RB.prevAge!==null&&RB.prevAge!==undefined&&s.age>RB.prevAge&&x.preferences.animations){
  if(s.age%10===0||s.achievements?.length>RB.prevAchievements)celebrate(18);
 }
 RB.prevAge=s.age;RB.prevAchievements=s.achievements?.length||0;
 if(!RB.initialized)initEffects(ctx);
}

function animateMoney(el,from,to,formatter){
 if(Math.abs(to-from)<1 || !Number.isFinite(to)||!Number.isFinite(from))return;
 const duration=500;const start=performance.now();
 function frame(t){
  if(!el.isConnected)return;
  const p=Math.min(1,(t-start)/duration),ease=1-Math.pow(1-p,3);
  el.textContent=formatter(from+(to-from)*ease);
  if(p<1)requestAnimationFrame(frame);
  else el.textContent=formatter(to);
 }
 requestAnimationFrame(frame);
}

function celebrate(count=20){
 if(typeof document==="undefined")return;
 const root=document.createElement("div");
 root.className="lp-celebration";root.setAttribute("aria-hidden","true");
 const colors=["#16bb71","#fdc15d","#17b9d8","#ff7890","#fff0ba","#4c92de"];
 for(let i=0;i<count;i++){
  const bit=document.createElement("i");
  bit.className="lp-confetti";
  bit.style.left=(4+Math.random()*92)+"%";
  bit.style.background=colors[i%colors.length];
  bit.style.setProperty("--fall",(1.8+Math.random()*1.5)+"s");
  bit.style.setProperty("--drift",(-90+Math.random()*180)+"px");
  bit.style.setProperty("--rot",(240+Math.random()*700)+"deg");
  bit.style.animationDelay=(Math.random()*.35)+"s";
  root.appendChild(bit);
 }
 document.body.appendChild(root);setTimeout(()=>root.remove(),3900);
}

function tone(which,s){
 const x=s?RB.ensure(s):null;
 if(!x?.preferences?.sound)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return;
  if(!RB.audio)RB.audio=new AC();
  const c=RB.audio,osc=c.createOscillator(),gain=c.createGain(),t=c.currentTime;
  osc.type="sine";osc.frequency.setValueAtTime(which==="success"?680:which==="age"?480:540,t);
  osc.frequency.exponentialRampToValueAtTime(which==="success"?980:720,t+.09);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.075,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+.16);
  osc.connect(gain);gain.connect(c.destination);osc.start(t);osc.stop(t+.18);
 }catch(_){}
}

function initEffects(ctx){
 if(RB.initialized)return;
 RB.initialized=true;
 if(typeof document.addEventListener!=="function")return;
 document.addEventListener("pointerdown",e=>{
  const button=e.target.closest?.("button");if(!button||button.disabled)return;
  const state=ctx.getState();
  if(state)tone(button.dataset.age!==undefined?"age":"click",state);
  if(!state||!RB.ensure(state).preferences.animations||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return;
  if(!(button.classList.contains("lp-rb-btn")||button.classList.contains("lp-row")||button.classList.contains("age-button")))return;
  if(!button.getBoundingClientRect)return;
  const rect=button.getBoundingClientRect(),d=Math.max(rect.width,rect.height);
  const ripple=document.createElement("span");ripple.className="lp-ripple";
  ripple.style.width=ripple.style.height=d+"px";
  ripple.style.left=(e.clientX-rect.left-d/2)+"px";
  ripple.style.top=(e.clientY-rect.top-d/2)+"px";
  button.style.position="relative";button.style.overflow="hidden";
  button.appendChild(ripple);setTimeout(()=>ripple.remove(),650);
 },{passive:true});
}

function handle(button,ctx){
 if(!button||!ctx.getState())return false;
 const d=button.dataset,s=ctx.getState(),x=RB.ensure(s);
 const id=d.rb;
 const res=(result)=>{
  if(result?.ok){ctx.save();ctx.render();if(result.celebrate)celebrate(26);tone("success",s);}
  else if(result?.message)ctx.notice(result.message,true);
 };
 if(id){
  if(["business","goals","journal","settings"].includes(id)){
   RB.screen=id;RB.owner="finances";RB.modal=null;
   if(ctx.getTab()!=="finances")ctx.setTab("finances");
   ctx.render();
  }else if(id==="close"){
   RB.screen=null;RB.modal=null;ctx.render();
  }else if(id==="profile"){
   RB.screen=null;ctx.setTab("profile");ctx.render();
  }else return false;
  return true;
 }
 if(d.rba){
  if(d.rba==="launch"){
   RB.modal={type:"launch",sector:d.id};ctx.render();return true;
  }
  if(d.rba==="sell"){
   RB.modal={type:"sell"};ctx.render();return true;
  }
  const result=RB.companyAction(s,d.rba,d.index,ctx);
  res(result);return true;
 }
 if(d.rbgoal){
  res(RB.claimGoal(s,d.rbgoal,ctx));return true;
 }
 if(d.rbsetting){
  if(["sound","animations"].includes(d.rbsetting)){
   x.preferences[d.rbsetting]=!x.preferences[d.rbsetting];
   ctx.save();ctx.render();
  }
  return true;
 }
 if(d.rbm){
  if(d.rbm==="close"){RB.modal=null;ctx.render();return true;}
  if(d.rbm==="start"){
   const name=document.getElementById("lp-business-name")?.value||"";
   const result=RB.launchCompany(s,RB.modal?.sector,name,ctx);
   if(result.ok)RB.modal=null;
   res(result);
   return true;
  }
  if(d.rbm==="confirm-sell"){
   const result=RB.companyAction(s,"sell",null,ctx);
   RB.modal=null;res(result);return true;
  }
 }
 return false;
}
RB.enhance=enhance;RB.handle=handle;RB.celebrate=celebrate;
})();