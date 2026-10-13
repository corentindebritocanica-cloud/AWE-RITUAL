/* AWE Ritual — accueil : connexion e-mail / mot de passe, puis menu du rituel V7 (admin uniquement pour l'instant). */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const { auth, statut, enregistrerSW, verifierVersion } = window.AWE;

  const MESSAGES = {
    'auth/invalid-email': "Cette adresse e-mail n'est pas valide.",
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
    'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
    'auth/user-disabled': 'Ce compte est désactivé.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie dans quelques minutes.',
    'auth/network-request-failed': 'Pas de réseau. Vérifie ta connexion.'
  };
  function dire(txt, erreur) { const m = $('message'); m.textContent = txt || ''; m.classList.toggle('erreur', !!erreur); }

  function afficher(ecran) {
    $('connexion').hidden = ecran !== 'connexion';
    $('menu').hidden = ecran !== 'menu';
    document.documentElement.classList.remove('chargement');
    if (ecran === 'menu') {
      $('date').textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      const d = new Date(window.DERNIERE_MAJ);
      $('version').textContent = isNaN(d) ? '' : 'Version du ' + d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      setTimeout(() => { if (!$('email').value) $('email').focus({ preventScroll: true }); }, 50);
    }
  }

  async function demarrer() {
    const s = await statut();
    if (s.user && s.admin) return afficher('menu');
    if (s.user && !s.admin) { await auth.signOut(); afficher('connexion'); return dire("Accès réservé à l'admin pour l'instant.", true); }
    afficher('connexion');
  }

  $('formConnexion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('email').value.trim(), mdp = $('mdp').value;
    if (!email || !mdp) return dire('Renseigne ton e-mail et ton mot de passe.', true);
    const btn = $('btnEntrer');
    btn.disabled = true; btn.textContent = 'Connexion…'; dire('');
    try {
      const cred = await auth.signInWithEmailAndPassword(email, mdp);
      const jeton = await cred.user.getIdTokenResult(true);
      if (jeton.claims.admin !== true) {
        await auth.signOut();
        dire("Accès réservé à l'admin pour l'instant.", true);
      } else {
        try { localStorage.setItem('awe-admin', '1'); } catch (err) {}
        $('mdp').value = '';
        afficher('menu');
      }
    } catch (err) {
      dire(MESSAGES[err.code] || 'Connexion impossible. Réessaie.', true);
    }
    btn.disabled = false; btn.textContent = 'Entrer';
  });

  $('voirMdp').addEventListener('click', () => {
    const champ = $('mdp'), visible = champ.type === 'password';
    champ.type = visible ? 'text' : 'password';
    $('voirMdp').textContent = visible ? 'Masquer' : 'Afficher';
    $('voirMdp').setAttribute('aria-pressed', String(visible));
  });

  $('oubli').addEventListener('click', async () => {
    const email = $('email').value.trim();
    if (!email) { dire("Saisis d'abord ton e-mail, puis touche « Mot de passe oublié ? ».", true); return $('email').focus(); }
    try { await auth.sendPasswordResetEmail(email); dire('Si ce compte existe, un e-mail de réinitialisation vient de partir.'); }
    catch (err) { dire(MESSAGES[err.code] || "Envoi impossible. Réessaie.", true); }
  });

  $('deconnexion').addEventListener('click', async () => {
    await auth.signOut();
    try { localStorage.removeItem('awe-admin'); } catch (e) {}
    $('email').value = ''; dire('');
    afficher('connexion');
  });

  // Admin : remet l'app à neuf (données du rituel, tutoriel, réglages, cache hors ligne).
  // La session Firebase est conservée pour ne pas avoir à se reconnecter.
  $('reinit').addEventListener('click', async () => {
    if (!confirm("Réinitialiser l'app ?\n\nTout le rituel (auras, journal, intentions, date de naissance, réglages) sera effacé de cet appareil, et le tutoriel se relancera. Tu restes connecté.")) return;
    const garder = ['awe-admin'];
    try { Object.keys(localStorage).filter((k) => !garder.includes(k) && !k.startsWith('firebase:')).forEach((k) => localStorage.removeItem(k)); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    try { if (window.caches) await Promise.all((await caches.keys()).filter((k) => k.startsWith('awe-ritual-')).map((k) => caches.delete(k))); } catch (e) {}
    try { if (navigator.serviceWorker) await Promise.all((await navigator.serviceWorker.getRegistrations()).map((r) => r.unregister())); } catch (e) {}
    location.replace('./v7/');
  });

  enregistrerSW('./');
  verifierVersion();
  demarrer();
})();
