# Problèmes rencontrés et résolus

Historique des erreurs de développement, à alimenter à chaque problème. Le plus récent en haut.

Modèle d'entrée :

```
## AAAA-MM-JJ · Titre court
- **Symptôme** : ce qu'on voyait.
- **Cause** : la vraie raison.
- **Solution** : ce qui a été changé (fichiers).
- **À retenir** : la règle pour ne pas recommencer.
```

Rappel des pièges déjà connus sur PORTAIL-DUO (détail dans GUIDE_PWA_IOS.md) : cache du service worker non invalidé, `100dvh` faux en standalone, bande en bas des écrans fixes, `env(safe-area-inset-*)` à 0 au lancement à froid.

---

## 2026-10-12 · Tests Playwright : le service worker contourne les bouchons Firebase
- **Symptôme** : en test local, après avoir ouvert l'accueil, V3 renvoyait vers l'accueil (garde admin refusée).
- **Cause** : le service worker enregistré sur l'accueil récupère lui-même le SDK Firebase sur gstatic ; les `route()` Playwright qui remplacent le SDK par un faux compte admin ne s'appliquent plus.
- **Solution** : contexte de test créé avec `service_workers='block'`.
- **À retenir** : bloquer les service workers dès qu'un test remplace des scripts réseau.

## 2026-10-12 · Mise en place du dépôt (pièges évités dès le départ)

- **Bande de couleur sous la barre d'accueil (V1)** : V1 est un écran fixe en canvas (`body{overflow:hidden}`), le cas qui provoque la zone hors page en standalone iOS. Solution : le fond de `<html>` suit en JS la couleur du bas du ciel (`v1/app.js`, boucle `frame`). À vérifier sur iPhone.
- **Zoom iOS sur le champ de date (V2)** : le champ était en 13,6 px. Passé à 16 px (`v2/style.css`, `.born input`).
- **Encoche ignorée sur V2** : le corps n'avait pas de marge de sécurité. Ajout de `env(safe-area-inset-*)` dans le `padding` de `body`.
- **Mises à jour invisibles** : un seul `sw.js` pour toute l'app, `CACHE_NAME` et `?v=` gérés par `auto-version.yml`, vérification de `DERNIERE_MAJ` au retour au premier plan (`commun.js`).
- **Connexion refusée depuis GitHub Pages** : le domaine `corentindebritocanica-cloud.github.io` doit figurer dans les domaines autorisés de Firebase Auth. Ajouté.
- **Tests Playwright locaux bloqués par le proxy** : lancer Chromium avec `--proxy-bypass-list=localhost;127.0.0.1` (l'option `bypass` de Playwright ne suffisait pas).
