/* V7 · Tutoriel guidé — affiché au tout premier lancement (clé locale « awe-tuto-vu »),
   relançable depuis le pied de page. Projecteur sur les vrais éléments de l'écran + bulle d'explication.
   Ne modifie aucune donnée du rituel. */
(function () {
  'use strict';
  const CLE = 'awe-tuto-vu';
  const $ = (id) => document.getElementById(id);
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // cible : sélecteur de l'élément à éclairer (null = carte centrée) ; onglet : vue à afficher avant
  const ETAPES = [
    { cible: null, sur: 'Bienvenue', titre: 'Ton rituel en cinq minutes', texte: "Chaque jour, AWE Ritual te propose un petit rituel en cinq étapes. À la fin, ton aura du jour se révèle. Voici comment tout fonctionne, en une minute." },
    { cible: '.aura-vive', sur: 'Ton aura', titre: 'Elle vit avec toi', texte: "Ce halo, c'est ton aura du jour. Il prend les couleurs de tes réponses au fil des étapes : rose pour le Feu, bleu pour l'Eau, jaune pour l'Air, vert pour la Terre." },
    { cible: '.progression', sur: 'Ta progression', titre: 'Cinq étapes, dans l\'ordre', texte: "Chaque segment s'allume quand une étape est faite. Elles se débloquent l'une après l'autre : pas besoin de réfléchir, suis le fil." },
    { cible: '.etape[data-e="ciel"] .etape-tete', sur: 'Étape 1 · Ciel', titre: 'Ce que dit le ciel', texte: "La phase et le signe de la Lune du jour, calculés pour de vrai. Ajoute ta date de naissance pour obtenir ton nombre du jour et une aura personnalisée." },
    { cible: '.etape[data-e="ressenti"] .etape-tete', sur: 'Étape 2 · Ressenti', titre: 'Sept cartes, sept réponses', texte: "Glisse une carte à droite si elle te ressemble aujourd'hui, à gauche sinon. Ou utilise les boutons « C'est moi » et « Pas moi ». Il n'y a pas de mauvaise réponse." },
    { cible: '.etape[data-e="souffle"] .etape-tete', sur: 'Étape 3 · Souffle', titre: 'Une minute pour respirer', texte: "Suis la bulle : cinq secondes pour inspirer, cinq pour expirer. Six respirations, c'est tout. Le son du bol t'accompagne si tu le laisses activé." },
    { cible: '.etape[data-e="arcane"] .etape-tete', sur: 'Étape 4 · Arcane', titre: 'Une carte pour ta journée', texte: "Touche la carte pour la retourner. Elle t'apporte un message et un petit geste concret à faire dans la journée." },
    { cible: '.etape[data-e="intention"] .etape-tete', sur: 'Étape 5 · Intention', titre: 'Une ligne pour toi', texte: "Termine par une phrase : « Aujourd'hui, je choisis de… ». Ton aura se révèle alors, avec ton affirmation du jour, prête à être partagée." },
    { cible: '.quotidien .bloc-tete', sur: 'Chaque jour', titre: 'La Lune au quotidien', texte: "Les repères de la tradition populaire pour le jardin, les cheveux et la maison, selon la Lune du jour. Un clin d'œil, pas une règle." },
    { cible: '#oAura', sur: 'Onglet', titre: 'Mon aura', texte: "Ton aura en détail, tes 7 derniers jours et ta lunaison. À la nouvelle lune, pose une intention de cycle ; à la pleine lune, fais ton bilan." },
    { cible: '#oJournal', sur: 'Onglet', titre: 'Journal', texte: "Toutes tes intentions et tes auras passées, jour après jour. Tout reste sur ton iPhone." },
    { cible: '#son', sur: 'Réglage', titre: 'Le son du bol', texte: "Active ou coupe le son quand tu veux." },
    { cible: null, sur: 'C\'est parti', titre: 'Reviens chaque jour', texte: "Un nouveau ciel t'attend chaque matin, et ton aura change avec toi. Commence ton premier rituel maintenant.", fin: 'Commencer mon rituel' }
  ];

  let i = 0, voile, trou, bulle, actif = false, cibleCourante = null;

  function construire() {
    voile = document.createElement('div');
    voile.className = 'tuto';
    voile.setAttribute('role', 'dialog');
    voile.setAttribute('aria-modal', 'true');
    voile.setAttribute('aria-labelledby', 'tutoTitre');
    voile.innerHTML = `<div class="tuto-trou" aria-hidden="true"></div>
      <div class="tuto-bulle">
        <div class="tuto-haut"><span class="mono muted" id="tutoSur"></span><button type="button" class="lien" id="tutoPasser">Passer</button></div>
        <b id="tutoTitre"></b>
        <p id="tutoTexte"></p>
        <div class="tuto-bas">
          <div class="tuto-points" id="tutoPoints" aria-hidden="true">${ETAPES.map(() => '<i></i>').join('')}</div>
          <div class="tuto-nav">
            <button type="button" id="tutoPrec" aria-label="Étape précédente">‹</button>
            <button type="button" class="principal" id="tutoSuiv">Suivant</button>
          </div>
        </div>
        <span class="tuto-compte mono muted" id="tutoCompte" aria-live="polite"></span>
      </div>`;
    document.body.appendChild(voile);
    trou = voile.querySelector('.tuto-trou');
    bulle = voile.querySelector('.tuto-bulle');
    $('tutoPasser').addEventListener('click', fermer);
    $('tutoSuiv').addEventListener('click', () => (i < ETAPES.length - 1 ? aller(i + 1) : fermer()));
    $('tutoPrec').addEventListener('click', () => i > 0 && aller(i - 1));
    // Glisser horizontalement sur la bulle pour naviguer
    let x0 = null;
    bulle.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    bulle.addEventListener('touchend', (e) => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (dx < -50 && i < ETAPES.length - 1) aller(i + 1); else if (dx > 50 && i > 0) aller(i - 1);
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      if (!actif) return;
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight' && i < ETAPES.length - 1) aller(i + 1);
      if (e.key === 'ArrowLeft' && i > 0) aller(i - 1);
    });
    addEventListener('resize', () => actif && placer());
    addEventListener('scroll', () => actif && placer(), { passive: true });
  }

  function placer() {
    const e = ETAPES[i], el = e.cible && document.querySelector(e.cible);
    const vw = innerWidth, vh = innerHeight, marge = 12;
    if (!el) {
      voile.classList.add('centre');
      trou.style.cssText = `left:${vw / 2}px;top:${vh / 2}px;width:0;height:0`;
      bulle.style.top = ''; bulle.style.bottom = '';
      return;
    }
    voile.classList.remove('centre');
    const r = el.getBoundingClientRect(), pad = 8;
    trou.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
    // Bulle sous la cible si elle est dans la moitié haute, sinon au-dessus
    const hb = bulle.offsetHeight;
    if (r.top + r.height / 2 < vh / 2) {
      bulle.style.bottom = ''; bulle.style.top = Math.min(r.bottom + pad + marge, vh - hb - marge) + 'px';
    } else {
      bulle.style.top = ''; bulle.style.bottom = Math.min(vh - r.top + pad + marge, vh - hb - marge) + 'px';
    }
  }

  function aller(n) {
    i = n; const e = ETAPES[i];
    if (cibleCourante) cibleCourante.classList.remove('tuto-cible');
    $('tutoSur').textContent = e.sur;
    $('tutoTitre').textContent = e.titre;
    $('tutoTexte').textContent = e.texte;
    $('tutoCompte').textContent = `${i + 1} / ${ETAPES.length}`;
    $('tutoSuiv').textContent = e.fin || (i === 0 ? 'Découvrir' : 'Suivant');
    $('tutoPrec').hidden = i === 0;
    $('tutoPasser').hidden = i === ETAPES.length - 1;
    voile.querySelectorAll('.tuto-points i').forEach((p, k) => p.classList.toggle('on', k <= i));
    bulle.classList.remove('entre'); void bulle.offsetWidth; bulle.classList.add('entre');

    const el = e.cible && document.querySelector(e.cible);
    cibleCourante = el || null;
    if (el) {
      el.classList.add('tuto-cible');
      if (!el.closest('.onglets')) { // la barre d'onglets est fixe : pas de défilement
        const r = el.getBoundingClientRect();
        // Laisser la place à la bulle : la cible vers le tiers haut de l'écran
        const vise = scrollY + r.top - innerHeight * 0.22;
        scrollTo({ top: Math.max(0, vise), behavior: reduit ? 'auto' : 'smooth' });
      }
    }
    placer();
    setTimeout(placer, reduit ? 0 : 380);
    $('tutoSuiv').focus({ preventScroll: true });
  }

  function ouvrir() {
    if (actif) return;
    if (!voile) construire();
    // Toujours partir de l'onglet Aujourd'hui
    const o = $('oAujourdhui'); if (o && o.getAttribute('aria-selected') !== 'true') o.click();
    actif = true; voile.hidden = false;
    document.documentElement.classList.add('tuto-ouvert');
    requestAnimationFrame(() => voile.classList.add('visible'));
    aller(0);
  }

  function fermer() {
    if (!actif) return;
    actif = false;
    try { localStorage.setItem(CLE, '1'); } catch (e) {}
    if (cibleCourante) cibleCourante.classList.remove('tuto-cible');
    voile.classList.remove('visible');
    document.documentElement.classList.remove('tuto-ouvert');
    setTimeout(() => { voile.hidden = true; }, reduit ? 0 : 220);
    scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' });
  }

  // Lancement : attendre que la page soit déverrouillée (compte admin confirmé)
  function quandPret(fn) {
    const h = document.documentElement;
    if (!h.classList.contains('verrou')) return setTimeout(fn, 450);
    const mo = new MutationObserver(() => { if (!h.classList.contains('verrou')) { mo.disconnect(); setTimeout(fn, 450); } });
    mo.observe(h, { attributes: true, attributeFilter: ['class'] });
  }

  let vu = false; try { vu = localStorage.getItem(CLE) === '1'; } catch (e) {}
  if (!vu) quandPret(ouvrir);

  const lienRevoir = $('revoirTuto');
  if (lienRevoir) lienRevoir.addEventListener('click', ouvrir);

  window.AWE_TUTO = { ouvrir };
})();
