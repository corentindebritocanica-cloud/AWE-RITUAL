/* Mandala (V3) — sept souffles tracent les sept anneaux du mandala du jour.
   Appui long = inspire (l'anneau se dessine), relâcher = expire (il se referme, le bol sonne).
   La géométrie dépend de la date : chaque jour a son mandala. Données locales : « mandala-jour ». */
(function () {
  'use strict';
  const { jour, ARCANES, CHAKRAS, rng, romain, store, son, reduit } = window.CIEL;
  const $ = (id) => document.getElementById(id);
  const NB = 7, INSPIRE = 4000, EXPIRE = 4000, MINI = 2200;
  const NOTES = [174.6, 196, 220, 261.6, 293.7, 329.6, 392]; // pentatonique ascendante, un bol par anneau

  /* ---------- Géométrie ---------- */
  const pol = (r, a) => `${(r * Math.cos(a - Math.PI / 2)).toFixed(2)} ${(r * Math.sin(a - Math.PI / 2)).toFixed(2)}`;
  const cercle = (r) => `M${r} 0A${r} ${r} 0 1 1 ${-r} 0A${r} ${r} 0 1 1 ${r} 0`;
  const TAU = Math.PI * 2;
  const FORMES = {
    petales(n, r0, r1) {
      let d = '';
      for (let k = 0; k < n; k++) {
        const a = k * TAU / n, w = Math.PI / n * .92, m = r0 + (r1 - r0) * .62;
        d += `M${pol(r0, a - w)}C${pol(m, a - w)} ${pol(r1, a - w * .32)} ${pol(r1, a)}C${pol(r1, a + w * .32)} ${pol(m, a + w)} ${pol(r0, a + w)}`;
      }
      return [cercle(r0), d];
    },
    etoile(n, r0, r1) {
      let d = '';
      for (let k = 0; k <= 2 * n; k++) d += (k ? 'L' : 'M') + pol(k % 2 ? r0 + 3 : r1 - 2, k * Math.PI / n);
      return [d, cercle(r0)];
    },
    vague(n, r0, r1) {
      const rm = (r0 + r1) / 2, amp = (r1 - r0) * .38; let d = '';
      for (let k = 0; k <= 360; k++) { const a = k / 360 * TAU; d += (k ? 'L' : 'M') + pol(rm + amp * Math.sin(n * a), a); }
      return [d, cercle(r1)];
    },
    triangles(n, r0, r1) {
      const t = Math.max(2, Math.round(n / 4)), out = [cercle(r0)];
      for (let k = 0; k < t; k++) { const o = k * TAU / (3 * t); out.push(`M${pol(r1, o)}L${pol(r1, o + TAU / 3)}L${pol(r1, o + 2 * TAU / 3)}Z`); }
      return out;
    },
    points(n, r0, r1) {
      const rm = (r0 + r1) / 2; let d = '';
      for (let k = 0; k < n; k++) { const [x, y] = pol(rm, k * TAU / n).split(' ').map(Number), r = 2.6; d += `M${x + r} ${y}A${r} ${r} 0 1 1 ${x - r} ${y}A${r} ${r} 0 1 1 ${x + r} ${y}`; }
      return [cercle(r0 + 2), d, cercle(r1 - 2)];
    },
    festons(n, r0, r1) {
      let d = '';
      for (let k = 0; k < n; k++) { const a = k * TAU / n, b = (k + 1) * TAU / n; d += (k ? '' : 'M' + pol(r0, a)) + `Q${pol(r1 + 4, (a + b) / 2)} ${pol(r0, b)}`; }
      return [d, cercle(r0)];
    }
  };
  const TYPES = ['etoile', 'vague', 'triangles', 'points', 'festons', 'petales'];
  const NOMBRES = [6, 8, 12, 16, 24];
  const COULEURS = ['rouge', 'or', 'encre'];

  function plan() {
    const r = rng(jour.graine), anneaux = [];
    for (let i = 0; i < NB; i++) {
      const r0 = 14 + i * 25, r1 = r0 + 25;
      const type = i === 0 ? 'petales' : i === NB - 1 ? 'points' : TYPES[Math.floor(r() * TYPES.length)];
      const n = i === 0 ? 8 : NOMBRES[Math.min(NOMBRES.length - 1, Math.floor(r() * 3) + Math.floor(i / 2))];
      anneaux.push({ type, n, r0, r1, couleur: COULEURS[i % 3], plein: type === 'petales' && i > 0 ? true : i === 0 });
    }
    return anneaux;
  }
  const ANNEAUX = plan();
  $('anneaux').insertAdjacentHTML('beforebegin', `<g class="guides">${ANNEAUX.map((a) => `<circle r="${a.r1}"/>`).join('')}</g>`);
  $('anneaux').innerHTML = ANNEAUX.map((a, i) =>
    `<g class="anneau ${a.couleur}${a.plein ? ' plein' : ''}" data-i="${i}" style="--d:${90 + i * 40}s">` +
    FORMES[a.type](a.n, a.r0, a.r1).map((d) => `<path d="${d}" pathLength="1"/>`).join('') + '</g>').join('');
  const groupes = [...document.querySelectorAll('.anneau')];
  const tracer = (i, k) => { groupes[i].style.opacity = k > 0 ? '1' : '0'; groupes[i].querySelectorAll('path').forEach((p) => { p.style.strokeDashoffset = String(1 - k); }); };
  groupes.forEach((g) => { g.style.opacity = '0'; }); // les bouts ronds dessineraient des points sur un anneau pas encore tracé

  /* ---------- Textes ---------- */
  const PHASES = {
    nouvelle: ['Je sème sans attendre.', 'Lune nouvelle : le temps de poser une graine, pas de récolter.'],
    croissante: ['Je nourris ce qui commence.', 'Lune croissante : ce que tu arroses aujourd\'hui prend racine.'],
    pleine: ['Je reçois et je rends grâce.', 'Pleine Lune : tout est visible, accueille ce qui est là.'],
    'décroissante': ['Je lâche ce qui pèse.', 'Lune décroissante : le moment d\'alléger, de trier, de pardonner.']
  };
  const ch = CHAKRAS[jour.chakra];
  $('date').textContent = jour.dateLongue;
  $('ciel').textContent = `Lune ${jour.phase} en ${jour.signe}`;
  $('phrase').textContent = `« ${PHASES[jour.phase][0]} »`;
  $('detail').textContent = `${PHASES[jour.phase][1]} Arcane ${romain(jour.arcane)}, ${ARCANES[jour.arcane]}. Chakra ${ch.de} : murmure « ${ch.bija} » trois fois.`;
  $('bindu').style.fill = ch.c;

  /* ---------- Son ---------- */
  const btnSon = $('son');
  btnSon.setAttribute('aria-pressed', String(son.actif));
  btnSon.addEventListener('click', () => { btnSon.setAttribute('aria-pressed', String(son.basculer())); if (son.actif) son.bol(392, 2.5, .12); });

  /* ---------- Souffle ---------- */
  let fait = 0, etat = { phase: 'repos' };
  const zone = $('zone'), consigne = (t) => { $('consigne').textContent = t; };
  $('perles').innerHTML = '<i></i>'.repeat(NB);
  const majPerles = () => $('perles').querySelectorAll('i').forEach((p, k) => p.classList.toggle('on', k < fait));
  const doux = (k) => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;

  function boucle(now) {
    const e = etat, i = fait;
    if (e.phase === 'inspire') {
      const k = Math.min(1, (now - e.t0) / INSPIRE);
      e.k = doux(k) * .7; tracer(i, e.k);
      if (k >= 1 && !e.retenu) { e.retenu = true; consigne('Retiens… puis relâche'); }
    } else if (e.phase === 'expire') {
      const k = Math.min(1, (now - e.t0) / EXPIRE);
      tracer(i, e.depart + (1 - e.depart) * doux(k));
      if (k >= 1) { terminerAnneau(); return; }
    } else if (e.phase === 'retrait') {
      const k = Math.min(1, (now - e.t0) / 500);
      tracer(i, e.depart * (1 - k));
      if (k >= 1) { etat = { phase: 'repos' }; return; }
    } else return;
    etat.raf = requestAnimationFrame(boucle);
  }
  function appuyer() {
    if (etat.phase !== 'repos' || fait >= NB) return;
    son.reveiller();
    etat = { phase: 'inspire', t0: performance.now(), k: 0 };
    zone.classList.add('respire'); consigne('Inspire…');
    etat.raf = requestAnimationFrame(boucle);
  }
  function relacher() {
    if (etat.phase !== 'inspire') return;
    cancelAnimationFrame(etat.raf); zone.classList.remove('respire');
    const duree = performance.now() - etat.t0;
    if (duree < MINI) { etat = { phase: 'retrait', t0: performance.now(), depart: etat.k }; consigne('Plus lentement, laisse le souffle venir'); etat.raf = requestAnimationFrame(boucle); return; }
    son.bol(NOTES[fait], 6);
    etat = { phase: 'expire', t0: performance.now(), depart: etat.k };
    consigne('Expire…');
    etat.raf = requestAnimationFrame(boucle);
  }
  function terminerAnneau() {
    groupes[fait].classList.add('fait'); fait++; majPerles(); etat = { phase: 'repos' };
    if (fait < NB) { consigne(fait === NB - 1 ? 'Dernier souffle' : `Encore ${NB - fait} souffles`); return; }
    store.set('mandala-jour', { cle: jour.cle, fini: true });
    setTimeout(() => son.bol(130.8, 9, .28), 300);
    finir(true);
  }
  function finir(anime) {
    groupes.forEach((g, i) => { g.classList.add('fait'); tracer(i, 1); });
    fait = NB; majPerles();
    zone.classList.add('contemple');
    consigne('Ton mandala est complet. Contemple-le un instant.');
    $('intention').hidden = false;
    if (anime) setTimeout(() => $('intention').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' }), 900);
  }

  zone.addEventListener('pointerdown', (e) => { e.preventDefault(); try { zone.setPointerCapture(e.pointerId); } catch (err) {} appuyer(); });
  zone.addEventListener('pointerup', relacher);
  zone.addEventListener('pointercancel', relacher);
  zone.addEventListener('contextmenu', (e) => e.preventDefault());
  zone.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); appuyer(); } });
  zone.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); relacher(); } });
  zone.setAttribute('aria-label', 'Mandala du jour : garde appuyé pour inspirer, relâche pour expirer');

  $('recommencer').addEventListener('click', () => {
    store.set('mandala-jour', null); fait = 0; majPerles();
    zone.classList.remove('contemple'); $('intention').hidden = true;
    groupes.forEach((g, i) => { g.classList.remove('fait'); tracer(i, 0); });
    consigne('Pose ton doigt sur le mandala et inspire');
    scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
  });

  const memo = store.get('mandala-jour', null);
  if (memo && memo.cle === jour.cle && memo.fini) finir(false);
})();
