  # Mise en production du paiement Stripe — à faire le 29/10/2026

> Copier-coller ce fichier à Claude pour reprendre directement.

## Où on en est (fait le 28/10)

- Le paiement Stripe fonctionne de bout en bout **en mode test, en local** : paiement avec la carte 4242, webhook reçu (200), accès débloqué.
- Le code est sur la branche `feature/stripe-paiement` (poussée sur GitHub), **pas encore fusionnée dans `master`** → le site en ligne n'a pas changé.
- `vercel-build` (dans `package.json`) applique `prisma migrate deploy` sur les déploiements de **production** uniquement → la colonne `User.paidAt` sera créée automatiquement au déploiement.
- En local (disque exFAT) : lancer le site avec `npm run dev:webpack`, pas `npm run dev`.
- En local, le webhook passe par : `stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:3000/api/stripe/webhook`
- Le `.env` local contient les clés **de test** → ne jamais y mettre les clés live.

## À faire demain, dans l'ordre

### 1. Vercel + nom de domaine (avec le dirigeant)
- [ ] Passer le projet Vercel en **Pro**
- [ ] Acheter le nom de domaine et l'ajouter dans Vercel → projet → Settings → **Domains**
- [ ] Sur Vercel (Production) : `NEXTAUTH_URL=https://<domaine>`

### 2. Vrai compte Stripe, en mode live (avec le dirigeant)
- [ ] **Activer le compte** : infos entreprise, représentant légal, IBAN
- [ ] Créer le **produit** + un **prix ponctuel** → noter le `price_...`
- [ ] Récupérer la **clé secrète** `sk_live_...` (Développeurs → Clés API)
- [ ] Créer le **webhook** (Développeurs → Webhooks → Ajouter une destination) :
  - URL : `https://<domaine>/api/stripe/webhook`
  - Événements : `checkout.session.completed` et `checkout.session.async_payment_succeeded`
  - Noter le secret `whsec_...`

### 3. Variables d'environnement sur Vercel (Production)
- [ ] `STRIPE_SECRET_KEY` = `sk_live_...`
- [ ] `STRIPE_PRICE_ID` = `price_...`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...` (celui du webhook live, pas celui de `stripe listen`)

### 4. E-mails (mot de passe oublié)
- [ ] Vérifier le nouveau domaine dans **Resend** (ajouter les enregistrements DNS demandés)
- [ ] Sur Vercel : `EMAIL_FROM=Cahier de vacances <noreply@<domaine>>`

### 5. Décision : utilisateurs déjà inscrits
Après la mise en ligne, tout compte USER sans paiement est renvoyé vers `/paiement`, y compris les anciens.
- [ ] **Option A** : on leur offre l'accès → Claude écrit un script qui remplit `paidAt` pour eux
- [ ] **Option B** : ils doivent payer → rien à faire

### 6. Mise en ligne (avec Claude)
- [ ] Fusionner `feature/stripe-paiement` dans `master` → Vercel déploie
- [ ] Vérifier que le build passe. Si erreur Prisma **P3005** (base créée sans migrations) → la résoudre avec Claude ; le site actuel reste en ligne tant que le build échoue
- [ ] Si option A : lancer le script des anciens utilisateurs
- [ ] Faire un **vrai paiement** avec une vraie carte sur le site en ligne
- [ ] Vérifier dans Stripe → Webhooks que l'événement a bien reçu une réponse **200**
- [ ] Vérifier que le compte a accès aux exercices
- [ ] Se **rembourser** dans Stripe (Paiements → le paiement → Rembourser)
