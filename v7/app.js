/* V7 · Rituel Aura — quatre étapes (ciel → ressenti → geste → intention) colorent l'aura du jour.
   Astronomie : astronomy-engine (MIT) si chargé, sinon modèle simplifié de V2 (hors ligne au 1er lancement).
   Données locales : « aura7 » = { naissance, jours: { 'AAAA-MM-JJ': {...} } }. */
(function () {
  'use strict';
  const { hash, rng, store, son, reduit } = window.CIEL;
  const $ = (id) => document.getElementById(id);
  const TAU = Math.PI * 2, rad = (d) => d * Math.PI / 180, norm = (a) => ((a % 360) + 360) % 360;
  const A = window.Astronomy || null;

  /* ---------- Données ---------- */
  const SIGNES = [['Bélier', 'Feu'], ['Taureau', 'Terre'], ['Gémeaux', 'Air'], ['Cancer', 'Eau'], ['Lion', 'Feu'], ['Vierge', 'Terre'], ['Balance', 'Air'], ['Scorpion', 'Eau'], ['Sagittaire', 'Feu'], ['Capricorne', 'Terre'], ['Verseau', 'Air'], ['Poissons', 'Eau']];
  const ELS = ['Feu', 'Eau', 'Air', 'Terre'];
  const ENCRE = { Feu: '--pink', Eau: '--blue', Air: '--yellow', Terre: '--green' };
  const POOL = {
    Feu: [["J'ai envie de commencer quelque chose aujourd'hui.", 'élan'], ['Je suis prêt·e à dire ce que je pense.', 'franchise'], ['Mon corps réclame du mouvement.', 'vitalité'], ["J'ai besoin qu'on me remarque un peu.", 'rayonnement'], ['Une petite colère me traverse, et c\'est ok.', 'intensité']],
    Eau: [["J'ai besoin de silence.", 'intériorité'], ['Mes émotions sont à fleur de peau.', 'sensibilité'], ["Je pense à quelqu'un qui me manque.", 'lien'], ['Mes rêves de cette nuit me reviennent.', 'intuition'], ["J'ai envie de prendre soin de quelqu'un.", 'tendresse']],
    Air: [["Mon esprit saute d'une idée à l'autre.", 'curiosité'], ["J'ai envie de parler à quelqu'un de nouveau.", 'ouverture'], ["J'ai besoin de sortir prendre l'air.", 'légèreté'], ['Je vois la situation sous un autre angle.', 'recul'], ["J'ai envie d'apprendre un truc aujourd'hui.", 'éveil']],
    Terre: [["J'ai besoin de ranger mon espace.", 'ancrage'], ['Je veux du concret, pas des promesses.', 'lucidité'], ['Mon corps demande du repos.', 'repos'], ["J'ai envie de cuisiner quelque chose de bon.", 'gourmandise'], ['Je me sens stable aujourd\'hui.', 'stabilité']]
  };
  const POUR = {
    Feu: { mantra: "J'ose prendre ma place.", yoga: 'Guerrier II', pourquoi: 'Ça brûle doucement' },
    Eau: { mantra: "J'accueille ce que je ressens.", yoga: "Posture de l'enfant", pourquoi: 'Ça coule en dedans' },
    Air: { mantra: 'Je laisse circuler.', yoga: 'Respiration alternée', pourquoi: 'Ça circule' },
    Terre: { mantra: 'Je suis ici, maintenant.', yoga: 'Tadasana, la montagne', pourquoi: "Ça s'enracine" }
  };
  const CHAKRA = [['racine', 'Terre'], ['sacré', 'Eau'], ['plexus solaire', 'Feu'], ['cœur', 'Air'], ['gorge', 'Air'], ['troisième œil', 'Eau'], ['couronne', 'Feu']];
  const ARCANES = [
    ['Le Mat', 'Élan', "Tu n'as pas besoin de tout savoir pour faire le premier pas.", 'Marche dix minutes sans destination.', 'Air'],
    ['Le Bateleur', 'Commencement', "Tout ce qu'il te faut est déjà sur ta table. Commence avec ce que tu as.", 'Range ton espace avant de commencer quoi que ce soit.', 'Feu'],
    ['La Papesse', 'Intuition', 'La réponse est déjà écrite en toi. Fais assez de silence pour la lire.', 'Cinq minutes de silence, les yeux fermés.', 'Eau'],
    ["L'Impératrice", 'Création', 'Ce qui pousse en toi demande de la douceur, pas du contrôle.', 'Touche une plante, un tissu, une matière vivante.', 'Terre'],
    ["L'Empereur", 'Structure', "Une limite claire est un acte d'amour, envers toi comme envers les autres.", 'Écris trois priorités, pas une de plus.', 'Feu'],
    ['Le Pape', 'Transmission', "Quelqu'un a déjà traversé ce que tu traverses. Écoute.", "Envoie un mot de gratitude à quelqu'un qui t'a guidé·e.", 'Terre'],
    ["L'Amoureux", 'Choix', "Choisir, c'est aussi renoncer. Laisse ton cœur trancher.", 'Pose la main sur ton cœur avant de décider.', 'Air'],
    ['Le Chariot', 'Direction', 'Tes forces contraires peuvent avancer ensemble si tu tiens les rênes.', "Tiens-toi droit·e, regard à l'horizon, trois respirations.", 'Eau'],
    ['La Justice', 'Équilibre', "Sois juste avec toi-même avant de l'être avec les autres.", 'Respiration carrée : quatre temps, quatre fois.', 'Air'],
    ["L'Hermite", 'Recul', "Ta lanterne éclaire un pas à la fois. C'est suffisant.", 'Une heure sans téléphone.', 'Terre'],
    ['La Roue de Fortune', 'Cycle', 'Rien ne reste en haut, rien ne reste en bas. Tout tourne.', 'Fais tourner lentement tes épaules, dix fois.', 'Feu'],
    ['La Force', 'Douceur', 'La vraie force ne serre pas : elle apprivoise.', 'Desserre la mâchoire, ouvre les mains.', 'Feu'],
    ['Le Pendu', 'Lâcher-prise', "Regarder autrement, c'est déjà avancer.", 'Jambes au mur, cinq minutes.', 'Eau'],
    ["L'Arcane sans nom", 'Transformation', 'Ce qui finit laisse la place. Coupe ce qui est sec, la sève reviendra.', "Donne ou jette un objet dont tu n'as plus besoin.", 'Eau'],
    ['Tempérance', 'Harmonie', 'Mélange les contraires lentement. Le juste dosage se trouve en goûtant.', "Bois un verre d'eau en pleine conscience.", 'Air'],
    ['Le Diable', 'Attachement', 'Regarde tes chaînes : certaines sont posées, pas fermées.', 'Une journée sans ton petit réflexe automatique.', 'Terre'],
    ['La Maison Dieu', 'Libération', "Ce qui s'effondre n'était pas fait pour tenir. Par la brèche, la lumière entre.", 'Secoue tout ton corps pendant une minute.', 'Feu'],
    ["L'Étoile", 'Espoir', 'Tu es guidé·e, même quand tu ne le vois pas. Donne sans compter.', 'Ce soir, regarde le ciel une minute.', 'Air'],
    ['La Lune', 'Rêve', 'Le brouillard fait partie du chemin. Ton instinct voit plus loin que tes yeux.', 'Note ton rêve dès le réveil.', 'Eau'],
    ['Le Soleil', 'Joie', 'Laisse-toi être vu·e. Ta joie éclaire plus que tu ne crois.', 'Dix minutes à la lumière du jour.', 'Feu'],
    ['Le Jugement', 'Renaissance', 'Un appel monte en toi. Réponds-y sans te justifier.', 'Chante ou fredonne une chanson à voix haute.', 'Feu'],
    ['Le Monde', 'Accomplissement', 'Un cercle se ferme. Célèbre le chemin avant le suivant.', 'Danse une chanson entière, seul·e.', 'Terre']
  ];
  const PHASES8 = ['Nouvelle lune', 'Premier croissant', 'Premier quartier', 'Gibbeuse croissante', 'Pleine lune', 'Gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'];
  const GROUPE = ['nouvelle', 'croissante', 'croissante', 'croissante', 'pleine', 'décroissante', 'décroissante', 'décroissante'];
  const PHRASE_PHASE = {
    nouvelle: 'Lune nouvelle : le temps de poser une graine, pas de récolter.',
    croissante: "Lune croissante : ce que tu arroses aujourd'hui prend racine.",
    pleine: 'Pleine Lune : tout est visible, accueille ce qui est là.',
    'décroissante': "Lune décroissante : le moment d'alléger, de trier, de pardonner."
  };
  const PHRASE_EL = {
    Feu: "La Lune en {s} attise l'élan : ose une chose franche.",
    Terre: 'La Lune en {s} demande du concret : un petit pas tangible suffit.',
    Air: 'La Lune en {s} fait circuler les idées : parle, écris, échange.',
    Eau: "La Lune en {s} rend sensible : écoute ce que tu ressens avant d'agir."
  };
  const ETAPES = ['ciel', 'ressenti', 'geste', 'intention'];

  /* ---------- Astronomie ---------- */
  const J2000 = Date.UTC(2000, 0, 1, 12), jours = (d) => (d.getTime() - J2000) / 864e5;
  function lonSoleilApprox(d) { const n = jours(d), L = 280.46 + .9856474 * n, g = rad(357.528 + .9856003 * n); return norm(L + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)); }
  function lonLuneApprox(d) { const n = jours(d), L = 218.316 + 13.176396 * n, M = rad(134.963 + 13.064993 * n), D = rad(297.85 + 12.190749 * n); return norm(L + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + .658 * Math.sin(2 * D) + .214 * Math.sin(2 * M)); }
  function lonSoleil(d) { try { if (A) return A.SunPosition(d).elon; } catch (e) {} return lonSoleilApprox(d); }
  function lonLune(d) { try { if (A) return A.EclipticGeoMoon(d).lon; } catch (e) {} return lonLuneApprox(d); }
  function angleLune(d) { try { if (A) return A.MoonPhase(d); } catch (e) {} return norm(lonLuneApprox(d) - lonSoleilApprox(d)); }
  const signeDe = (lon) => SIGNES[Math.floor(norm(lon) / 30)];
  function cielDu(d) {
    const ang = angleLune(d), i8 = Math.floor(norm(ang + 22.5) / 45) % 8, sg = signeDe(lonLune(d));
    return { angle: ang, illum: (1 - Math.cos(rad(ang))) / 2, phase: PHASES8[i8], groupe: GROUPE[i8], signe: sg[0], element: sg[1] };
  }
  /* Lunaison en cours : de la dernière nouvelle lune à la prochaine, avec la pleine lune. */
  function lunaisonDe(d) {
    const MOIS = 29.530589 * 864e5;
    try {
      if (A) {
        let t = A.SearchMoonPhase(0, new Date(d.getTime() - 31 * 864e5), 40).date;
        for (let k = 0; k < 3; k++) {
          const n = A.SearchMoonPhase(0, new Date(t.getTime() + 864e5), 40).date;
          if (n > d) return { debut: t, fin: n, pleine: A.SearchMoonPhase(180, t, 40).date };
          t = n;
        }
      }
    } catch (e) {}
    const debut = new Date(d.getTime() - angleLune(d) / 360 * MOIS);
    return { debut, fin: new Date(debut.getTime() + MOIS), pleine: new Date(debut.getTime() + MOIS / 2) };
  }

  /* ---------- Utilitaires ---------- */
  const cle = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const deCle = (k) => { const [y, m, j] = k.split('-').map(Number); return new Date(y, m - 1, j, 12); };
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MAINTENANT = new Date(), AUJ = cle(MAINTENANT);
  const CIEL_AUJ = cielDu(MAINTENANT);

  /* ---------- Stockage ---------- */
  const donnees = store.get('aura7', null) || { naissance: store.get('aura-birth', ''), jours: {} };
  if (!donnees.jours) donnees.jours = {};
  const jourAuj = donnees.jours[AUJ] || (donnees.jours[AUJ] = { etapes: {}, reponses: [], intention: '' });
  const sauver = () => store.set('aura7', donnees);

  /* ---------- Profil, cartes, scores ---------- */
  function soleilNatal() { if (!donnees.naissance) return null; return signeDe(lonSoleil(new Date(donnees.naissance + 'T12:00:00Z'))); }
  const graine = () => hash(AUJ + (donnees.naissance || ''));
  const arcaneDuJour = () => graine() % 22;
  function cartesDuJour() {
    const s = CIEL_AUJ, sol = soleilNatal(), g = graine(), r = rng(g), ch = CHAKRA[(g >>> 5) % 7], arc = ARCANES[g % 22];
    const lentilles = [[`Lune · ${s.phase.toLowerCase()} en ${s.signe}`, s.element], [`Arcane · ${arc[0]}`, arc[4]], [`Chakra du ${ch[0]}`, ch[1]],
      [sol ? `Ton signe · ${sol[0]}` : 'Ton humeur', sol ? sol[1] : ELS[Math.floor(r() * 4)]], [`Lune en ${s.signe}`, s.element], ['Ton corps, ce matin', ELS[Math.floor(r() * 4)]], ['Ton souffle', ELS[Math.floor(r() * 4)]]];
    const out = [], vus = new Set();
    lentilles.forEach(([lentille, el], i) => { let st; do { st = POOL[el][Math.floor(r() * 5)]; } while (vus.has(st[0]) && vus.size < 20); vus.add(st[0]); out.push({ lentille, el, t: st[0], mot: st[1], i }); });
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  let cartes = cartesDuJour();

  function scores(rep = jourAuj.reponses) {
    const sol = soleilNatal(), sc = { Feu: .6, Eau: .6, Air: .6, Terre: .6 };
    if (sol) sc[sol[1]] += 1;
    sc[CIEL_AUJ.element] += .6;
    rep.forEach((a) => { const c = cartes.find((x) => x.i === a.i); if (c) sc[c.el] += a.moi ? 1.4 : -.35; });
    if (jourAuj.etapes.geste && jourAuj.geste === 'arcane') sc[ARCANES[arcaneDuJour()][4]] += .5;
    ELS.forEach((e) => { sc[e] = Math.max(.15, sc[e]); });
    return sc;
  }
  const dominant = (sc) => [...ELS].sort((a, b) => sc[b] - sc[a])[0];
  function mots(sc = scores()) {
    const kw = jourAuj.reponses.filter((a) => a.moi).map((a) => (cartes.find((c) => c.i === a.i) || {}).mot).filter(Boolean);
    if (kw.length >= 3) return kw.slice(0, 3);
    const ordre = [...ELS].sort((a, b) => sc[b] - sc[a]);
    return [...kw, ...ordre.map((e) => POOL[e][0][1])].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  }
  /* Instantané gardé pour la frise et le journal : les jours passés ne se recalculent pas. */
  function instantane() {
    const sc = scores();
    Object.assign(jourAuj, { sc, mots: mots(sc), dominant: dominant(sc), phase: CIEL_AUJ.phase, signe: CIEL_AUJ.signe, illum: +CIEL_AUJ.illum.toFixed(3) });
    sauver();
  }

  /* ---------- Aura (canvas, encres riso superposées + trame + grain) ---------- */
  function dessinerAura(cv, sc, seed, detail = true) {
    const ctx = cv.getContext('2d'), W = cv.width, H = cv.height, r = rng(seed);
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = css('--card'); ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = css('--blend') || 'multiply';
    const tot = ELS.reduce((a, e) => a + sc[e], 0);
    ELS.forEach((e) => {
      const col = css(ENCRE[e]), part = sc[e] / tot, n = 1 + Math.round(part * 4);
      for (let k = 0; k < n; k++) {
        const x = W * (.2 + r() * .6), y = H * (.22 + r() * .56), rr = W * (.16 + part * .55) * (.7 + r() * .5);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
        g.addColorStop(0, col + 'a8'); g.addColorStop(.5, col + '6e'); g.addColorStop(1, col + '00');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU); ctx.fill();
      }
    });
    if (detail) {
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = css('--card'); const pas = W / 90;
      for (let y = 0; y < H; y += pas) for (let x = (y / pas) % 2 ? pas / 2 : 0; x < W; x += pas) { ctx.globalAlpha = .28; ctx.beginPath(); ctx.arc(x, y, pas * .22, 0, TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
      const img = ctx.getImageData(0, 0, W, H), d = img.data;
      for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 26; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
      ctx.putImageData(img, 0, 0);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------- Lune (SVG) ---------- */
  function dessinerLune(svg, angle) {
    const R = 44, croissante = angle <= 180, a = croissante ? angle : 360 - angle, x = R * Math.cos(rad(a));
    const clair = `M0 ${-R}A${R} ${R} 0 0 1 0 ${R}A${Math.abs(x).toFixed(2)} ${R} 0 0 ${x > 0 ? 0 : 1} 0 ${-R}Z`;
    svg.innerHTML = `<circle class="ombre" r="${R}"/><path class="clair" d="${clair}"${croissante ? '' : ' transform="scale(-1 1)"'}/><circle class="bord" r="${R}"/>`;
  }

  /* ---------- Étapes ---------- */
  let ouverte = null;
  const nbFaites = () => ETAPES.filter((e) => jourAuj.etapes[e]).length;
  const courante = () => ETAPES.find((e) => !jourAuj.etapes[e]) || null;
  function etatDe(e) { if (jourAuj.etapes[e]) return 'fait'; return e === courante() ? 'courant' : 'verrou'; }

  function rendreEtapes() {
    if (ouverte && etatDe(ouverte) === 'verrou') ouverte = null;
    const cible = ouverte === null ? courante() : ouverte;
    document.querySelectorAll('.etape').forEach((li) => {
      const e = li.dataset.e, et = etatDe(e), ouvert = e === cible;
      li.className = 'etape ' + et;
      const tete = li.querySelector('.etape-tete'), corps = li.querySelector('.corps');
      tete.setAttribute('aria-expanded', String(ouvert));
      tete.disabled = et === 'verrou';
      corps.hidden = !ouvert;
      li.querySelector('.etat').textContent = et === 'fait' ? '✓ Fait' : et === 'courant' ? (ouvert ? 'En cours' : 'Ouvrir') : 'Après ' + String(ETAPES.indexOf(e)).padStart(2, '0');
    });
    const n = nbFaites();
    document.querySelectorAll('#segments i').forEach((i, k) => i.classList.toggle('on', k < n));
    $('progTexte').textContent = n === 4 ? 'Rituel accompli' : `Rituel · ${n}/4`;
    $('revelation').hidden = n < 4;
    if (n === 4) rendreRevelation();
    if (cible === 'ressenti') disposerDeck();
    if (cible === 'geste') rendreGeste();
    if (cible === 'intention') $('intention').value = jourAuj.intention || '';
  }
  /* garder = l'étape reste ouverte (ex. l'arcane retourné, pour lire son message avant de continuer). */
  function valider(e, garder) {
    if (jourAuj.etapes[e]) return;
    jourAuj.etapes[e] = true;
    instantane();
    ouverte = garder ? e : null;
    son.bol(e === 'intention' ? 261.6 : 196, e === 'intention' ? 6 : 3.5, e === 'intention' ? .24 : .14);
    rendreEtapes(); rendreVive();
    if (garder) return;
    if (nbFaites() === 4) setTimeout(() => $('revelation').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' }), 120);
    else { const li = document.querySelector(`.etape[data-e="${courante()}"]`); if (li) setTimeout(() => li.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'nearest' }), 80); }
  }
  document.querySelectorAll('.etape-tete').forEach((b) => b.addEventListener('click', () => {
    const e = b.parentElement.dataset.e; if (etatDe(e) === 'verrou') return;
    const cible = ouverte === null ? courante() : ouverte;
    ouverte = cible === e ? '' : e; // '' = tout fermé
    rendreEtapes();
  }));

  /* ---------- 01 · Ciel ---------- */
  function rendreCiel() {
    const s = CIEL_AUJ, sol = soleilNatal();
    $('date').textContent = MAINTENANT.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    $('cielLigne').innerHTML = `Lune <b>${s.phase.toLowerCase()}</b> en <b>${s.signe}</b> · ${Math.round(s.illum * 100)} %` + (sol ? `<br>Soleil natal <b>${sol[0]}</b>` : '');
    dessinerLune($('lune'), s.angle);
    $('luneNom').textContent = `${s.phase} en ${s.signe} · ${Math.round(s.illum * 100)} % éclairée`;
    $('phrase').textContent = PHRASE_PHASE[s.groupe] + ' ' + PHRASE_EL[s.element].replace('{s}', s.signe);
    $('sCiel').textContent = `${s.phase} en ${s.signe}`;
    $('naissanceBloc').hidden = !!donnees.naissance;
    $('okCiel').disabled = !donnees.naissance;
    $('naissance2').value = donnees.naissance || '';
    // Rendez-vous lunaires : l'app change de ton autour de la pleine et de la nouvelle lune.
    const ev = $('evenement');
    if (s.groupe === 'pleine') { ev.hidden = false; ev.innerHTML = '<b>Pleine lune</b> · le moment de faire le bilan de ta lunaison dans « Mon aura ».'; }
    else if (s.groupe === 'nouvelle') { ev.hidden = false; ev.innerHTML = '<b>Nouvelle lune</b> · un nouveau cycle commence : pose une intention qui tiendra un mois.'; }
    else ev.hidden = true;
  }
  function changerNaissance(v) {
    if (!v || v === donnees.naissance) return;
    donnees.naissance = v; store.set('aura-birth', v);
    // Les cartes dépendent de la date de naissance : on rejoue le ressenti du jour.
    jourAuj.reponses = []; delete jourAuj.etapes.ressenti; delete jourAuj.etapes.geste;
    cartes = cartesDuJour(); viderDeck();
    instantane(); rendreCiel(); rendreEtapes(); rendreVive();
  }
  $('naissance').addEventListener('change', (e) => changerNaissance(e.target.value));
  $('naissance2').addEventListener('change', (e) => { changerNaissance(e.target.value); rendreAura(); });
  $('okCiel').addEventListener('click', () => valider('ciel'));

  /* ---------- 02 · Ressenti (deck de V2) ---------- */
  const deck = $('deck'); let noeuds = new Map(), glisse = null;
  function carteEl(c) {
    const el = document.createElement('article'); el.className = 'carte'; el.tabIndex = -1;
    el.innerHTML = `<span class="tache" style="background:var(${ENCRE[c.el]})"></span><div class="lentille mono"><span>${c.lentille}</span><span>${c.el}</span></div><p>${c.t}</p><span class="pourquoi">${POUR[c.el].pourquoi}.</span><span class="tampon oui">C'EST MOI</span><span class="tampon non">PAS MOI</span>`;
    return el;
  }
  const restantes = () => { const faits = new Set(jourAuj.reponses.map((a) => a.i)); return cartes.filter((c) => !faits.has(c.i)); };
  function viderDeck() { noeuds.forEach((n) => n.remove()); noeuds.clear(); }
  function disposerDeck() {
    const rest = restantes();
    [...noeuds.keys()].forEach((i) => { if (!rest.slice(0, 3).some((c) => c.i === i) && !noeuds.get(i).dataset.sortie) { noeuds.get(i).remove(); noeuds.delete(i); } });
    rest.slice(0, 3).forEach((c, p) => {
      let el = noeuds.get(c.i);
      if (!el) { el = carteEl(c); noeuds.set(c.i, el); el.style.transform = `translateY(${(p + 1) * 12}px) scale(${1 - (p + 1) * .04})`; el.style.opacity = '0'; deck.prepend(el); el.offsetWidth; }
      el.style.zIndex = 10 - p; el.style.transform = p ? `translateY(${p * 12}px) scale(${1 - p * .04})` : ''; el.style.opacity = p === 2 ? '.6' : '1'; el.setAttribute('aria-hidden', p ? 'true' : 'false');
    });
    const n = jourAuj.reponses.length;
    $('points').innerHTML = cartes.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
  }
  function repondre(moi) {
    const c = restantes()[0]; if (!c) return;
    const el = noeuds.get(c.i);
    jourAuj.reponses.push({ i: c.i, moi }); sauver();
    if (el) {
      el.dataset.sortie = '1'; const dir = moi ? 1 : -1;
      el.style.transition = reduit ? 'opacity 200ms ease-out' : 'transform 340ms cubic-bezier(.23,1,.32,1),opacity 340ms ease-out';
      if (!reduit) el.style.transform = `translate(${dir * (innerWidth * .9)}px,${(glisse ? glisse.dy : 0) * .4}px) rotate(${dir * 18}deg)`;
      el.style.opacity = '0';
      setTimeout(() => { el.remove(); noeuds.delete(c.i); }, 360);
    }
    try { navigator.vibrate && navigator.vibrate(8); } catch (e) {}
    son.clic(moi ? 1500 : 1100, .05);
    disposerDeck(); rendreVive();
    if (!restantes().length) setTimeout(() => valider('ressenti'), 420);
  }
  deck.addEventListener('pointerdown', (e) => {
    const c = restantes()[0]; if (!c) return; const el = noeuds.get(c.i); if (!el || !el.contains(e.target)) return;
    el.setPointerCapture(e.pointerId); el.style.transition = 'none';
    glisse = { el, id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, vx: 0, lx: e.clientX, lt: performance.now() };
  });
  deck.addEventListener('pointermove', (e) => {
    if (!glisse || e.pointerId !== glisse.id) return;
    const t = performance.now(), dt = Math.max(1, t - glisse.lt);
    glisse.vx = .6 * glisse.vx + .4 * ((e.clientX - glisse.lx) / dt); glisse.lx = e.clientX; glisse.lt = t;
    glisse.dx = e.clientX - glisse.x0; glisse.dy = e.clientY - glisse.y0;
    glisse.el.style.transform = `translate(${glisse.dx}px,${glisse.dy * .35}px) rotate(${glisse.dx * .05}deg)`;
    const k = Math.min(1, Math.abs(glisse.dx) / 110);
    glisse.el.querySelector('.tampon.oui').style.opacity = glisse.dx > 0 ? k : 0;
    glisse.el.querySelector('.tampon.non').style.opacity = glisse.dx < 0 ? k : 0;
  });
  function finGlisse(e) {
    if (!glisse || e.pointerId !== glisse.id) return; const g = glisse;
    const lance = Math.abs(g.vx) > .11 && Math.sign(g.vx) === Math.sign(g.dx), loin = Math.abs(g.dx) > 110;
    if ((lance || loin) && Math.abs(g.dx) > 12) { repondre(g.dx > 0); glisse = null; return; }
    g.el.style.transition = 'transform 420ms cubic-bezier(.32,.72,0,1)'; g.el.style.transform = '';
    g.el.querySelectorAll('.tampon').forEach((s) => { s.style.opacity = 0; }); glisse = null;
  }
  deck.addEventListener('pointerup', finGlisse); deck.addEventListener('pointercancel', finGlisse);
  $('ouiBtn').addEventListener('click', () => repondre(true));
  $('nonBtn').addEventListener('click', () => repondre(false));

  /* ---------- 03 · Geste : souffle ou arcane, choisi par l'élément dominant ---------- */
  const modeGeste = () => jourAuj.geste || (['Eau', 'Air'].includes(dominant(scores())) ? 'souffle' : 'arcane');
  function rendreGeste() {
    const m = modeGeste(), dom = dominant(scores());
    $('souffle').hidden = m !== 'souffle'; $('arcane').hidden = m !== 'arcane';
    $('sGeste').textContent = m === 'souffle' ? 'Une minute de souffle' : "L'arcane du jour";
    $('changerGeste').textContent = m === 'souffle' ? 'Plutôt tirer un arcane' : 'Plutôt une minute de souffle';
    $('changerGeste').hidden = !!jourAuj.etapes.geste;
    $('suiteGeste').hidden = !(jourAuj.etapes.geste && m === 'arcane' && !jourAuj.etapes.intention);
    $('bulle').style.setProperty('--souffle', `var(${ENCRE[dom]})`);
    const arc = ARCANES[arcaneDuJour()];
    $('aNum').textContent = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'][arcaneDuJour()];
    $('aNom').textContent = arc[0]; $('aMot').textContent = arc[1]; $('aMessage').textContent = arc[2]; $('aGeste').textContent = arc[3];
    const vu = jourAuj.etapes.geste && jourAuj.geste === 'arcane';
    $('carteTarot').classList.toggle('retournee', vu); $('arcaneTexte').hidden = !vu; $('arcaneAide').hidden = vu;
    if (jourAuj.etapes.geste && jourAuj.geste === 'souffle') { $('bulleTexte').textContent = 'Fait'; $('souffleBtn').textContent = 'Refaire une minute'; }
  }
  $('changerGeste').addEventListener('click', () => { if (souffleEnCours) return; jourAuj.geste = modeGeste() === 'souffle' ? 'arcane' : 'souffle'; sauver(); rendreGeste(); });

  let souffleEnCours = null;
  $('souffleBtn').addEventListener('click', () => {
    if (souffleEnCours) { arreterSouffle(false); return; }
    jourAuj.geste = 'souffle'; sauver(); son.reveiller();
    $('changerGeste').hidden = true;
    let cycle = 0; const total = 6, b = $('bulle'), txt = $('bulleTexte');
    $('souffleBtn').textContent = 'Arrêter';
    son.bol(196, 4, .16);
    const pas = () => {
      if (cycle >= total * 2) { arreterSouffle(true); return; }
      const inspire = cycle % 2 === 0;
      b.classList.toggle('inspire', inspire);
      txt.textContent = (inspire ? 'Inspire' : 'Expire') + ` · ${Math.floor(cycle / 2) + 1}/${total}`;
      if (inspire) { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }
      cycle++; souffleEnCours = setTimeout(pas, 5000);
    };
    pas();
  });
  function arreterSouffle(fini) {
    clearTimeout(souffleEnCours); souffleEnCours = null;
    $('bulle').classList.remove('inspire');
    $('bulleTexte').textContent = fini ? 'Merci' : 'Prêt·e ?';
    $('souffleBtn').textContent = fini ? 'Refaire une minute' : 'Commencer · 1 min';
    if (fini) valider('geste'); else $('changerGeste').hidden = !!jourAuj.etapes.geste;
  }
  $('carteTarot').addEventListener('click', () => {
    if ($('carteTarot').classList.contains('retournee')) return;
    jourAuj.geste = 'arcane'; sauver();
    $('carteTarot').classList.add('retournee'); son.bol(220, 5, .18);
    setTimeout(() => { $('arcaneTexte').hidden = false; $('arcaneAide').hidden = true; valider('geste', true); }, reduit ? 0 : 650);
  });
  $('suiteGeste').addEventListener('click', () => {
    ouverte = null; rendreEtapes();
    const li = document.querySelector('.etape[data-e="intention"]'); if (li) li.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'nearest' });
  });

  /* ---------- 04 · Intention ---------- */
  $('intention').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('okIntention').click(); } });
  $('okIntention').addEventListener('click', () => {
    const t = $('intention').value.trim();
    if (!t) { $('intention').placeholder = POUR[dominant(scores())].mantra.replace(/\.$/, '') + '…'; $('intention').focus(); return; }
    jourAuj.intention = t; sauver(); $('intention').blur();
    if (jourAuj.etapes.intention) { ouverte = ''; rendreEtapes(); rendreRevelation(); } else valider('intention');
  });

  /* ---------- Aura vivante & révélation ---------- */
  function rendreVive() { dessinerAura($('auraVive'), scores(), graine(), false); }
  function rendreRevelation() {
    const sc = scores(), dom = dominant(sc);
    dessinerAura($('auraFinale'), sc, graine());
    $('rDate').textContent = MAINTENANT.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    $('rMots').innerHTML = mots(sc).map(echapper).join('<br>');
    $('rMantra').textContent = `« ${POUR[dom].mantra} »`;
    $('rIntention').textContent = jourAuj.intention ? 'Mon intention · ' + jourAuj.intention : '';
    $('rIntention').hidden = !jourAuj.intention;
  }
  $('versAura').addEventListener('click', () => onglet('vAura'));

  /* Partage : image 1080×1350 (aura + mots + mantra) via la feuille de partage iOS, sinon texte copié. */
  $('partager').addEventListener('click', async () => {
    const sc = scores(), dom = dominant(sc), m = mots(sc);
    const texte = `Who am I? · ${MAINTENANT.toLocaleDateString('fr-FR')}\nAujourd'hui je suis : ${m.join(', ')}.\n${POUR[dom].mantra}`;
    try {
      const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
      const ctx = cv.getContext('2d'), aura = document.createElement('canvas'); aura.width = aura.height = 900;
      dessinerAura(aura, sc, graine());
      ctx.fillStyle = css('--paper'); ctx.fillRect(0, 0, 1080, 1350);
      ctx.drawImage(aura, 90, 90); ctx.strokeStyle = css('--ink'); ctx.lineWidth = 3; ctx.strokeRect(90, 90, 900, 900);
      ctx.fillStyle = css('--ink'); ctx.font = '700 28px "Space Mono", monospace';
      ctx.fillText('WHO AM I?', 90, 1060); ctx.textAlign = 'right'; ctx.fillText(MAINTENANT.toLocaleDateString('fr-FR'), 990, 1060);
      ctx.textAlign = 'left'; ctx.font = 'italic 76px "Instrument Serif", Georgia, serif'; ctx.fillText(m.join(' · '), 90, 1160, 900);
      ctx.font = 'italic 44px "Instrument Serif", Georgia, serif'; ctx.fillStyle = css('--muted'); ctx.fillText(POUR[dom].mantra, 90, 1240, 900);
      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const fichier = new File([blob], `aura-${AUJ}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [fichier] })) { await navigator.share({ files: [fichier], text: texte }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(texte); $('toast').textContent = 'Copié. Colle-le où tu veux.'; } catch (e) { $('toast').textContent = texte; }
  });

  /* ---------- Mon aura ---------- */
  function rendreAura() {
    const sc = scores(), dom = dominant(sc), tot = ELS.reduce((a, e) => a + sc[e], 0), sol = soleilNatal();
    dessinerAura($('auraJour'), sc, graine());
    $('aDate').textContent = MAINTENANT.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    $('aEtat').textContent = nbFaites() === 4 ? 'Révélée' : `En cours · ${nbFaites()}/4`;
    $('aMots').innerHTML = mots(sc).map(echapper).join('<br>');
    $('aMantra').textContent = `« ${POUR[dom].mantra} »`;
    $('mix').innerHTML = ELS.map((e) => `<div class="barre"><span>${e}</span><div class="piste"><div class="rempli" style="background:var(${ENCRE[e]});transform:scaleX(${(sc[e] / tot).toFixed(3)})"></div></div><span>${Math.round(sc[e] / tot * 100)} %</span></div>`).join('');
    $('fEl').textContent = dom; $('fYoga').textContent = POUR[dom].yoga;
    $('fLune').textContent = `${CIEL_AUJ.phase} en ${CIEL_AUJ.signe}`;
    $('fSoleil').textContent = sol ? sol[0] : 'À renseigner';

    // Frise : les 7 derniers jours réellement vécus (pas de jours simulés).
    const tuiles = []; let compte = 0;
    for (let k = 6; k >= 0; k--) {
      const d = new Date(MAINTENANT); d.setDate(d.getDate() - k); const kk = cle(d), j = donnees.jours[kk];
      const plein = j && j.sc && (k === 0 ? nbFaites() > 0 : Object.keys(j.etapes || {}).length > 0);
      if (plein) compte++;
      tuiles.push({ kk, d, j: plein ? j : null, ajd: k === 0 });
    }
    $('septCompte').textContent = `${compte}/7`;
    $('frise').innerHTML = tuiles.map((t, i) => `<div class="jour-tuile${t.ajd ? ' ajd' : ''}">${t.j ? `<canvas width="120" height="120" data-i="${i}" aria-label="${t.j.mots ? t.j.mots.join(', ') : ''}"></canvas>` : '<span class="vide-rond"></span>'}<span>${t.d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')}</span></div>`).join('');
    tuiles.forEach((t, i) => { if (t.j) dessinerAura($('frise').querySelector(`canvas[data-i="${i}"]`), t.ajd ? sc : t.j.sc, hash(t.kk + (donnees.naissance || '')), false); });

    // Lunaison : un rond par jour, coloré par l'élément dominant des jours vécus.
    const lu = lunaisonDe(MAINTENANT), d0 = deCle(cle(lu.debut)), nbJ = Math.round((deCle(cle(lu.fin)) - d0) / 864e5), kPleine = cle(lu.pleine);
    let html = '', indexAuj = 0;
    for (let k = 0; k < nbJ; k++) {
      const d = new Date(d0); d.setDate(d.getDate() + k); const kk = cle(d), j = donnees.jours[kk];
      const fait = j && j.dominant && Object.keys(j.etapes || {}).length;
      if (kk === AUJ) indexAuj = k + 1;
      const classes = [fait ? 'fait' : '', kk === AUJ ? 'ajd' : '', kk === kPleine ? 'pleine' : '', kk > AUJ ? 'futur' : ''].join(' ').trim();
      html += `<i class="${classes}"${fait ? ` style="background:var(${ENCRE[j.dominant]})"` : ''} title="${d.toLocaleDateString('fr-FR')}"></i>`;
    }
    $('lunaison').innerHTML = html;
    $('lunaisonTexte').textContent = `Jour ${indexAuj}/${nbJ}`;
    const jPleine = Math.round((deCle(kPleine) - deCle(AUJ)) / 864e5), jNouv = Math.round((deCle(cle(lu.fin)) - deCle(AUJ)) / 864e5);
    $('lunaisonAide').textContent = jPleine > 0 ? `Pleine lune dans ${jPleine} j (cercle jaune). Chaque rond coloré est un jour où tu as fait ton rituel.`
      : jPleine === 0 ? "Pleine lune aujourd'hui : regarde quelle couleur revient le plus depuis la nouvelle lune."
      : `Nouvelle lune dans ${jNouv} j. Chaque rond coloré est un jour où tu as fait ton rituel.`;
  }

  /* ---------- Journal ---------- */
  function rendreJournal() {
    const cles = Object.keys(donnees.jours).filter((k) => { const j = donnees.jours[k]; return j.sc && Object.keys(j.etapes || {}).length; }).sort().reverse();
    $('journalVide').hidden = cles.length > 0;
    $('journal').innerHTML = cles.map((k, i) => {
      const j = donnees.jours[k], d = deCle(k);
      return `<li class="entree"><canvas width="112" height="112" data-i="${i}" aria-hidden="true"></canvas><div class="infos">
        <span class="mono muted">${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${echapper(j.phase || '')}${j.signe ? ' en ' + echapper(j.signe) : ''}</span>
        <span class="mots-courts">${(j.mots || []).map(echapper).join(' · ')}</span>
        ${j.intention ? `<p>${echapper(j.intention)}</p>` : `<p class="muted">${Object.keys(j.etapes).length}/4 étapes · pas d'intention posée</p>`}
      </div></li>`;
    }).join('');
    cles.forEach((k, i) => dessinerAura($('journal').querySelector(`canvas[data-i="${i}"]`), donnees.jours[k].sc, hash(k + (donnees.naissance || '')), false));
  }

  /* ---------- Onglets ---------- */
  const VUES = { vAujourdhui: 'oAujourdhui', vAura: 'oAura', vJournal: 'oJournal' };
  function onglet(v) {
    Object.entries(VUES).forEach(([vue, o]) => { $(vue).hidden = vue !== v; $(o).setAttribute('aria-selected', String(vue === v)); });
    if (v === 'vAura') rendreAura();
    if (v === 'vJournal') rendreJournal();
    if (v === 'vAujourdhui') rendreVive();
    scrollTo(0, 0);
    try { sessionStorage.setItem('aura7-onglet', v); } catch (e) {}
  }
  Object.entries(VUES).forEach(([vue, o]) => $(o).addEventListener('click', () => onglet(vue)));

  /* ---------- Son ---------- */
  const bSon = $('son');
  bSon.setAttribute('aria-pressed', String(son.actif));
  bSon.addEventListener('click', () => { bSon.setAttribute('aria-pressed', String(son.basculer())); if (son.actif) son.bol(261.6, 2.5, .12); });

  /* Redessiner les encres si le thème change */
  const redessiner = () => { rendreVive(); if (!$('revelation').hidden) rendreRevelation(); if (!$('vAura').hidden) rendreAura(); if (!$('vJournal').hidden) rendreJournal(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redessiner);

  /* Changement de jour pendant que l'app reste ouverte : on recharge au retour. */
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && cle(new Date()) !== AUJ) location.reload(); });

  if (jourAuj.sc === undefined) instantane();
  rendreCiel(); rendreEtapes(); rendreVive();
  let depart = 'vAujourdhui'; try { depart = sessionStorage.getItem('aura7-onglet') || depart; } catch (e) {}
  if (depart !== 'vAujourdhui') onglet(depart);
})();
