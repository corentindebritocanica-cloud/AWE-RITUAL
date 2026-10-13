# À faire · AWE Ritual

Liste de travail avant et après le lancement public. On coche au fil de l'eau (`- [x]`).
Sources : audit de marché du 11/10/2026 et checklist « 20 choses à vérifier avant de lancer un site » (revue le 13/10/2026).

---

## 1 · Indispensable avant le lancement public

### Juridique
- [ ] **Politique de confidentialité (RGPD)** : date de naissance, journal intime, intentions, données Firestore. Préciser : quoi, pourquoi, où (hébergement UE), combien de temps, droits (accès, export, suppression).
- [ ] **Mentions légales** (LCEN) : éditeur, directeur de publication, hébergeur.
- [ ] **CGU** : service de bien-être et de divertissement, pas de prédiction, pas d'avis médical, psychologique, juridique ou financier.
- [ ] **CGV** dès qu'il y a un abonnement : prix TTC, durée, renouvellement, droit de rétractation, médiateur de la consommation.
- [ ] **Résiliation en ligne en un clic** (obligatoire depuis 2023, amende jusqu'à 75 000 €).
- [ ] **Suppression du compte et export du journal** depuis l'app.
- [ ] **Consentement explicite** avant toute synchronisation du journal dans Firestore.

### Sécurité
- [x] Aucune clé de compte de service ni jeton dans le code (la config web Firebase est publique par conception).
- [ ] **Publier `firestore.rules`** après test dans le simulateur (lecture et écriture limitées à `users/{uid}` de l'utilisateur connecté).
- [ ] **Firebase App Check** à l'ouverture des inscriptions (anti-abus).
- [ ] Clé d'IA éventuelle derrière un serveur intermédiaire (Cloudflare Worker), jamais dans le front.

### Mesure
- [ ] **Outil d'analytics sans cookies** (Plausible ou Umami) : mesurer le retour à J1, J7, J30 et le taux de rituels terminés.

### Qualité
- [ ] **Contraste** : vérifier les gris clairs (`--muted`) et le jaune de la Lune en clair et en sombre (WCAG AA).
- [x] Avertissement avant la respiration.
- [x] Message de soutien (3114, 15, 112) si l'écrit laisse paraître une détresse.
- [ ] Mention « généré par IA » sur tout texte produit par une IA (AI Act), si une IA est ajoutée.

---

## 2 · Produit (feuille de route)

- [ ] **Migrer les données vers Firestore** (`users/{uid}/jours`, `users/{uid}/cycles`), synchronisation entre appareils.
- [ ] **Accès utilisateur classique** en plus de l'admin (claim absent = utilisateur).
- [ ] **Rappel quotidien** : notification web push (iOS 16.4+, app installée) ou e-mail du matin, une seule par jour, heure choisie.
- [ ] **Offre premium** : gratuit généreux + abonnement lisible (repère de l'audit : 5,99 à 6,99 €/mois ou 39 à 45 €/an), sans abonnement hebdomadaire.
- [ ] Parcours guidés de 21 à 29 jours (premium).
- [ ] Achats ponctuels : compatibilité, « Mon année ».
- [ ] Offre « membre fondateur » à vie au lancement, cartes cadeaux.
- [ ] Licence Swiss Ephemeris Pro (700 CHF) **avant** de monétiser un thème natal complet (ascendant, maisons).

---

## 3 · Page vitrine publique (plus tard)

L'app reste cachée des moteurs de recherche ; ces points concernent la future page d'accueil publique.

- [ ] **`noindex`** sur l'app (`/v7/`), indexation seulement sur la vitrine.
- [ ] Balise **meta title** et **description** par page.
- [ ] **Image de partage réseaux** (Open Graph 1200×630).
- [ ] **Sitemap + robots.txt**.
- [ ] Pages SEO : Lune du jour, pleine et nouvelle lune du mois, arcane du jour.
- [ ] Un seul appel à l'action par page (« Commencer mon rituel »).

---

## 4 · Petits plus

- [ ] **Page 404** personnalisée (`404.html` à la racine, GitHub Pages), utile depuis le retrait de V1 à V6.
- [ ] Validation renforcée des champs (date de naissance plausible, longueur des textes) quand l'inscription ouvrira.
- [ ] Textes alternatifs complets sur les auras et la Lune.
- [ ] Nettoyer `style.css` de l'accueil (styles des anciennes cartes V1 à V6).

## Pas nécessaire pour l'instant

- **Bannière cookies** : inutile tant qu'il n'y a ni publicité ni mesure avec cookies (le stockage local de l'app est exempté).
- **Anti-spam de formulaire** : pas d'inscription publique pour l'instant (voir App Check plus haut).
- **Compression d'images** : très peu d'images dans l'app.
