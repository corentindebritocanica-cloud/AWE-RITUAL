const $=id=>document.getElementById(id);
const TAU=Math.PI*2, rad=d=>d*Math.PI/180, norm=a=>((a%360)+360)%360;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Données ---------- */
const SIGNS=[["Bélier","♈","Feu"],["Taureau","♉","Terre"],["Gémeaux","♊","Air"],["Cancer","♋","Eau"],["Lion","♌","Feu"],["Vierge","♍","Terre"],["Balance","♎","Air"],["Scorpion","♏","Eau"],["Sagittaire","♐","Feu"],["Capricorne","♑","Terre"],["Verseau","♒","Air"],["Poissons","♓","Eau"]];
const EL={Feu:"#ff9a6b",Terre:"#d9c58c",Air:"#a9d2ff",Eau:"#8f9cff"};
const MONTHS=["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
const MONTHS_L=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
const ARC=[["0","Le Mat","Ose un pas dans l'inconnu, même petit."],["I","Le Bateleur","Tu as déjà tout ce qu'il faut pour commencer."],["II","La Papesse","Écoute ce que tu sais sans l'avoir appris."],["III","L'Impératrice","Laisse quelque chose naître de tes mains."],["IV","L'Empereur","Pose une limite claire, avec douceur."],["V","Le Pape","Demande conseil, ou offre le tien."],["VI","L'Amoureux","Choisis avec le cœur, puis assume."],["VII","Le Chariot","Avance, même si la route n'est pas finie."],["VIII","La Justice","Remets les choses à leur juste place."],["VIIII","L'Hermite","Un moment seul·e t'éclairera."],["X","La Roue de Fortune","Ce qui tourne aujourd'hui t'est favorable."],["XI","La Force","La douceur est ta vraie puissance."],["XII","Le Pendu","Regarde la situation à l'envers."],["XIII","L'Arcane sans nom","Laisse partir ce qui est terminé."],["XIIII","Tempérance","Dose, mélange, prends ton temps."],["XV","Le Diable","Observe ce qui te tient, sans te juger."],["XVI","La Maison Dieu","Une ouverture soudaine te libère."],["XVII","L'Étoile","Fais confiance, tu es à ta place."],["XVIII","La Lune","Tes rêves ont quelque chose à te dire."],["XVIIII","Le Soleil","Partage ta joie, elle se multiplie."],["XX","Le Jugement","Quelque chose en toi se réveille."],["XXI","Le Monde","Savoure ce qui est accompli."]];
const CHAKRAS=[["racine","#d9584c","Tadasana, pieds bien ancrés"],["sacré","#ea8a3e","le papillon, bassin ouvert"],["plexus solaire","#e8c03f","le bateau, gainage doux"],["cœur","#5bb07a","le chameau, poitrine ouverte"],["gorge","#4f9bd6","le poisson, nuque relâchée"],["troisième œil","#6c68d6","l'enfant, front au sol"],["couronne","#a674d6","Savasana, cinq minutes de silence"]];
const INTENTS=["Ralentir","Dire non sans me justifier","Savourer mon café","Écouter vraiment","Marcher dehors","Oser proposer mon idée","Respirer avant de répondre","Ranger un coin de chez moi","Appeler ma mère","Ne rien prévoir ce soir"];
const CITIES=[["Paris",48.857,2.352,"Europe/Paris"],["Toulouse",43.604,1.444,"Europe/Paris"],["Lyon",45.764,4.835,"Europe/Paris"],["Marseille",43.296,5.37,"Europe/Paris"],["Bordeaux",44.838,-.579,"Europe/Paris"],["Lille",50.629,3.057,"Europe/Paris"],["Nantes",47.218,-1.554,"Europe/Paris"],["Strasbourg",48.573,7.752,"Europe/Paris"],["Nice",43.71,7.262,"Europe/Paris"],["Montpellier",43.611,3.877,"Europe/Paris"],["Rennes",48.117,-1.678,"Europe/Paris"],["Perpignan",42.699,2.895,"Europe/Paris"],["Brest",48.39,-4.486,"Europe/Paris"],["Clermont-Ferrand",45.777,3.087,"Europe/Paris"],["Grenoble",45.188,5.724,"Europe/Paris"],["Dijon",47.322,5.041,"Europe/Paris"],["Tours",47.394,.685,"Europe/Paris"],["Limoges",45.834,1.261,"Europe/Paris"],["Pau",43.295,-.371,"Europe/Paris"],["Ajaccio",41.919,8.738,"Europe/Paris"],["Bruxelles",50.85,4.352,"Europe/Brussels"],["Genève",46.204,6.143,"Europe/Zurich"],["Lausanne",46.52,6.633,"Europe/Zurich"],["Montréal",45.502,-73.567,"America/Toronto"],["Québec",46.813,-71.208,"America/Toronto"],["Casablanca",33.573,-7.589,"Africa/Casablanca"],["Alger",36.754,3.059,"Africa/Algiers"],["Tunis",36.806,10.181,"Africa/Tunis"],["Dakar",14.716,-17.467,"Africa/Dakar"],["Abidjan",5.36,-4.008,"Africa/Abidjan"],["Fort-de-France",14.616,-61.059,"America/Martinique"],["Saint-Denis (Réunion)",-20.882,55.45,"Indian/Reunion"]];
const RARE=["Les Perséides traversent ton ciel. Fais un vœu à voix basse.","Une étoile filante, c'est un caillou plus petit qu'un grain de riz. Les petites choses aussi illuminent.","Note quelque chose que tu n'oses dire à personne. Personne ne le lira."];

/* ---------- Astronomie simplifiée ---------- */
const J2000=Date.UTC(2000,0,1,12), days=d=>(d.getTime()-J2000)/864e5;
function sunLon(d){const n=days(d),L=280.46+.9856474*n,g=rad(357.528+.9856003*n);return norm(L+1.915*Math.sin(g)+.02*Math.sin(2*g))}
function moonLon(d){const n=days(d),L=218.316+13.176396*n,M=rad(134.963+13.064993*n),D=rad(297.85+12.190749*n);
  return norm(L+6.289*Math.sin(M)+1.274*Math.sin(2*D-M)+.658*Math.sin(2*D)+.214*Math.sin(2*M)-.186*Math.sin(rad(357.529+.98560028*n)))}
const phase=d=>norm(moonLon(d)-sunLon(d))/360, illum=p=>(1-Math.cos(TAU*p))/2;
const sign=lon=>SIGNS[Math.floor(lon/30)];
const phaseName=p=>p<.03||p>.97?"Nouvelle Lune":p<.22?"Premier croissant":p<.28?"Premier quartier":p<.47?"Lune gibbeuse croissante":p<.53?"Pleine Lune":p<.72?"Lune gibbeuse décroissante":p<.78?"Dernier quartier":"Dernier croissant";
const reduce=n=>{while(n>9&&n!==11&&n!==22)n=String(n).split("").reduce((a,b)=>a+ +b,0);return n};

/* ---------- Utilitaires ---------- */
const key=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function rgba(hex,a){const n=parseInt(hex.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function mix(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const c=[16,8,0].map(s=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t));return`rgb(${c})`}
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(){try{return JSON.parse(localStorage.getItem("wai-constellation"))}catch(e){return null}},set(v){try{localStorage.setItem("wai-constellation",JSON.stringify(v))}catch(e){}}};

/* ---------- État ---------- */
const NOW=new Date(), TODAY=key(NOW);
let S=store.get()||{birth:null,entries:[],named:{},sim:true,today:null};
if(!S.today||S.today.date!==TODAY)S.today={date:TODAY,stage:"breathe"};
const save=()=>store.set(S);
let view=S.birth?"day":"onboard", zoom=0, zoomV=0, zoomTarget=0, hourOverride=null;
const seedDay=hash(TODAY+(S.birth?S.birth.y+"-"+S.birth.m+"-"+S.birth.d:""));
const arcIdx=seedDay%22, chakra=CHAKRAS[(seedDay>>>5)%7];

/* ---------- Canvas ---------- */
const cv=$("sky"), ctx=cv.getContext("2d"); let W=0,H=0;
function resize(){const dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize);resize();
const R0=()=>Math.min(W,H);
const bgStars=(()=>{const r=rng(7),a=[];for(let i=0;i<260;i++)a.push({x:r(),y:r(),s:r()*1.2+.2,p:r()*TAU,v:.5+r()*1.5});return a})();

const SKY=[[0,"#05060f","#0b0f26"],[5,"#0b0f26","#1b1838"],[6.5,"#2a2350","#c3807a"],[8,"#22325c","#5a6f9c"],[13,"#1e3866","#4c6b9c"],[17.5,"#2b2a5a","#cf875e"],[19.5,"#141433","#3a2a55"],[21,"#070917","#10142e"],[24,"#05060f","#0b0f26"]];
function hourNow(){if(hourOverride!==null)return hourOverride;const d=new Date();return d.getHours()+d.getMinutes()/60}
function skyCols(h){for(let i=0;i<SKY.length-1;i++){const[a,t1,b1]=SKY[i],[b,t2,b2]=SKY[i+1];if(h>=a&&h<=b){const t=(h-a)/(b-a);return[mix(t1,t2,t),mix(b1,b2,t)]}}return["#05060f","#0b0f26"]}
const starVis=h=>h<5.5||h>20.5?1:h<8?1-(h-5.5)/2.5*.6:h>18?.4+(h-18)/2.5*.6:.4;

function drawStar(x,y,r,col,glow=1,cloudy=false){
  if(cloudy){ctx.fillStyle="rgba(200,205,230,.12)";for(const[dx,dy,rr]of[[-6,2,10],[5,-1,12],[0,5,9]]){ctx.beginPath();ctx.arc(x+dx,y+dy,rr,0,TAU);ctx.fill()}
    ctx.fillStyle="rgba(241,236,255,.35)";ctx.beginPath();ctx.arc(x,y,r*.5,0,TAU);ctx.fill();return}
  const g=ctx.createRadialGradient(x,y,0,x,y,r*4*glow);g.addColorStop(0,rgba(col,.95));g.addColorStop(.22,rgba(col,.45));g.addColorStop(1,rgba(col,0));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*4*glow,0,TAU);ctx.fill();
  ctx.fillStyle="#fffaf0";ctx.beginPath();ctx.arc(x,y,Math.max(1,r*.55),0,TAU);ctx.fill();
}
function drawMoon(x,y,R,p,glow=true){
  if(glow){const g=ctx.createRadialGradient(x,y,R*.8,x,y,R*3);g.addColorStop(0,"rgba(243,227,189,.18)");g.addColorStop(1,"rgba(243,227,189,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R*3,0,TAU);ctx.fill()}
  ctx.fillStyle="rgba(20,22,48,.92)";ctx.beginPath();ctx.arc(x,y,R,0,TAU);ctx.fill();
  ctx.strokeStyle="rgba(241,236,255,.15)";ctx.lineWidth=1;ctx.stroke();
  const rx=Math.abs(Math.cos(TAU*p))*R;ctx.fillStyle="#f3e3bd";ctx.beginPath();
  if(p<.5){ctx.arc(x,y,R,-Math.PI/2,Math.PI/2,false);ctx.ellipse(x,y,rx,R,0,Math.PI/2,p<.25?-Math.PI/2:Math.PI*1.5,p<.25)}
  else{ctx.arc(x,y,R,-Math.PI/2,Math.PI/2,true);ctx.ellipse(x,y,rx,R,0,Math.PI/2,p<.75?-Math.PI/2:Math.PI*1.5,p<.75)}
  ctx.fill();
}
function text(t,x,y,size,col,font="Manrope",align="center",style=""){ctx.font=`${style} ${size}px ${font==="serif"?"serif":`"${font}"`}`;ctx.fillStyle=col;ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillText(t,x,y)}

/* ---------- Entrées (réelles + simulées) ---------- */
function simEntries(){const out=[];for(let k=1;k<=28;k++){const d=addDays(NOW,-k),r=rng(hash(key(d)));
  out.push({date:key(d),missed:r()<.14,el:sign(moonLon(d))[2],energy:1+Math.floor(r()*5),arcane:Math.floor(r()*22),intent:INTENTS[Math.floor(r()*INTENTS.length)],sim:true})}return out}
function allEntries(){const m=new Map();if(S.sim)simEntries().forEach(e=>m.set(e.date,e));S.entries.forEach(e=>m.set(e.date,e));return m}

/* ---------- Onboarding : la roue ---------- */
let wheelRot=-(171/365)*TAU, birthYear=1995, dragAng=null;
function wheelDay(){return((Math.round(-wheelRot/TAU*365)%365)+365)%365}
function dayToDate(n,y){const d=new Date(Date.UTC(y,0,1,12));d.setUTCDate(1+n);return d}
function updateBirthLabel(){const d=dayToDate(wheelDay(),birthYear);const t=`${d.getUTCDate()} ${MONTHS_L[d.getUTCMonth()]}`;$("bDate").textContent=t;$("bYear").textContent=birthYear;
  const s=$("wheelSlider");s.setAttribute("aria-valuenow",wheelDay()+1);s.setAttribute("aria-valuetext",t)}
function drawOnboard(a){
  const cx=W/2,cy=H/2,R=R0()*.39;ctx.save();ctx.globalAlpha=a;
  ctx.strokeStyle="rgba(241,236,255,.22)";ctx.lineWidth=1;
  for(const rr of[R,R*.8,R*.62]){ctx.beginPath();ctx.arc(cx,cy,rr,0,TAU);ctx.stroke()}
  for(let i=0;i<365;i+=5){const an=-Math.PI/2+i/365*TAU+wheelRot,l=i%30<5?10:5;ctx.beginPath();ctx.moveTo(cx+Math.cos(an)*R,cy+Math.sin(an)*R);ctx.lineTo(cx+Math.cos(an)*(R-l),cy+Math.sin(an)*(R-l));ctx.stroke()}
  for(let m=0;m<12;m++){const doy=Math.round((Date.UTC(2001,m,15)-Date.UTC(2001,0,1))/864e5),an=-Math.PI/2+doy/365*TAU+wheelRot;
    text(MONTHS[m],cx+Math.cos(an)*R*.9,cy+Math.sin(an)*R*.9,12,"rgba(241,236,255,.72)","DM Mono")}
  for(let k=0;k<12;k++){const doy=(79+k*30.44+15)%365,an=-Math.PI/2+doy/365*TAU+wheelRot,s=SIGNS[k];
    text(s[1]+"︎",cx+Math.cos(an)*R*.71,cy+Math.sin(an)*R*.71,17,EL[s[2]],"serif")}
  ctx.fillStyle="#f2c46d";ctx.beginPath();ctx.moveTo(cx,cy-R-4);ctx.lineTo(cx-7,cy-R-16);ctx.lineTo(cx+7,cy-R-16);ctx.closePath();ctx.fill();
  ctx.restore();
}

/* ---------- Révélation ---------- */
let revealT0=0, natal=null;
/* Heure locale d'un fuseau IANA → UTC (gère l'heure d'été historique via la base du navigateur) */
function tzOffset(ts,tz){const p=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).formatToParts(new Date(ts)).map(x=>[x.type,x.value]));
  return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-ts}
function zonedToUtc(y,m,d,hh,mm,tz){const g=Date.UTC(y,m,d,hh,mm);let u=g-tzOffset(g,tz);u=g-tzOffset(u,tz);return u}
function ascendant(t,lat,lon){const d=(t-J2000)/864e5,th=rad(norm(280.46061837+360.98564736629*d+lon)),e=rad(23.4393),f=rad(lat);
  return norm(Math.atan2(Math.cos(th),-(Math.sin(th)*Math.cos(e)+Math.tan(f)*Math.sin(e)))*180/Math.PI)}
const hasTime=()=>S.birth&&S.birth.time&&S.birth.city!=null;
function computeNatal(){const b=S.birth;let t=Date.UTC(b.y,b.m,b.d,12),asc=null;
  if(hasTime()){const c=CITIES[b.city],[hh,mm]=b.time.split(":").map(Number);t=zonedToUtc(b.y,b.m,b.d,hh,mm,c[3]);asc=sign(ascendant(t,c[1],c[2]))}
  const d=new Date(t),lp=reduce(`${b.y}${b.m+1}${b.d}`.split("").reduce((a,c)=>a+ +c,0));
  return{sun:sign(sunLon(d)),moon:sign(moonLon(d)),lp,asc}}
let ascT0=0;
function drawReveal(a,t){
  const sheet=!$("ascForm").hidden,cx=W/2,cy=sheet?H*.33:H*.5,R=R0()*(sheet?.2:.24);
  const pts=[[cx,cy-R,natal.sun,"Soleil en "+natal.sun[0]],[cx+R*1.1,cy,null,"Chemin de vie "+natal.lp],[cx,cy+R,natal.asc,natal.asc?"Ascendant "+natal.asc[0]:"Ascendant"],[cx-R*1.1,cy,natal.moon,"Lune en "+natal.moon[0]]];
  ctx.save();ctx.globalAlpha=a;
  const k=Math.min(1,t/2400);ctx.lineWidth=1;
  for(let i=0;i<4;i++){const p=pts[i],q=pts[(i+1)%4],ghost=!natal.asc&&(i===1||i===2);ctx.setLineDash(ghost?[3,5]:[]);ctx.strokeStyle=`rgba(242,196,109,${(ghost?.22:.45)*k})`;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke()}
  ctx.setLineDash([]);
  pts.forEach((p,i)=>{const delay=i===2&&natal.asc&&ascT0?0:i*600,base=i===2&&natal.asc&&ascT0?performance.now()-ascT0:t,lt=easeOut((base-delay)/900);if(lt<=0)return;
    ctx.globalAlpha=a*lt;
    if(i===2&&!natal.asc){ctx.setLineDash([2,4]);ctx.strokeStyle="rgba(241,236,255,.45)";ctx.beginPath();ctx.arc(p[0],p[1],9,0,TAU);ctx.stroke();ctx.setLineDash([]);text("?",p[0],p[1]+1,15,"rgba(241,236,255,.6)","Cormorant Garamond")}
    else drawStar(p[0],p[1],5+3*lt,p[2]?EL[p[2][2]]:"#f2c46d",1.4);
    text(p[3],p[0],p[1]+28,19,"rgba(241,236,255,.92)","Cormorant Garamond","center","italic 500");
    if(p[2])text(p[2][1]+"︎  "+p[2][2],p[0],p[1]+47,11,"rgba(241,236,255,.6)","DM Mono");
    else if(i===2)text("à révéler",p[0],p[1]+47,11,"rgba(241,236,255,.5)","DM Mono")});
  ctx.restore();
}

/* ---------- Jour ---------- */
const BREATH_MS=6000, BREATHS=3;
let breath={held:false,acc:0,x:0,y:0}, trail=[], todayStarT=0, closedT=0;
function drawDay(a,s){
  const cx=W/2,mY=H*.3,mR=R0()*.085;
  ctx.save();ctx.globalAlpha=a;ctx.translate(W/2,H/2);ctx.scale(s,s);ctx.translate(-W/2,-H/2);
  drawMoon(cx,mY,mR,phase(NOW));
  const st=S.today.stage, e=S.today;
  const orbFade=breath.held?1:Math.max(0,1-(performance.now()-(breath.relT||0))/220);
  if(st==="breathe"&&breath.acc>0&&orbFade>0){ctx.globalAlpha=a*orbFade;const ph=(breath.acc%BREATH_MS)/BREATH_MS,k=ph<.5?ph*2:1-(ph-.5)*2,ease=.5-.5*Math.cos(Math.PI*k),r=30+ease*R0()*.16;
    const g=ctx.createRadialGradient(breath.x,breath.y,0,breath.x,breath.y,r);g.addColorStop(0,"rgba(242,196,109,.35)");g.addColorStop(1,"rgba(242,196,109,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(breath.x,breath.y,r,0,TAU);ctx.fill();
    ctx.strokeStyle="rgba(242,196,109,.7)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(breath.x,breath.y,r*.7,0,TAU);ctx.stroke();ctx.globalAlpha=a}
  if(st==="veil"){const t=performance.now()/1000,y=H*.62+Math.sin(t*2)*6;ctx.strokeStyle="rgba(241,236,255,.6)";ctx.lineWidth=1.5;
    for(let i=0;i<3;i++){ctx.globalAlpha=a*(.3+.25*i);ctx.beginPath();ctx.moveTo(cx-12,y-i*12+6);ctx.lineTo(cx,y-i*12-4);ctx.lineTo(cx+12,y-i*12+6);ctx.stroke()}ctx.globalAlpha=a}
  if(st==="close"||st==="done"){const t=(performance.now()-todayStarT)/1000,sy=H*.58,el=e.el||"Air";e.energy=e.energy||3;
    /* Naissance : jamais depuis zéro, ease-out fort, 600 ms (moment rare, donc un peu de délice) */
    const born=easeOut(t/.6),prog=Math.min(1,Math.abs(traceSum)/TAU);
    ctx.globalAlpha=a*born;drawStar(cx,sy,(4+e.energy*1.2)*(.6+.4*born),EL[el],st==="done"?1.8:1+prog*.7);ctx.globalAlpha=a;
    if(st==="done"){const ct=(performance.now()-closedT)/1200;if(ct<1){ctx.strokeStyle=`rgba(242,196,109,${.7*(1-ct)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,sy,R0()*.16+easeOut(ct)*60,0,TAU);ctx.stroke()}}
    else{const Rr=R0()*.16;ctx.setLineDash([3,6]);ctx.strokeStyle="rgba(241,236,255,.25)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,sy,Rr,0,TAU);ctx.stroke();ctx.setLineDash([]);
      /* Retour continu pendant le geste : l'anneau se remplit au fil du tracé */
      if(traceSum){ctx.strokeStyle="rgba(242,196,109,.9)";ctx.lineWidth=2.5;ctx.lineCap="round";ctx.beginPath();ctx.arc(cx,sy,Rr,-Math.PI/2,-Math.PI/2+traceSum,traceSum<0);ctx.stroke()}}}
  if(trail.length>1){ctx.strokeStyle="rgba(242,196,109,.35)";ctx.lineWidth=2;ctx.lineCap="round";ctx.beginPath();trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()}
  ctx.restore();
}

/* ---------- Cycle ---------- */
function cycleLayout(){const cx=W/2,cy=H*.52,R=R0()*.33,m=allEntries(),pts=[];
  for(let k=28;k>=0;k--){const d=addDays(NOW,-k),kk=key(d),e=k===0&&S.today.stage==="done"?S.entries.find(x=>x.date===TODAY):m.get(kk);
    const idx=28-k,an=-Math.PI/2+(idx+.5)/29*TAU,j=(rng(hash(kk))()-.5)*.12,rr=R*(e?(.42+.1*(e.energy||3)+j):.7);
    pts.push({d,k,e,x:cx+Math.cos(an)*rr,y:cy+Math.sin(an)*rr,an})}
  return{cx,cy,R,pts}}
function drawCycle(a,s){
  const L=cycleLayout();ctx.save();ctx.globalAlpha=a;ctx.translate(W/2,H/2);ctx.scale(s,s);ctx.translate(-W/2,-H/2);
  L.pts.forEach(p=>{const mx=L.cx+Math.cos(p.an)*L.R*1.16,my=L.cy+Math.sin(p.an)*L.R*1.16;drawMoon(mx,my,Math.max(3.5,R0()*.011),phase(p.d),false)});
  const lit=L.pts.filter(p=>p.e&&!p.e.missed);
  ctx.strokeStyle="rgba(241,236,255,.32)";ctx.lineWidth=1;ctx.beginPath();lit.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
  ctx.setLineDash([2,5]);ctx.strokeStyle="rgba(242,196,109,.4)";
  for(let i=0;i<lit.length;i++)for(let j=i+2;j<lit.length;j++)if(lit[i].e.arcane===lit[j].e.arcane){ctx.beginPath();ctx.moveTo(lit[i].x,lit[i].y);ctx.quadraticCurveTo(L.cx,L.cy,lit[j].x,lit[j].y);ctx.stroke()}
  ctx.setLineDash([]);
  const t=performance.now()/1000;
  L.pts.forEach(p=>{if(!p.e){if(p.k===0){ctx.strokeStyle="rgba(242,196,109,.5)";ctx.beginPath();ctx.arc(p.x,p.y,6,0,TAU);ctx.stroke()}return}
    const tw=reduceMotion?1:.85+.15*Math.sin(t*1.3+p.k);drawStar(p.x,p.y,(2.5+p.e.energy*.9)*tw,EL[p.e.el],p.k===0?1.6:1,p.e.missed)});
  drawMoon(L.cx,L.cy,R0()*.035,phase(NOW));
  ctx.restore();
}

/* ---------- Année ---------- */
function drawYear(a,s){
  const cx=W/2,cy=H*.52,R=R0()*.36;ctx.save();ctx.globalAlpha=a;ctx.translate(W/2,H/2);ctx.scale(s,s);ctx.translate(-W/2,-H/2);
  ctx.strokeStyle="rgba(241,236,255,.2)";ctx.lineWidth=1;for(const rr of[R,R*.78]){ctx.beginPath();ctx.arc(cx,cy,rr,0,TAU);ctx.stroke()}
  for(let k=0;k<12;k++){const an=-Math.PI/2+rad(k*30);ctx.beginPath();ctx.moveTo(cx+Math.cos(an)*R*.78,cy+Math.sin(an)*R*.78);ctx.lineTo(cx+Math.cos(an)*R,cy+Math.sin(an)*R);ctx.stroke();
    const am=-Math.PI/2+rad(k*30+15),s2=SIGNS[k];text(s2[1]+"︎",cx+Math.cos(am)*R*.89,cy+Math.sin(am)*R*.89,15,EL[s2[2]],"serif")}
  allEntries().forEach(e=>{if(e.missed)return;const d=new Date(e.date+"T12:00"),an=-Math.PI/2+rad(sunLon(d)),j=rng(hash(e.date)),rr=R*(.35+j()*.36);drawStar(cx+Math.cos(an)*rr,cy+Math.sin(an)*rr,1.8+e.energy*.4,EL[e.el],.8)});
  const ns=-Math.PI/2+rad(sunLon(NOW));ctx.fillStyle="#f2c46d";ctx.beginPath();ctx.arc(cx+Math.cos(ns)*R*1.06,cy+Math.sin(ns)*R*1.06,5,0,TAU);ctx.fill();
  text("aujourd'hui",cx+Math.cos(ns)*R*1.17,cy+Math.sin(ns)*R*1.17,10,"rgba(242,196,109,.9)","DM Mono");
  if(S.birth){const b=new Date(Date.UTC(S.birth.y,S.birth.m,S.birth.d,12)),bn=-Math.PI/2+rad(sunLon(b));drawStar(cx+Math.cos(bn)*R*.2,cy+Math.sin(bn)*R*.2,6,"#f2c46d",1.6)}
  ctx.restore();
}

/* ---------- Étoile filante ---------- */
let shoot=null;
function launchShoot(){const fromLeft=Math.random()<.5;shoot={t0:performance.now(),x0:fromLeft?W*.1:W*.9,y0:H*.12,dx:fromLeft?W*.6:-W*.6,dy:H*.35,dur:reduceMotion?6000:3800,caught:false}}
function shootPos(){if(!shoot)return null;const k=(performance.now()-shoot.t0)/shoot.dur;if(k>1){shoot=null;return null}return{x:shoot.x0+shoot.dx*k,y:shoot.y0+shoot.dy*k,k}}
function drawShoot(){const p=shootPos();if(!p)return;const len=80,nx=-shoot.dx/Math.hypot(shoot.dx,shoot.dy),ny=-shoot.dy/Math.hypot(shoot.dx,shoot.dy);
  const g=ctx.createLinearGradient(p.x,p.y,p.x+nx*len,p.y+ny*len);g.addColorStop(0,"rgba(255,250,235,.95)");g.addColorStop(1,"rgba(255,250,235,0)");
  ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+nx*len,p.y+ny*len);ctx.stroke();drawStar(p.x,p.y,2.5,"#fff5dc",1.2)}
function toast(title,msg){const t=$("toast");t.innerHTML=`<span class="eyebrow" style="color:var(--gold)">${title}</span><span>${msg}</span>`;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,6000)}

/* ---------- Boucle de rendu ---------- */
function frame(now){
  const h=hourNow(),[top,bot]=skyCols(h);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(bot!==frame.bg){frame.bg=bot;document.documentElement.style.backgroundColor=bot}
  const vis=starVis(h),t=now/1000;
  for(const s of bgStars){const tw=reduceMotion?1:.6+.4*Math.sin(t*s.v+s.p);ctx.fillStyle=`rgba(255,250,240,${vis*tw*(.35+s.s*.4)})`;ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.s,0,TAU);ctx.fill()}
  const dt=Math.min(.05,(now-(frame.last||now))/1000);
  if(view==="onboard"){stepWheel(dt);drawOnboard(1)}
  else if(view==="reveal")drawReveal(1,now-revealT0);
  else{if(!pinch){const r=springStep(zoom,zoomV,zoomTarget,dt,.38,1);zoom=r[0];zoomV=r[1]}
    const sk=reduceMotion?0:.45; /* mouvement réduit : fondu sans zoom */
    [drawDay,drawCycle,drawYear].forEach((fn,v)=>{const al=Math.max(0,1-Math.abs(zoom-v)*1.4);if(al>.01)fn(al,1+(v-zoom)*sk)})}
  drawShoot();
  if(view==="day"&&S.today.stage==="breathe"&&breath.held){breath.acc+=Math.min(50,now-(frame.last||now));updateBreath()}
  frame.last=now;requestAnimationFrame(frame);
}

/* ---------- UI : vues ---------- */
const layers=["onboard","reveal","day","cycle","year"];
function setView(v){view=v;layers.forEach(l=>$(l).hidden=true);if(v!=="reveal")$("ascForm").hidden=true;
  if(v==="onboard"||v==="reveal"){$(v).hidden=false;$("ruler").hidden=true;$("card").hidden=true;return}
  $("ruler").hidden=false;const z=v==="day"?0:v==="cycle"?1:2;zoomTarget=z;$(v).hidden=false;
  [...$("ruler").children].forEach(b=>b.setAttribute("aria-pressed",+b.dataset.z===z));
  $("card").hidden=!(v==="day"&&S.today.stage==="card");
  if(v==="day")renderDay();if(v==="cycle")renderCycle();if(v==="year")renderYear()}
const zoomTo=z=>setView(["day","cycle","year"][Math.max(0,Math.min(2,z))]);

/* Jour */
function renderDay(){
  const p=phase(NOW),ms=sign(moonLon(NOW)),py=phase(addDays(NOW,-1)),diff=Math.round((illum(p)-illum(py))*100);
  $("dDate").textContent=NOW.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  $("moonLine").textContent=`${phaseName(p)} en ${ms[0]}`;
  $("sinceLine").textContent=`Depuis hier : la Lune a ${diff>=0?"grandi":"décru"} de ${Math.abs(diff)} %`;
  const st=S.today.stage,alt=$("altBtn");$("closeMsg").hidden=st!=="done";$("breathLbl").hidden=!(st==="breathe"&&breath.acc>0);
  const H={breathe:["Pose ton doigt sur le ciel et garde-le. Respire avec lui.","Passer la respiration"],veil:["Glisse vers le haut pour lever le voile.","Lever le voile"],card:["",""],close:["Trace un cercle autour de ton étoile pour clore la journée.","Clore la journée"],done:["",""]}[st];
  $("hint").textContent=H[0];alt.textContent=H[1];alt.hidden=!H[1];
  if(st==="done"){const tm=sign(moonLon(addDays(NOW,1)));$("teaser").textContent=tm[0]!==ms[0]?`Demain, la Lune entre en ${tm[0]}.`:`Demain, la Lune sera éclairée à ${Math.round(illum(phase(addDays(NOW,1)))*100)} %.`}
  $("card").hidden=st!=="card";
}
function updateBreath(){const n=Math.floor(breath.acc/BREATH_MS),ph=(breath.acc%BREATH_MS)/BREATH_MS,l=$("breathLbl");
  l.hidden=false;l.textContent=`${ph<.5?"Inspire":"Expire"} · ${Math.min(n+1,BREATHS)}/${BREATHS}`;
  if(breath.acc>=BREATHS*BREATH_MS){breath.held=false;setStage("veil")}}
function setStage(st){S.today.stage=st;save();renderDay()}
function fillCard(){const a=ARC[arcIdx];$("arcRoman").textContent=a[0];$("arcName").textContent=a[1];$("arcMsg").textContent=a[2];
  $("chakraLine").innerHTML=`<span style="color:${chakra[1]}">●</span> Chakra du ${chakra[0]} · posture : ${chakra[2]}`}
$("altBtn").addEventListener("click",()=>{const st=S.today.stage;if(st==="breathe"){breath.acc=0;setStage("veil")}else if(st==="veil"){fillCard();setStage("card")}else if(st==="close")closeDay()});
const energyBox=document.querySelector(".energy");let energy=3;
for(let i=1;i<=5;i++){const b=document.createElement("button");b.type="button";b.textContent=i;b.setAttribute("aria-pressed",i===energy);b.addEventListener("click",()=>{energy=i;[...energyBox.querySelectorAll("button")].forEach(x=>x.setAttribute("aria-pressed",+x.textContent===i))});energyBox.appendChild(b)}
$("card").addEventListener("submit",e=>{e.preventDefault();
  const el=sign(moonLon(NOW))[2];S.today.intent=$("intent").value.trim()||"Être là";S.today.energy=energy;S.today.el=el;S.today.arcane=arcIdx;
  S.entries=S.entries.filter(x=>x.date!==TODAY);S.entries.push({date:TODAY,el,energy,arcane:arcIdx,intent:S.today.intent});
  /* Sortie par le même chemin que l'entrée (vers le bas), puis l'étoile naît */
  card.style.transform="translate(-50%,100%)";
  setTimeout(()=>{todayStarT=performance.now();setStage("close");card.style.transform=""},reduceMotion?0:300)});
function closeDay(){closedT=performance.now();trail=[];traceSum=0;vib([12,40,12]);setStage("done")}

/* Cycle */
function cycleKey(){let d=new Date(NOW);for(let i=0;i<30;i++){if(phase(d)<.034)break;d=addDays(d,-1)}return key(d)}
function renderCycle(){const m=allEntries(),last=[...Array(29)].map((_,k)=>m.get(key(addDays(NOW,-k)))).filter(Boolean);
  const lit=last.filter(e=>!e.missed),arcs=new Set([...m.values()].filter(e=>!e.missed).map(e=>e.arcane));
  $("cStats").innerHTML=`<span>${lit.length} étoiles</span><span>${last.length-lit.length} voilées</span><span>${arcs.size}/22 arcanes</span>`;
  const n=S.named[cycleKey()];$("cName").textContent=n||"Constellation sans nom";$("simTag").hidden=!S.sim}
$("nameForm").addEventListener("submit",e=>{e.preventDefault();const v=$("cInput").value.trim();if(!v)return;S.named[cycleKey()]=v;save();$("cInput").value="";renderCycle()});

/* Année */
const ART={Gémeaux:"des",Poissons:"des",Vierge:"de la",Balance:"de la"};
function renderYear(){const s=sign(sunLon(NOW));$("ySeason").textContent=`Saison ${ART[s[0]]||"du"} ${s[0]}`;
  let stat="";if(S.birth){let nb=new Date(NOW.getFullYear(),S.birth.m,S.birth.d);if(nb<NOW)nb=new Date(NOW.getFullYear()+1,S.birth.m,S.birth.d);const dd=Math.ceil((nb-NOW)/864e5);
    stat=`<span>Retour solaire dans ${dd} jours</span>`}
  if(S.birth){const n=computeNatal();if(n.asc)stat=`<span>${n.sun[0]} ascendant ${n.asc[0]}</span>`+stat}
  $("yAsc").hidden=!S.birth||hasTime();
  const m=allEntries();$("yStats").innerHTML=stat+`<span>${[...m.values()].filter(e=>!e.missed).length} jours vécus</span>`}

/* ---------- Gestes ---------- */
/* Physique : ressorts façon Apple (damping 1 = sans rebond, response en secondes) */
const easeOut=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),4);
function springStep(x,v,target,dt,response=.4,damping=1){const w=TAU/response,k=w*w,c=2*damping*w,n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
  for(let i=0;i<n;i++){const acc=-k*(x-target)-c*v;v+=acc*h;x+=v*h}return[x,v]}
const rubber=(o,dim,c=.55)=>o*dim*c/(dim+c*Math.abs(o));
const vib=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};
const card=$("card");
const ptrs=new Map();let pinch=null,veil=null,wheelLock=0,wheelSpring=null,wheelVel=0,lastWheelT=0,traceAng=null,traceSum=0;
function stepWheel(dt){if(!wheelSpring)return;const r=springStep(wheelRot,wheelSpring.v,wheelSpring.target,dt,.5,1);wheelRot=r[0];wheelSpring.v=r[1];updateBirthLabel();
  if(Math.abs(wheelRot-wheelSpring.target)<1e-4&&Math.abs(wheelSpring.v)<1e-3){wheelRot=wheelSpring.target;wheelSpring=null}}
/* Voile : le panneau suit le doigt 1:1, validation à la vitesse (un petit coup suffit) */
function startVeil(y){fillCard();card.hidden=false;veil={y0:y,lastY:y,lastT:performance.now(),v:0,h:card.offsetHeight};card.style.transition="none";card.style.transform=`translate(-50%,${veil.h}px)`}
function moveVeil(y){const now=performance.now(),dt=Math.max(1,now-veil.lastT);veil.v=.6*veil.v+.4*((veil.lastY-y)/dt);veil.lastY=y;veil.lastT=now;
  let off=veil.h-(veil.y0-y);if(off<0)off=-rubber(-off,veil.h);if(off>veil.h)off=veil.h+rubber(off-veil.h,veil.h,.2);card.style.transform=`translate(-50%,${off}px)`}
function endVeil(cancel=false){const v=veil;veil=null;card.style.transition="";const lift=v.y0-v.lastY;
  if(!cancel&&(v.v>.11||lift>v.h*.3)){card.style.transform="";vib(10);setStage("card")}
  else{card.style.transform=`translate(-50%,${v.h}px)`;setTimeout(()=>{if(S.today.stage==="veil"&&!veil){card.hidden=true;card.style.transform=""}},420)}}
cv.addEventListener("pointerdown",e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2&&["day","cycle","year"].includes(view)){const[a,b]=[...ptrs.values()];pinch={d0:Math.hypot(a.x-b.x,a.y-b.y),z0:zoom,lastZ:zoom,lastT:performance.now(),v:0};
    if(breath.held){breath.held=false;breath.relT=performance.now()}if(veil)endVeil(true);trail=[];traceAng=null;traceSum=0;return}
  if(ptrs.size>1)return; /* protection multi-touch */
  const sp=shootPos();if(sp&&!shoot.caught&&Math.hypot(sp.x-e.clientX,sp.y-e.clientY)<60){shoot.caught=true;shoot=null;vib(15);toast("Étoile filante attrapée",RARE[Math.floor(Math.random()*RARE.length)]);return}
  if(view==="onboard"){wheelSpring=null;dragAng=Math.atan2(e.clientY-H/2,e.clientX-W/2);wheelVel=0;lastWheelT=performance.now();return}
  if(view!=="day"||zoomTarget!==0)return;const st=S.today.stage;
  if(st==="breathe"){breath.held=true;breath.x=e.clientX;breath.y=e.clientY;vib(8)}
  else if(st==="veil")startVeil(e.clientY);
  else if(st==="close"){trail=[{x:e.clientX,y:e.clientY}];traceSum=0;traceAng=Math.atan2(e.clientY-H*.58,e.clientX-W/2)}});
cv.addEventListener("pointermove",e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&ptrs.size===2){const[a,b]=[...ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);let z=pinch.z0+Math.log(pinch.d0/d)*1.6;
    if(z<0)z=-rubber(-z,1,.35);if(z>2)z=2+rubber(z-2,1,.35);
    const now=performance.now(),dt=Math.max(1,now-pinch.lastT);pinch.v=.7*pinch.v+.3*((z-pinch.lastZ)/dt*1000);pinch.lastZ=z;pinch.lastT=now;zoom=z;zoomV=0;return}
  if(view==="onboard"&&dragAng!==null){const an=Math.atan2(e.clientY-H/2,e.clientX-W/2);let d=an-dragAng;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;wheelRot+=d;dragAng=an;
    const now=performance.now(),dt=Math.max(1,now-lastWheelT);wheelVel=.6*wheelVel+.4*(d/dt*1000);lastWheelT=now;updateBirthLabel();return}
  if(breath.held){breath.x=e.clientX;breath.y=e.clientY}
  if(veil)moveVeil(e.clientY);
  if(traceAng!==null){trail.push({x:e.clientX,y:e.clientY});const an=Math.atan2(e.clientY-H*.58,e.clientX-W/2);let d=an-traceAng;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;traceSum+=d;traceAng=an;
    if(Math.abs(traceSum)>=TAU*.94){traceAng=null;closeDay()}}});
function endPtr(e){if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);
  if(pinch){if(ptrs.size<2){const proj=zoom+pinch.v*.18;zoomV=pinch.v;pinch=null;zoomTo(Math.round(Math.max(0,Math.min(2,proj))))}return}
  if(view==="onboard"&&dragAng!==null){dragAng=null;if(performance.now()-lastWheelT>80)wheelVel=0;
    const proj=wheelRot+wheelVel*.35;wheelSpring={target:-Math.round(-proj/TAU*365)/365*TAU,v:wheelVel}}
  if(breath.held){breath.held=false;breath.relT=performance.now();$("breathLbl").textContent="Pause · repose ton doigt"}
  if(veil)endVeil();
  if(traceAng!==null){traceAng=null;trail=[];traceSum=0;$("hint").textContent="Presque. Fais le tour complet de ton étoile."}}
cv.addEventListener("pointerup",endPtr);cv.addEventListener("pointercancel",endPtr);
cv.addEventListener("wheel",e=>{e.preventDefault();if(view==="onboard"){wheelSpring=null;wheelRot-=e.deltaY*.002;updateBirthLabel();clearTimeout(wheelLock);wheelLock=setTimeout(()=>{wheelSpring={target:-wheelDay()/365*TAU,v:0}},120);return}
  if(view==="reveal")return;if(performance.now()-(cv.wl||0)<500)return;cv.wl=performance.now();zoomTo(zoomTarget+(e.deltaY>0?1:-1))},{passive:false});
addEventListener("keydown",e=>{if(e.target.tagName==="INPUT")return;if(["day","cycle","year"].includes(view)){if(e.key==="-")zoomTo(zoomTarget+1);if(e.key==="+"||e.key==="=")zoomTo(zoomTarget-1)}});
$("wheelSlider").addEventListener("keydown",e=>{const st={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:30,PageDown:-30}[e.key];if(!st)return;e.preventDefault();wheelRot-=st/365*TAU;wheelRot=-wheelDay()/365*TAU;updateBirthLabel()});
$("ruler").addEventListener("click",e=>{const b=e.target.closest("button");if(b)zoomTo(+b.dataset.z)});

/* ---------- Onboarding boutons ---------- */
$("yMinus").addEventListener("click",()=>{birthYear=Math.max(1930,birthYear-1);updateBirthLabel()});
$("yPlus").addEventListener("click",()=>{birthYear=Math.min(2012,birthYear+1);updateBirthLabel()});
$("revealBtn").addEventListener("click",()=>{const d=dayToDate(wheelDay(),birthYear);S.birth={y:birthYear,m:d.getUTCMonth(),d:d.getUTCDate()};save();natal=computeNatal();revealT0=performance.now();setView("reveal")});
$("enterBtn").addEventListener("click",()=>setView("day"));

/* ---------- Heure & lieu : quatrième étoile ---------- */
CITIES.forEach((c,i)=>{const o=document.createElement("option");o.value=i;o.textContent=c[0];$("bCity").appendChild(o)});$("bCity").value=1;
function openAsc(){$("ascForm").hidden=false;$("revealBottom").hidden=true}
function closeAsc(){$("ascForm").hidden=true;$("revealBottom").hidden=false;$("ascOpen").hidden=hasTime()}
$("ascOpen").addEventListener("click",openAsc);
$("ascCancel").addEventListener("click",closeAsc);
$("bUnknown").addEventListener("change",e=>{$("bTime").disabled=e.target.checked;$("ascSubmit").textContent=e.target.checked?"Continuer sans l'heure":"Révéler mon ascendant"});
$("ascForm").addEventListener("submit",e=>{e.preventDefault();
  if($("bUnknown").checked){S.birth.unknownTime=true;save();closeAsc();$("revealTxt").textContent="Sans heure, ton ascendant reste voilé. Tu pourras l'ajouter plus tard depuis ta vue Année.";return}
  S.birth.time=$("bTime").value;S.birth.city=+$("bCity").value;save();natal=computeNatal();ascT0=performance.now();closeAsc();
  $("revealTxt").textContent=`${natal.sun[0]} ascendant ${natal.asc[0]}. Chaque jour vécu ajoutera une étoile à ton ciel.`;
  document.querySelector("#reveal h1").textContent="Voici tes quatre premières étoiles"});
$("yAsc").addEventListener("click",()=>{natal=computeNatal();revealT0=performance.now()-4000;setView("reveal");openAsc()});

/* ---------- Démo ---------- */
$("demoBtn").addEventListener("click",()=>{const p=$("demo");p.hidden=!p.hidden;$("demoBtn").setAttribute("aria-expanded",!p.hidden)});
[["Réelle",null],["Aube",6.8],["Jour",13],["Crépuscule",18.2],["Nuit",23]].forEach(([l,h])=>{const b=document.createElement("button");b.textContent=l;b.setAttribute("aria-pressed",h===null);
  b.addEventListener("click",()=>{hourOverride=h;[...$("hours").children].forEach(x=>x.setAttribute("aria-pressed",x===b))});$("hours").appendChild(b)});
$("simBtn").addEventListener("click",()=>{S.sim=!S.sim;save();$("simBtn").setAttribute("aria-pressed",S.sim);if(view==="cycle")renderCycle();if(view==="year")renderYear()});
$("simBtn").setAttribute("aria-pressed",S.sim);
$("shootBtn").addEventListener("click",()=>{launchShoot();$("demo").hidden=true;$("demoBtn").setAttribute("aria-expanded",false)});
$("resetDay").addEventListener("click",()=>{S.today={date:TODAY,stage:"breathe"};S.entries=S.entries.filter(x=>x.date!==TODAY);breath.acc=0;save();setView("day")});
$("resetAll").addEventListener("click",()=>{S={birth:null,entries:[],named:{},sim:true,today:{date:TODAY,stage:"breathe"}};breath.acc=0;save();updateBirthLabel();setView("onboard")});

/* ---------- Démarrage ---------- */
if(S.today.stage==="card")fillCard();
if(S.today.stage==="close"||S.today.stage==="done"){const e=S.entries.find(x=>x.date===TODAY);if(e)Object.assign(S.today,{el:e.el,energy:e.energy});todayStarT=performance.now()-2000}
updateBirthLabel();setView(view);requestAnimationFrame(frame);
const md=NOW.getMonth()+1,dd=NOW.getDate();if((md===8&&dd>=9&&dd<=14)||(md===12&&dd>=10&&dd<=15))setTimeout(launchShoot,4000);
