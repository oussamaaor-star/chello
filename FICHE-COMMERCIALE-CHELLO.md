# CHELLO — Fiche Commerciale du Site Web

**Boutique :** Chello — Women's Fashion
**Adresse :** Al Araimi Boulevard, 1er étage, Seeb, Muscat, Oman
**URL :** chello-nine.vercel.app
**Technologie :** React 19, Supabase (base de données), Vercel (hébergement)

---

## 1. SITE VITRINE & E-COMMERCE

### Page d'accueil
- Hero éditorial élégant avec typographie serif
- Bandeau défilant avec les avantages (livraison, paiement, qualité)
- Grille de catégories avec images (robes, abayas, sacs, chaussures, parfums)
- Section "Nouveautés" avec les derniers produits
- Section "Lookbook" avec mise en scène parallaxe
- Bannière programme de fidélité
- Section localisation avec lien direct Google Maps
- Section Instagram avec lien vers @chello.om

### Catalogue produits
- Affichage grille responsive (2 colonnes mobile, 4 colonnes desktop)
- Filtrage par catégorie (ملابس جاهزة, عبايات, شنط, أحذية, عطورات)
- Badge "جديد" (nouveau) sur les produits récents
- Prix en Rial Omanais (ر.ع.)

### Page produit
- Galerie d'images avec navigation
- Sélection de taille (S, M, L, XL)
- **Sélection de couleur** (pastilles visuelles avec code couleur)
- **Guide des tailles** interactif (tableau vêtements + tableau chaussures + conseils de mesure)
- Bouton "Ajouter au panier"
- Bouton "Commander via WhatsApp" (lien direct)
- Description complète
- **Onglets : Description, À propos, Avis clients**
- **Section avis clients** : note moyenne, distribution étoiles, formulaire pour laisser un avis (modéré par l'admin)
- Produits similaires en bas de page

### Panier & Commande
- Panier latéral (drawer) avec aperçu rapide
- Modification des quantités et suppression
- Sous-total avec livraison gratuite à partir de 30 OMR
- Formulaire de livraison complet (nom, téléphone, ville, adresse)
- Paiement à la livraison (Cash on Delivery)
- Page de confirmation de commande avec récapitulatif
- Génération de facture PDF téléchargeable

---

## 2. ESPACE CLIENT

### Compte utilisateur
- Inscription / Connexion sécurisée (email + mot de passe)
- Réinitialisation de mot de passe par email
- Profil modifiable (nom, téléphone, avatar)

### Historique commandes
- Liste de toutes les commandes passées
- Détail de chaque commande (produits, montants, statut)
- Suivi de commande en temps réel par numéro de référence

### Carnet d'adresses
- Ajout / modification / suppression d'adresses de livraison
- Adresse par défaut pour les futures commandes

### Alertes stock
- S'abonner à des alertes quand un produit revient en stock
- Notifications automatiques

### Liste de souhaits (Favoris)
- Ajouter/retirer des produits en favori (icône coeur)
- Page dédiée avec tous les favoris sauvegardés

---

## 3. PROGRAMME DE FIDELITE

### Principe
- Système de tampons : **8 visites/achats = 1 récompense**
- Fonctionne aussi bien en **boutique physique** qu'en **ligne**
- Anti-fraude : pas de QR code libre-service, seul le caissier ou le système peut tamponner

### Inscription fidélité
- Page publique d'inscription (/fidelite)
- Champs : nom complet, numéro WhatsApp
- Code unique généré automatiquement
- Carte de fidélité digitale avec les 8 tampons visuels

### Tamponnage automatique
- **En boutique** : le caissier recherche le client par téléphone dans le POS, le tampon est ajouté automatiquement après la vente
- **En ligne** : quand une commande passe au statut "Livrée", le tampon est ajouté automatiquement si le numéro de téléphone correspond à un membre fidélité
- Notification toast en temps réel quand un tampon est ajouté

### Retrouver sa carte
- Page dédiée pour retrouver sa carte par numéro WhatsApp
- Affichage du nombre de tampons et de l'historique

---

## 4. DASHBOARD PROPRIETAIRE (Admin)

**Accès :** /admin (rôle "admin" requis)

### Tableau de bord
- Chiffre d'affaires total
- Nombre de commandes
- Nombre de clients
- Produits en stock faible
- Graphiques et statistiques

### Gestion des commandes
- Liste de toutes les commandes avec recherche et filtres
- Changement de statut : En attente → Confirmée → En livraison → Livrée / Annulée
- Tamponnage fidélité automatique quand une commande est marquée "Livrée"
- Détail complet de chaque commande (produits, montants, client, adresse)

### Gestion des produits
- Ajout / modification / suppression de produits
- Upload d'images
- Gestion des tailles et du stock
- Catégorisation (robes, abayas, sacs, chaussures, parfums)
- Marquage "featured" pour les mettre en avant

### Gestion des promotions
- Création de codes promo
- Définition du pourcentage de réduction
- Dates de validité (début/fin)
- Activation / désactivation

### Gestion des utilisateurs
- Liste de tous les comptes clients
- Détails de chaque utilisateur
- Attribution de rôles (admin, caissier, client)

### Gestion des avis
- Modération des avis clients
- Approbation / rejet
- Réponse aux avis

### Gestion fidélité
- Liste de tous les membres fidélité
- Historique des tampons
- Recherche par nom, WhatsApp ou code

### Alertes stock
- Vue des produits en rupture ou stock faible
- Notifications pour réapprovisionner

---

## 5. DASHBOARD CAISSIER

**Accès :** /caisse (rôle "cashier" requis)

### Tableau de bord caisse
- Ventes du jour (nombre + total en OMR)
- Commandes en attente
- Liste des dernières ventes

### Point de vente (POS)
- Grille de produits avec recherche instantanée
- Ajout au panier avec sélection de taille et quantité
- **Champ téléphone client** avec recherche automatique du membre fidélité
- Aperçu des tampons fidélité du client trouvé
- Validation de la vente → commande créée avec statut "Confirmée" et paiement "Cash"
- **Tampon fidélité ajouté automatiquement** après chaque vente réussie
- Écran de succès avec récapitulatif + statut fidélité

### Commandes
- Vue de toutes les commandes avec recherche et filtres par statut
- Changement de statut des commandes
- Tampon fidélité automatique quand une commande passe en "Livrée"

### Fidélité
- Recherche de membres par code, WhatsApp ou nom
- Tamponnage manuel si nécessaire
- Vue des tampons actuels et historique

### Stock (lecture seule)
- Consultation du stock de tous les produits
- Filtrage : en stock / stock faible / rupture
- Recherche par nom de produit
- Le caissier **ne peut pas modifier** les produits ni le stock

---

## 6. FONCTIONNALITES TECHNIQUES

### Bilingue arabe/anglais
- Interface entièrement traduite (arabe par défaut, anglais en option)
- Support RTL (droite-à-gauche) natif pour l'arabe
- Bouton de bascule EN/AR dans le header

### Design responsive
- Adapté à tous les écrans : mobile, tablette, desktop
- Menu hamburger sur mobile avec navigation complète
- Panier drawer optimisé pour le tactile

### Google Analytics (GA4)
- **Tableau de bord Google Analytics** intégré : nombre de visiteurs, pages les plus vues, provenance du trafic, comportement des clientes
- Tracking automatique de chaque page visitée (compatible navigation SPA)
- **Gratuit** — nécessite un compte Google Analytics (analytics.google.com)
- Le propriétaire peut consulter les statistiques à tout moment depuis son téléphone ou PC

### Performance & SEO
- 46 pages pré-rendues pour le référencement Google
- Chargement paresseux des images et des pages (lazy loading)
- Score Lighthouse optimisé
- Méta-données SEO sur chaque page

### Sécurité
- Authentification sécurisée via Supabase Auth
- Contrôle d'accès par rôle (admin, cashier, client)
- Les dashboards admin et caissier sont protégés
- Redirection automatique après connexion selon le rôle

### Intégrations
- **WhatsApp** : bouton flottant + liens directs pour commander
- **Instagram** : lien vers @chello.om
- **Google Maps** : lien vers la localisation du magasin

---

## 7. PAGES SUPPLEMENTAIRES

| Page | Description |
|------|-------------|
| Blog | Articles mode (tendances Oman, conseils style, guide sacs/chaussures) |
| FAQ | Questions fréquentes avec accordéons |
| Contact | Formulaire + WhatsApp + localisation |
| À propos | Histoire et mission de Chello |
| Mentions légales | Informations légales obligatoires |
| CGV | Conditions générales de vente |
| Politique de confidentialité | Protection des données |
| Livraison & Retours | Politique de livraison et retours |

---

## 8. THEME & IDENTITE VISUELLE

- **Couleur dominante :** Crème / Beige (#faf8f4)
- **Couleur secondaire :** Noir profond (#18140f)
- **Couleur accent :** Silver / Argenté (#9e9e9e)
- **Typographie titre :** Playfair Display + Amiri (serif)
- **Typographie corps :** Montserrat + Cairo (sans-serif)
- **Style :** Éditorial luxe, minimaliste, aéré

---

## 9. PAIEMENT EN LIGNE (Option à activer)

### Statut actuel
Le site fonctionne actuellement en **paiement à la livraison (Cash on Delivery)** uniquement.
Le paiement par carte bancaire est **prêt à être intégré** dès que le propriétaire ouvre un compte marchand.

### Ce que ça permettra
- Paiement par **carte bancaire** (Visa / Mastercard)
- Paiement via **Apple Pay**
- Paiement via **OmanNet** (cartes de débit locales omanaises)
- La commande est marquée **"Payée"** automatiquement dans le dashboard
- Moins de commandes annulées qu'avec le Cash on Delivery

### Plateformes recommandées

| Plateforme | Frais par vente | OmanNet | Licence CBO |
|------------|----------------|---------|-------------|
| **Paymob** (le moins cher) | 2.5% carte / 1.5% OmanNet | Oui | Oui |
| **Thawani** (le plus connu en Oman) | ~2.5-3% (sur devis) | Oui | Oui |
| **Tap Payments** | ~2.75% | Oui (direct) | Oui |

> **Exemple :** Sur une vente de 10 OMR, la commission est d'environ 0.25 à 0.30 OMR.
> L'inscription est **gratuite**, il n'y a **aucun abonnement mensuel**.
> La TVA Oman (5%) s'applique sur les frais du gateway.

### Documents nécessaires pour ouvrir le compte
1. **Registre commercial** (CR / السجل التجاري) de la boutique
2. **Pièce d'identité** du propriétaire (carte résidente ou passeport)
3. **Compte bancaire commercial** de la boutique (IBAN)
4. **Logo** de la boutique + nom commercial

### Procédure
1. Créer un compte marchand sur la plateforme choisie (thawani.om ou paymob.com)
2. Soumettre les documents ci-dessus
3. Validation : **3 à 7 jours ouvrables**
4. Le propriétaire reçoit **2 clés API** (codes d'accès)
5. Le développeur intègre les clés → **le paiement en ligne est activé sur le site**

### Coût total pour le propriétaire
- Ouverture du compte : **Gratuit**
- Abonnement mensuel : **Aucun**
- Seul coût : la **commission par transaction** (~2.5 à 3%)
- L'argent des ventes est viré directement sur le **compte bancaire** de la boutique

---

## 10. COUTS POUR LE PROPRIETAIRE

### Résumé des coûts

| Poste | Coût | Fréquence | Obligatoire ? |
|-------|------|-----------|---------------|
| **Nom de domaine** (.com) | ~10-15 $/an (~4-6 OMR/an) | Annuel | Recommandé |
| **Nom de domaine** (.om) | ~130-260 $/an (~50-100 OMR/an) | Annuel | Optionnel |
| **Hébergement** (Vercel) | 0 $ (plan gratuit) | — | Inclus |
| **Base de données** (Supabase) | 0 $ (plan gratuit) | — | Inclus |
| **Commission paiement en ligne** | ~2.5-3% par vente carte | Par transaction | Si activé |

### Détail par poste

#### Nom de domaine (adresse du site)
Le site fonctionne actuellement sur **chello-nine.vercel.app** (gratuit).
Pour une adresse professionnelle, le propriétaire peut acheter :
- **chello.com** ou **chello-store.com** → ~10-15 $/an (~4-6 OMR/an) — le plus abordable
- **chello.om** (domaine omanais) → ~130-260 $/an (~50-100 OMR/an) — plus cher mais local
- Achat sur des sites comme Namecheap, GoDaddy ou Gandi
- La connexion du domaine au site est **gratuite** et se fait en quelques minutes

#### Hébergement du site (Vercel)
- **Plan actuel : Gratuit (Hobby)**
- Inclut : déploiements illimités, 100 GB de bande passante/mois, CDN mondial
- **Suffisant pour une boutique** comme Chello tant que le trafic reste modéré
- Si le site grandit beaucoup : Plan Pro à **20 $/mois** (~8 OMR/mois) avec 1 TB de bande passante
- **Pour le moment : 0 $/mois**

#### Base de données (Supabase)
- **Plan actuel : Gratuit**
- Inclut : 500 MB de stockage, 50 000 utilisateurs actifs/mois, API illimitées
- **Largement suffisant pour démarrer**
- Si la boutique grandit : Plan Pro à **25 $/mois** (~10 OMR/mois) avec 8 GB de stockage
- **Pour le moment : 0 $/mois**

#### Commission paiement en ligne
- Voir section 9 ci-dessus
- **Uniquement si le propriétaire active le paiement par carte**
- Pas de frais si on reste en Cash on Delivery (paiement à la livraison)

### Ce que le propriétaire paie aujourd'hui

| Poste | Coût |
|-------|------|
| Hébergement | **0 OMR** |
| Base de données | **0 OMR** |
| Domaine | **0 OMR** (utilise l'adresse gratuite Vercel) |
| **TOTAL mensuel** | **0 OMR/mois** |

### Ce que le propriétaire pourrait payer (recommandé)

| Poste | Coût |
|-------|------|
| Domaine .com (ex: chello-store.com) | **~5 OMR/an** |
| Hébergement (Vercel gratuit) | **0 OMR/mois** |
| Base de données (Supabase gratuit) | **0 OMR/mois** |
| Commission paiement carte (~2.5%) | **~0.25 OMR pour 10 OMR de vente** |
| **TOTAL fixe** | **~5 OMR/an + commissions** |

> **En résumé : le site ne coûte quasiment rien à maintenir.** Le seul investissement recommandé est un nom de domaine professionnel (~5 OMR/an). L'hébergement et la base de données sont gratuits pour le niveau d'usage actuel. Le paiement en ligne ne coûte que si on l'active, et c'est une commission par vente (pas un abonnement).

---

## 11. HEBERGEMENT & DEPLOIEMENT

- **Hébergeur :** Vercel (infrastructure mondiale, CDN rapide)
- **Base de données :** Supabase (PostgreSQL managé, temps réel)
- **Domaine actuel :** chello-nine.vercel.app
- **Domaine personnalisé :** Prêt à être connecté (ex: chello.com ou chello.om)
- **Mises à jour :** Déploiement instantané à chaque modification

---

## 12. RECAPITULATIF DES ACCES

| Rôle | URL | Fonctions |
|------|-----|-----------|
| Client | chello-nine.vercel.app | Acheter, suivre commandes, fidélité |
| Caissier | /caisse | Ventes POS, commandes, fidélité, stock (lecture) |
| Propriétaire | /admin | Tout gérer : produits, commandes, promos, users, avis, fidélité, alertes |

---

*Document généré le 25 juin 2026 — Chello Women's Fashion, Al Araimi Boulevard, Muscat, Oman*
