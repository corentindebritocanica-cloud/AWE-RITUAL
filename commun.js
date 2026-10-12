/* AWE Ritual — noyau commun (accueil, V1, V2)
   Rôle : initialiser Firebase (SDK compat chargé avant ce fichier), garder les pages
   réservées à l'admin, enregistrer le service worker et vérifier la version au retour
   au premier plan (une PWA iOS remise devant ne se recharge jamais seule).
   La configuration web Firebase est publique par nature : la sécurité repose sur
   firestore.rules et sur le claim « admin » du compte, jamais sur ce fichier. */
(function () {
  'use strict';

  const CONFIG = {
    apiKey: 'AIzaSyAiNJgVwxk0cEDfQaHb62WYXQvGwWXyF8I',
    authDomain: 'awe-ritual.firebaseapp.com',
    projectId: 'awe-ritual',
    storageBucket: 'awe-ritual.firebasestorage.app',
    messagingSenderId: '1004569301624',
    appId: '1:1004569301624:web:8b2dcd174796335436938d'
  };
  // Mémoire locale du dernier statut admin : permet d'ouvrir l'app hors ligne
  // quand le jeton ne peut pas être rafraîchi.
  const CLE_ADMIN = 'awe-admin';

  if (!firebase.apps.length) firebase.initializeApp(CONFIG);
  const auth = firebase.auth();
  // LOCAL = la session survit à la fermeture de l'app : connexion une seule fois par appareil.
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

  function lireAdminLocal() { try { return localStorage.getItem(CLE_ADMIN) === '1'; } catch (e) { return false; } }
  function ecrireAdminLocal(v) { try { v ? localStorage.setItem(CLE_ADMIN, '1') : localStorage.removeItem(CLE_ADMIN); } catch (e) {} }

  /* Résout le statut du compte connecté : { user, admin } (user = null si déconnecté). */
  function statut() {
    return new Promise((resolve) => {
      const stop = auth.onAuthStateChanged(async (user) => {
        stop();
        if (!user) { ecrireAdminLocal(false); return resolve({ user: null, admin: false }); }
        try {
          const jeton = await user.getIdTokenResult();
          const admin = jeton.claims.admin === true;
          ecrireAdminLocal(admin);
          resolve({ user, admin });
        } catch (e) {
          resolve({ user, admin: lireAdminLocal() });
        }
      });
    });
  }

  /* Pages prototypes : le contenu reste masqué (classe « verrou » sur <html>) tant que
     le compte admin n'est pas confirmé ; sinon retour à l'accueil. */
  async function garder(racine) {
    const s = await statut();
    if (!s.user || !s.admin) { location.replace(racine); return; }
    document.documentElement.classList.remove('verrou');
  }

  /* Service worker unique, portée racine (accueil + prototypes = une seule app installée). */
  function enregistrerSW(racine) {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register(racine + 'sw.js', { scope: racine }).catch(() => {});
  }

  /* Au retour au premier plan : relit la page sur le serveur et recharge si DERNIERE_MAJ a changé.
     Pas de rechargement pendant une saisie : un bandeau est proposé à la place. */
  function verifierVersion() {
    const locale = window.DERNIERE_MAJ;
    if (!locale) return;
    let enCours = false;
    async function controler() {
      if (enCours || document.visibilityState !== 'visible') return;
      enCours = true;
      try {
        const rep = await fetch(location.pathname, { cache: 'no-store' });
        const txt = await rep.text();
        const m = txt.match(/DERNIERE_MAJ = '([^']*)'/);
        if (m && m[1] !== locale) {
          const actif = document.activeElement;
          const saisie = actif && /INPUT|TEXTAREA|SELECT/.test(actif.tagName);
          if (saisie) bandeauMaj(); else location.reload();
        }
        if (navigator.serviceWorker) navigator.serviceWorker.getRegistration().then((r) => r && r.update());
      } catch (e) { /* hors ligne : on réessaiera au prochain retour */ }
      enCours = false;
    }
    document.addEventListener('visibilitychange', controler);
  }
  function bandeauMaj() {
    if (document.getElementById('awe-maj')) return;
    const b = document.createElement('button');
    b.id = 'awe-maj';
    b.type = 'button';
    b.textContent = 'Nouvelle version disponible · Mettre à jour';
    b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 16px);z-index:99;font:600 15px -apple-system,system-ui,sans-serif;padding:12px 18px;border-radius:999px;border:0;background:#f2c46d;color:#1a1430;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    b.addEventListener('click', () => location.reload());
    document.body.appendChild(b);
  }

  window.AWE = { auth, statut, garder, enregistrerSW, verifierVersion };
})();
