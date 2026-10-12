/* Oracle (V4) — allumer la bougie, poser sa question, tirer une carte parmi les 22 arcanes.
   Le tirage est vraiment aléatoire (pas lié à la date). Un tirage par jour, gardé dans « oracle-tirages ». */
(function () {
  'use strict';
  const { jour, CHAKRAS, romain, store, son, reduit } = window.CIEL;
  const $ = (id) => document.getElementById(id);

  /* ---------- Les 22 cartes ---------- */
  const CARTES = [
    ['Le Mat', 'Élan', "Tu n'as pas besoin de tout savoir pour faire le premier pas.", 'Quel pas léger puis-je faire sans plan ?', 'Marche dix minutes sans destination.', 'mat'],
    ['Le Bateleur', 'Commencement', "Tout ce qu'il te faut est déjà sur ta table. Commence avec ce que tu as.", "Quel outil est-ce que j'oublie d'utiliser ?", 'Range ton espace avant de commencer quoi que ce soit.', 'bateleur'],
    ['La Papesse', 'Intuition', 'La réponse est déjà écrite en toi. Fais assez de silence pour la lire.', "Que sais-je déjà, sans pouvoir l'expliquer ?", 'Cinq minutes de silence, les yeux fermés.', 'papesse'],
    ["L'Impératrice", 'Création', 'Ce qui pousse en toi demande de la douceur, pas du contrôle.', "Qu'est-ce que je fais naître en ce moment ?", 'Touche une plante, un tissu, une matière vivante.', 'imperatrice'],
    ["L'Empereur", 'Structure', "Une limite claire est un acte d'amour, envers toi comme envers les autres.", "Où ai-je besoin d'un cadre ?", 'Écris trois priorités, pas une de plus.', 'empereur'],
    ['Le Pape', 'Transmission', "Quelqu'un a déjà traversé ce que tu traverses. Écoute.", 'De qui puis-je apprendre aujourd’hui ?', 'Envoie un mot de gratitude à quelqu’un qui t’a guidé·e.', 'pape'],
    ["L'Amoureux", 'Choix', "Choisir, c'est aussi renoncer. Laisse ton cœur trancher.", "Entre quoi et quoi est-ce que j'hésite vraiment ?", 'Pose la main sur ton cœur avant de décider.', 'amoureux'],
    ['Le Chariot', 'Direction', 'Tes forces contraires peuvent avancer ensemble si tu tiens les rênes.', 'Vers où est-ce que j’avance ?', 'Tiens-toi droit·e, regard à l’horizon, trois respirations.', 'chariot'],
    ['La Justice', 'Équilibre', "Sois juste avec toi-même avant de l'être avec les autres.", "Qu'est-ce qui serait vraiment équitable ici ?", 'Respiration carrée : quatre temps, quatre fois.', 'justice'],
    ["L'Hermite", 'Recul', 'Ta lanterne éclaire un pas à la fois. C’est suffisant.', "De quoi ai-je besoin de m'éloigner un peu ?", 'Une heure sans téléphone.', 'hermite'],
    ['La Roue de Fortune', 'Cycle', 'Rien ne reste en haut, rien ne reste en bas. Tout tourne.', 'Quel cycle se termine pour moi ?', 'Fais tourner lentement tes épaules, dix fois.', 'roue'],
    ['La Force', 'Douceur', 'La vraie force ne serre pas : elle apprivoise.', "Qu'est-ce que je peux apprivoiser au lieu de le combattre ?", 'Desserre la mâchoire, ouvre les mains.', 'force'],
    ['Le Pendu', 'Lâcher-prise', "Regarder autrement, c'est déjà avancer.", 'Et si je retournais la situation ?', 'Jambes au mur, cinq minutes.', 'pendu'],
    ["L'Arcane sans nom", 'Transformation', 'Ce qui finit laisse la place. Coupe ce qui est sec, la sève reviendra.', "Qu'est-ce que je peux laisser partir ?", 'Donne ou jette un objet dont tu n’as plus besoin.', 'sansnom'],
    ['Tempérance', 'Harmonie', 'Mélange les contraires lentement. Le juste dosage se trouve en goûtant.', "Où ai-je besoin de nuance ?", "Bois un verre d'eau en pleine conscience.", 'temperance'],
    ['Le Diable', 'Attachement', 'Regarde tes chaînes : certaines sont posées, pas fermées.', 'À quoi suis-je attaché·e plus que je ne le voudrais ?', 'Une journée sans ton petit réflexe automatique.', 'diable'],
    ['La Maison Dieu', 'Libération', "Ce qui s'effondre n'était pas fait pour tenir. Par la brèche, la lumière entre.", 'Quelle certitude vacille ?', 'Secoue tout ton corps pendant une minute.', 'maisondieu'],
    ["L'Étoile", 'Espoir', 'Tu es guidé·e, même quand tu ne le vois pas. Donne sans compter.', "Qu'est-ce qui me redonne foi ?", 'Ce soir, regarde le ciel une minute.', 'etoile'],
    ['La Lune', 'Rêve', 'Le brouillard fait partie du chemin. Ton instinct voit plus loin que tes yeux.', 'Quelle peur se déguise en vérité ?', 'Note ton rêve dès le réveil.', 'lune'],
    ['Le Soleil', 'Joie', 'Laisse-toi être vu·e. Ta joie éclaire plus que tu ne crois.', "Qu'est-ce qui me rend simplement heureux·se ?", 'Dix minutes à la lumière du jour.', 'soleil'],
    ['Le Jugement', 'Renaissance', 'Un appel monte en toi. Réponds-y sans te justifier.', 'À quoi suis-je appelé·e ?', 'Chante ou fredonne une chanson à voix haute.', 'jugement'],
    ['Le Monde', 'Accomplissement', 'Un cercle se ferme. Célèbre le chemin avant le suivant.', "Qu'ai-je accompli sans le fêter ?", 'Danse une chanson entière, seul·e.', 'monde']
  ].map(([nom, mot, message, question, geste, symbole], i) => ({ i, nom, mot, message, question, geste, symbole }));

  /* ---------- Symboles (viewBox -50 -50 100 100) ---------- */
  const rayons = (n, r0, r1) => Array.from({ length: n }, (_, k) => { const a = k * 2 * Math.PI / n; return `M${(r0 * Math.cos(a)).toFixed(1)} ${(r0 * Math.sin(a)).toFixed(1)}L${(r1 * Math.cos(a)).toFixed(1)} ${(r1 * Math.sin(a)).toFixed(1)}`; }).join('');
  const etoile = (n, r0, r1, cy = 0, cx = 0) => Array.from({ length: 2 * n + 1 }, (_, k) => { const a = k * Math.PI / n - Math.PI / 2, r = k % 2 ? r0 : r1; return (k ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); }).join('') + 'Z';
  const INF = 'M0 0C-8-12-26-12-26 0S-8 12 0 0 8-12 26-12 26 0 8 12 0 0';
  const S = {
    mat: `<path d="M-30 32Q-10 20 0 22T30 10"/><path class="or" d="M8-6a10 10 0 1 1-10-10 6 6 0 1 1 6 6 3 3 0 1 1-3-3"/>`,
    bateleur: `<path class="or" d="${INF}" transform="translate(0 -24) scale(.7)"/><path d="M-30 10H30M-24 10V34M24 10V34"/><circle cx="-12" cy="2" r="4"/><path d="M6 -2l8 8"/><path d="M0 6v-14"/>`,
    papesse: `<path d="M-24-10h48v40h-48z M0-10v40"/><path class="or" d="M10-36a14 14 0 1 0 0 20 11 11 0 1 1 0-20z"/>`,
    imperatrice: `<circle class="or" cy="-12" r="16"/><path d="M0 4v30M-12 22h24"/><path d="M-30-12q-6 18 8 30M30-12q6 18-8 30"/>`,
    empereur: `<path d="M-24-14h48v44h-48z"/><path class="or" d="M-24-14l24-18 24 18"/><path d="M-8 30v-20h16v20"/>`,
    pape: `<path class="or" d="M-20 20L20-20M20 20L-20-20"/><circle cx="-24" cy="-24" r="6"/><circle cx="24" cy="-24" r="6"/><path d="M-24 24h-6M24 24h6M24 24v-6M-24 24v-6"/>`,
    amoureux: `<circle cx="-11" r="20"/><circle class="or" cx="11" r="20"/>`,
    chariot: `<path d="M-30-6h60v18h-60z"/><circle class="or" cx="-18" cy="22" r="10"/><circle class="or" cx="18" cy="22" r="10"/><path d="M0-6v-20M-10-26h20"/>`,
    justice: `<path d="M0-34v62M-26-20h52M-16 28h32"/><path class="or" d="M-26-20l-10 22h20zM26-20l-10 22h20z"/>`,
    hermite: `<path d="M-10-14h20v26h-20zM-6-14v-8h12v8M0 12v22"/><circle class="plein" cy="-1" r="5"/><path class="or" d="${rayons(8, 16, 22)}" transform="translate(0 -1)"/>`,
    roue: `<circle r="30"/><circle class="or" r="8"/><path d="${rayons(8, 8, 30)}"/>`,
    force: `<path class="or" d="${INF}" transform="translate(0 -22) scale(.75)"/><path d="M-22 4a22 22 0 0 0 44 0"/><path d="M-16 24c6 10 26 10 32 0"/>`,
    pendu: `<path d="M-30-30h60M0-30v18"/><path class="or" d="M-14-12h28L0 16z"/><circle cy="24" r="7"/>`,
    sansnom: `<path d="M0 34V-6"/><path class="or" d="M0 2C-20 2-24-14-22-26 -8-24 0-14 0 2zM0-6c16 0 22-12 20-24-12 2-20 10-20 24z"/><path d="M-26 34h52"/>`,
    temperance: `<path d="M-30-10h18l-3 16h-12zM12 10h18l-3 16h-12z"/><path class="or" d="M-14-4C0-4 4 6 14 12"/><path class="or" d="${etoile(4, 2, 6, -30)}"/>`,
    diable: `<circle cx="-12" r="12"/><circle class="or" cx="12" r="12"/><path d="M-30-30l12 14M30-30l-12 14"/>`,
    maisondieu: `<path d="M-14 34V-12h28v46M-14-12l4-10h20l4 10"/><path class="or" d="M-30-36L-4-18-12-14 10 2"/><path d="M-6 34v-12h12v12"/>`,
    etoile: `<path class="or" d="${etoile(8, 10, 30, -6)}"/><path d="${etoile(4, 2, 6, 34, -22)}"/><path d="${etoile(4, 2, 6, 34, 22)}"/>`,
    lune: `<path class="or" d="M8-30a28 28 0 1 0 0 56 22 22 0 1 1 0-56z"/><path d="M-36 34q8-6 16 0t16 0 16 0 16 0 16 0"/>`,
    soleil: `<circle class="or" r="14"/><path d="${rayons(16, 20, 32)}"/>`,
    jugement: `<path d="M-30 30h60"/><path class="or" d="M-4-6l-22-18q-4 18 10 24zM4-6l22-18q4 18-10 24z"/><path d="M0-6v26M-8 20h16"/>`,
    monde: `<ellipse class="or" rx="22" ry="32"/><circle cx="-32" cy="-32" r="3.5"/><circle cx="32" cy="-32" r="3.5"/><circle cx="-32" cy="32" r="3.5"/><circle cx="32" cy="32" r="3.5"/><circle r="4"/>`
  };

  /* ---------- État ---------- */
  let tirages = store.get('oracle-tirages', []);
  const duJour = () => tirages.find((t) => t.cle === jour.cle);
  $('date').textContent = jour.dateLongue;

  const btnSon = $('son');
  btnSon.setAttribute('aria-pressed', String(son.actif));
  btnSon.addEventListener('click', () => { btnSon.setAttribute('aria-pressed', String(son.basculer())); if (son.actif) son.bol(392, 2.5, .12); });

  const montrer = (id) => { $(id).hidden = false; };
  const descendre = (id) => setTimeout(() => $(id).scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' }), 80);

  /* ---------- 1 · Allumer la bougie (appui long) ---------- */
  let minuteur = 0;
  const bougie = $('bougie');
  function allumer(silence) {
    document.documentElement.classList.add('allume');
    $('consigneBougie').textContent = 'La flamme est allumée.';
    bougie.disabled = true; bougie.setAttribute('aria-label', 'Bougie allumée');
    if (!silence) { son.bol(220, 6); montrer('question'); descendre('question'); }
  }
  bougie.addEventListener('pointerdown', (e) => {
    if (bougie.disabled) return; e.preventDefault(); son.reveiller();
    bougie.classList.add('appui');
    minuteur = setTimeout(() => { bougie.classList.remove('appui'); allumer(false); }, 1200);
  });
  const annuler = () => { clearTimeout(minuteur); bougie.classList.remove('appui'); };
  bougie.addEventListener('pointerup', annuler);
  bougie.addEventListener('pointercancel', annuler);
  bougie.addEventListener('pointerleave', annuler);
  bougie.addEventListener('contextmenu', (e) => e.preventDefault());
  bougie.addEventListener('click', (e) => { if (e.detail === 0 && !bougie.disabled) allumer(false); }); // clavier : Entrée / Espace

  /* ---------- 2 · Mélanger ---------- */
  function hasard(n) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }
  $('melanger').addEventListener('click', () => {
    $('texteQuestion').blur();
    const ordre = CARTES.map((c) => c.i);
    for (let i = ordre.length - 1; i > 0; i--) { const j = hasard(i + 1); [ordre[i], ordre[j]] = [ordre[j], ordre[i]]; }
    const ev = $('eventail');
    ev.innerHTML = ordre.map((id, k) => `<button type="button" class="dosCarte" role="option" aria-selected="false" aria-label="Carte ${k + 1} sur 22" data-c="${id}" style="--i:${k};--x:${(hasard(200) - 100)};--r:${hasard(40) - 20}"></button>`).join('');
    $('question').hidden = true; montrer('tirage');
    ev.classList.add('melange'); setTimeout(() => ev.classList.remove('melange'), 1400);
    son.clic(900, .06);
    requestAnimationFrame(() => { ev.scrollLeft = (ev.scrollWidth - ev.clientWidth) / 2; arc(); });
    descendre('tirage');
  });

  /* L'éventail : chaque carte s'incline selon sa distance au centre */
  let rafArc = 0, choisieCentre = null;
  function arc() {
    const ev = $('eventail'), centre = ev.getBoundingClientRect().left + ev.clientWidth / 2;
    let meilleur = null, dMin = 1e9;
    ev.querySelectorAll('.dosCarte').forEach((c) => {
      const b = c.getBoundingClientRect(), d = (b.left + b.width / 2 - centre) / 60;
      c.style.transform = `translateY(${Math.min(60, d * d * 5) - (Math.abs(d) < .5 ? 24 : 0)}px) rotate(${d * 7}deg)`;
      c.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
      if (Math.abs(d) < dMin) { dMin = Math.abs(d); meilleur = c; }
    });
    if (meilleur !== choisieCentre) {
      if (choisieCentre) choisieCentre.setAttribute('aria-selected', 'false');
      meilleur.setAttribute('aria-selected', 'true'); choisieCentre = meilleur;
      if (!$('tirage').hidden) son.clic(1600, .025);
    }
  }
  $('eventail').addEventListener('scroll', () => { cancelAnimationFrame(rafArc); rafArc = requestAnimationFrame(arc); }, { passive: true });
  $('eventail').addEventListener('click', (e) => { const c = e.target.closest('.dosCarte'); if (c) reveler(+c.dataset.c, true); });

  /* ---------- 3 · Révéler ---------- */
  function remplir(carte, question) {
    const ch = CHAKRAS[jour.chakra];
    $('cNum').textContent = romain(carte.i);
    $('cSymbole').innerHTML = `<circle class="or" r="46" stroke-dasharray="1 4"/>${S[carte.symbole]}`;
    $('cNom').textContent = carte.nom;
    $('cMot').textContent = carte.mot;
    $('cMessage').textContent = `« ${carte.message} »`;
    $('cQuestion').textContent = carte.question;
    $('cGeste').textContent = carte.geste;
    $('cCiel').textContent = `Lune ${jour.phase} en ${jour.signe} · Chakra ${ch.de}`;
    $('cQuestionPosee').hidden = !question;
    $('cQuestionPosee').textContent = question ? `Ta question : ${question}` : '';
    $('carte').setAttribute('aria-label', `${carte.nom}, ${carte.mot}`);
  }
  function reveler(id, anime) {
    const carte = CARTES[id], question = anime ? $('texteQuestion').value.trim() : (duJour() || {}).question;
    if (anime) {
      tirages = tirages.filter((t) => t.cle !== jour.cle);
      tirages.push({ cle: jour.cle, carte: id, question, le: new Date().toISOString() });
      store.set('oracle-tirages', tirages.slice(-60));
    }
    remplir(carte, question);
    $('tirage').hidden = true; $('question').hidden = true; montrer('revelation');
    const sec = $('revelation');
    if (!anime || reduit) { sec.classList.add('revele'); }
    else { sec.classList.remove('revele'); descendre('revelation'); setTimeout(() => { sec.classList.add('revele'); son.bol(261.6, 7); }, 450); }
    journal();
  }

  /* ---------- Journal ---------- */
  function journal() {
    const passes = tirages.slice().reverse().slice(0, 7);
    $('journal').hidden = passes.length < 2;
    $('liste').innerHTML = passes.map((t) => {
      const c = CARTES[t.carte], d = new Date(t.cle + 'T12:00:00');
      return `<li><b>${romain(c.i)}</b><div>${c.nom}</div><span>${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span></li>`;
    }).join('');
  }

  $('refaire').addEventListener('click', () => {
    tirages = tirages.filter((t) => t.cle !== jour.cle); store.set('oracle-tirages', tirages);
    $('revelation').hidden = true; $('revelation').classList.remove('revele');
    montrer('question'); descendre('question'); journal();
  });

  /* ---------- Démarrage ---------- */
  const t = duJour();
  if (t) { allumer(true); reveler(t.carte, false); }
  else journal();
})();
