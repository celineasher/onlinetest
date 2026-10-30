/* LifePath Reimagined — simulation extension, original code */
(function(){
'use strict';
const sectors=[{"id":"cafe","icon":"☕","name":"Coffee & Bakery","cost":45000,"market":33000,"products":[["House Blend",7,3.1],["Butter Croissant",6,2.3],["Iced Latte",8,3.3],["Signature Cake",12,5.1]],"flavor":"Build a neighborhood café into a nationwide favorite."},{"id":"games","icon":"🎮","name":"Game Studio","cost":65000,"market":9000,"products":[["Indie Adventure",39,12],["Puzzle Game",22,8],["Arcade Collection",19,7],["Expansion Pack",15,5]],"flavor":"Ship games, build a fanbase, and turn creativity into profit."},{"id":"fashion","icon":"👟","name":"Fashion Label","cost":55000,"market":15000,"products":[["Streetwear Tee",45,19],["Designer Hoodie",110,47],["Signature Sneaker",175,72],["Capsule Collection",230,100]],"flavor":"Design desirable collections and build an international label."},{"id":"tech","icon":"💻","name":"Consumer Tech","cost":95000,"market":8000,"products":[["Smart Speaker",190,85],["Tablet",540,290],["Wireless Headphones",230,95],["Smartwatch",350,158]],"flavor":"Bring original technology products to market."},{"id":"fitness","icon":"💪","name":"Fitness Brand","cost":50000,"market":21000,"products":[["Workout Program",29,7],["Gym Bottle",18,6],["Training Wear",75,33],["Home Fitness Kit",180,81]],"flavor":"Help people stay active while building your brand."}];
const goals=[{"id":"teen","icon":"🎓","title":"First steps","desc":"Reach age 18","target":18,"reward":1500},{"id":"smart","icon":"🧠","title":"Sharp mind","desc":"Reach 85 intelligence","target":85,"reward":2500},{"id":"job","icon":"💼","title":"Career starter","desc":"Get a full-time job","target":1,"reward":2500},{"id":"cash","icon":"💵","title":"Savings milestone","desc":"Save $100,000","target":100000,"reward":5000},{"id":"family","icon":"❤️","title":"Family first","desc":"Raise a child","target":1,"reward":3500},{"id":"creator","icon":"🎨","title":"Creative spark","desc":"Reach 80 creativity","target":80,"reward":4500},{"id":"fame","icon":"⭐","title":"Rising star","desc":"Reach 50 fame","target":50,"reward":6500},{"id":"builder","icon":"🏢","title":"Founder","desc":"Launch a profitable company","target":1,"reward":7500},{"id":"property","icon":"🏠","title":"Homeowner","desc":"Own a property","target":1,"reward":4000},{"id":"legacy","icon":"🧬","title":"New generation","desc":"Continue your family's legacy","target":2,"reward":12500}];
function rand(a,b){return Math.floor(a+Math.random()*(b-a+1))}

function ensure(s){
 if(!s||typeof s!=="object")return null;
 if(!s.extras||typeof s.extras!=="object")s.extras={};
 if(!s.extras.reimagined||typeof s.extras.reimagined!=="object")s.extras.reimagined={};
 const x=s.extras.reimagined;
 if(!x.business||typeof x.business!=="object")x.business=null;
 if(!x.goalClaims||typeof x.goalClaims!=="object")x.goalClaims={};
 if(!x.cooldowns||typeof x.cooldowns!=="object")x.cooldowns={};
 if(!x.preferences||typeof x.preferences!=="object")x.preferences={sound:false,animations:true};
 if(!Number.isFinite(x.lastYearTick))x.lastYearTick=-1;
 if(!Number.isFinite(x.milestones))x.milestones=0;
 if(!Number.isFinite(x.businessRevenue))x.businessRevenue=0;
 if(!Number.isFinite(x.turnsPlayed))x.turnsPlayed=0;
 if(!Array.isArray(x.journal))x.journal=[];
 return x;
}

function goalProgress(s,id){
 const x=ensure(s),w=s.extras?.world||{};
 switch(id){
 case "teen":return s.age;
 case "smart":return s.stats?.smarts||0;
 case "job":return s.job||w.special?.id?1:0;
 case "cash":return Math.max(0,s.money);
 case "family":return s.children||0;
 case "creator":return s.extras?.creativity||0;
 case "fame":return w.fame||0;
 case "builder":return x.business&&x.business.active&&x.business.cumulativeProfit>0?1:0;
 case "property":return s.assets?.some(a=>a.type==="Property"||a.id==="home")?1:0;
 case "legacy":return w.generations||1;
 default:return 0;
 }
}

function milestones(s){
 const x=ensure(s);
 const done=goals.filter(q=>goalProgress(s,q.id)>=q.target);
 return {completed:done.length,total:goals.length,claimed:Object.keys(x.goalClaims).length};
}

function calcCompany(b){
 if(!b||!b.active)return 0;
 const productValue=(b.products||[]).reduce((n,p)=>n+Math.max(0,p.price-p.cost)*450,0);
 return Math.max(0,Math.round(b.cash+Math.max(0,b.facilities)*30000+b.brand*1600+productValue+b.employees*3000));
}

function launchCompany(s,id,name,ctx){
 const info=sectors.find(x=>x.id===id);
 if(!info||!s.alive||s.age<18)return {ok:false,message:"You must be at least 18."};
 const x=ensure(s);
 if(x.business?.active)return {ok:false,message:"You already operate a company."};
 if(s.money<info.cost)return {ok:false,message:"You need "+ctx.cash(info.cost)+" to start."};
 const title=String(name||"").trim().slice(0,34)||s.name.split(" ")[0]+"'s "+info.name;
 s.money-=info.cost;
 x.business={id,industry:info.name,name:title,icon:info.icon,active:true,
 cash:Math.round(info.cost*.72),employees:3,brand:32,morale:79,facilities:1,
 products:[{id:info.products[0][0].toLowerCase().replace(/\W/g,"_"),name:info.products[0][0],price:info.products[0][1],cost:info.products[0][2],quality:53,marketing:12,annualSales:0}],
 years:0,cumulativeProfit:0,valuation:info.cost,totalSales:0,history:[],lastReport:null,launchedAt:s.age};
 ctx.log("🏢","A business is born",`You founded ${title} in the ${info.name.toLowerCase()} industry.`);
 ctx.stat("happiness",8);
 return {ok:true,message:"Company launched!"};
}

function companyAction(s,action,subject,ctx){
 const x=ensure(s),b=x.business;
 if(!b?.active||!s.alive)return {ok:false,message:"No active company."};
 const money=n=>ctx.cash(Math.round(n));
 let used=false;
 function spend(amount){if(b.cash<amount)return false;b.cash-=amount;return true;}
 switch(action){
 case "hire":{
  const cost=4000;
  if(!spend(cost))return {ok:false,message:"The company needs "+money(cost)+" in cash."};
  const count=2; b.employees+=count;b.morale=Math.min(100,b.morale+4);
  ctx.log("🤝","Growing the team",`${b.name} hired ${count} new employees.`);
  break;
 }
 case "fire":{
  if(b.employees<=1)return {ok:false,message:"You must keep at least one employee."};
  b.employees=Math.max(1,b.employees-1);b.morale=Math.max(0,b.morale-12);
  ctx.log("📉","Staff cuts",`You reduced the team at ${b.name}.`);
  break;
 }
 case "expand":{
  const cost=70000*b.facilities;
  if(!spend(cost))return {ok:false,message:"Expansion needs "+money(cost)+" in company cash."};
  b.facilities++;b.brand=Math.min(100,b.brand+4);b.morale=Math.min(100,b.morale+5);
  ctx.log("🏗️","A bigger operation",`${b.name} expanded to ${b.facilities} facilities.`);
  break;
 }
 case "dividend":{
  if(b.cash<25000)return {ok:false,message:"Keep at least $25,000 in company cash before taking dividends."};
  const amount=Math.min(15000,Math.floor(b.cash*.15));b.cash-=amount;s.money+=amount;
  ctx.log("💵","Owner's dividend",`Your company paid you ${money(amount)}.`);
  break;
 }
 case "marketing":{
  const p=b.products[Number(subject)];if(!p)return {ok:false,message:"Product not found."};
  if(!spend(5000))return {ok:false,message:"You need $5,000 in company cash."};
  p.marketing=Math.min(100,p.marketing+12);b.brand=Math.min(100,b.brand+4);
  ctx.log("📣","Marketing campaign",`You promoted ${p.name} to new customers.`);
  break;
 }
 case "research":{
  const p=b.products[Number(subject)];if(!p)return {ok:false,message:"Product not found."};
  if(p.quality>=99)return {ok:false,message:"This product is already at maximum quality."};
  if(!spend(10000))return {ok:false,message:"Research requires $10,000 in company cash."};
  p.quality=Math.min(100,p.quality+8);b.brand=Math.min(100,b.brand+2);
  ctx.log("🔬","Research breakthrough",`${p.name} has improved in quality.`);
  break;
 }
 case "priceup":
 case "pricedown":{
  const p=b.products[Number(subject)];if(!p)return {ok:false,message:"Product not found."};
  const next=action==="priceup"?p.price*1.1:p.price*.9;
  if(next<p.cost*1.05||next>p.cost*9)return {ok:false,message:"That price is outside reasonable market limits."};
  p.price=Math.max(1,Math.round(next*100)/100);
  ctx.log("🏷️","New pricing",`${b.name} adjusted the price of ${p.name} to ${money(p.price)}.`);
  break;
 }
 case "product":{
  const info=sectors.find(q=>q.id===b.id);
  const available=info?.products.filter(q=>!b.products.some(p=>p.name===q[0]))||[];
  if(!available.length)return {ok:false,message:"You've developed every available product."};
  if(!spend(18000))return {ok:false,message:"New product development requires $18,000."};
  const next=available[0];
  b.products.push({id:next[0].toLowerCase().replace(/\W/g,"_"),name:next[0],price:next[1],cost:next[2],quality:rand(50,68),marketing:10,annualSales:0});
  ctx.log("✨","New product launch",`${b.name} introduced ${next[0]}.`);
  break;
 }
 case "morale":{
  if(!spend(2500))return {ok:false,message:"You need $2,500 in company cash."};
  b.morale=Math.min(100,b.morale+12);b.brand=Math.min(100,b.brand+2);
  ctx.log("🎉","Team celebration",`Your employees enjoyed a team appreciation event.`);
  break;
 }
 case "sell":{
  const value=calcCompany(b);
  const proceeds=Math.round(Math.max(0,value)*.84);
  if(!Number.isFinite(proceeds))return {ok:false,message:"Valuation unavailable."};
  s.money+=proceeds;b.active=false;b.saleAmount=proceeds;
  ctx.log("🤝","A business exit",`You sold ${b.name} for ${money(proceeds)}.`);
  ctx.stat("happiness",9);
  break;
 }
 default:return {ok:false,message:"Unknown business action."};
 }
 if(action!=="sell")b.valuation=calcCompany(b);
 return {ok:true,message:"Action completed"};
}

function tick(s,ctx){
 if(!s?.alive)return false;
 const x=ensure(s);
 if(x.lastYearTick===s.age)return false;
 x.lastYearTick=s.age;x.turnsPlayed++;
 const b=x.business;
 if(!b?.active)return true;
 b.years++;
 const sector=sectors.find(a=>a.id===b.id)||sectors[0];
 const marketShock=.8+Math.random()*.45;
 const specialNews=Math.random()<.11;
 const marketTrend=specialNews?(Math.random()<.5?.7:1.35):1;
 const market=marketShock*marketTrend;
 const demandBase=sector.market*(1+b.brand/175)*(0.8+b.morale/500)*market;
 const capacity=Math.round(b.facilities*20000+b.employees*4000);
 let revenue=0,materials=0,totalUnits=0;
 const n=Math.max(1,b.products.length);
 for(const p of b.products){
   const typical=sector.products.find(q=>q[0]===p.name)||[p.name,p.price,p.cost];
   const baseline=typical[1];
   const priceFactor=Math.max(.25,Math.min(2.2,Math.pow(baseline/Math.max(1,p.price),1.45)));
   const demand=Math.max(0,Math.round((demandBase/n)*priceFactor*(.5+p.quality/100)*(1+p.marketing/95)));
   const sales=Math.min(Math.round(capacity/n),demand);
   p.annualSales=sales;p.lastDemand=demand;
   revenue+=sales*p.price;materials+=sales*p.cost;totalUnits+=sales;
   p.marketing=Math.max(0,Math.round(p.marketing*.75));
 }
 const wages=b.employees*21000;
 const rent=b.facilities*14000;
 const expenses=materials+wages+rent;
 const profit=Math.round(revenue-expenses);
 b.cash+=profit;b.cumulativeProfit+=profit;b.totalSales+=totalUnits;
 b.brand=Math.max(0,Math.min(100,b.brand+ (profit>0?rand(0,3):-rand(1,4))));
 b.morale=Math.max(0,Math.min(100,b.morale+rand(-4,3)));
 const ownerDraw=profit>0&&b.cash>25000?Math.min(Math.round(profit*.15),30000):0;
 if(ownerDraw){s.money+=ownerDraw;b.cash-=ownerDraw;}
 b.valuation=calcCompany(b);
 const report={year:s.age,market:Math.round(market*100),revenue:Math.round(revenue),materials:Math.round(materials),wages,rent,profit,ownerDraw,units:totalUnits,marketEvent:specialNews};
 b.lastReport=report;
 b.history.push(report);
 if(b.history.length>24)b.history.shift();
 x.businessRevenue+=Math.max(0,revenue);
 const money=n=>ctx.cash(Math.abs(Math.round(n)));
 ctx.log(profit>=0?"📈":"📉","Company annual report",`${b.name} ${profit>=0?"earned":"lost"} ${money(profit)} this year across ${totalUnits.toLocaleString()} sales.${ownerDraw?" You collected "+money(ownerDraw)+" in dividends.":""}`);
 if(specialNews){ctx.log("📰","Market turbulence",marketTrend>1?"Customer demand surged in your sector.":"Changing consumer habits reduced demand this year.");}
 if(b.cash< -120000){
   b.active=false;b.valuation=0;
   ctx.log("💔","Business closure",`${b.name} ran out of operating funds and closed.`);
   ctx.stat("happiness",-16);
 }
 return true;
}

function claimGoal(s,id,ctx){
 if(!s?.alive)return {ok:false,message:"Your current life has ended."};
 const q=goals.find(q=>q.id===id);
 if(!q)return {ok:false,message:"Goal not found."};
 const x=ensure(s);
 if(x.goalClaims[id])return {ok:false,message:"Already claimed."};
 if(goalProgress(s,id)<q.target)return {ok:false,message:"Goal not completed yet."};
 x.goalClaims[id]=s.age;s.money+=q.reward;x.milestones++;
 ctx.log("🏆","Challenge complete",`You completed ${q.title} and received ${ctx.cash(q.reward)}.`);
 ctx.stat("happiness",5);
 return {ok:true,message:"Reward claimed!",celebrate:true};
}

function makeEvent(s,ctx){
 if(!s||!s.alive||Math.random()>.62)return null;
 const x=ensure(s);
 const candidates=[];
 const add=(key,minAge,maxAge,weight,icon,title,text,choices,check)=>{if(s.age<minAge||s.age>maxAge||check&&!check())return;if((x.cooldowns[key]??-100)>s.age-4)return;for(let i=0;i<weight;i++)candidates.push({key,icon,title,text,choices});};
 const option=(text,fn)=>({text,fn:()=>{fn();x.cooldowns[current.key]=s.age;}});
 let current=null;
 add("school_event",6,17,2,"📚","The Class Project","Your class is preparing a big group project, but one classmate has stopped helping.",[
 ["Take the lead",()=>{ctx.stat("smarts",6);ctx.stat("happiness",-3);ctx.log("📚","A strong leader","You guided the project to completion.");}],
 ["Talk it out",()=>{ctx.stat("happiness",5);ctx.log("🤝","Teamwork","You resolved the dispute by talking.");}],
 ["Let the project fail",()=>{ctx.stat("smarts",-4);ctx.log("📝","A missed opportunity","Your team's project didn't go well.");}]
 ]);
 add("firstjob",18,38,2,"💼","A New Opportunity","A company across town offers an interview for an exciting role.",[
 ["Prepare diligently",()=>{ctx.stat("smarts",3);ctx.log("💼","A promising interview","You prepared an impressive interview.");}],
 ["Ask a friend for advice",()=>{ctx.stat("happiness",6);ctx.log("🤝","Getting advice","Your friend helped you find your strengths.");}],
 ["Skip it",()=>{ctx.stat("happiness",-2);ctx.log("🚪","Passed opportunity","You stayed focused on your current path.");}]
 ]);
 add("founder",18,85,3,"🏢","A Competitor Appears",`A rival company has started selling products similar to those from ${x.business?.name||"your company"}.`,[
 ["Improve your products",()=>{const b=x.business;if(b?.active){b.products.forEach(p=>p.quality=Math.min(100,p.quality+5));b.cash-=5000;}ctx.log("🔬","Product innovation","You answered competition with improved quality.");}],
 ["Run a marketing campaign",()=>{const b=x.business;if(b?.active){b.brand=Math.min(100,b.brand+9);b.cash-=3500;}ctx.log("📣","A bold campaign","Your brand gained fresh attention.");}],
 ["Keep your strategy",()=>{ctx.log("🤝","Confidence in your products","You chose to stay the course.");}]
 ],()=>x.business?.active);
 add("founderwin",18,90,2,"💵","A Large Wholesale Order","A major retailer asks your company to fulfill a special order.",[
 ["Accept the order",()=>{const b=x.business;b.cash+=rand(7000,40000);b.brand=Math.min(100,b.brand+3);ctx.log("📦","Major order","You secured a high-value business deal.");}],
 ["Negotiate terms",()=>{const b=x.business;const gain=rand(-3000,50000);b.cash+=gain;ctx.log("🤝","Negotiation",gain>0?"Your negotiation was a success.":"The buyer walked away from the offer.");}],
 ["Decline the offer",()=>ctx.log("📦","No rush","You decided to focus on existing customers.")]
 ],()=>x.business?.active&&x.business.years>=1);
 add("partner",18,90,2,"❤️","A Question of Time","Your partner says you have been too busy lately.",[
 ["Plan a thoughtful date",()=>{s.money-=200;const p=s.people.find(p=>p.type==="Partner"&&p.alive);if(p)p.closeness=Math.min(100,p.closeness+12);ctx.stat("happiness",7);ctx.log("❤️","Making time","You had a lovely evening together.");}],
 ["Promise to change",()=>{const p=s.people.find(p=>p.type==="Partner"&&p.alive);if(p)p.closeness=Math.min(100,p.closeness+5);ctx.log("💬","A promise","You agreed to make more time for one another.");}],
 ["Dismiss the concern",()=>{const p=s.people.find(p=>p.type==="Partner"&&p.alive);if(p)p.closeness=Math.max(0,p.closeness-12);ctx.stat("happiness",-5);ctx.log("💔","A difficult conversation","Your partner felt ignored.");}]
 ],()=>s.people.some(p=>p.type==="Partner"&&p.alive));
 add("invest",18,90,2,"📈","Market Rumors","An optimistic headline predicts a great year for investors.",[
 ["Keep a balanced plan",()=>{ctx.stat("smarts",2);ctx.log("📚","Financial research","You avoided making decisions based solely on a headline.");}],
 ["Buy more investments",()=>{if(s.money>=3000){s.money-=3000;s.extras.invested=(s.extras.invested||0)+3000;ctx.log("💵","New investment","You invested another $3,000.");}else ctx.log("💵","Not enough savings","You couldn't afford to invest.");}],
 ["Ignore the market",()=>ctx.log("🏠","Unchanged portfolio","You chose to focus on your everyday life.")]
 ]);
 add("care",36,110,2,"🩺","A Health Wake-up Call","Your doctor asks you to make a few changes to your routine.",[
 ["Follow medical advice",()=>{ctx.stat("health",10);ctx.log("🩺","Looking after yourself","You started a healthier routine.");}],
 ["Take a vacation",()=>{s.money-=1500;ctx.stat("happiness",13);ctx.log("🌴","Time to reset","You took a restorative holiday.");}],
 ["Keep things the same",()=>{ctx.stat("health",-4);ctx.log("🫤","No changes","You decided not to change your habits.");}]
 ]);
 add("midlife",45,85,2,"🌅","An Unexpected Invitation","An old friend invites you to reconnect over a weekend.",[
 ["Meet your old friend",()=>{ctx.stat("happiness",10);ctx.log("🤝","Reconnected","You shared memories and made new ones.");}],
 ["Send a warm message",()=>{ctx.stat("happiness",4);ctx.log("💬","Keeping in touch","You sent a thoughtful message.");}],
 ["Stay home",()=>ctx.log("🏡","A peaceful weekend","You relaxed instead.")]
 ]);
 if(!candidates.length)return null;
 current=candidates[Math.floor(Math.random()*candidates.length)];
 return {icon:current.icon,title:current.title,text:current.text,choices:current.choices.map(a=>option(a[0],a[1]))};
}
window.LifePathReimagined={sectors,goals,ensure,goalProgress,milestones,calcCompany,launchCompany,companyAction,tick,claimGoal,makeEvent};
})();