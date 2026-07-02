# CHELLO — Proposition Commerciale : Site Web E-Commerce

**Boutique :** Chello — Women's Fashion
**Adresse :** Al Araimi Boulevard, 1er étage, Seeb, Muscat, Oman

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
- Section Instagram

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
- Sous-total avec livraison gratuite configurable
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
- Page publique d'inscription
- Champs : nom complet, numéro WhatsApp
- Code unique généré automatiquement
- Carte de fidélité digitale avec les 8 tampons visuels

### Tamponnage automatique
- **En boutique** : le caissier recherche le client par téléphone dans le POS, le tampon est ajouté automatiquement après la vente
- **En ligne** : quand une commande passe au statut "Livrée", le tampon est ajouté automatiquement si le numéro de téléphone correspond à un membre fidélité
- Notification en temps réel quand un tampon est ajouté

### Retrouver sa carte
- Page dédiée pour retrouver sa carte par numéro WhatsApp
- Affichage du nombre de tampons et de l'historique

---

## 4. DASHBOARD PROPRIETAIRE (Admin)

**Accès sécurisé par rôle "admin"**

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
- Gestion des tailles, couleurs et du stock
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

**Accès sécurisé par rôle "cashier"**

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
- Tracking automatique de chaque page visitée
- **Gratuit** — nécessite uniquement un compte Google Analytics
- Le propriétaire peut consulter les statistiques à tout moment depuis son téléphone ou PC

### Performance & SEO
- Pages pré-rendues pour le référencement Google
- Chargement paresseux des images et des pages (lazy loading)
- Score Lighthouse optimisé
- Méta-données SEO sur chaque page

### Sécurité
- Authentification sécurisée
- Contrôle d'accès par rôle (admin, cashier, client)
- Les dashboards admin et caissier sont protégés
- Redirection automatique après connexion selon le rôle

### Intégrations
- **WhatsApp** : bouton flottant + liens directs pour commander
- **Instagram** : lien vers le compte de la boutique
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

- **Couleur dominante :** Crème / Beige
- **Couleur secondaire :** Noir profond
- **Couleur accent :** Silver / Argenté
- **Typographie :** Polices serif élégantes + polices arabes professionnelles
- **Style :** Éditorial luxe, minimaliste, aéré — inspiré des grandes maisons de mode

---

## 9. PAIEMENT EN LIGNE (Option)

### Modes de paiement
- **Paiement à la livraison** (Cash on Delivery) — inclus par défaut
- **Paiement par carte bancaire** (Visa / Mastercard) — activable
- **Apple Pay** — activable
- **OmanNet** (cartes de débit locales omanaises) — activable

### Pour activer le paiement par carte

Le propriétaire doit ouvrir un compte marchand chez un prestataire de paiement agréé en Oman :

| Plateforme | Frais par vente | OmanNet | Licence CBO |
|------------|----------------|---------|-------------|
| **Paymob** (le moins cher) | 2.5% carte / 1.5% OmanNet | Oui | Oui |
| **Thawani** (le plus connu en Oman) | ~2.5-3% (sur devis) | Oui | Oui |
| **Tap Payments** | ~2.75% | Oui (direct) | Oui |

> **Exemple :** Sur une vente de 10 OMR, la commission est d'environ 0.25 à 0.30 OMR.
> L'inscription est **gratuite**, il n'y a **aucun abonnement mensuel**.
> La TVA Oman (5%) s'applique sur les frais du gateway.

### Documents nécessaires
1. **Registre commercial** (CR / السجل التجاري) de la boutique
2. **Pièce d'identité** du propriétaire (carte résidente ou passeport)
3. **Compte bancaire commercial** de la boutique (IBAN)
4. **Logo** de la boutique + nom commercial

### Procédure
1. Créer un compte marchand sur la plateforme choisie
2. Soumettre les documents ci-dessus
3. Validation : **3 à 7 jours ouvrables**
4. Le propriétaire reçoit les **clés d'accès**
5. Le développeur intègre les clés → **le paiement en ligne est activé sur le site**

### Coût du paiement en ligne
- Ouverture du compte : **Gratuit**
- Abonnement mensuel : **Aucun**
- Seul coût : la **commission par transaction** (~2.5 à 3%)
- L'argent des ventes est viré directement sur le **compte bancaire** de la boutique

---

## 10. COUTS POUR LE PROPRIETAIRE

### Résumé des coûts récurrents

| Poste | Coût | Fréquence | Obligatoire ? |
|-------|------|-----------|---------------|
| **Nom de domaine** (.com) | ~10-15 $/an (~4-6 OMR/an) | Annuel | Recommandé |
| **Hébergement** | 0 $ (plan gratuit inclus) | — | Inclus |
| **Base de données** | 0 $ (plan gratuit inclus) | — | Inclus |
| **Commission paiement en ligne** | ~2.5-3% par vente carte | Par transaction | Si activé |

### Détail par poste

#### Nom de domaine (adresse du site)
- Un domaine **.com** est recommandé (ex: chello-store.com)
- Coût : **~10-15 $/an (~4-6 OMR/an)**
- La connexion du domaine au site est **gratuite** et se fait en quelques minutes

#### Hébergement du site
- **Plan gratuit** inclus
- Inclut : déploiements illimités, 100 GB de bande passante/mois, CDN mondial
- **Suffisant pour une boutique** comme Chello tant que le trafic reste modéré
- Si le site grandit beaucoup : Plan Pro à **20 $/mois** (~8 OMR/mois) avec 1 TB de bande passante

#### Base de données
- **Plan gratuit** inclus
- Inclut : 500 MB de stockage, 50 000 utilisateurs actifs/mois, API illimitées
- **Largement suffisant pour démarrer**
- Si la boutique grandit : Plan Pro à **25 $/mois** (~10 OMR/mois) avec 8 GB de stockage

#### Commission paiement en ligne
- Voir section 9 ci-dessus
- **Uniquement si le propriétaire active le paiement par carte**
- Pas de frais si on reste en Cash on Delivery (paiement à la livraison)

### Coût total récurrent estimé

| Poste | Coût |
|-------|------|
| Domaine .com | **~5 OMR/an** |
| Hébergement | **0 OMR/mois** |
| Base de données | **0 OMR/mois** |
| Commission paiement carte (~2.5%) | **~0.25 OMR pour 10 OMR de vente** |
| **TOTAL fixe** | **~5 OMR/an + commissions si paiement carte activé** |

> **En résumé : le site ne coûte quasiment rien à maintenir.** Le seul coût récurrent est un nom de domaine professionnel (~5 OMR/an). L'hébergement et la base de données sont gratuits. Le paiement en ligne ne coûte que si on l'active, et c'est une commission par vente (pas un abonnement).

---

## 11. COMPARATIF : COMBIEN COUTERAIT TOUT CELA SUR SHOPIFY ?

Le tableau ci-dessous montre combien coûterait chaque fonctionnalité de ce site si elle était mise en place via **Shopify + applications tierces** (prix officiels 2026).

### Abonnements mensuels obligatoires

| Fonctionnalité | Équivalent Shopify | Coût/mois |
|---|---|---|
| Boutique e-commerce (catalogue, panier, checkout) | Shopify Basic Plan | **39 $/mois** |
| Point de vente caissier (POS) | Shopify POS Pro | **89 $/mois/local** |
| Programme de fidélité (tampons, récompenses) | Smile.io (Growth) | **99 - 199 $/mois** |
| Avis clients sur les produits | Judge.me (Awesome) ou Loox | **15 - 50 $/mois** |
| Bilingue arabe/anglais (traduction) | Langify ou Weglot | **15 - 32 $/mois** |
| Blog intégré | Inclus dans Shopify | Inclus |
| **TOTAL abonnements** | | **~257 - 409 $/mois** |

### Frais de transaction Shopify

| Type | Coût |
|---|---|
| Commission par vente (carte) | **2.9% + 0.30 $ par transaction** |
| Si passerelle externe (non-Shopify Payments) | **+ 2% de frais supplémentaires** |

### Coûts annuels sur Shopify

| Poste | Coût/an |
|---|---|
| Abonnement Shopify Basic | **468 $/an** |
| POS Pro (1 boutique) | **1,068 $/an** |
| App fidélité (Smile.io Growth) | **1,188 - 2,388 $/an** |
| App avis (Judge.me/Loox) | **180 - 600 $/an** |
| App traduction bilingue | **180 - 384 $/an** |
| Domaine | **~15 $/an** |
| **TOTAL 1ère année** | **~3,099 - 4,923 $/an** |
| **TOTAL sur 3 ans** | **~9,297 - 14,769 $** |

### Ce que Shopify ne fournit PAS (même avec les abonnements)

- Dashboard admin personnalisé avec statistiques sur mesure
- Système de tampons fidélité intégré au POS (auto-stamp à la vente)
- Tamponnage automatique quand une commande est livrée
- Guide des tailles interactif intégré
- Variantes couleur avec pastilles visuelles
- Design éditorial luxe 100% personnalisé (thème sur mesure)
- Interface caissier simplifiée dédiée
- Aucun frais de transaction supplémentaire
- Hébergement et base de données gratuits

### Résumé

| | Shopify + Apps | Ce site |
|---|---|---|
| Coût la 1ère année | **~3,099 - 4,923 $** | **Paiement unique** |
| Coût sur 3 ans | **~9,297 - 14,769 $** | **0 $ supplémentaire** |
| Abonnement mensuel | **257 - 409 $/mois** | **0 $/mois** |
| Frais de transaction | 2.9% + 0.30$ + 2% si gateway externe | ~2.5% (gateway uniquement) |
| POS en boutique | 89 $/mois en plus | **Inclus** |
| Fidélité + tampons auto | 99-199 $/mois en plus | **Inclus** |
| Design sur mesure | Thème premium ~180-350$ | **Inclus** |
| Propriété du code | Non (location) | **Oui, le code vous appartient** |

> **Avec Shopify, vous louez un service. Avec ce site, vous possédez votre plateforme.**
> En 1 an sur Shopify, vous dépensez entre 3,000 et 5,000 $. En 3 ans, entre 9,000 et 15,000 $.
> Ce site offre **toutes ces fonctionnalités et plus encore**, sans abonnement mensuel, et le code source vous appartient.

---

## 12. HEBERGEMENT & DEPLOIEMENT

- **Hébergeur :** Infrastructure mondiale avec CDN rapide
- **Base de données :** Base de données managée avec temps réel
- **Domaine personnalisé :** Prêt à être connecté (ex: chello-store.com)
- **Mises à jour :** Déploiement instantané à chaque modification

---

## 13. RECAPITULATIF DES ACCES

| Rôle | Espace | Fonctions |
|------|--------|-----------|
| Cliente | Site public | Acheter, suivre commandes, fidélité, favoris |
| Caissier | Dashboard caisse | Ventes POS, commandes, fidélité, stock (lecture) |
| Propriétaire | Dashboard admin | Tout gérer : produits, commandes, promos, users, avis, fidélité, alertes |

---

*Chello Women's Fashion — Al Araimi Boulevard, Muscat, Oman*
