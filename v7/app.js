/* V7 · Rituel Aura — cinq étapes (ciel → ressenti → souffle → arcane → intention) colorent l'aura du jour.
   En plus : nombre du jour (numérologie), « Lune au quotidien », intention et bilan de lunaison, garde-fous.
   Astronomie : astronomy-engine (MIT) si chargé, sinon modèle simplifié de V2 (hors ligne au 1er lancement).
   Données locales : « aura7 » = { naissance, jours: { 'AAAA-MM-JJ': {...} }, cycles: { 'AAAA-MM-JJ (nouvelle lune)': { intention, bilan } } }. */
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
  const ETAPES = ['ciel', 'ressenti', 'souffle', 'arcane', 'intention'];
  const NB = ETAPES.length;

  /* Affirmation du jour : élément dominant × moment de la lunaison (16 phrases). */
  const AFFIRMATIONS = {
    Feu: { nouvelle: "J'ose lancer ce qui m'appelle, même tout petit.", croissante: 'Chaque pas que je fais nourrit mon élan.', pleine: "Je rayonne sans m'excuser d'exister.", 'décroissante': 'Je garde mon feu pour ce qui compte vraiment.' },
    Eau: { nouvelle: "J'écoute ce qui naît en moi, sans le juger.", croissante: 'Je laisse mes émotions me guider avec douceur.', pleine: "J'accueille pleinement tout ce que je ressens.", 'décroissante': 'Je laisse partir ce qui ne me nourrit plus.' },
    Air: { nouvelle: "J'ouvre mon esprit à une idée neuve.", croissante: 'Mes mots construisent ce que je veux voir grandir.', pleine: 'Je vois clair et je le dis avec justesse.', 'décroissante': 'Je fais de la place dans mes pensées.' },
    Terre: { nouvelle: 'Je plante une graine simple et concrète.', croissante: 'Je construis pas à pas, à mon rythme.', pleine: "Je savoure ce que j'ai déjà construit.", 'décroissante': "Je range, je trie, je m'allège." }
  };
  const affirmation = (dom) => AFFIRMATIONS[dom][CIEL_AUJ.groupe];

  /* Numérologie (tradition pythagoricienne) : chemin de vie, année, jour personnel. */
  const NOMBRES = {
    1: ['le commencement', 'Lance une chose nouvelle, même minuscule.'],
    2: ['la coopération', 'Écoute avant de décider, avance à deux.'],
    3: ["l'expression", 'Dis, écris, crée : laisse sortir ce qui est en toi.'],
    4: ['la construction', 'Avance sur une tâche concrète, une seule.'],
    5: ['le mouvement', 'Change une habitude, sors de ta routine.'],
    6: ['le soin', 'Prends soin de quelqu\'un, et de toi.'],
    7: ["l'introspection", 'Garde un moment de silence pour toi.'],
    8: ["l'action", 'Prends la décision que tu repousses.'],
    9: ["l'achèvement", 'Termine, trie, remercie ce qui s\'achève.'],
    11: ["l'inspiration", "Fais confiance à ce que tu pressens."],
    22: ['la grande construction', 'Vois grand, mais pose une pierre aujourd\'hui.'],
    33: ['le don de soi', 'Donne sans t\'oublier.']
  };
  const chiffres = (n) => String(n).split('').reduce((a, c) => a + (+c || 0), 0);
  function reduire(n, maitres) { while (n > 9 && !(maitres && [11, 22, 33].includes(n))) n = chiffres(n); return n; }

  /* La Lune au quotidien (tradition française) : type de jour au jardin selon le signe, cheveux et maison selon la phase. */
  const JARDIN = { Feu: ['fruit', 'tomates, courgettes, haricots, arbres fruitiers'], Terre: ['racine', 'carottes, radis, ail, oignons, bulbes'], Air: ['fleur', 'fleurs, bouquets, artichauts, brocolis'], Eau: ['feuille', 'salades, épinards, aromatiques ; arrosage et tonte'] };
  const CHEVEUX = { nouvelle: 'Pause : soin du cuir chevelu plutôt que coupe.', croissante: "Coupe pour qu'ils repoussent plus vite et plus forts.", pleine: "Masque ou soin nourrissant : la tradition dit qu'il agit mieux.", 'décroissante': 'Coupe pour garder ta coupe plus longtemps ; épilation plus durable.' };
  const MAISON = { nouvelle: 'Pose tes projets, prépare la liste.', croissante: 'Commence, plante, lance un chantier.', pleine: 'Partage un repas, invite, célèbre.', 'décroissante': 'Range, trie, désherbe, fais le grand ménage.' };

  /* Garde-fou : mots qui laissent paraître une détresse → message de soutien (3114), jamais de blocage. */
  const DETRESSE = /suicid|me tuer|m'?en finir|en finir avec|envie de mourir|veux mourir|plus envie de vivre|plus la force|dispara[iî]tre|me faire du mal|scarif|automutil|me couper|me pendre/i;
  function verifierDetresse(t) { if (DETRESSE.test(t || '')) { $('soutien').hidden = false; $('soutien').scrollIntoView({ behavior: 'auto', block: 'center' }); } }

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
  if (!donnees.cycles) donnees.cycles = {};
  Object.values(donnees.jours).forEach((j) => {
    if (j.etapes && j.etapes.geste) { j.etapes[j.geste === 'arcane' ? 'arcane' : 'souffle'] = true; delete j.etapes.geste; }
  });
  const jourAuj = donnees.jours[AUJ] || (donnees.jours[AUJ] = { etapes: {}, reponses: [], intention: '' });
  const sauver = () => store.set('aura7', donnees);

  /* ---------- Profil, cartes, scores ---------- */
  function soleilNatal() { if (!donnees.naissance) return null; return signeDe(lonSoleil(new Date(donnees.naissance + 'T12:00:00Z'))); }
  const graine = () => hash(AUJ + (donnees.naissance || ''));
  const arcaneDuJour = () => graine() % 22;
  function numerologie() {
    if (!donnees.naissance) return null;
    const [ay, am, aj] = donnees.naissance.split('-').map(Number);
    const chemin = reduire(chiffres(ay) + chiffres(am) + chiffres(aj), true);
    const annee = reduire(chiffres(aj) + chiffres(am) + chiffres(MAINTENANT.getFullYear()));
    const mois = reduire(annee + chiffres(MAINTENANT.getMonth() + 1));
    const jour = reduire(mois + chiffres(MAINTENANT.getDate()));
    return { chemin, annee, jour };
  }
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
    if (jourAuj.etapes.arcane) sc[ARCANES[arcaneDuJour()][4]] += .5;
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
    Object.assign(jourAuj, { sc, mots: mots(sc), dominant: dominant(sc), phase: CIEL_AUJ.phase, signe: CIEL_AUJ.signe, illum: +CIEL_AUJ.illum.toFixed(3), affirmation: affirmation(dominant(sc)), nombre: (numerologie() || {}).jour || null });
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
  let ouverte = null, etapesDepliees = false;
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
    $('progTexte').textContent = n === NB ? 'Rituel accompli' : `Rituel · ${n}/${NB}`;
    $('revelation').hidden = n < NB;
    if (n === NB) rendreRevelation();
    // Rituel fini : les étapes se replient pour laisser la place à l'aura révélée.
    const replie = n === NB && !etapesDepliees;
    $('etapes').hidden = replie; $('revoirEtapes').hidden = n < NB;
    $('revoirEtapes').textContent = replie ? 'Revoir mes étapes' : 'Replier mes étapes';
    if (cible === 'ressenti') disposerDeck();
    if (cible === 'souffle' || cible === 'arcane') rendreGeste();
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
    if (nbFaites() === NB) setTimeout(() => $('revelation').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'start' }), 120);
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
    const nu = numerologie();
    $('nombreJour').hidden = !nu;
    if (nu) { $('nChiffre').textContent = nu.jour; $('nSens').textContent = NOMBRES[nu.jour][0]; $('nConseil').textContent = NOMBRES[nu.jour][1]; }
    const jd = JARDIN[s.element];
    $('qJour').textContent = `Lune ${s.groupe} en ${s.signe}`;
    $('quotidien').innerHTML = `<div><dt>Jardin</dt><dd>Jour <b>${jd[0]}</b> : ${jd[1]}.</dd></div><div><dt>Cheveux</dt><dd>${CHEVEUX[s.groupe]}</dd></div><div><dt>Maison</dt><dd>${MAISON[s.groupe]}</dd></div>`;
    // Rendez-vous lunaires : l'app change de ton autour de la pleine et de la nouvelle lune.
    const ev = $('evenement');
    const cy = cycleCourant();
    if (s.groupe === 'pleine' && !cy.donnee.bilan) { ev.hidden = false; ev.innerHTML = '<b>Pleine lune</b> · le moment de faire le bilan de ta lunaison. <button type="button" class="lien" data-aller="cycleBilan">Faire mon bilan</button>'; }
    else if (!cy.donnee.intention && cy.jour <= 4) { ev.hidden = false; ev.innerHTML = (s.groupe === 'nouvelle' ? '<b>Nouvelle lune</b>' : `<b>Jour ${cy.jour} du cycle</b>`) + ' · le cycle vient de commencer : pose une intention qui tiendra un mois. <button type="button" class="lien" data-aller="cycleIntention">Poser mon intention de cycle</button>'; }
    else ev.hidden = true;
  }
  function changerNaissance(v) {
    if (!v || v === donnees.naissance) return;
    donnees.naissance = v; store.set('aura-birth', v);
    // Les cartes dépendent de la date de naissance : on rejoue le ressenti du jour.
    jourAuj.reponses = []; delete jourAuj.etapes.ressenti; delete jourAuj.etapes.arcane;
    cartes = cartesDuJour(); viderDeck();
    instantane(); rendreCiel(); rendreEtapes(); rendreVive();
  }
  $('naissance').addEventListener('change', (e) => changerNaissance(e.target.value));
  $('naissance2').addEventListener('change', (e) => { changerNaissance(e.target.value); rendreAura(); });
  $('okCiel').addEventListener('click', () => valider('ciel'));
  $('revoirEtapes').addEventListener('click', () => { etapesDepliees = !etapesDepliees; ouverte = ''; rendreEtapes(); });

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

  /* ---------- 03 · Souffle et 04 · Arcane ---------- */
  const ROMAINS = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  function rendreGeste() {
    $('bulle').style.setProperty('--souffle', `var(${ENCRE[dominant(scores())]})`);
    initRythme(); majBrume();
    if (jourAuj.etapes.souffle && !souffleEnCours) { $('bulleTexte').textContent = 'Fait'; $('souffleBtn').textContent = 'Refaire une minute'; }
    const arc = ARCANES[arcaneDuJour()], vu = !!jourAuj.etapes.arcane;
    $('aNum').textContent = ROMAINS[arcaneDuJour()];
    $('aNom').textContent = arc[0]; $('aMot').textContent = arc[1]; $('aMessage').textContent = arc[2]; $('aGeste').textContent = arc[3];
    $('sArcane').textContent = vu ? `${arc[0]} · ${arc[1]}` : 'Une carte pour éclairer ta journée';
    $('carteTarot').classList.toggle('retournee', vu); $('arcaneTexte').hidden = !vu; $('arcaneAide').hidden = vu;
    $('suiteArcane').hidden = !(vu && !jourAuj.etapes.intention);
  }

  function majBrume() { document.documentElement.style.setProperty('--dominante', `var(${ENCRE[dominant(scores())]})`); }
  /* Rythmes : durées d'inspiration et d'expiration (s). Toujours 6 cycles = 1 min, sans rétention. */
  const RYTHMES = {
    apaiser: [4, 6, 'Inspire 4 s, expire 6 s : l\'expiration plus longue aide à se calmer.'],
    equilibre: [5, 5, 'Inspire 5 s, expire 5 s : un souffle régulier et stable.'],
    energiser: [6, 4, 'Inspire 6 s, expire 4 s : l\'inspiration plus longue réveille en douceur.']
  };
  const RYTHME_ELEMENT = { Feu: 'apaiser', Air: 'apaiser', Eau: 'energiser', Terre: 'equilibre' };
  let rythme = null, rythmeManuel = false;
  function choisirRythme(r, manuel) {
    rythme = r; rythmeManuel = !!manuel;
    document.querySelectorAll('#rythmes button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.r === r)));
    $('rythmeTexte').textContent = RYTHMES[r][2] + (manuel ? '' : ' Suggéré selon ton élément du jour.');
  }
  document.querySelectorAll('#rythmes button').forEach((x) => x.addEventListener('click', () => { if (!souffleEnCours) choisirRythme(x.dataset.r, true); }));
  function initRythme() {
    if (souffleEnCours || rythmeManuel) return;
    choisirRythme(RYTHME_ELEMENT[dominant(scores())], false);
  }

  let souffleEnCours = null;
  $('souffleBtn').addEventListener('click', () => {
    if (souffleEnCours) { arreterSouffle(false); return; }
    son.reveiller();
    let cycle = 0; const total = 6, b = $('bulle'), txt = $('bulleTexte');
    const [dIn, dOut] = RYTHMES[rythme || 'equilibre'];
    document.querySelectorAll('#rythmes button').forEach((x) => { x.disabled = true; });
    $('souffleBtn').textContent = 'Arrêter';
    son.bol(196, 4, .16);
    const pas = () => {
      if (cycle >= total * 2) { arreterSouffle(true); return; }
      const inspire = cycle % 2 === 0;
      b.classList.toggle('inspire', inspire);
      txt.textContent = (inspire ? 'Inspire' : 'Expire') + ` · ${Math.floor(cycle / 2) + 1}/${total}`;
      if (inspire) { try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} }
      b.style.transitionDuration = (inspire ? dIn : dOut) + 's';
      cycle++; souffleEnCours = setTimeout(pas, (inspire ? dIn : dOut) * 1000);
    };
    pas();
  });
  function arreterSouffle(fini) {
    clearTimeout(souffleEnCours); souffleEnCours = null;
    $('bulle').classList.remove('inspire');
    document.querySelectorAll('#rythmes button').forEach((x) => { x.disabled = false; });
    $('bulleTexte').textContent = fini ? 'Merci' : 'Prêt·e ?';
    $('souffleBtn').textContent = fini ? 'Refaire une minute' : 'Commencer · 1 min';
    if (fini) valider('souffle');
  }
  $('carteTarot').addEventListener('click', () => {
    if ($('carteTarot').classList.contains('retournee')) return;
    $('carteTarot').classList.add('retournee'); son.bol(220, 5, .18);
    setTimeout(() => { $('arcaneTexte').hidden = false; $('arcaneAide').hidden = true; valider('arcane', true); }, reduit ? 0 : 650);
  });
  $('suiteArcane').addEventListener('click', () => {
    ouverte = null; rendreEtapes();
    const li = document.querySelector('.etape[data-e="intention"]'); if (li) li.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'nearest' });
  });

  /* ---------- 05 · Intention ---------- */
  $('intention').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('okIntention').click(); } });
  $('okIntention').addEventListener('click', () => {
    const t = $('intention').value.trim();
    if (!t) { $('intention').placeholder = affirmation(dominant(scores())).replace(/\.$/, '') + '…'; $('intention').focus(); return; }
    jourAuj.intention = t; sauver(); $('intention').blur();
    verifierDetresse(t);
    if (jourAuj.etapes.intention) { ouverte = ''; rendreEtapes(); rendreRevelation(); } else valider('intention');
  });

  /* ---------- Aura vivante & révélation ---------- */
  function rendreVive() { dessinerAura($('auraVive'), scores(), graine(), false); }
  function rendreRevelation() {
    const sc = scores(), dom = dominant(sc);
    dessinerAura($('auraFinale'), sc, graine());
    $('rDate').textContent = MAINTENANT.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    $('rMots').innerHTML = mots(sc).map(echapper).join('<br>');
    const nu = numerologie();
    $('rMantra').textContent = `« ${affirmation(dom)} »`;
    $('rNombre').hidden = !nu; if (nu) $('rNombre').textContent = `Jour personnel ${nu.jour} · ${NOMBRES[nu.jour][0]}`;
    $('rIntention').textContent = jourAuj.intention ? 'Mon intention · ' + jourAuj.intention : '';
    $('rIntention').hidden = !jourAuj.intention;
  }
  $('versAura').addEventListener('click', () => onglet('vAura'));
  $('soutienFermer').addEventListener('click', () => { $('soutien').hidden = true; });

  /* Partage : image 1080×1920 au format story (aura + mots + affirmation) via la feuille de partage iOS, sinon texte copié. */
  $('partager').addEventListener('click', async () => {
    const sc = scores(), dom = dominant(sc), m = mots(sc);
    const af = affirmation(dom), texte = `AWE Ritual · ${MAINTENANT.toLocaleDateString('fr-FR')}\nAujourd'hui je suis : ${m.join(', ')}.\n${af}`;
    try {
      const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920;
      const ctx = cv.getContext('2d'), aura = document.createElement('canvas'); aura.width = aura.height = 900;
      dessinerAura(aura, sc, graine());
      ctx.fillStyle = css('--paper'); ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = css('--ink'); ctx.font = '700 30px "Space Mono", monospace';
      ctx.fillText('AWE RITUAL', 90, 250); ctx.textAlign = 'right'; ctx.fillText(MAINTENANT.toLocaleDateString('fr-FR'), 990, 250);
      ctx.drawImage(aura, 90, 300); ctx.strokeStyle = css('--ink'); ctx.lineWidth = 3; ctx.strokeRect(90, 300, 900, 900);
      ctx.textAlign = 'left'; ctx.font = 'italic 84px "Instrument Serif", Georgia, serif'; ctx.fillText(m.join(' · '), 90, 1340, 900);
      ctx.font = 'italic 50px "Instrument Serif", Georgia, serif'; ctx.fillStyle = css('--muted');
      const lignes = [], motsAf = af.split(' '); let l = '';
      motsAf.forEach((w) => { const t = l ? l + ' ' + w : w; if (ctx.measureText(t).width > 900) { lignes.push(l); l = w; } else l = t; }); lignes.push(l);
      lignes.forEach((t, i) => ctx.fillText(t, 90, 1440 + i * 64));
      ctx.font = 'italic 40px "Instrument Serif", Georgia, serif'; ctx.fillText('Ton ciel, ton souffle, ton jour', 90, 1690);
      ctx.font = '700 26px "Space Mono", monospace'; ctx.fillText(`LUNE ${CIEL_AUJ.phase.toUpperCase()} EN ${CIEL_AUJ.signe.toUpperCase()}`, 90, 1760);
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
    $('aEtat').textContent = nbFaites() === NB ? 'Révélée' : `En cours · ${nbFaites()}/${NB}`;
    $('aMots').innerHTML = mots(sc).map(echapper).join('<br>');
    $('aMantra').textContent = `« ${affirmation(dom)} »`;
    $('mix').innerHTML = ELS.map((e) => `<div class="barre"><span>${e}</span><div class="piste"><div class="rempli" style="background:var(${ENCRE[e]});transform:scaleX(${(sc[e] / tot).toFixed(3)})"></div></div><span>${Math.round(sc[e] / tot * 100)} %</span></div>`).join('');
    $('fEl').textContent = dom; $('fYoga').textContent = POUR[dom].yoga;
    $('fLune').textContent = `${CIEL_AUJ.phase} en ${CIEL_AUJ.signe}`;
    $('fSoleil').textContent = sol ? sol[0] : 'À renseigner';
    const nu = numerologie();
    $('fChemin').textContent = nu ? `${nu.chemin} · ${NOMBRES[nu.chemin][0]}` : 'À renseigner';
    $('fAnnee').textContent = nu ? `${nu.annee} · ${NOMBRES[nu.annee][0]}` : 'À renseigner';

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
    rendreCycle();
  }

  /* ---------- Rituel de cycle : intention à la nouvelle lune, bilan à la pleine lune ---------- */
  function cycleCourant() {
    const lu = lunaisonDe(MAINTENANT), k = cle(lu.debut);
    const donnee = donnees.cycles[k] || (donnees.cycles[k] = { intention: '', bilan: '' });
    const jour = Math.round((deCle(AUJ) - deCle(k)) / 864e5) + 1;
    return { lu, k, donnee, jour, apresPleine: AUJ >= cle(lu.pleine) };
  }
  function statsCycle(lu) {
    const comptes = { Feu: 0, Eau: 0, Air: 0, Terre: 0 }; let n = 0;
    for (let d = deCle(cle(lu.debut)); cle(d) <= AUJ; d.setDate(d.getDate() + 1)) {
      const j = donnees.jours[cle(d)];
      if (j && j.dominant && Object.keys(j.etapes || {}).length) { n++; comptes[j.dominant]++; }
    }
    const top = n ? [...ELS].sort((a, b) => comptes[b] - comptes[a])[0] : null;
    return { n, top };
  }
  function rendreCycle() {
    const c = cycleCourant(), st = statsCycle(c.lu);
    $('cycleTexte').hidden = !c.donnee.intention; $('cycleTexte').textContent = c.donnee.intention ? `« ${c.donnee.intention} »` : '';
    $('cycleForm').hidden = !!c.donnee.intention;
    $('cycleBilan').hidden = !c.apresPleine;
    $('bilanAttente').hidden = c.apresPleine;
    $('bilanAttente').textContent = `Bilan de pleine lune le ${c.lu.pleine.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.`;
    $('bilanStats').textContent = st.n ? `${st.n} jour${st.n > 1 ? 's' : ''} de rituel depuis la nouvelle lune. Élément qui revient le plus : ${st.top} (${AFFIRMATIONS[st.top].pleine.replace(/\.$/, '').toLowerCase()}).` : 'Pas encore de rituel sur ce cycle : le bilan se nourrit de tes jours.';
    $('bilanTexte').hidden = !c.donnee.bilan; $('bilanTexte').textContent = c.donnee.bilan;
    $('bilanForm').hidden = !!c.donnee.bilan;
  }
  $('cycleOk').addEventListener('click', () => {
    const t = $('cycleChamp').value.trim(); if (!t) { $('cycleChamp').focus(); return; }
    const c = cycleCourant(); c.donnee.intention = t; sauver(); son.bol(174.6, 5, .18); rendreCycle(); rendreCiel(); verifierDetresse(t);
  });
  $('bilanOk').addEventListener('click', () => {
    const t = $('bilanChamp').value.trim(); if (!t) { $('bilanChamp').focus(); return; }
    const c = cycleCourant(); c.donnee.bilan = t; sauver(); son.bol(261.6, 6, .2); rendreCycle(); rendreCiel(); verifierDetresse(t);
  });
  // Bandeau de rendez-vous lunaire → bloc correspondant dans « Mon aura »
  $('evenement').addEventListener('click', (e) => {
    const b = e.target.closest('[data-aller]'); if (!b) return;
    onglet('vAura');
    const cible = $(b.dataset.aller); setTimeout(() => { cible.scrollIntoView({ behavior: reduit ? 'auto' : 'smooth', block: 'center' }); const ch = cible.querySelector('textarea'); if (ch) ch.focus({ preventScroll: true }); }, 60);
  });

  /* ---------- Journal ---------- */
  function rendreJournal() {
    const cles = Object.keys(donnees.jours).filter((k) => { const j = donnees.jours[k]; return j.sc && Object.keys(j.etapes || {}).length; }).sort().reverse();
    $('journalVide').hidden = cles.length > 0;
    $('journal').innerHTML = cles.map((k, i) => {
      const j = donnees.jours[k], d = deCle(k);
      return `<li class="entree"><canvas width="112" height="112" data-i="${i}" aria-hidden="true"></canvas><div class="infos">
        <span class="mono muted">${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · ${echapper(j.phase || '')}${j.signe ? ' en ' + echapper(j.signe) : ''}</span>
        <span class="mots-courts">${(j.mots || []).map(echapper).join(' · ')}</span>
        ${j.intention ? `<p>${echapper(j.intention)}</p>` : `<p class="muted">${Object.keys(j.etapes).length}/${NB} étapes · pas d'intention posée</p>`}
      </div></li>`;
    }).join('');
    const cyc = Object.keys(donnees.cycles).filter((k) => donnees.cycles[k].intention || donnees.cycles[k].bilan).sort().reverse();
    $('journalCycles').innerHTML = cyc.map((k) => { const c = donnees.cycles[k];
      return `<div class="cycle"><span class="mono muted">Cycle du ${deCle(k).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>${c.intention ? `<p class="cycle-texte">« ${echapper(c.intention)} »</p>` : ''}${c.bilan ? `<p>${echapper(c.bilan)}</p>` : ''}</div>`; }).join('');
    if (cyc.length) $('journalVide').hidden = true;
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
  rendreCiel(); rendreEtapes(); rendreVive(); majBrume();
  let depart = 'vAujourdhui'; try { depart = sessionStorage.getItem('aura7-onglet') || depart; } catch (e) {}
  if (depart !== 'vAujourdhui') onglet(depart);
})();
