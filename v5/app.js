/* Chakras (V5) — scan des sept centres de la racine à la couronne, centre à soigner, méditation guidée.
   Données locales : « chakras-scan » = { cle, etats: [0|1|2 ×7] } (0 contracté, 1 fluide, 2 agité). */
(function () {
  'use strict';
  const { jour, CHAKRAS, store, son, reduit } = window.CIEL;
  const $ = (id) => document.getElementById(id);

  const Y = [200, 176, 146, 112, 74, 42, 16]; // position de chaque centre sur la silhouette
  const PLUS = [
    { hz: 396, posture: 'Tadasana, la montagne', mudra: 'Prithvi mudra', consigne: 'Sens le poids de ton bassin, le contact avec le sol.',
      ferme: "J'ai le droit d'être ici. La terre me porte.", agite: 'Je ralentis. Rien ne presse, je suis en sécurité.' },
    { hz: 417, posture: 'Le pigeon', mudra: 'Shakti mudra', consigne: 'Respire dans ton bas-ventre, comme une eau qui se balance.',
      ferme: "Je m'autorise le plaisir et l'émotion.", agite: 'Je laisse mes émotions passer comme des vagues.' },
    { hz: 528, posture: 'Le bateau', mudra: 'Rudra mudra', consigne: "Pose ton attention au creux de l'estomac, sous les côtes.",
      ferme: "J'ose prendre ma place.", agite: "Je n'ai rien à prouver aujourd'hui." },
    { hz: 639, posture: 'Le cobra', mudra: 'Anjali mudra', consigne: 'Sens la poitrine se soulever, au centre, derrière le sternum.',
      ferme: "J'ouvre mon cœur sans me perdre.", agite: "Je donne aussi de l'amour à moi-même." },
    { hz: 741, posture: 'Le poisson', mudra: 'Vishuddha mudra', consigne: 'Avale doucement. Sens la gorge, la nuque, la voix qui attend.',
      ferme: 'Ma voix compte. Je dis ce qui est vrai.', agite: "J'écoute autant que je parle." },
    { hz: 852, posture: "L'enfant", mudra: 'Hakini mudra', consigne: 'Détends le front. Regarde vers l’intérieur, entre les sourcils.',
      ferme: 'Je fais confiance à ce que je pressens.', agite: 'Je pose mon mental, je reviens au corps.' },
    { hz: 963, posture: 'Savasana, le repos', mudra: 'Sahasrara mudra', consigne: 'Imagine une ouverture au sommet du crâne, une lumière douce.',
      ferme: 'Je suis relié·e à plus grand que moi.', agite: 'Je redescends dans mon corps, ici et maintenant.' }
  ];
  const ETATS = ['contracté', 'fluide', 'agité'];

  $('date').textContent = jour.dateLongue;
  const btnSon = $('son');
  btnSon.setAttribute('aria-pressed', String(son.actif));
  btnSon.addEventListener('click', () => { btnSon.setAttribute('aria-pressed', String(son.basculer())); });

  /* ---------- Silhouette ---------- */
  $('points').innerHTML = CHAKRAS.map((c, i) =>
    `<g class="point" data-i="${i}"><circle class="halo" cx="100" cy="${Y[i]}" r="14" fill="${c.c}" filter="url(#flou)"/><circle class="coeur" cx="100" cy="${Y[i]}" r="5" fill="${c.c}" opacity=".3"/></g>`).join('');
  const points = [...document.querySelectorAll('.point')];
  const racine = document.documentElement;
  function eclairer(i, etats) {
    points.forEach((p, k) => {
      p.classList.toggle('actif', k === i);
      const coeur = p.querySelector('.coeur');
      if (etats && etats[k] != null) { coeur.setAttribute('r', [4, 7, 10][etats[k]]); coeur.setAttribute('opacity', etats[k] === 0 ? '.5' : '1'); }
      else { coeur.setAttribute('r', '5'); coeur.setAttribute('opacity', k === i ? '1' : '.3'); }
    });
    $('montee').style.transform = `scaleY(${i < 0 ? 0 : (206 - Y[i]) / 186})`;
    if (i >= 0) racine.style.setProperty('--c', CHAKRAS[i].c);
  }

  /* ---------- Scan ---------- */
  let etats = [], i = 0;
  $('pas').innerHTML = CHAKRAS.map((c) => `<i style="--pc:${c.c}"></i>`).join('');
  function afficherScan() {
    const c = CHAKRAS[i];
    $('sNom').textContent = `${i + 1}/7 · ${c.nom}`;
    $('sTitre').textContent = `Chakra ${c.de}`;
    $('sConsigne').textContent = PLUS[i].consigne + ' Comment le sens-tu ?';
    $('pas').querySelectorAll('i').forEach((p, k) => p.classList.toggle('on', k <= i));
    $('retourScan').hidden = i === 0;
    eclairer(i, etats);
  }
  document.querySelector('.etats').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    etats[i] = +b.dataset.e;
    son.bol(PLUS[i].hz / 2, 2.5, .12);
    if (i < 6) { i++; afficherScan(); }
    else { store.set('chakras-scan', { cle: jour.cle, etats }); resultat(true); }
  });
  $('retourScan').addEventListener('click', () => { if (i > 0) { i--; afficherScan(); } });

  /* ---------- Résultat ---------- */
  function focus() {
    const contracte = etats.indexOf(0); if (contracte >= 0) return [contracte, 0];
    const agite = etats.indexOf(2); if (agite >= 0) return [agite, 2];
    return [6, 1];
  }
  function resultat(anime) {
    const [f, e] = focus(), c = CHAKRAS[f], p = PLUS[f];
    $('scan').hidden = true; $('resultat').hidden = false;
    $('sous').textContent = `${etats.filter((x) => x === 1).length} centres sur 7 fluides aujourd'hui.`;
    eclairer(f, etats);
    $('montee').style.transform = 'scaleY(1)';
    $('rTitre').textContent = `${c.nom} · ${c.fr}`;
    $('rRaison').textContent = e === 1 ? "Tout circule : nourris la couronne, en gratitude." : `Tu l'as senti ${ETATS[e]} : c'est lui que tu accompagnes aujourd'hui.`;
    $('rBija').textContent = c.bija === 'silence' ? 'Silence' : c.bija;
    $('rHz').textContent = `${p.hz} Hz`;
    $('rPosture').textContent = p.posture;
    $('rMudra').textContent = p.mudra;
    $('rAffirmation').textContent = `« ${e === 2 ? p.agite : p.ferme} »`;
    $('ecouter').dataset.hz = p.hz;
    if (anime) setTimeout(() => $('resultat').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' }), 120);
  }
  $('ecouter').addEventListener('click', () => {
    if (!son.actif) { son.basculer(); btnSon.setAttribute('aria-pressed', 'true'); }
    son.bol(+$('ecouter').dataset.hz / 2, 8, .25);
  });
  $('refaire').addEventListener('click', () => {
    arreter(); etats = []; i = 0; store.set('chakras-scan', null);
    $('resultat').hidden = true; $('scan').hidden = false;
    $('sous').textContent = 'Un scan du corps énergétique, de la racine à la couronne.';
    afficherScan(); scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
  });

  /* ---------- Méditation guidée : 7 centres × 3 souffles (4 s inspire, 6 s expire) ---------- */
  let minuteurs = [], enCours = false;
  function arreter() {
    minuteurs.forEach(clearTimeout); minuteurs = []; enCours = false;
    $('mediter').textContent = 'Commencer'; $('guide').hidden = true; $('guide').classList.remove('inspire');
    if (!$('resultat').hidden) { const [f] = focus(); eclairer(f, etats); $('montee').style.transform = 'scaleY(1)'; }
  }
  function mediter() {
    if (enCours) return arreter();
    enCours = true; son.reveiller();
    $('mediter').textContent = 'Arrêter'; $('guide').hidden = false;
    let t = 0;
    const plus = (ms, fn) => { minuteurs.push(setTimeout(fn, t)); t += ms; };
    CHAKRAS.forEach((c, k) => {
      for (let s = 0; s < 3; s++) {
        plus(4000, () => {
          if (s === 0) { eclairer(k, null); $('gBija').textContent = c.bija === 'silence' ? '…' : c.bija; son.bol(PLUS[k].hz / 2, 7, .18); }
          $('gEtape').textContent = `${c.nom} · souffle ${s + 1}/3 · inspire`;
          $('guide').classList.add('inspire');
        });
        plus(6000, () => {
          $('gEtape').textContent = `${c.nom} · souffle ${s + 1}/3 · ${c.bija === 'silence' ? 'expire en silence' : 'chante ' + c.bija}`;
          $('guide').classList.remove('inspire');
        });
      }
    });
    plus(0, () => { son.bol(130.8, 9, .25); $('gEtape').textContent = 'Alignement terminé'; $('gBija').textContent = 'ॐ'; enCours = false; $('mediter').textContent = 'Recommencer'; });
    $('guide').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' });
  }
  $('mediter').addEventListener('click', mediter);
  document.addEventListener('visibilitychange', () => { if (document.hidden && enCours) arreter(); });

  /* ---------- Démarrage ---------- */
  const memo = store.get('chakras-scan', null);
  if (memo && memo.cle === jour.cle && memo.etats && memo.etats.length === 7) { etats = memo.etats; resultat(false); }
  else afficherScan();
})();
