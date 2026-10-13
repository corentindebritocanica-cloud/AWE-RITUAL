# AWE Ritual · Ton ciel, ton souffle, ton jour

PWA française de rituel quotidien (spiritualité & bien-être : ciel du jour, Lune, arcane, chakra, souffle, intention). Pensée exclusivement pour iPhone, installée sur l'écran d'accueil.

- **Nom** : AWE (Aura · Wisdom · Energy), app « AWE Ritual », accroche « Ton ciel, ton souffle, ton jour » (remplace « Who am I? » le 13/10/2026 : l'app est devenue un rituel du jour plutôt qu'une quête d'identité).
- **Statut** : phase prototype. Accès réservé à l'admin.
- **URL** : https://corentindebritocanica-cloud.github.io/AWE-RITUAL/

## Structure

| Chemin | Rôle |
| --- | --- |
| `index.html`, `style.css`, `app.js` | Accueil : connexion e-mail / mot de passe, puis accès au rituel (V7) |
| `commun.js` | Noyau commun : init Firebase, garde admin, service worker, vérification de version |
| `v7/` | **Aura, le rituel** (seule version active) : rituel du jour en 5 étapes (ciel + nombre du jour → ressenti → souffle → arcane → intention) qui colore une aura vivante et donne une affirmation du jour ; « La Lune au quotidien » (jardin, cheveux, maison) ; onglets Aujourd'hui / Mon aura (frise 7 jours, lunaison, intention de cycle et bilan de pleine lune, numérologie) / Journal ; garde-fous (avertissement respiration, message de soutien 3114 si l'écrit laisse paraître une détresse). Astronomie via astronomy-engine (MIT, CDN jsDelivr), repli sur le modèle simplifié hors ligne |
| `ciel.js` | Outils partagés hérités des prototypes (aléa par date, stockage local, son du bol en Web Audio) ; V7 n'en utilise que le stockage, l'aléa et le son |
| `sw.js` | Service worker unique, portée racine (accueil + V7 = une seule app installée) |
| `manifest.json`, `icones/` | Manifeste PWA et icônes (dont `apple-touch-icon.png` 180×180) |
| `firestore.rules` | Règles Firestore versionnées, **jamais déployées automatiquement** |
| `.github/workflows/auto-version.yml` | Met à jour `DERNIERE_MAJ`, les URLs `?v=` et `CACHE_NAME` à chaque push |
| `.claude/skills/` | Skills design/animation d'Emil Kowalski (licence MIT) |
| `A_FAIRE.md` | Liste de travail avant et après le lancement public (juridique, sécurité, mesure, produit, vitrine) |
| `PROBLEMES_RESOLUS.md` | Historique des problèmes de dev et de leurs solutions |

HTML + CSS + JS pur, sans framework ni build.

## Authentification

- Firebase Authentication, fournisseur **e-mail / mot de passe**, SDK compat 10.12.2 (gstatic).
- Persistance `LOCAL` : un appareil connecté une fois le reste (pas d'expiration côté app).
- Sur iPhone, chaque icône installée a son propre stockage : il faut se connecter une fois par icône installée, pas une fois par page. Accueil et V7 partagent la même session (même origine, même app installée).
- **Rôles** : claim personnalisé `admin: true` posé sur le compte via l'API Admin (Identity Toolkit). Pas de compte utilisateur classique pour l'instant (prévu plus tard : claim absent = utilisateur).
- Un compte sans claim admin est déconnecté avec le message « Accès réservé à l'admin pour l'instant ».
- Pas d'inscription dans l'app : les comptes se créent dans la console Firebase.
- La garde des pages prototypes (`AWE.garder`) est un confort d'interface : le dépôt est public, la vraie protection des données est `firestore.rules`.

## Données

- **V7** stocke tout dans `localStorage` : `aura7` = date de naissance, un instantané par jour (étapes, réponses, intention, scores, affirmation, nombre du jour) et un objet par lunaison (`cycles` : intention, bilan) ; `aura-birth` et `awe-son` sont partagés. Aucune collection Firestore utilisée.
- **Archives** : les prototypes V1 à V6 (Constellation, Aura fanzine, Mandala, Oracle, Chakras, Mala) ont été retirés de `main` le 13/10/2026 et restent consultables sur la branche [`archive/prototypes-v1-v6`](https://github.com/corentindebritocanica-cloud/AWE-RITUAL/tree/archive/prototypes-v1-v6).
- **Firestore** : base `(default)`, région `eur3`. Règles publiées actuellement : tout refusé. Règles du dépôt : lecture / écriture réservées au claim admin. À publier via la console après test dans le simulateur.

## PWA / iOS

Règles appliquées (référence : [GUIDE_PWA_IOS.md de PORTAIL-DUO](https://github.com/corentindebritocanica-cloud/PORTAIL-DUO/blob/main/GUIDE_PWA_IOS.md)) :

- `viewport-fit=cover` + `env(safe-area-inset-*)` sur chaque page.
- `apple-mobile-web-app-capable` **et** `mobile-web-app-capable`, `apple-touch-icon` 180×180.
- Fond de `<html>` = fond du bas de page (zone hors page sous la barre d'accueil en standalone). V1 (écran fixe en canvas) synchronise ce fond en JS avec la couleur du bas du ciel.
- Champs en 16 px minimum (pas de zoom iOS), pas de `user-scalable=no`, hover limité à `(hover:hover) and (pointer:fine)`, retour tactile sur `:active`.
- Son : Web Audio (bol chantant synthétisé, aucun fichier audio), lancé seulement après un geste (exigence iOS) ; bouton son par page, réglage partagé `awe-son`. Le bouton silencieux de l'iPhone peut couper le son.
- Service worker : réseau d'abord pour le code (repli cache après 4 s), cache d'abord pour icônes, polices et SDK Firebase.
- Vérification de version au retour au premier plan (`visibilitychange` → relit `DERNIERE_MAJ` sur le serveur → recharge, ou bandeau si saisie en cours).

**Installer** : Safari → `···` → Partager → « Sur l'écran d'accueil », laisser « Ouvrir en tant qu'app Web » activé.

**Après une mise à jour** : fermer complètement l'app (multitâche) puis la rouvrir.

## Déploiement

- GitHub Pages depuis `main`, racine du dépôt.
- Domaine `corentindebritocanica-cloud.github.io` ajouté aux domaines autorisés Firebase Auth.
- Ne jamais modifier `DERNIERE_MAJ`, `?v=` ni `CACHE_NAME` à la main : le workflow `auto-version.yml` s'en charge.
- Commits sémantiques : `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `chore:`.
- Aucune donnée sensible dans le dépôt (e-mails, mots de passe, clé de compte de service, jetons). La configuration web Firebase de `commun.js` est publique par conception.

## Feuille de route

- Direction retenue : **V7 Aura, le rituel** (fusion de V2 avec le souffle de V3 et l'arcane de V4, enrichie selon l'audit de marché du 11/10/2026). Prochaines étapes : rappel quotidien (notification ou e-mail), offre premium (abonnement annuel lisible, parcours de 21 à 29 jours), puis migrer les données locales vers Firestore (`users/{uid}/...`).
- Accès utilisateur classique en plus de l'admin.
- Admin : à définir (contenus du jour, statistiques…).
- Plus tard : prise de rendez-vous avec des praticiens (yoga, tissus aériens).
