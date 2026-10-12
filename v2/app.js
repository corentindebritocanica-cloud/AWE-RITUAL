const $=id=>document.getElementById(id);
const TAU=Math.PI*2, rad=d=>d*Math.PI/180, norm=a=>((a%360)+360)%360;
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

/* ---------- Données ---------- */
const SIGNS=[["Bélier","Feu"],["Taureau","Terre"],["Gémeaux","Air"],["Cancer","Eau"],["Lion","Feu"],["Vierge","Terre"],["Balance","Air"],["Scorpion","Eau"],["Sagittaire","Feu"],["Capricorne","Terre"],["Verseau","Air"],["Poissons","Eau"]];
const ELS=["Feu","Eau","Air","Terre"];
const INK={Feu:"--pink",Eau:"--blue",Air:"--yellow",Terre:"--green"};
const POOL={
 Feu:[["J'ai envie de commencer quelque chose aujourd'hui.","élan"],["Je suis prêt·e à dire ce que je pense.","franchise"],["Mon corps réclame du mouvement.","vitalité"],["J'ai besoin qu'on me remarque un peu.","rayonnement"],["Une petite colère me traverse, et c'est ok.","intensité"]],
 Eau:[["J'ai besoin de silence.","intériorité"],["Mes émotions sont à fleur de peau.","sensibilité"],["Je pense à quelqu'un qui me manque.","lien"],["Mes rêves de cette nuit me reviennent.","intuition"],["J'ai envie de prendre soin de quelqu'un.","tendresse"]],
 Air:[["Mon esprit saute d'une idée à l'autre.","curiosité"],["J'ai envie de parler à quelqu'un de nouveau.","ouverture"],["J'ai besoin de sortir prendre l'air.","légèreté"],["Je vois la situation sous un autre angle.","recul"],["J'ai envie d'apprendre un truc aujourd'hui.","éveil"]],
 Terre:[["J'ai besoin de ranger mon espace.","ancrage"],["Je veux du concret, pas des promesses.","lucidité"],["Mon corps demande du repos.","repos"],["J'ai envie de cuisiner quelque chose de bon.","gourmandise"],["Je me sens stable aujourd'hui.","stabilité"]]};
const ARC=["Le Mat","Le Bateleur","La Papesse","L'Impératrice","L'Empereur","Le Pape","L'Amoureux","Le Chariot","La Justice","L'Hermite","La Roue de Fortune","La Force","Le Pendu","L'Arcane sans nom","Tempérance","Le Diable","La Maison Dieu","L'Étoile","La Lune","Le Soleil","Le Jugement","Le Monde"];
const ARC_EL=["Air","Feu","Eau","Terre","Feu","Terre","Air","Eau","Air","Terre","Feu","Feu","Eau","Eau","Air","Terre","Feu","Air","Eau","Feu","Feu","Terre"];
const CHAKRA=[["racine","Terre"],["sacré","Eau"],["plexus solaire","Feu"],["cœur","Air"],["gorge","Air"],["troisième œil","Eau"],["couronne","Feu"]];
const FOR_EL={
 Feu:{mantra:"J'ose prendre ma place.",yoga:"Guerrier II",why:"Ça brûle doucement"},
 Eau:{mantra:"J'accueille ce que je ressens.",yoga:"Posture de l'enfant",why:"Ça coule en dedans"},
 Air:{mantra:"Je laisse circuler.",yoga:"Respiration alternée",why:"Ça circule"},
 Terre:{mantra:"Je suis ici, maintenant.",yoga:"Tadasana, la montagne",why:"Ça s'enracine"}};

/* ---------- Astronomie simplifiée ---------- */
const J2000=Date.UTC(2000,0,1,12),days=d=>(d.getTime()-J2000)/864e5;
function sunLon(d){const n=days(d),L=280.46+.9856474*n,g=rad(357.528+.9856003*n);return norm(L+1.915*Math.sin(g)+.02*Math.sin(2*g))}
function moonLon(d){const n=days(d),L=218.316+13.176396*n,M=rad(134.963+13.064993*n),D=rad(297.85+12.190749*n);return norm(L+6.289*Math.sin(M)+1.274*Math.sin(2*D-M)+.658*Math.sin(2*D)+.214*Math.sin(2*M))}
const sign=l=>SIGNS[Math.floor(l/30)];
const phaseName=p=>p<.03||p>.97?"nouvelle":p<.47?"croissante":p<.53?"pleine":"décroissante";

/* ---------- Utilitaires ---------- */
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const NOW=new Date(),TODAY=key(NOW);

/* ---------- Profil et ciel du jour ---------- */
let birth=store.get("aura-birth","1995-06-21");$("birth").value=birth;
function profile(){const b=new Date(birth+"T12:00:00Z");return{sun:sign(sunLon(b))}}
function sky(){const ms=sign(moonLon(NOW)),p=norm(moonLon(NOW)-sunLon(NOW))/360,seed=hash(TODAY+birth),arc=seed%22,ch=CHAKRA[(seed>>>5)%7];
  return{moon:ms,phase:phaseName(p),arc,ch,seed}}

/* ---------- Cartes du jour ---------- */
function todaysCards(){const s=sky(),pr=profile(),r=rng(s.seed),out=[],used=new Set();
  const lenses=[[`Lune ${s.phase} en ${s.moon[0]}`,s.moon[1]],[`Arcane · ${ARC[s.arc]}`,ARC_EL[s.arc]],[`Chakra du ${s.ch[0]}`,s.ch[1]],[`Ton signe · ${pr.sun[0]}`,pr.sun[1]],[`Lune ${s.phase} en ${s.moon[0]}`,s.moon[1]],["Ton corps, ce matin",ELS[Math.floor(r()*4)]],["Ton souffle",ELS[Math.floor(r()*4)]]];
  lenses.forEach(([lens,el],i)=>{let st;do{st=POOL[el][Math.floor(r()*5)]}while(used.has(st[0])&&used.size<20);used.add(st[0]);out.push({lens,el,t:st[0],kw:st[1],i})});
  for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
let cards=todaysCards();
let answers=(()=>{const a=store.get("aura-answers",null);return a&&a.date===TODAY&&a.birth===birth?a.list:[]})();
const saveAnswers=()=>store.set("aura-answers",{date:TODAY,birth,list:answers});

/* ---------- Scores ---------- */
function scores(list=answers){const pr=profile(),s=sky(),sc={Feu:.6,Eau:.6,Air:.6,Terre:.6};sc[pr.sun[1]]+=1;sc[s.moon[1]]+=.6;
  list.forEach(a=>{const c=cards[a.i];if(!c)return;sc[c.el]+=a.me?1.4:-.35});ELS.forEach(e=>sc[e]=Math.max(.15,sc[e]));return sc}
function words(){const kw=answers.filter(a=>a.me).map(a=>cards[a.i].kw);if(kw.length>=3)return kw.slice(0,3);
  const sc=scores(),order=[...ELS].sort((a,b)=>sc[b]-sc[a]);const fill=order.map(e=>POOL[e][0][1]);return[...kw,...fill].filter((v,i,a)=>a.indexOf(v)===i).slice(0,3)}
const dominant=sc=>[...ELS].sort((a,b)=>sc[b]-sc[a])[0];

/* ---------- Aura (canvas, encres riso superposées + grain) ---------- */
function drawAura(cv,sc,seed,detail=true){
  const ctx=cv.getContext("2d"),W=cv.width,H=cv.height,r=rng(seed);
  ctx.globalCompositeOperation="source-over";ctx.fillStyle=css("--card");ctx.fillRect(0,0,W,H);
  ctx.globalCompositeOperation=css("--blend")||"multiply";
  const tot=ELS.reduce((a,e)=>a+sc[e],0);
  ELS.forEach(e=>{const col=css(INK[e]),share=sc[e]/tot,n=1+Math.round(share*4);
    for(let k=0;k<n;k++){const x=W*(.2+r()*.6),y=H*(.22+r()*.56),rr=W*(.16+share*.55)*(.7+r()*.5);
      const g=ctx.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,col+"a8");g.addColorStop(.5,col+"6e");g.addColorStop(1,col+"00");
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rr,0,TAU);ctx.fill()}});
  if(detail){/* trame demi-teinte : points réguliers qui laissent voir le papier */
    ctx.globalCompositeOperation="source-over";ctx.fillStyle=css("--card");const step=W/90;
    for(let y=0;y<H;y+=step)for(let x=(y/step)%2?step/2:0;x<W;x+=step){ctx.globalAlpha=.28;ctx.beginPath();ctx.arc(x,y,step*.22,0,TAU);ctx.fill()}
    ctx.globalAlpha=1;
    /* grain */
    const img=ctx.getImageData(0,0,W,H),d=img.data;for(let i=0;i<d.length;i+=4){const n=(r()-.5)*26;d[i]+=n;d[i+1]+=n;d[i+2]+=n}ctx.putImageData(img,0,0)}
  ctx.globalCompositeOperation="source-over";
}

/* ---------- Deck : glisser 1:1, validation à la vitesse ---------- */
const deck=$("deck");let nodes=new Map(),drag=null;
function cardEl(c){const el=document.createElement("article");el.className="card";el.tabIndex=-1;
  el.innerHTML=`<span class="blob" style="background:var(${INK[c.el]})"></span><div class="lens mono"><span>${c.lens}</span><span>${c.el}</span></div><p>${c.t}</p><span class="why">${FOR_EL[c.el].why}.</span><span class="stamp yes">C'EST MOI</span><span class="stamp no">PAS MOI</span>`;return el}
function remaining(){const done=new Set(answers.map(a=>a.i));return cards.filter(c=>!done.has(c.i))}
function layoutDeck(){const rem=remaining();
  [...nodes.keys()].forEach(i=>{if(!rem.slice(0,3).some(c=>c.i===i)&&!nodes.get(i).dataset.out){nodes.get(i).remove();nodes.delete(i)}});
  rem.slice(0,3).forEach((c,depth)=>{let el=nodes.get(c.i);if(!el){el=cardEl(c);nodes.set(c.i,el);el.style.transform=`translateY(${(depth+1)*12}px) scale(${1-(depth+1)*.04})`;el.style.opacity="0";deck.prepend(el);el.offsetWidth}
    el.style.zIndex=10-depth;el.style.transform=depth?`translateY(${depth*12}px) scale(${1-depth*.04})`:"";el.style.opacity=depth===2?".6":"1";el.setAttribute("aria-hidden",depth?"true":"false")});
  const n=answers.length;$("progress").innerHTML=cards.map((_,i)=>`<i class="${i<n?"on":""}"></i>`).join("");
  const fin=rem.length===0;$("done").hidden=!fin;$("actions").hidden=fin;deck.hidden=fin;$("swipeHint").hidden=fin}
function answer(me){const c=remaining()[0];if(!c)return;const el=nodes.get(c.i);answers.push({i:c.i,me});saveAnswers();
  if(el){el.dataset.out="1";const dir=me?1:-1;el.style.transition=reduceMotion?"opacity 200ms ease-out":"transform 340ms cubic-bezier(.23,1,.32,1),opacity 340ms ease-out";
    if(!reduceMotion)el.style.transform=`translate(${dir*(innerWidth*.9)}px,${(drag?drag.dy:0)*.4}px) rotate(${dir*18}deg)`;el.style.opacity="0";
    setTimeout(()=>{el.remove();nodes.delete(c.i)},360)}
  try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}
  layoutDeck();renderPortrait()}
deck.addEventListener("pointerdown",e=>{const c=remaining()[0];if(!c)return;const el=nodes.get(c.i);if(!el||!el.contains(e.target))return;
  el.setPointerCapture(e.pointerId);el.style.transition="none";drag={el,id:e.pointerId,x0:e.clientX,y0:e.clientY,dx:0,dy:0,vx:0,lx:e.clientX,lt:performance.now()}});
deck.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;const now=performance.now(),dt=Math.max(1,now-drag.lt);
  drag.vx=.6*drag.vx+.4*((e.clientX-drag.lx)/dt);drag.lx=e.clientX;drag.lt=now;drag.dx=e.clientX-drag.x0;drag.dy=e.clientY-drag.y0;
  drag.el.style.transform=`translate(${drag.dx}px,${drag.dy*.35}px) rotate(${drag.dx*.05}deg)`;
  const k=Math.min(1,Math.abs(drag.dx)/110);drag.el.querySelector(".stamp.yes").style.opacity=drag.dx>0?k:0;drag.el.querySelector(".stamp.no").style.opacity=drag.dx<0?k:0});
function endDrag(e){if(!drag||e.pointerId!==drag.id)return;const d=drag;
  const fling=Math.abs(d.vx)>.11&&Math.sign(d.vx)===Math.sign(d.dx),far=Math.abs(d.dx)>110;
  if((fling||far)&&Math.abs(d.dx)>12){answer(d.dx>0);drag=null;return}
  d.el.style.transition="transform 420ms cubic-bezier(.32,.72,0,1)";d.el.style.transform="";d.el.querySelectorAll(".stamp").forEach(s=>s.style.opacity=0);drag=null}
deck.addEventListener("pointerup",endDrag);deck.addEventListener("pointercancel",endDrag);
$("yesBtn").addEventListener("click",()=>answer(true));
$("noBtn").addEventListener("click",()=>answer(false));
addEventListener("keydown",e=>{if($("p1").hidden||e.target.tagName==="INPUT")return;if(e.key==="ArrowRight")answer(true);if(e.key==="ArrowLeft")answer(false)});
$("redo").addEventListener("click",()=>{answers=[];saveAnswers();nodes.forEach(n=>n.remove());nodes.clear();layoutDeck();renderPortrait()});
$("seePortrait").addEventListener("click",()=>tab(2));

/* ---------- Portrait ---------- */
function renderPortrait(){const sc=scores(),dom=dominant(sc),s=sky(),tot=ELS.reduce((a,e)=>a+sc[e],0);
  drawAura($("aura"),sc,hash(TODAY+birth));
  $("pDate").textContent=NOW.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"2-digit"});
  $("pWords").innerHTML=words().join("<br>");
  $("partial").hidden=answers.length>=cards.length;
  $("mix").innerHTML=ELS.map(e=>`<div class="bar"><span>${e}</span><div class="track"><div class="fill" style="background:var(${INK[e]});transform:scaleX(${(sc[e]/tot).toFixed(3)})"></div></div><span>${Math.round(sc[e]/tot*100)} %</span></div>`).join("");
  $("mantra").textContent=`« ${FOR_EL[dom].mantra} »`;$("fEl").textContent=dom;$("fYoga").textContent=FOR_EL[dom].yoga;
  $("fMoon").textContent=`${s.phase[0].toUpperCase()+s.phase.slice(1)} en ${s.moon[0]}`;$("fArc").textContent=ARC[s.arc]}
$("copyBtn").addEventListener("click",()=>{const sc=scores(),dom=dominant(sc),t=`Who am I? · ${NOW.toLocaleDateString("fr-FR")}\nAujourd'hui je suis : ${words().join(", ")}.\nÉlément : ${dom}. ${FOR_EL[dom].mantra}`;
  navigator.clipboard.writeText(t).then(()=>$("copied").textContent="Copié. Colle-le où tu veux.",()=>$("copied").textContent=t)});

/* ---------- Pile ---------- */
function renderPile(){const out=[];
  for(let k=11;k>=1;k--){const d=new Date(NOW);d.setDate(d.getDate()-k);const r=rng(hash(key(d))),sc={};ELS.forEach(e=>sc[e]=.2+r()*2);const dom=dominant(sc);out.push({d,sc,word:POOL[dom][Math.floor(r()*5)][1],sim:true})}
  const sc=scores();out.push({d:NOW,sc,word:words()[0],sim:false});
  $("pile").innerHTML=out.map((o,i)=>`<div class="tile"><canvas width="240" height="240" data-i="${i}"></canvas><span>${o.d.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric"})}${o.sim?"":" · aujourd'hui"}</span><em>${o.word}</em></div>`).join("");
  out.forEach((o,i)=>drawAura($("pile").querySelector(`canvas[data-i="${i}"]`),o.sc,hash(key(o.d)+birth),false))}

/* ---------- Onglets ---------- */
function tab(n){[1,2,3].forEach(i=>{$("t"+i).setAttribute("aria-selected",i===n);$("p"+i).hidden=i!==n});if(n===2)renderPortrait();if(n===3)renderPile()}
[1,2,3].forEach(i=>$("t"+i).addEventListener("click",()=>tab(i)));
$("t1").parentElement.addEventListener("keydown",e=>{const cur=[1,2,3].find(i=>$("t"+i).getAttribute("aria-selected")==="true");if(e.key==="ArrowRight"){tab(cur%3+1);$("t"+(cur%3+1)).focus()}if(e.key==="ArrowLeft"){const p=(cur+1)%3+1;tab(p);$("t"+p).focus()}});

/* ---------- En-tête ---------- */
function renderHead(){const s=sky(),pr=profile();
  $("today").textContent=NOW.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  $("sky").innerHTML=`Soleil natal <b>${pr.sun[0]}</b> · Lune <b>${s.phase}</b> en <b>${s.moon[0]}</b> · Arcane <b>${ARC[s.arc]}</b> · Chakra du <b>${s.ch[0]}</b>`}
$("birth").addEventListener("change",e=>{if(!e.target.value)return;birth=e.target.value;store.set("aura-birth",birth);cards=todaysCards();answers=[];saveAnswers();nodes.forEach(n=>n.remove());nodes.clear();renderHead();layoutDeck();renderPortrait()});

/* Redessiner les encres si le thème change */
const redraw=()=>{renderPortrait();if(!$("p3").hidden)renderPile()};
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",redraw);
new MutationObserver(redraw).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});

renderHead();layoutDeck();renderPortrait();
document.fonts&&document.fonts.ready.then(()=>{});
