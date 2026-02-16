# Projet Détection de la Maladie d'Alzheimer

## Plateforme de Gestion Médicale - Architecture Microservices

---

### Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Architecture globale](#2-architecture-globale)
3. [Technologies utilisées](#3-technologies-utilisées)
4. [Structure du projet](#4-structure-du-projet)
5. [Backend - Microservices](#5-backend---microservices)
6. [Frontend - Angular](#6-frontend---angular)
7. [Base de données - PostgreSQL](#7-base-de-données---postgresql)
8. [API REST - Endpoints](#8-api-rest---endpoints)
9. [Documentation Swagger / OpenAPI](#9-documentation-swagger--openapi)
10. [Prérequis et installation](#10-prérequis-et-installation)
11. [Démarrage du projet](#11-démarrage-du-projet)
12. [Captures et fonctionnalités](#12-captures-et-fonctionnalités)
13. [Évolutions futures](#13-évolutions-futures)

---

## 1. Présentation du projet

Ce projet s'inscrit dans le cadre du développement d'une **plateforme de détection de la maladie d'Alzheimer**. Il est conçu avec une **architecture microservices** permettant une évolution itérative et modulaire.

Le module actuellement développé est la **Gestion de Stock** (Catégorie / Produit), qui permet de gérer l'inventaire des médicaments, équipements médicaux, compléments alimentaires et matériel de rééducation utilisés dans le cadre du suivi et du traitement des patients atteints de la maladie d'Alzheimer.

### Objectifs du module Gestion de Stock

- Gérer les **catégories** de produits médicaux (CRUD complet)
- Gérer les **produits** associés à chaque catégorie (CRUD complet)
- Fournir un **tableau de bord** avec statistiques agrégées (totaux, stock bas, ruptures, valeur totale)
- Assurer la **traçabilité** avec dates de création et de modification
- Fournir une **interface backoffice** professionnelle pour les utilisateurs
- Exposer des **API REST documentées** (Swagger/OpenAPI) pour l'intégration avec les autres modules

---

## 2. Architecture globale

Le projet suit une architecture **microservices** avec les composants suivants :

```
                          ┌─────────────────┐
                          │   Frontend       │
                          │   Angular 17     │
                          │   Port : 4200    │
                          └────────┬─────────┘
                                   │
                                   │ HTTP
                                   ▼
                          ┌─────────────────┐
                          │  API Gateway     │
                          │  Spring Cloud    │
                          │  Port : 8080     │
                          └────────┬─────────┘
                                   │
                          ┌────────┴─────────┐
                          │                  │
                          ▼                  ▼
                 ┌─────────────┐    ┌──────────────────┐
                 │   Eureka    │    │  Service Stock    │
                 │   Server    │    │  (Catégorie /     │
                 │  Port: 8761 │    │   Produit)        │
                 │             │    │  Port : 8081      │
                 └─────────────┘    │  Swagger UI       │
                                    └────────┬──────────┘
                                             │
                                             ▼
                                    ┌──────────────────┐
                                    │   PostgreSQL      │
                                    │   alzheimer_stock │
                                    │   Port : 5432     │
                                    └──────────────────┘
```

### Rôle de chaque composant

| Composant | Rôle | Port |
|-----------|------|------|
| **Eureka Server** | Registre de découverte de services. Tous les microservices s'y enregistrent automatiquement au démarrage. Permet la résolution dynamique des adresses. | 8761 |
| **API Gateway** | Point d'entrée unique pour le frontend en production. Route les requêtes vers les microservices. Gère le CORS et le load balancing. | 8080 |
| **Service Stock** | Microservice métier responsable de la gestion des catégories, produits et tableau de bord. Expose les API REST CRUD et la documentation Swagger. | 8081 |
| **Frontend Angular** | Interface backoffice web avec sidebar, tableau de bord, gestion des catégories et produits. | 4200 |
| **PostgreSQL** | Système de gestion de base de données relationnelle stockant les catégories et produits. | 5432 |

---

## 3. Technologies utilisées

### Backend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| Java | 17 LTS | Langage de programmation principal |
| Spring Boot | 3.2.4 | Framework de développement backend |
| Spring Cloud | 2023.0.1 | Écosystème microservices (Eureka, Gateway) |
| Spring Data JPA | 3.2.4 | Couche d'accès aux données (ORM) |
| Spring Validation | 3.2.4 | Validation des données entrantes |
| Netflix Eureka | 4.1.0 | Découverte et enregistrement de services |
| Spring Cloud Gateway | 4.1.0 | Passerelle API et routage |
| SpringDoc OpenAPI | 2.5.0 | Documentation Swagger UI automatique |
| Lombok | 1.18.30 | Réduction du code boilerplate (getters, setters, builders) |
| PostgreSQL Driver | 42.6.2 | Connecteur JDBC pour PostgreSQL |
| Maven | 3.8+ | Gestionnaire de dépendances et build |

### Frontend

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| Angular | 17.3 | Framework de développement frontend |
| TypeScript | 5.4 | Langage de programmation typé |
| Bootstrap | 5.3.3 | Framework CSS pour le design responsive |
| Bootstrap Icons | 1.11.3 | Bibliothèque d'icônes |
| RxJS | 7.8 | Programmation réactive (Observables) |
| Angular Router | 17.3 | Navigation et routage SPA |
| Angular HttpClient | 17.3 | Communication HTTP avec le backend |

### Base de données

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| PostgreSQL | 15+ | SGBD relationnel principal |
| Hibernate | 6.4 | ORM pour le mapping objet-relationnel |

---

## 4. Structure du projet

```
alzheimer-detection/
│
├── backend/
│   ├── pom.xml                                          # POM parent Maven
│   │
│   ├── eureka-server/                                   # Microservice Eureka
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/alzheimer/eureka/
│   │       │   └── EurekaServerApplication.java         # Point d'entrée
│   │       └── resources/
│   │           └── application.yml                      # Configuration
│   │
│   ├── api-gateway/                                     # Microservice Gateway
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/alzheimer/gateway/
│   │       │   └── ApiGatewayApplication.java           # Point d'entrée
│   │       └── resources/
│   │           └── application.yml                      # Configuration + Routes
│   │
│   └── service-stock/                                   # Microservice Stock
│       ├── pom.xml
│       └── src/main/
│           ├── java/com/alzheimer/stock/
│           │   ├── ServiceStockApplication.java         # Point d'entrée
│           │   ├── config/
│           │   │   └── OpenApiConfig.java               # Configuration Swagger/OpenAPI
│           │   ├── entite/
│           │   │   ├── Categorie.java                   # Entité JPA Catégorie
│           │   │   └── Produit.java                     # Entité JPA Produit
│           │   ├── dto/
│           │   │   ├── CategorieDTO.java                # Objet de transfert Catégorie
│           │   │   ├── ProduitDTO.java                  # Objet de transfert Produit
│           │   │   └── TableauDeBordDTO.java            # Objet de transfert Dashboard
│           │   ├── repository/
│           │   │   ├── CategorieRepository.java         # Accès données Catégorie
│           │   │   └── ProduitRepository.java           # Accès données Produit
│           │   ├── service/
│           │   │   ├── CategorieService.java            # Interface service Catégorie
│           │   │   ├── CategorieServiceImpl.java        # Implémentation Catégorie
│           │   │   ├── ProduitService.java              # Interface service Produit
│           │   │   ├── ProduitServiceImpl.java          # Implémentation Produit
│           │   │   ├── TableauDeBordService.java        # Interface service Dashboard
│           │   │   └── TableauDeBordServiceImpl.java    # Implémentation Dashboard
│           │   ├── controleur/
│           │   │   ├── CategorieControleur.java         # REST Controller Catégorie
│           │   │   ├── ProduitControleur.java           # REST Controller Produit
│           │   │   └── TableauDeBordControleur.java     # REST Controller Dashboard
│           │   └── exception/
│           │       ├── ResourceIntrouvableException.java # Exception 404
│           │       └── GestionGlobaleExceptions.java     # Gestionnaire global d'erreurs
│           └── resources/
│               └── application.yml                      # Configuration + DB + Swagger
│
├── frontend/
│   └── alzheimer-app/
│       ├── angular.json                                 # Configuration Angular
│       ├── package.json                                 # Dépendances npm
│       ├── tsconfig.json                                # Configuration TypeScript
│       └── src/
│           ├── index.html                               # Page HTML principale
│           ├── main.ts                                  # Point d'entrée Angular
│           ├── styles.css                               # Styles globaux (backoffice theme)
│           ├── environments/
│           │   ├── environment.ts                       # Config développement (port 8081)
│           │   └── environment.prod.ts                  # Config production (gateway 8080)
│           └── app/
│               ├── app.component.ts                     # Composant racine (layout sidebar)
│               ├── app.config.ts                        # Configuration application
│               ├── app.routes.ts                        # Définition des routes (lazy loading)
│               ├── modeles/
│               │   ├── categorie.model.ts               # Interface Catégorie
│               │   ├── produit.model.ts                 # Interface Produit
│               │   └── tableau-de-bord.model.ts         # Interface Tableau de Bord
│               ├── services/
│               │   ├── categorie.service.ts             # Service HTTP Catégorie
│               │   ├── produit.service.ts               # Service HTTP Produit
│               │   └── tableau-de-bord.service.ts       # Service HTTP Dashboard
│               └── composants/
│                   ├── partage/
│                   │   └── sidebar/
│                   │       └── sidebar.component.ts     # Sidebar + Topbar (navigation)
│                   ├── tableau-de-bord/
│                   │   └── tableau-de-bord.component.ts # Dashboard (stats, actions rapides)
│                   ├── categorie/
│                   │   ├── liste-categories/
│                   │   │   └── liste-categories.component.ts  # Liste (recherche, pagination)
│                   │   └── formulaire-categorie/
│                   │       └── formulaire-categorie.component.ts  # Formulaire CRUD
│                   └── produit/
│                       ├── liste-produits/
│                       │   └── liste-produits.component.ts  # Liste (recherche, filtres, pagination)
│                       └── formulaire-produit/
│                           └── formulaire-produit.component.ts  # Formulaire CRUD
│
├── database/
│   └── init.sql                                         # Script d'initialisation SQL
│
├── GUIDE-INSTALLATION.md                                # Guide d'installation détaillé
├── LANCEMENT.md                                         # Guide de lancement rapide
└── README.md                                            # Ce fichier
```

---

## 5. Backend - Microservices

### 5.1 - Eureka Server (Découverte de services)

Le serveur Eureka est le **registre central** de l'architecture microservices. Chaque microservice s'y enregistre au démarrage, ce qui permet :

- La **découverte dynamique** des services (pas besoin de coder les adresses en dur)
- Le **load balancing** côté client
- La **haute disponibilité** en cas de montée en charge

**Configuration** (`application.yml`) :
- Port : `8761`
- Ne s'enregistre pas lui-même (`register-with-eureka: false`)

### 5.2 - API Gateway (Passerelle)

La passerelle API est le **point d'entrée unique** pour toutes les requêtes provenant du frontend en production. Elle assure :

- Le **routage intelligent** des requêtes vers le bon microservice
- La gestion du **CORS** (Cross-Origin Resource Sharing) pour le frontend Angular
- Le **load balancing** via l'intégration avec Eureka (`lb://service-stock`)
- La **réécriture des URLs** : `/api/stock/**` → `/api/**` (préservation du préfixe `/api`)

**Routes configurées** :
| Chemin entrant | Réécriture | Service cible |
|----------------|------------|---------------|
| `/api/stock/categories` | `/api/categories` | `service-stock` |
| `/api/stock/produits` | `/api/produits` | `service-stock` |
| `/api/stock/tableau-de-bord` | `/api/tableau-de-bord` | `service-stock` |

### 5.3 - Service Stock (Module métier)

Le microservice principal qui gère la logique métier de la gestion de stock.

#### Architecture en couches

```
Requête HTTP
    │
    ▼
┌──────────────────┐
│   Contrôleur     │  ← Réception des requêtes REST, validation, annotations Swagger
│   (controleur/)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Service        │  ← Logique métier, conversion DTO ↔ Entité, agrégations
│   (service/)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Repository     │  ← Accès base de données via Spring Data JPA
│   (repository/)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   PostgreSQL     │  ← Stockage persistant
│   (alzheimer_stock)
└──────────────────┘
```

#### Entités JPA

**Catégorie** (`Categorie.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `nom` | String | Obligatoire, unique, max 100 caractères |
| `description` | String | Optionnel, max 500 caractères |
| `produits` | List\<Produit\> | Relation OneToMany, cascade ALL |
| `dateCreation` | LocalDateTime | Automatique, non modifiable |
| `dateModification` | LocalDateTime | Automatique |

**Produit** (`Produit.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `nom` | String | Obligatoire, max 100 caractères |
| `description` | String | Optionnel, max 500 caractères |
| `prix` | BigDecimal | Obligatoire, précision (10,2) |
| `quantite` | Integer | Obligatoire |
| `categorie` | Categorie | ManyToOne, obligatoire |
| `dateCreation` | LocalDateTime | Automatique, non modifiable |
| `dateModification` | LocalDateTime | Automatique |

#### Relation entre les entités

```
┌──────────────┐       1    *    ┌──────────────┐
│  Catégorie   │ ───────────────►│   Produit    │
│              │                 │              │
│ id           │                 │ id           │
│ nom          │                 │ nom          │
│ description  │                 │ description  │
│ dateCreation │                 │ prix         │
│ dateMod...   │                 │ quantite     │
│              │                 │ categorie_id │
└──────────────┘                 │ dateCreation │
                                 │ dateMod...   │
                                 └──────────────┘

Une catégorie peut contenir plusieurs produits (OneToMany)
Un produit appartient à une seule catégorie (ManyToOne)
La suppression d'une catégorie entraîne la suppression de ses produits (CASCADE)
```

#### Pattern DTO (Data Transfer Object)

Les DTOs sont utilisés pour :
- **Découpler** la couche de présentation de la couche de persistance
- **Contrôler** les données exposées via l'API
- **Valider** les données entrantes avec des annotations Jakarta Validation
- **Agréger** les données pour le tableau de bord (`TableauDeBordDTO`)

**TableauDeBordDTO** - Agrégation des statistiques :

| Champ | Type | Description |
|-------|------|-------------|
| `totalCategories` | long | Nombre total de catégories |
| `totalProduits` | long | Nombre total de produits |
| `produitsStockBas` | long | Produits avec quantité <= 10 |
| `produitsEnRupture` | long | Produits avec quantité = 0 |
| `valeurTotaleStock` | BigDecimal | Somme (prix x quantité) de tous les produits |
| `dernieresCategories` | List\<CategorieDTO\> | 5 dernières catégories créées |
| `derniersProduits` | List\<ProduitDTO\> | 5 derniers produits créés |

#### Gestion des erreurs

Le projet implémente un gestionnaire global d'exceptions (`@RestControllerAdvice`) :

| Exception | Code HTTP | Description |
|-----------|-----------|-------------|
| `ResourceIntrouvableException` | 404 | Ressource non trouvée |
| `MethodArgumentNotValidException` | 400 | Erreur de validation des champs |
| `Exception` (générique) | 500 | Erreur interne du serveur |

Format de réponse d'erreur :
```json
{
  "timestamp": "2026-02-16T14:30:00",
  "message": "Catégorie introuvable avec id : '999'",
  "statut": 404
}
```

---

## 6. Frontend - Angular

### 6.1 - Architecture

Le frontend utilise **Angular 17** en mode **Standalone Components** (sans NgModules), avec :

- **Lazy Loading** : Les composants sont chargés à la demande pour de meilleures performances
- **Services injectables** : Communication HTTP centralisée avec le backend
- **Template-driven Forms** : Formulaires avec validation côté client
- **Routing** : Navigation SPA (Single Page Application)
- **Layout Backoffice** : Sidebar fixe + topbar avec breadcrumbs

### 6.2 - Layout Backoffice

L'application utilise un **layout backoffice professionnel** avec :

- **Sidebar fixe** (gauche) : Navigation principale avec icônes, sections groupées (Principal, Gestion, Actions Rapides), indicateur de page active, logo et branding
- **Topbar** (haut) : Breadcrumbs de navigation dynamiques, horloge en temps réel
- **Zone de contenu** : Zone principale scrollable avec padding et max-width
- **Responsive** : La sidebar se transforme en overlay sur mobile avec bouton hamburger

### 6.3 - Composants

| Composant | Route | Description |
|-----------|-------|-------------|
| `SidebarComponent` | - | Sidebar de navigation + topbar avec breadcrumbs et horloge |
| `TableauDeBordComponent` | `/` | Dashboard avec 4 cartes stats, alertes rupture, actions rapides, dernières données |
| `ListeCategoriesComponent` | `/categories` | Tableau avec recherche, pagination, actions CRUD |
| `FormulaireCategorieComponent` | `/categories/ajouter` | Formulaire de création de catégorie |
| `FormulaireCategorieComponent` | `/categories/modifier/:id` | Formulaire de modification de catégorie |
| `ListeProduitsComponent` | `/produits` | Tableau avec recherche, filtres (catégorie, stock), pagination, actions CRUD |
| `FormulaireProduitComponent` | `/produits/ajouter` | Formulaire de création de produit avec aperçu valeur stock |
| `FormulaireProduitComponent` | `/produits/modifier/:id` | Formulaire de modification de produit |

### 6.4 - Services

| Service | Méthodes | Description |
|---------|----------|-------------|
| `CategorieService` | `listerTout()`, `obtenirParId()`, `creer()`, `modifier()`, `supprimer()` | Appels HTTP vers `/api/categories` |
| `ProduitService` | `listerTout()`, `listerParCategorie()`, `obtenirParId()`, `creer()`, `modifier()`, `supprimer()` | Appels HTTP vers `/api/produits` |
| `TableauDeBordService` | `obtenirTableauDeBord()` | Appel HTTP unique vers `/api/tableau-de-bord` |

### 6.5 - Environnements

| Fichier | API URL | Usage |
|---------|---------|-------|
| `environment.ts` | `http://localhost:8081/api` | Développement (appel direct au service-stock) |
| `environment.prod.ts` | `http://localhost:8080/api/stock` | Production (via API Gateway) |

### 6.6 - Fonctionnalités de l'interface

**Tableau de bord** :
- 4 cartes statistiques : catégories, produits, stock faible (≤ 10), valeur totale du stock (TND)
- Alerte rouge si des produits sont en rupture de stock
- 3 boutons d'actions rapides (nouvelle catégorie, nouveau produit, voir le stock)
- Aperçu des 5 dernières catégories et 5 derniers produits
- Loading spinner pendant le chargement
- Gestion d'erreur avec bouton "Réessayer"

**Listes (Catégories / Produits)** :
- Barre de recherche en temps réel
- Filtre par catégorie (produits)
- Filtre par niveau de stock : normal, faible, rupture (produits)
- Pagination client-side (8 catégories / 10 produits par page)
- Bouton de réinitialisation des filtres
- Loading spinner pendant le chargement
- États vides illustrés avec boutons d'action

**Formulaires** :
- Validation en temps réel (champs obligatoires, longueur, format)
- Compteur de caractères (description)
- Aperçu de la valeur en stock en temps réel (formulaire produit)
- Indicateur de stock faible / rupture (formulaire produit)
- Spinner sur le bouton pendant la soumission
- Messages d'erreur de l'API affichés à l'utilisateur

**UI/UX** :
- Design professionnel avec CSS custom properties (thème cohérent)
- Animations : fade-in pages, slide-down alertes, animation modale
- Badges colorés pour les quantités : vert (> 10), orange (1-10), rouge (0)
- Modale de confirmation avant chaque suppression
- Messages de succès/erreur après chaque opération
- Design responsive (desktop, tablette, mobile)

---

## 7. Base de données - PostgreSQL

### 7.1 - Schéma de la base de données

**Base** : `alzheimer_stock`

#### Table `categories`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `nom` | VARCHAR(100) | NOT NULL, UNIQUE |
| `description` | VARCHAR(500) | - |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `date_modification` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### Table `produits`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `nom` | VARCHAR(100) | NOT NULL |
| `description` | VARCHAR(500) | - |
| `prix` | DECIMAL(10,2) | NOT NULL, CHECK > 0 |
| `quantite` | INTEGER | NOT NULL, CHECK >= 0 |
| `categorie_id` | BIGINT | FOREIGN KEY → categories(id) ON DELETE CASCADE |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `date_modification` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### Index de performance

| Index | Table | Colonne |
|-------|-------|---------|
| `idx_produit_categorie` | produits | categorie_id |
| `idx_produit_nom` | produits | nom |
| `idx_categorie_nom` | categories | nom |

### 7.2 - Stratégie de création des tables

Le projet utilise `hibernate.ddl-auto: update`, ce qui signifie que **Hibernate crée et met à jour automatiquement** les tables au démarrage du microservice. Aucune exécution manuelle de script SQL n'est nécessaire.

Le fichier `database/init.sql` est fourni à titre de **référence** et contient des données de test.

---

## 8. API REST - Endpoints

### Base URL

| Mode | URL |
|------|-----|
| Développement (direct) | `http://localhost:8081` |
| Production (via Gateway) | `http://localhost:8080/api/stock` |

### 8.1 - Tableau de Bord (`/api/tableau-de-bord`)

| Méthode | Endpoint | Description | Réponse |
|---------|----------|-------------|---------|
| `GET` | `/api/tableau-de-bord` | Statistiques agrégées du stock | 200 + JSON Object |

**Exemple de réponse** :
```json
{
  "totalCategories": 4,
  "totalProduits": 9,
  "produitsStockBas": 3,
  "produitsEnRupture": 0,
  "valeurTotaleStock": 2547100.00,
  "dernieresCategories": [
    { "id": 4, "nom": "Matériel de Rééducation", "nombreProduits": 2 }
  ],
  "derniersProduits": [
    { "id": 9, "nom": "Tablette Cognitive", "prix": 35000.00, "quantite": 20 }
  ]
}
```

### 8.2 - Catégories (`/api/categories`)

| Méthode | Endpoint | Description | Corps de la requête | Réponse |
|---------|----------|-------------|---------------------|---------|
| `GET` | `/api/categories` | Lister toutes les catégories | - | 200 + JSON Array |
| `GET` | `/api/categories/{id}` | Obtenir une catégorie par ID | - | 200 + JSON Object |
| `POST` | `/api/categories` | Créer une nouvelle catégorie | JSON CategorieDTO | 201 + JSON Object |
| `PUT` | `/api/categories/{id}` | Modifier une catégorie | JSON CategorieDTO | 200 + JSON Object |
| `DELETE` | `/api/categories/{id}` | Supprimer une catégorie | - | 204 No Content |

**Exemple de corps JSON (POST/PUT)** :
```json
{
  "nom": "Médicaments",
  "description": "Médicaments pour le traitement de la maladie d'Alzheimer"
}
```

**Exemple de réponse (GET)** :
```json
{
  "id": 1,
  "nom": "Médicaments",
  "description": "Médicaments pour le traitement de la maladie d'Alzheimer",
  "dateCreation": "2026-02-16T14:30:00",
  "dateModification": "2026-02-16T14:30:00",
  "nombreProduits": 3
}
```

### 8.3 - Produits (`/api/produits`)

| Méthode | Endpoint | Description | Corps de la requête | Réponse |
|---------|----------|-------------|---------------------|---------|
| `GET` | `/api/produits` | Lister tous les produits | - | 200 + JSON Array |
| `GET` | `/api/produits/{id}` | Obtenir un produit par ID | - | 200 + JSON Object |
| `GET` | `/api/produits/categorie/{categorieId}` | Lister les produits d'une catégorie | - | 200 + JSON Array |
| `POST` | `/api/produits` | Créer un nouveau produit | JSON ProduitDTO | 201 + JSON Object |
| `PUT` | `/api/produits/{id}` | Modifier un produit | JSON ProduitDTO | 200 + JSON Object |
| `DELETE` | `/api/produits/{id}` | Supprimer un produit | - | 204 No Content |

**Exemple de corps JSON (POST/PUT)** :
```json
{
  "nom": "Donépézil 10mg",
  "description": "Inhibiteur de la cholinestérase - boîte de 30",
  "prix": 4500.00,
  "quantite": 150,
  "categorieId": 1
}
```

### 8.4 - Codes de réponse HTTP

| Code | Signification | Quand |
|------|---------------|-------|
| `200` | Succès | GET, PUT réussis |
| `201` | Créé | POST réussi |
| `204` | Pas de contenu | DELETE réussi |
| `400` | Requête invalide | Erreur de validation |
| `404` | Non trouvé | Ressource inexistante |
| `500` | Erreur serveur | Erreur interne |

---

## 9. Documentation Swagger / OpenAPI

Le Service Stock intègre **SpringDoc OpenAPI** qui génère automatiquement une documentation interactive de l'API.

### URLs d'accès

| URL | Description |
|-----|-------------|
| **http://localhost:8081/api/swagger-ui.html** | Interface Swagger UI interactive |
| http://localhost:8081/api/v3/api-docs | Spécification OpenAPI au format JSON |

### Groupes d'API documentés

| Tag | Description | Endpoints |
|-----|-------------|-----------|
| **Tableau de Bord** | Statistiques agrégées du stock | `GET /api/tableau-de-bord` |
| **Catégories** | CRUD des catégories de stock | 5 endpoints |
| **Produits** | CRUD des produits de stock | 6 endpoints |

### Fonctionnalités Swagger UI

- **Try it out** : Tester chaque endpoint directement depuis le navigateur
- **Modèles** : Visualiser la structure des DTOs (CategorieDTO, ProduitDTO, TableauDeBordDTO)
- **Validation** : Voir les contraintes de validation sur chaque champ
- **Serveurs** : Basculer entre le service direct (port 8081) et l'API Gateway (port 8080)

> Swagger UI remplace Postman pour les tests rapides de l'API. Aucune installation supplémentaire n'est nécessaire.

---

## 10. Prérequis et installation

Consulter le fichier **[GUIDE-INSTALLATION.md](GUIDE-INSTALLATION.md)** pour les instructions détaillées étape par étape.

### Résumé des prérequis

| Outil | Version minimale | Vérification |
|-------|------------------|--------------|
| Java JDK | 17 | `java -version` |
| Apache Maven | 3.8+ | `mvn --version` |
| Node.js | 18+ | `node --version` |
| Angular CLI | 17 | `ng version` |
| PostgreSQL | 15+ | pgAdmin ou `psql --version` |

---

## 11. Démarrage du projet

### Ordre de démarrage (obligatoire)

```bash
# 1. S'assurer que PostgreSQL est lancé et que la base alzheimer_stock existe

# 2. Terminal 1 - Eureka Server (attendre le démarrage complet)
cd backend/eureka-server
mvn spring-boot:run

# 3. Terminal 2 - API Gateway
cd backend/api-gateway
mvn spring-boot:run

# 4. Terminal 3 - Service Stock
cd backend/service-stock
mvn spring-boot:run

# 5. Terminal 4 - Frontend Angular
cd frontend/alzheimer-app
npm install       # (uniquement la première fois)
ng serve --open
```

### Vérification

| Service | URL | Attendu |
|---------|-----|---------|
| Eureka | http://localhost:8761 | Dashboard avec les services enregistrés |
| API Gateway | http://localhost:8080 | Passerelle active |
| Service Stock | http://localhost:8081/api/categories | Réponse JSON |
| Swagger UI | http://localhost:8081/api/swagger-ui.html | Documentation API interactive |
| Frontend | http://localhost:4200 | Interface backoffice Angular |

---

## 12. Captures et fonctionnalités

### Page Tableau de Bord (`/`)

- Layout backoffice avec sidebar fixe (gauche) et topbar (breadcrumbs + horloge)
- 4 cartes statistiques : catégories, produits, stock faible (≤ 10), valeur totale stock (TND)
- Alerte rouge si produits en rupture de stock
- 3 boutons d'actions rapides : Nouvelle Catégorie, Nouveau Produit, Voir tout le Stock
- Aperçu des 5 dernières catégories avec nombre de produits
- Aperçu des 5 derniers produits avec prix (TND) et indicateur de stock coloré

### Page Gestion des Catégories (`/categories`)

- Barre de recherche en temps réel pour filtrer les catégories
- Tableau paginé : ID, Nom, Description, Nombre de produits, Date de création
- Bouton **Nouvelle Catégorie** pour ajouter
- Bouton **Modifier** (jaune) sur chaque ligne
- Bouton **Supprimer** (rouge) avec confirmation modale
- Compteur de résultats dynamique
- Message de succès/erreur après chaque opération

### Page Formulaire Catégorie (`/categories/ajouter` ou `/categories/modifier/:id`)

- Champs : Nom (obligatoire, 2-100 caractères), Description (optionnel, max 500)
- Compteur de caractères en temps réel
- Validation visuelle (bordure rouge si invalide)
- Loading spinner pendant le chargement en modification
- Messages d'erreur de l'API affichés

### Page Gestion des Produits (`/produits`)

- Barre de recherche en temps réel
- Filtre par catégorie (liste déroulante)
- Filtre par niveau de stock : Tout, Normal (> 10), Faible (1-10), Rupture (0)
- Tableau paginé : ID, Nom, Description, Prix, Quantité (badge coloré), Catégorie, Date
- Bouton de réinitialisation des filtres
- Badges de quantité : vert (> 10), orange (1-10), rouge (0 - Rupture)
- Actions : Modifier, Supprimer avec confirmation

### Page Formulaire Produit (`/produits/ajouter` ou `/produits/modifier/:id`)

- Champs : Nom, Description, Prix, Quantité, Catégorie (liste déroulante)
- Validation : nom obligatoire, prix > 0, quantité >= 0, catégorie obligatoire
- Aperçu de la valeur en stock en temps réel (prix x quantité)
- Indicateur d'alerte si stock faible ou en rupture
- Loading spinner et gestion d'erreurs

### Swagger UI (`/api/swagger-ui.html`)

- Documentation interactive de tous les endpoints
- 3 groupes : Tableau de Bord, Catégories, Produits
- Bouton "Try it out" pour tester directement
- Visualisation des modèles de données et contraintes de validation

---

## 13. Évolutions futures

Le projet est conçu de manière **itérative**. Les modules suivants pourront être ajoutés en tant que nouveaux microservices :

| Module | Description | Priorité |
|--------|-------------|----------|
| Gestion des Patients | Dossiers patients, historique médical | Haute |
| Détection IA | Algorithmes de détection précoce Alzheimer | Haute |
| Gestion des Utilisateurs | Authentification, rôles, permissions (JWT) | Haute |
| Gestion des Rendez-vous | Planification des consultations | Moyenne |
| Notifications | Alertes email/SMS pour les suivis | Basse |
| Gestion documentaire | Upload et stockage de documents médicaux | Basse |

Chaque nouveau module sera un **microservice indépendant** qui s'enregistrera automatiquement dans Eureka et sera accessible via l'API Gateway.

---

## Auteur

Développé dans le cadre du projet **Détection de la Maladie d'Alzheimer**.

**Technologies** : Spring Boot / Spring Cloud / Angular / PostgreSQL

**Architecture** : Microservices
