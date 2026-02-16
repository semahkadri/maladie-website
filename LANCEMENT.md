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
cd alzheimer-detection/backend
mvn clean install -DskipTests
```

Résultat attendu : **BUILD SUCCESS**

---

## Lancement (4 terminaux)

### Terminal 1 : Eureka Server

```
cd alzheimer-detection/backend/eureka-server
mvn spring-boot:run
```

Attendre : `Started EurekaServerApplication`
Vérifier : http://localhost:8761

---

### Terminal 2 : API Gateway

```
cd alzheimer-detection/backend/api-gateway
mvn spring-boot:run
```

Attendre : `Started ApiGatewayApplication`

---

### Terminal 3 : Service Stock

```
cd alzheimer-detection/backend/service-stock
mvn spring-boot:run
```

Attendre : `Started ServiceStockApplication`
Vérifier : http://localhost:8081/api/categories

---

### Terminal 4 : Frontend Angular

```
cd alzheimer-detection/frontend/alzheimer-app
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
| **Swagger UI** | **http://localhost:8081/api/swagger-ui.html** | **Documentation interactive de l'API** |
| OpenAPI JSON | http://localhost:8081/api/v3/api-docs | Spécification OpenAPI brute |
| **Frontend Backoffice** | **http://localhost:4200** | **Interface de gestion Angular** |

---

## Swagger UI - Documentation API

Après le lancement du Service Stock, ouvrir **http://localhost:8081/api/swagger-ui.html** pour accéder à la documentation interactive.

### Ce que vous pouvez faire dans Swagger UI :

- **Visualiser** tous les endpoints de l'API (Tableau de Bord, Catégories, Produits)
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

---

## Frontend Backoffice - Interface de gestion

Ouvrir **http://localhost:4200** pour accéder au backoffice Angular.

### Pages disponibles :

| Page | Fonctionnalités |
|------|-----------------|
| **Tableau de Bord** (`/`) | 4 cartes stats, alertes rupture de stock, actions rapides, dernières données |
| **Catégories** (`/categories`) | Liste avec recherche, pagination, CRUD complet |
| **Produits** (`/produits`) | Liste avec recherche, filtre catégorie, filtre stock, pagination, CRUD complet |
| **Formulaires** | Création / modification avec validation, aperçu valeur stock |

### Fonctionnalités du backoffice :

- Sidebar de navigation fixe avec sections groupées
- Topbar avec breadcrumbs dynamiques et horloge
- Recherche en temps réel sur les listes
- Filtres multiples (catégorie, niveau de stock)
- Pagination côté client
- Alertes rupture de stock sur le dashboard
- Valeur totale du stock en TND
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
| 2 | Ouvrir http://localhost:8081/api/swagger-ui.html | Interface Swagger avec 3 groupes d'API |
| 3 | Ouvrir http://localhost:4200 | Backoffice Angular avec sidebar et dashboard |
| 4 | Cliquer "Catégories" dans la sidebar | Liste des catégories avec recherche |
| 5 | Cliquer "Nouvelle Catégorie" | Formulaire de création |
| 6 | Créer une catégorie | Redirection vers la liste, catégorie visible |
| 7 | Cliquer "Produits" dans la sidebar | Liste des produits avec filtres |
| 8 | Créer un produit | Redirection vers la liste, produit visible |
| 9 | Retour au Dashboard | Stats mises à jour (totaux, valeur stock) |

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
