# timy.studio

Site de timy. : vitrine CGI automobile, formulaire de brief avec pièces jointes, chat privé par projet, paiement Stripe déclenché par toi, page « À propos et musique » avec tes sorties et tes liens.

Stack : Next.js 16 (React 19), Supabase (base de données + stockage des fichiers), Stripe Checkout, hébergement Vercel. Le site est en anglais.

## Comment ça marche

1. Un client remplit `/start` (budget, description, fichiers). Il arrive sur sa page privée `/order/<lien secret>` et reçoit ce lien par email.
2. Tu es prévenu sur Discord (et par email) et tu réponds depuis `/admin`.
3. Quand le prix final est validé dans le chat, tu l'envoies depuis `/admin` (bouton « Send price to client »). **Le bouton de paiement n'apparaît chez le client qu'à ce moment-là.**
4. Le client paie via Stripe. Le webhook passe la commande en « Paid », ajoute un message dans le chat et te notifie. Stripe te verse l'argent sur ton compte bancaire (payouts).

## Mise en route

### 1. En local
```bash
npm install
cp .env.example .env.local   # puis remplis les valeurs (voir ci-dessous)
npm run dev                  # http://localhost:3000
```

### 2. Supabase (gratuit)
1. Crée un projet sur supabase.com.
2. SQL Editor : colle le contenu de `supabase/schema.sql` et exécute. Ça crée les tables et le bucket privé `briefs`.
3. Project settings > API : copie l'URL, la clé `anon` et la clé `service_role` dans `.env.local`. **La clé `service_role` ne doit jamais être publique ni préfixée `NEXT_PUBLIC_`.**
4. Les projets gratuits sont mis en pause après environ une semaine sans activité : prévois le plan Pro quand le site tourne pour de bon.

### 3. Stripe
1. Crée ton compte Stripe, ajoute ton IBAN (Settings > Payouts). Travaille d'abord en mode test.
2. Developers > API keys : copie la clé secrète dans `STRIPE_SECRET_KEY`.
3. Developers > Webhooks > Add endpoint : `https://timy.studio/api/stripe/webhook`, événements `checkout.session.completed` et `checkout.session.async_payment_succeeded`. Copie le « signing secret » (`whsec_...`) dans `STRIPE_WEBHOOK_SECRET`.
4. Settings > Payment methods : active ce que tu veux proposer (cartes, Apple Pay, Google Pay, PayPal si disponible pour ton compte, etc.). Le site utilise automatiquement ce que tu actives.
5. Settings > Business > Invoices : renseigne les mentions légales de tes factures. Le site demande à Stripe de générer une facture à chaque paiement, mais le contenu légal reste à valider avec ton comptable.
6. Test : carte `4242 4242 4242 4242`, date future, CVC au choix. Quand tout marche, remplace les clés par celles du mode live et recrée le webhook en live.

### 4. Vercel + domaine
1. Mets le dossier sur GitHub, puis « Import project » sur vercel.com.
2. Ajoute toutes les variables de `.env.example` dans Settings > Environment Variables (`NEXT_PUBLIC_SITE_URL=https://timy.studio`).
3. Settings > Domains : ajoute `timy.studio` et configure le DNS comme indiqué.

### 5. Notifications (facultatif mais recommandé)
- **Discord** : Paramètres du salon > Intégrations > Webhooks > Nouveau webhook, colle l'URL dans `DISCORD_WEBHOOK_URL`.
- **Email (Resend)** : crée un compte sur resend.com, vérifie le domaine `timy.studio`, puis renseigne `RESEND_API_KEY` et `MAIL_FROM`. Sans ça, les clients ne reçoivent pas leur lien privé ni tes réponses par email (ils doivent garder l'onglet ou le lien).

## Personnaliser

Tout se règle dans `src/lib/config.ts` :
- `works` : colle l'URL de chaque vidéo TikTok. Miniature et titre sont récupérés automatiquement.
- `links` : complète les URL SoundCloud et Spotify (laissées vides, donc masquées).
- `appleArtistIds` : ajoute les identifiants Apple Music de tes autres noms d'artiste (NYTH, ARYX...) pour afficher leurs sorties aussi. L'ID est à la fin de l'URL de la page artiste.
- `services`, `budgets`, `projectTypes`, `heroReel` (vidéo de fond de l'accueil, à mettre dans `public/media/`).
- `src/app/legal/page.tsx` : **remplace tous les champs entre [crochets]** (identité, SIRET, hébergeur, durée de conservation) et fais relire les conditions par un professionnel avant la mise en ligne.

## Utiliser l'admin

`/admin` : mot de passe = `ADMIN_PASSWORD`. Liste des commandes (point rouge = nouveau message), puis page de commande : chat, fichiers du client (liens de téléchargement valables 1 h), envoi du prix, changement de statut. Choisis « Paid » pour enregistrer un paiement reçu hors du site (virement, PayPal).

## Limites actuelles (à savoir)

- Le chat se met à jour toutes les quelques secondes (pas de temps réel instantané) et n'accepte que du texte : pour les livrables, envoie un lien (Drive, WeTransfer...) dans le chat.
- Pas de comptes clients : chaque client a un lien privé secret. Quiconque a le lien voit la conversation.
- Stripe n'est pas un séquestre : le client paie une fois, en entier, à l'avance. Pas d'acompte ni de paiement en deux fois pour l'instant.
- Les vidéos TikTok sont des liens vers TikTok (pas d'intégration du lecteur), ce qui évite les cookies tiers.
- La protection anti-spam est basique (champ piège, délai minimal, limites par email). Ajoute Cloudflare Turnstile si tu reçois du spam.
