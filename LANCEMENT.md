# Lancement du Projet - Détection Maladie Alzheimer

## Prérequis

Avant de lancer, vérifier que ces services sont installés et fonctionnels :

```
java -version       → 17.x.x
mvn --version       → 3.x.x
node --version      → 18.x.x
ng version          → 17.x.x
PostgreSQL          → en cours d'exécution
Base alzheimer_stock → créée
```

---

## Compilation (une seule fois ou après modification du code)

```
cd alzheimer-stock-clean/backend
mvn clean install -DskipTests
```

Résultat attendu : **BUILD SUCCESS**

---

## Lancement (4 terminaux)

### Terminal 1 : Eureka Server

```
cd alzheimer-stock-clean/backend/eureka-server
mvn spring-boot:run
```

Attendre : `Started EurekaServerApplication`
Vérifier : http://localhost:8761

---

### Terminal 2 : API Gateway

```
cd alzheimer-stock-clean/backend/api-gateway
mvn spring-boot:run
```

Attendre : `Started ApiGatewayApplication`

---

### Terminal 3 : Service Stock

```
cd alzheimer-stock-clean/backend/service-stock
mvn spring-boot:run
```

Attendre : `Started ServiceStockApplication`
Vérifier : http://localhost:8081/api/categories

---

### Terminal 4 : Frontend Angular

```
cd alzheimer-stock-clean/frontend/alzheimer-app
npm install
ng serve --open
```

Vérifier : http://localhost:4200

---

## Toutes les URLs d'accès

| Service | URL | Description |
|---------|-----|-------------|
| Eureka Dashboard | http://localhost:8761 | Registre des microservices |
| API Gateway | http://localhost:8080 | Point d'entrée unifié (production) |
| Stock API (direct) | http://localhost:8081/api/categories | API REST des catégories |
| Stock API (direct) | http://localhost:8081/api/produits | API REST des produits |
| Stock API (direct) | http://localhost:8081/api/tableau-de-bord | API REST du tableau de bord |
| Panier API (direct) | http://localhost:8081/api/panier/{sessionId} | API REST du panier |
| Commandes API (direct) | http://localhost:8081/api/commandes | API REST des commandes |
| Analyse Stock API (direct) | http://localhost:8081/api/analyse-stock | API REST de l'analyse de stock |
| **Swagger UI** | **http://localhost:8081/api/swagger-ui.html** | **Documentation interactive de l'API** |
| OpenAPI JSON | http://localhost:8081/api/v3/api-docs | Spécification OpenAPI brute |
| **Frontend Frontoffice** | **http://localhost:4200** | **Site public (accueil, catalogue)** |
| **Frontend Backoffice** | **http://localhost:4200/admin** | **Interface d'administration Angular** |

---

## Swagger UI - Documentation API

Après le lancement du Service Stock, ouvrir **http://localhost:8081/api/swagger-ui.html** pour accéder à la documentation interactive.

### Ce que vous pouvez faire dans Swagger UI :

- **Visualiser** tous les endpoints de l'API (Tableau de Bord, Catégories, Produits, Panier, Commandes, Analyse Stock)
- **Tester** chaque endpoint avec le bouton "Try it out" (remplace Postman)
- **Voir** la structure des objets JSON attendus (DTOs)
- **Voir** les contraintes de validation sur chaque champ
- **Basculer** entre le serveur direct (port 8081) et l'API Gateway (port 8080)

### Endpoints disponibles dans Swagger :

| Groupe | Endpoints |
|--------|-----------|
| **Tableau de Bord** | `GET /api/tableau-de-bord` - Statistiques agrégées (totaux, stock bas, ruptures, valeur totale) |
| **Catégories** | `GET`, `POST`, `PUT`, `DELETE` sur `/api/categories` |
| **Produits** | `GET`, `POST`, `PUT`, `DELETE` sur `/api/produits` + filtre par catégorie |
| **Panier** | `GET`, `POST`, `PUT`, `DELETE` sur `/api/panier/{sessionId}` - Gestion du panier d'achat |
| **Commandes** | `GET`, `POST`, `PATCH` sur `/api/commandes` - Création et gestion des commandes |

---

## Frontend - Interface Angular

Ouvrir **http://localhost:4200** pour accéder au site.

### Pages Frontoffice (site public) :

| Page | Fonctionnalités |
|------|-----------------|
| **Accueil** (`/`) | Hero section, stats, catégories, derniers produits |
| **Catalogue** (`/catalogue`) | Grille produits, recherche, filtres, tri, pagination, bouton "Ajouter au panier" |
| **Détail Produit** (`/catalogue/:id`) | Informations complètes, sélecteur quantité, ajout panier, produits similaires |
| **Catégorie** (`/categories/:id`) | Produits filtrés par catégorie, recherche |
| **Panier** (`/panier`) | Liste articles, contrôles quantité +/-, suppression, total, passage commande |
| **Commander** (`/commander`) | Formulaire client (nom, email, tél, adresse) + récapitulatif commande |
| **Confirmation** (`/commande/:ref`) | Page succès avec référence, détails, boutons navigation |

### Pages Backoffice (administration) :

| Page | Fonctionnalités |
|------|-----------------|
| **Tableau de Bord** (`/admin`) | 4 cartes stats, alertes rupture, actions rapides, dernières données |
| **Catégories** (`/admin/categories`) | Liste avec recherche, pagination, CRUD complet |
| **Produits** (`/admin/produits`) | Liste avec recherche, filtre catégorie, filtre stock, pagination, CRUD complet |
| **Commandes** (`/admin/commandes`) | Liste avec recherche, filtre par statut, pagination, accès au détail |
| **Détail Commande** (`/admin/commandes/:id`) | Infos client, articles commandés, changement de statut |
| **Analyse Stock** (`/admin/analyse-stock`) | KPIs, classification ABC, tendance des ventes, tableau produits avec filtres/tri, scores de santé |
| **Formulaires** | Création / modification avec validation, aperçu valeur stock |

### Fonctionnalités clés :

- **Bilingue FR/EN** : Bouton de langue dans la navbar et la topbar (persistance localStorage)
- **Mode Sombre / Clair** : Bouton lune/soleil dans la navbar et la topbar (persistance localStorage)
- **Panier d'achat** : Ajout depuis le catalogue/détail, badge compteur dans la navbar, gestion quantités
- **Commande complète** : Checkout avec formulaire client, validation stock, confirmation avec référence
- **Gestion des commandes** : 6 statuts (En attente → Livrée ou Annulée), restauration stock sur annulation
- **Analyse de stock** : KPIs, classification ABC, graphique tendances, prévisions, scores de santé
- Sidebar de navigation fixe avec sections groupées (catégories, produits, commandes, analyse)
- Topbar avec breadcrumbs dynamiques, bouton FR/EN, bouton dark/light mode et horloge
- Recherche en temps réel, tri (8 critères), pagination configurable (6/12/24/48)
- Filtres multiples (catégorie, niveau de stock, statut commande, classification ABC) avec chips de filtres actifs
- Alertes rupture de stock sur le dashboard
- Design responsive (desktop, tablette, mobile)

---

## Mode développement simplifié

En développement, le frontend communique **directement** avec le Service Stock (port 8081), sans passer par l'API Gateway. Il suffit donc de lancer :

```
# Terminal 1 : Service Stock
cd backend/service-stock
mvn spring-boot:run

# Terminal 2 : Frontend
cd frontend/alzheimer-app
ng serve --open
```

> Eureka et API Gateway ne sont nécessaires qu'en production ou pour tester le routage via Gateway.

---

## Vérification rapide

| Étape | Action | Résultat attendu |
|-------|--------|------------------|
| 1 | Ouvrir http://localhost:8081/api/categories | JSON `[]` ou liste de catégories |
| 2 | Ouvrir http://localhost:8081/api/swagger-ui.html | Interface Swagger avec 6 groupes d'API |
| 3 | Ouvrir http://localhost:4200 | Frontoffice : page d'accueil avec hero, stats, catégories |
| 4 | Cliquer "Catalogue" | Grille produits avec recherche, filtres, tri, pagination, bouton panier |
| 5 | Cliquer "Ajouter au panier" | Badge panier s'incrémente dans la navbar |
| 6 | Cliquer un produit | Page détail avec prix, stock, quantité, ajout panier, similaires |
| 7 | Cliquer "Panier" dans la navbar | Page panier avec articles, quantités, total |
| 8 | Cliquer "Passer la commande" | Page checkout avec formulaire client |
| 9 | Remplir le nom et confirmer | Page confirmation avec référence CMD-xxx |
| 10 | Cliquer bouton FR/EN | Toute l'interface bascule en anglais |
| 11 | Cliquer bouton 🌙 (lune) | L'interface passe en mode sombre, icône → ☀️ |
| 12 | Recharger la page | Le mode sombre est conservé (localStorage) |
| 13 | Cliquer bouton ☀️ (soleil) | Retour au mode clair |
| 14 | Cliquer "Administration" | Backoffice `/admin` avec sidebar et dashboard |
| 15 | Naviguer vers "Commandes" | La commande créée apparaît dans la liste |
| 16 | Cliquer "Voir" sur la commande | Détail avec changement de statut |
| 17 | Naviguer vers "Analyse Stock" | Dashboard avec KPIs, ABC, tendances, tableau produits |
| 18 | Filtrer par classification A | Seuls les produits de catégorie A s'affichent |
| 19 | Créer une catégorie | CRUD catégories fonctionne |
| 20 | Créer un produit | CRUD produits fonctionne |
| 21 | Cliquer "Voir le site" (sidebar) | Retour au frontoffice |

---

## Arrêt

`Ctrl + C` dans chaque terminal.

---

## Résumé des ports

| Service | Port |
|---------|------|
| PostgreSQL | 5432 |
| Eureka Server | 8761 |
| API Gateway | 8080 |
| Service Stock | 8081 |
| Frontend Angular | 4200 |
