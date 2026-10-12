/* AWE Ritual — ciel du jour partagé (V3 à V6)
   Astronomie simplifiée (même modèle que V2), arcanes, aléa déterministe par date,
   stockage local et petit son de bol chantant (Web Audio, lancé seulement après un geste). */
(function () {
  'use strict';
  const rad = (d) => d * Math.PI / 180, norm = (a) => ((a % 360) + 360) % 360;
  const J2000 = Date.UTC(2000, 0, 1, 12), jours = (d) => (d.getTime() - J2000) / 864e5;
  function lonSoleil(d) { const n = jours(d), L = 280.46 + .9856474 * n, g = rad(357.528 + .9856003 * n); return norm(L + 1.915 * Math.sin(g) + .02 * Math.sin(2 * g)); }
  function lonLune(d) { const n = jours(d), L = 218.316 + 13.176396 * n, M = rad(134.963 + 13.064993 * n), D = rad(297.85 + 12.190749 * n); return norm(L + 6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + .658 * Math.sin(2 * D) + .214 * Math.sin(2 * M)); }

  const SIGNES = ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'];
  const ELEMENTS = ['Feu', 'Terre', 'Air', 'Eau'];
  const ARCANES = ['Le Mat', 'Le Bateleur', 'La Papesse', "L'Impératrice", "L'Empereur", 'Le Pape', "L'Amoureux", 'Le Chariot', 'La Justice', "L'Hermite", 'La Roue de Fortune', 'La Force', 'Le Pendu', "L'Arcane sans nom", 'Tempérance', 'Le Diable', 'La Maison Dieu', "L'Étoile", 'La Lune', 'Le Soleil', 'Le Jugement', 'Le Monde'];
  const CHAKRAS = [
    { nom: 'Muladhara', fr: 'racine', de: 'de la racine', c: '#d2423a', bija: 'LAM', lieu: 'base de la colonne' },
    { nom: 'Svadhisthana', fr: 'sacré', de: 'du sacré', c: '#ec7a2c', bija: 'VAM', lieu: 'bas-ventre' },
    { nom: 'Manipura', fr: 'plexus solaire', de: 'du plexus solaire', c: '#e9b62c', bija: 'RAM', lieu: 'creux de l’estomac' },
    { nom: 'Anahata', fr: 'cœur', de: 'du cœur', c: '#4fa66a', bija: 'YAM', lieu: 'centre de la poitrine' },
    { nom: 'Vishuddha', fr: 'gorge', de: 'de la gorge', c: '#3c9ad1', bija: 'HAM', lieu: 'gorge' },
    { nom: 'Ajna', fr: 'troisième œil', de: 'du troisième œil', c: '#5a5bc4', bija: 'OM', lieu: 'entre les sourcils' },
    { nom: 'Sahasrara', fr: 'couronne', de: 'de la couronne', c: '#a35ac2', bija: 'silence', lieu: 'sommet du crâne' }
  ];

  const cle = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  function hash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function romain(n) { if (!n) return '0'; let s = ''; for (const [v, r] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= v) { s += r; n -= v; } return s; }

  const maintenant = new Date(), aujourdhui = cle(maintenant);
  const ll = lonLune(maintenant), fraction = norm(ll - lonSoleil(maintenant)) / 360;
  const phase = fraction < .03 || fraction > .97 ? 'nouvelle' : fraction < .47 ? 'croissante' : fraction < .53 ? 'pleine' : 'décroissante';
  const graine = hash('awe' + aujourdhui), signe = Math.floor(ll / 30);
  const jour = {
    date: maintenant, cle: aujourdhui, graine, fraction, phase,
    signe: SIGNES[signe], element: ELEMENTS[signe % 4],
    arcane: graine % 22, chakra: (graine >>> 7) % 7,
    dateLongue: maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  };

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* Bol chantant : partiels inharmoniques qui décroissent lentement. iOS exige un geste avant le premier son. */
  let audio = null;
  const son = {
    actif: store.get('awe-son', true),
    basculer() { this.actif = !this.actif; store.set('awe-son', this.actif); return this.actif; },
    reveiller() {
      if (!this.actif) return null;
      try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { audio = null; }
      return audio;
    },
    bol(freq = 196, duree = 5, volume = .22) {
      const a = this.reveiller(); if (!a) return;
      const t = a.currentTime, sortie = a.createGain(); sortie.gain.value = volume; sortie.connect(a.destination);
      [[1, 1], [2.71, .45], [5.15, .2], [8.4, .08]].forEach(([k, g], i) => {
        const o = a.createOscillator(), e = a.createGain();
        o.type = 'sine'; o.frequency.value = freq * k; o.detune.value = (i % 2 ? 3 : -3);
        e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(g, t + .02); e.gain.exponentialRampToValueAtTime(.0001, t + duree / (1 + i * .6));
        o.connect(e); e.connect(sortie); o.start(t); o.stop(t + duree);
      });
    },
    clic(freq = 1400, volume = .08) {
      const a = this.reveiller(); if (!a) return;
      const t = a.currentTime, o = a.createOscillator(), e = a.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * .5, t + .06);
      e.gain.setValueAtTime(volume, t); e.gain.exponentialRampToValueAtTime(.0001, t + .09);
      o.connect(e); e.connect(a.destination); o.start(t); o.stop(t + .1);
    }
  };

  window.CIEL = { jour, SIGNES, ARCANES, CHAKRAS, cle, hash, rng, romain, store, son,
    reduit: matchMedia('(prefers-reduced-motion: reduce)').matches };
})();
