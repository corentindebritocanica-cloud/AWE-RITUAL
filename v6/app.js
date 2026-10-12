/* Mala (V6) — japa : un mantra du jour (selon le jour de la semaine), un mala de 27, 54 ou 108 perles.
   On égrène en tirant le fil vers soi (ou d'une touche). Données locales : « mala-japa ». */
(function () {
  'use strict';
  const { jour, store, son, reduit } = window.CIEL;
  const $ = (id) => document.getElementById(id);

  const MANTRAS = [
    { latin: 'Om Suryaya Namaha', deva: 'ॐ सूर्याय नमः', sens: 'Je salue la lumière du soleil, source de toute vie.', jour: 'Dimanche · Soleil' },
    { latin: 'Om Namah Shivaya', deva: 'ॐ नमः शिवाय', sens: "Je m'incline devant la conscience qui vit en moi.", jour: 'Lundi · Lune' },
    { latin: 'Om Gam Ganapataye Namaha', deva: 'ॐ गं गणपतये नमः', sens: "Que les obstacles s'écartent du chemin.", jour: 'Mardi · Mars' },
    { latin: 'So Hum', deva: 'सोऽहम्', sens: 'Je suis cela. « So » à l’inspire, « Hum » à l’expire.', jour: 'Mercredi · Mercure' },
    { latin: 'Om Mani Padme Hum', deva: 'ॐ मणि पद्मे हूँ', sens: 'Le joyau est dans le lotus : la compassion éveillée.', jour: 'Jeudi · Jupiter' },
    { latin: 'Om Shreem Mahalakshmiyei Namaha', deva: 'ॐ श्रीं महालक्ष्म्यै नमः', sens: "J'accueille l'abondance et la beauté.", jour: 'Vendredi · Vénus' },
    { latin: 'Om Shanti Shanti Shanti', deva: 'ॐ शान्तिः शान्तिः शान्तिः', sens: 'Paix en moi, paix autour de moi, paix partout.', jour: 'Samedi · Saturne' }
  ];
  const E = 60; // écart entre deux perles (px)

  let memo = store.get('mala-japa', {});
  if (memo.cle !== jour.cle) memo = { cle: jour.cle, compte: 0, total: memo.total || 108, mantra: jour.date.getDay(), tours: memo.tours || {} };
  const sauver = () => store.set('mala-japa', memo);

  $('date').textContent = jour.dateLongue;
  const btnSon = $('son');
  btnSon.setAttribute('aria-pressed', String(son.actif));
  btnSon.addEventListener('click', () => { btnSon.setAttribute('aria-pressed', String(son.basculer())); if (son.actif) son.clic(640, .1); });

  /* ---------- Mantra ---------- */
  function afficherMantra() {
    const m = MANTRAS[memo.mantra], duJour = memo.mantra === jour.date.getDay();
    $('mJour').textContent = duJour ? `Mantra du jour · ${m.jour}` : m.jour;
    $('mDeva').textContent = m.deva;
    $('mLatin').textContent = m.latin;
    $('mSens').textContent = m.sens;
    $('autres').innerHTML = MANTRAS.map((x, i) => `<button type="button" role="radio" aria-checked="${i === memo.mantra}" data-i="${i}">${x.latin.replace(/^Om /, '')}</button>`).join('');
  }
  $('autres').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    memo.mantra = +b.dataset.i; memo.compte = 0; sauver(); afficherMantra(); rafraichir(); $('fin').hidden = true;
  });

  /* ---------- Nombre de perles ---------- */
  function majTours() { document.querySelectorAll('.tours button').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.n === memo.total))); }
  document.querySelector('.tours').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    memo.total = +b.dataset.n; memo.compte = Math.min(memo.compte, memo.total); sauver(); majTours(); dessinerAnneau(); rafraichir();
  });

  /* ---------- Anneau de progression ---------- */
  function dessinerAnneau() {
    const n = memo.total, r = 52, rayon = n > 60 ? 1.6 : n > 30 ? 2.3 : 3;
    let s = `<circle class="meru" cx="0" cy="${-r}" r="${rayon + 2}"/>`;
    for (let k = 1; k <= n; k++) { const a = k / (n + 1) * Math.PI * 2 - Math.PI / 2; s += `<circle data-k="${k}" cx="${(r * Math.cos(a)).toFixed(2)}" cy="${(r * Math.sin(a)).toFixed(2)}" r="${rayon}"/>`; }
    $('anneau').innerHTML = s;
  }
  function rafraichir() {
    $('compte').textContent = memo.compte;
    $('surTotal').textContent = `/ ${memo.total}`;
    $('anneau').querySelectorAll('circle[data-k]').forEach((c) => c.classList.toggle('on', +c.dataset.k <= memo.compte));
    placer();
  }

  /* ---------- Le fil : perles positionnées autour du point de comptage ---------- */
  const PERLES = [];
  for (let j = -5; j <= 4; j++) { const p = document.createElement('span'); p.className = 'perle'; p.dataset.j = j; $('perles').appendChild(p); PERLES.push(p); }
  let o = 0; // décalage en cours (0 → E)
  function placer() {
    PERLES.forEach((p) => {
      const j = +p.dataset.j, index = memo.compte - j; // au-dessus du point : perles à venir
      p.style.transform = `translateY(${j * E + o}px)`;
      p.classList.toggle('meru', index === memo.total + 1);
    });
  }

  function compter() {
    if (memo.compte >= memo.total) return;
    memo.compte++; sauver();
    son.clic(560 + (memo.compte % 3) * 40, .09);
    if (memo.compte % 27 === 0 && memo.compte < memo.total) son.bol(261.6, 3, .1);
    if (memo.compte >= memo.total) terminer();
    rafraichir();
  }
  function terminer() {
    memo.tours[jour.cle] = (memo.tours[jour.cle] || 0) + 1; sauver();
    son.bol(130.8, 9, .28);
    const sem = Object.entries(memo.tours).filter(([c]) => (jour.date - new Date(c + 'T12:00:00')) / 864e5 < 7).reduce((s, [, n]) => s + n, 0);
    $('finTexte').textContent = `${memo.total} répétitions de « ${MANTRAS[memo.mantra].latin} ». ${memo.tours[jour.cle]} tour${memo.tours[jour.cle] > 1 ? 's' : ''} aujourd'hui, ${sem} sur 7 jours.`;
    $('fin').hidden = false;
    $('consigne').textContent = 'Le méru est sous tes doigts : on ne le franchit pas, on retourne le mala.';
    setTimeout(() => $('fin').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' }), 400);
  }
  $('encore').addEventListener('click', () => {
    memo.compte = 0; sauver(); $('fin').hidden = true; rafraichir();
    $('consigne').textContent = 'Fais glisser les perles vers toi, une par répétition';
    scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
  });

  /* Animation du décalage vers une cible (0 = retour, E = une perle passe) */
  let raf = 0;
  function amener(cible, ms) {
    cancelAnimationFrame(raf);
    const de = o, t0 = performance.now(), d = reduit ? 1 : ms;
    const pas = (now) => {
      const k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3);
      o = de + (cible - de) * e; placer();
      if (k < 1) { raf = requestAnimationFrame(pas); return; }
      if (cible >= E) { o = 0; compter(); }
    };
    raf = requestAnimationFrame(pas);
  }

  /* ---------- Gestes ---------- */
  const fil = $('fil');
  let geste = null;
  fil.addEventListener('pointerdown', (e) => {
    son.reveiller(); cancelAnimationFrame(raf);
    if (o >= E * .5) { o = 0; compter(); } else { o = 0; placer(); }
    try { fil.setPointerCapture(e.pointerId); } catch (err) {}
    geste = { id: e.pointerId, y: e.clientY, total: 0, t0: performance.now() };
  });
  fil.addEventListener('pointermove', (e) => {
    if (!geste || e.pointerId !== geste.id) return;
    const dy = e.clientY - geste.y; geste.y = e.clientY; geste.total += Math.abs(dy);
    if (memo.compte >= memo.total) return;
    o = Math.max(0, o + dy);
    while (o >= E) { o -= E; compter(); if (memo.compte >= memo.total) { o = 0; break; } }
    placer();
  });
  function finGeste(e) {
    if (!geste || e.pointerId !== geste.id) return;
    const tape = geste.total < 8 && performance.now() - geste.t0 < 350;
    geste = null;
    if (memo.compte >= memo.total) { o = 0; placer(); return; }
    if (tape) amener(E, 220);
    else amener(o > E * .4 ? E : 0, 180);
  }
  fil.addEventListener('pointerup', finGeste);
  fil.addEventListener('pointercancel', finGeste);
  fil.addEventListener('contextmenu', (e) => e.preventDefault());
  fil.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); son.reveiller(); amener(E, 200); } });
  fil.addEventListener('click', (e) => e.preventDefault());

  /* ---------- Démarrage ---------- */
  afficherMantra(); majTours(); dessinerAnneau(); rafraichir();
  if (memo.compte >= memo.total) { $('fin').hidden = false; $('finTexte').textContent = `Japa accompli : ${memo.total} répétitions de « ${MANTRAS[memo.mantra].latin} ».`; }
})();
