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
- Gérer un **panier d'achat** (ajout, modification quantité, suppression) avec sessions anonymes
- Gérer les **commandes** (création depuis le panier, suivi de statut, gestion administrative)
- Fournir un **tableau de bord** avec statistiques agrégées (totaux, stock bas, ruptures, valeur totale)
- Assurer la **traçabilité** avec dates de création et de modification
- Fournir une **interface backoffice** professionnelle pour les administrateurs (sous `/admin`)
- Fournir une **interface frontoffice** publique avec catalogue, panier et passage de commande (sous `/`)
- Proposer une **interface bilingue FR/EN** avec bouton de changement de langue et persistance du choix
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
| **Service Stock** | Microservice métier responsable de la gestion des catégories, produits, panier, commandes et tableau de bord. Expose les API REST CRUD et la documentation Swagger. | 8081 |
| **Frontend Angular** | Interface web comprenant un **frontoffice** public (catalogue, panier, commande, détail produit, catégories) et un **backoffice** d'administration (sidebar, tableau de bord, CRUD catégories, produits et gestion des commandes). | 4200 |
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
│           │   │   ├── Produit.java                     # Entité JPA Produit
│           │   │   ├── Panier.java                      # Entité JPA Panier (session)
│           │   │   ├── LignePanier.java                 # Entité JPA Ligne de panier
│           │   │   ├── Commande.java                    # Entité JPA Commande
│           │   │   ├── LigneCommande.java               # Entité JPA Ligne de commande
│           │   │   └── StatutCommande.java              # Enum des statuts de commande
│           │   ├── dto/
│           │   │   ├── CategorieDTO.java                # Objet de transfert Catégorie
│           │   │   ├── ProduitDTO.java                  # Objet de transfert Produit
│           │   │   ├── TableauDeBordDTO.java            # Objet de transfert Dashboard
│           │   │   ├── PanierDTO.java                   # Objet de transfert Panier
│           │   │   ├── LignePanierDTO.java              # Objet de transfert Ligne Panier
│           │   │   ├── CommandeDTO.java                 # Objet de transfert Commande
│           │   │   ├── LigneCommandeDTO.java            # Objet de transfert Ligne Commande
│           │   │   └── CreerCommandeDTO.java            # DTO création commande (checkout)
│           │   ├── repository/
│           │   │   ├── CategorieRepository.java         # Accès données Catégorie
│           │   │   ├── ProduitRepository.java           # Accès données Produit
│           │   │   ├── PanierRepository.java            # Accès données Panier
│           │   │   ├── LignePanierRepository.java       # Accès données Ligne Panier
│           │   │   └── CommandeRepository.java          # Accès données Commande
│           │   ├── service/
│           │   │   ├── CategorieService.java            # Interface service Catégorie
│           │   │   ├── CategorieServiceImpl.java        # Implémentation Catégorie
│           │   │   ├── ProduitService.java              # Interface service Produit
│           │   │   ├── ProduitServiceImpl.java          # Implémentation Produit
│           │   │   ├── TableauDeBordService.java        # Interface service Dashboard
│           │   │   ├── TableauDeBordServiceImpl.java    # Implémentation Dashboard
│           │   │   ├── PanierService.java               # Interface service Panier
│           │   │   ├── PanierServiceImpl.java           # Implémentation Panier
│           │   │   ├── CommandeService.java             # Interface service Commande
│           │   │   └── CommandeServiceImpl.java         # Implémentation Commande
│           │   ├── controleur/
│           │   │   ├── CategorieControleur.java         # REST Controller Catégorie
│           │   │   ├── ProduitControleur.java           # REST Controller Produit
│           │   │   ├── TableauDeBordControleur.java     # REST Controller Dashboard
│           │   │   ├── PanierControleur.java            # REST Controller Panier
│           │   │   └── CommandeControleur.java          # REST Controller Commande
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
│           ├── styles.css                               # Styles globaux (backoffice + frontoffice .fo-*)
│           ├── environments/
│           │   ├── environment.ts                       # Config développement (port 8081)
│           │   └── environment.prod.ts                  # Config production (gateway 8080)
│           └── app/
│               ├── app.component.ts                     # Composant racine (simple <router-outlet>)
│               ├── app.config.ts                        # Configuration application
│               ├── app.routes.ts                        # Routes : frontoffice (/) + backoffice (/admin)
│               ├── modeles/
│               │   ├── categorie.model.ts               # Interface Catégorie
│               │   ├── produit.model.ts                 # Interface Produit
│               │   ├── tableau-de-bord.model.ts         # Interface Tableau de Bord
│               │   ├── panier.model.ts                  # Interface Panier + LignePanier
│               │   └── commande.model.ts                # Interface Commande + CreerCommande
│               ├── services/
│               │   ├── categorie.service.ts             # Service HTTP Catégorie
│               │   ├── produit.service.ts               # Service HTTP Produit
│               │   ├── tableau-de-bord.service.ts       # Service HTTP Dashboard
│               │   ├── panier.service.ts                # Service HTTP Panier (BehaviorSubject)
│               │   ├── commande.service.ts              # Service HTTP Commande
│               │   └── traduction.service.ts            # Service i18n FR/EN (dictionnaire + toggle)
│               └── composants/
│                   ├── layouts/                          # Wrappers de mise en page
│                   │   ├── layout-frontoffice/
│                   │   │   └── layout-frontoffice.component.ts  # Shell public (navbar + footer)
│                   │   └── layout-backoffice/
│                   │       └── layout-backoffice.component.ts   # Shell admin (sidebar + topbar)
│                   ├── frontoffice/                      # Pages publiques
│                   │   ├── accueil/
│                   │   │   └── accueil.component.ts      # Page d'accueil (hero, stats, catégories)
│                   │   ├── catalogue/
│                   │   │   └── catalogue.component.ts    # Catalogue produits (grille, recherche, ajout panier)
│                   │   ├── detail-produit/
│                   │   │   └── detail-produit.component.ts  # Détail produit + similaires + ajout panier
│                   │   ├── categorie-produits/
│                   │   │   └── categorie-produits.component.ts  # Produits par catégorie
│                   │   ├── panier/
│                   │   │   └── panier.component.ts       # Panier d'achat (quantités, total)
│                   │   ├── commander/
│                   │   │   └── commander.component.ts    # Formulaire de commande (checkout)
│                   │   └── confirmation-commande/
│                   │       └── confirmation-commande.component.ts  # Confirmation après commande
│                   ├── partage/
│                   │   └── sidebar/
│                   │       └── sidebar.component.ts     # Sidebar + Topbar (navigation admin)
│                   ├── commande/                         # Gestion commandes (backoffice)
│                   │   ├── liste-commandes/
│                   │   │   └── liste-commandes.component.ts  # Liste commandes (recherche, filtres)
│                   │   └── detail-commande/
│                   │       └── detail-commande.component.ts  # Détail + changement statut
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
| `/api/stock/panier/**` | `/api/panier/**` | `service-stock` |
| `/api/stock/commandes/**` | `/api/commandes/**` | `service-stock` |

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

**Panier** (`Panier.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `sessionId` | String | Obligatoire, unique (identifiant session anonyme) |
| `lignes` | List\<LignePanier\> | Relation OneToMany, cascade ALL |
| `dateCreation` | LocalDateTime | Automatique, non modifiable |
| `dateModification` | LocalDateTime | Automatique |

**LignePanier** (`LignePanier.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `panier` | Panier | ManyToOne, obligatoire |
| `produit` | Produit | ManyToOne, obligatoire |
| `quantite` | Integer | Obligatoire, min 1 |

**Commande** (`Commande.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `reference` | String | Unique, générée (CMD-yyyyMMdd-XXXX) |
| `nomClient` | String | Obligatoire |
| `emailClient` | String | Optionnel |
| `telephoneClient` | String | Optionnel |
| `adresseLivraison` | String | Optionnel |
| `statut` | StatutCommande | Enum : EN_ATTENTE, CONFIRMEE, EN_PREPARATION, EXPEDIEE, LIVREE, ANNULEE |
| `montantTotal` | BigDecimal | Calculé automatiquement |
| `lignes` | List\<LigneCommande\> | Relation OneToMany, cascade ALL |
| `dateCommande` | LocalDateTime | Automatique, non modifiable |

**LigneCommande** (`LigneCommande.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `commande` | Commande | ManyToOne, obligatoire |
| `produit` | Produit | ManyToOne, obligatoire |
| `nomProduit` | String | Snapshot du nom au moment de la commande |
| `prixUnitaire` | BigDecimal | Snapshot du prix au moment de la commande |
| `quantite` | Integer | Obligatoire |
| `sousTotal` | BigDecimal | prixUnitaire × quantité |

**StatutCommande** (`StatutCommande.java`)

| Valeur | Description |
|--------|-------------|
| `EN_ATTENTE` | Commande créée, en attente de confirmation |
| `CONFIRMEE` | Commande confirmée par l'administrateur |
| `EN_PREPARATION` | Commande en cours de préparation |
| `EXPEDIEE` | Commande expédiée |
| `LIVREE` | Commande livrée au client |
| `ANNULEE` | Commande annulée (restauration du stock) |

#### Relations entre les entités

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

┌──────────────┐       1    *    ┌──────────────┐         *    1    ┌──────────────┐
│   Panier     │ ───────────────►│ LignePanier  │ ◄───────────────│   Produit    │
│              │                 │              │                  │              │
│ id           │                 │ id           │                  │              │
│ sessionId    │                 │ panier_id    │                  │              │
│ dateCreation │                 │ produit_id   │                  │              │
│              │                 │ quantite     │                  │              │
└──────────────┘                 └──────────────┘                  └──────────────┘

┌──────────────┐       1    *    ┌───────────────┐        *    1    ┌──────────────┐
│  Commande    │ ───────────────►│LigneCommande  │ ◄───────────────│   Produit    │
│              │                 │               │                  │              │
│ id           │                 │ id            │                  │              │
│ reference    │                 │ commande_id   │                  │              │
│ nomClient    │                 │ produit_id    │                  │              │
│ statut       │                 │ nomProduit    │                  │              │
│ montantTotal │                 │ prixUnitaire  │                  │              │
│ dateCommande │                 │ quantite      │                  │              │
└──────────────┘                 │ sousTotal     │                  │              │
                                 └───────────────┘                  └──────────────┘

- Une catégorie peut contenir plusieurs produits (OneToMany)
- Un produit appartient à une seule catégorie (ManyToOne)
- La suppression d'une catégorie entraîne la suppression de ses produits (CASCADE)
- Un panier contient plusieurs lignes de panier (OneToMany)
- Chaque ligne de panier référence un produit avec une quantité
- Une commande contient plusieurs lignes de commande (snapshots)
- L'annulation d'une commande restaure le stock des produits
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
| `IllegalArgumentException` | 400 | Erreur de logique métier (stock insuffisant, panier vide, etc.) |
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
- **Layout Wrapper Pattern** : Chaque partie (frontoffice/backoffice) a son propre composant layout

### 6.2 - Architecture Frontoffice / Backoffice

L'application est divisée en **deux parties** coexistant dans le même projet Angular, chacune avec son propre layout :

```
http://localhost:4200/
│
├── /                     ─── LayoutFrontofficeComponent (navbar publique + footer)
│   ├── /                       → AccueilComponent (page d'accueil)
│   ├── /catalogue              → CatalogueComponent (grille de produits, ajout au panier)
│   ├── /catalogue/:id          → DetailProduitComponent (détail produit, ajout au panier)
│   ├── /categories/:id         → CategorieProduitsComponent (produits par catégorie)
│   ├── /panier                 → PanierComponent (panier d'achat)
│   ├── /commander              → CommanderComponent (formulaire de commande)
│   └── /commande/:ref          → ConfirmationCommandeComponent (confirmation)
│
├── /admin                ─── LayoutBackofficeComponent (sidebar + topbar + footer)
│   ├── /admin                  → TableauDeBordComponent (dashboard)
│   ├── /admin/categories       → ListeCategoriesComponent (CRUD)
│   ├── /admin/categories/ajouter       → FormulaireCategorieComponent
│   ├── /admin/categories/modifier/:id  → FormulaireCategorieComponent
│   ├── /admin/produits         → ListeProduitsComponent (CRUD)
│   ├── /admin/produits/ajouter         → FormulaireProduitComponent
│   ├── /admin/produits/modifier/:id    → FormulaireProduitComponent
│   ├── /admin/commandes        → ListeCommandesComponent (gestion)
│   └── /admin/commandes/:id    → DetailCommandeComponent (détail + changement statut)
│
└── /**                   ─── Redirection vers /
```

#### Layout Frontoffice (site public)

- **Navbar horizontale** : Logo, liens Accueil / Catalogue / Panier (avec badge compteur), bouton "Administration", **bouton FR/EN**
- **Zone de contenu** : Pages publiques en lecture seule
- **Footer** : Branding projet + badges technologies
- **Responsive** : Menu hamburger sur mobile

#### Layout Backoffice (administration)

- **Sidebar fixe** (gauche) : Navigation avec icônes, sections groupées (Principal, Gestion, Actions Rapides), lien "Voir le site" pour retourner au frontoffice
- **Topbar** (haut) : Breadcrumbs dynamiques, **bouton FR/EN**, horloge en temps réel
- **Zone de contenu** : Zone scrollable avec padding et max-width
- **Responsive** : Sidebar en overlay sur mobile avec bouton hamburger

### 6.3 - Composants

#### Frontoffice (pages publiques, lecture seule)

| Composant | Route | Description |
|-----------|-------|-------------|
| `LayoutFrontofficeComponent` | - | Shell public : navbar horizontale (avec panier badge) + router-outlet + footer |
| `AccueilComponent` | `/` | Page d'accueil : hero section, 3 stats (produits, catégories, valeur stock), grille catégories, 6 derniers produits |
| `CatalogueComponent` | `/catalogue` | Grille de produits responsive (3/2/1 colonnes), recherche, filtre catégorie, badges stock, bouton "Ajouter au panier" |
| `DetailProduitComponent` | `/catalogue/:id` | Détail complet : prix, stock, catégorie, description, sélecteur quantité + "Ajouter au panier", produits similaires |
| `CategorieProduitsComponent` | `/categories/:id` | En-tête catégorie + grille de produits filtrés, recherche dans la catégorie |
| `PanierComponent` | `/panier` | Panier d'achat : liste articles avec contrôles quantité +/-, suppression, sous-totaux, total, bouton "Commander" |
| `CommanderComponent` | `/commander` | Formulaire checkout : nom (requis), email, téléphone, adresse + récapitulatif commande |
| `ConfirmationCommandeComponent` | `/commande/:ref` | Page de confirmation : icône succès, référence commande, détails, boutons "Continuer" / "Accueil" |

#### Backoffice (administration, CRUD)

| Composant | Route | Description |
|-----------|-------|-------------|
| `LayoutBackofficeComponent` | - | Shell admin : sidebar + topbar + router-outlet + footer |
| `SidebarComponent` | - | Sidebar de navigation + topbar avec breadcrumbs et horloge |
| `TableauDeBordComponent` | `/admin` | Dashboard avec 4 cartes stats, alertes rupture, actions rapides, dernières données |
| `ListeCategoriesComponent` | `/admin/categories` | Tableau avec recherche, pagination, actions CRUD |
| `FormulaireCategorieComponent` | `/admin/categories/ajouter` | Formulaire de création de catégorie |
| `FormulaireCategorieComponent` | `/admin/categories/modifier/:id` | Formulaire de modification de catégorie |
| `ListeProduitsComponent` | `/admin/produits` | Tableau avec recherche, filtres (catégorie, stock), pagination, actions CRUD |
| `FormulaireProduitComponent` | `/admin/produits/ajouter` | Formulaire de création de produit avec aperçu valeur stock |
| `FormulaireProduitComponent` | `/admin/produits/modifier/:id` | Formulaire de modification de produit |
| `ListeCommandesComponent` | `/admin/commandes` | Tableau avec recherche, filtre par statut, pagination, bouton "Voir" pour chaque commande |
| `DetailCommandeComponent` | `/admin/commandes/:id` | Détail commande : infos client, lignes articles, total + changement de statut (dropdown + bouton "Appliquer") |

### 6.4 - Services

| Service | Méthodes | Description |
|---------|----------|-------------|
| `CategorieService` | `listerTout()`, `obtenirParId()`, `creer()`, `modifier()`, `supprimer()` | Appels HTTP vers `/api/categories` |
| `ProduitService` | `listerTout()`, `listerParCategorie()`, `obtenirParId()`, `creer()`, `modifier()`, `supprimer()` | Appels HTTP vers `/api/produits` |
| `TableauDeBordService` | `obtenirTableauDeBord()` | Appel HTTP unique vers `/api/tableau-de-bord` |
| `PanierService` | `chargerPanier()`, `ajouterProduit()`, `modifierQuantite()`, `supprimerProduit()`, `viderPanier()` | Appels HTTP vers `/api/panier` + état réactif via `BehaviorSubject` |
| `CommandeService` | `creerCommande()`, `listerTout()`, `obtenirParId()`, `obtenirParReference()`, `modifierStatut()` | Appels HTTP vers `/api/commandes` |
| `TraductionService` | `tr()`, `setLang()`, `toggleLang()` | Service i18n FR/EN : dictionnaire centralisé (~350 clés), persistance localStorage |

### 6.5 - Environnements

| Fichier | API URL | Usage |
|---------|---------|-------|
| `environment.ts` | `http://localhost:8081/api` | Développement (appel direct au service-stock) |
| `environment.prod.ts` | `http://localhost:8080/api/stock` | Production (via API Gateway) |

### 6.6 - Fonctionnalités de l'interface

**Frontoffice (site public)** :
- Page d'accueil avec hero section, statistiques, catégories et produits récents
- Catalogue de produits en grille responsive avec recherche, filtre par catégorie et bouton "Ajouter au panier"
- Page détail produit avec informations complètes, sélecteur de quantité, bouton "Ajouter au panier" et produits similaires
- Page catégorie avec produits filtrés et recherche
- Panier d'achat avec contrôles quantité, suppression, sous-totaux et total
- Formulaire de commande (checkout) avec validation et récapitulatif
- Page de confirmation de commande avec référence et détails
- Navigation : navbar horizontale avec icône panier (badge compteur), bouton "Administration" vers le backoffice

**Backoffice - Tableau de bord** :
- 4 cartes statistiques : catégories, produits, stock faible (≤ 10), valeur totale du stock (TND)
- Alerte rouge si des produits sont en rupture de stock
- 3 boutons d'actions rapides (nouvelle catégorie, nouveau produit, voir le stock)
- Aperçu des 5 dernières catégories et 5 derniers produits
- Loading spinner pendant le chargement
- Gestion d'erreur avec bouton "Réessayer"

**Backoffice - Listes (Catégories / Produits)** :
- Barre de recherche en temps réel
- Filtre par catégorie (produits)
- Filtre par niveau de stock : normal, faible, rupture (produits)
- Pagination client-side (8 catégories / 10 produits par page)
- Bouton de réinitialisation des filtres
- Loading spinner pendant le chargement
- États vides illustrés avec boutons d'action

**Backoffice - Formulaires** :
- Validation en temps réel (champs obligatoires, longueur, format)
- Compteur de caractères (description)
- Aperçu de la valeur en stock en temps réel (formulaire produit)
- Indicateur de stock faible / rupture (formulaire produit)
- Spinner sur le bouton pendant la soumission
- Messages d'erreur de l'API affichés à l'utilisateur

**Traduction FR/EN (i18n)** :
- Bouton pill-shaped avec globe icon (FR | EN) dans la navbar frontoffice et la topbar backoffice
- **Tous les textes** de l'application traduits : titres, labels, messages, placeholders, validations, alertes, pagination
- `TraductionService` centralisé avec dictionnaire de ~160 clés organisées par composant
- Persistance du choix de langue dans `localStorage` (survit au rechargement de page)
- Interpolation de paramètres dynamiques : `{nom}`, `{n}`, etc.
- Format de date adapté au locale (`fr-FR` / `en-US`) dans la topbar
- Traductions professionnelles et naturelles (pas de traduction littérale mot-à-mot)

**UI/UX** :
- Design professionnel avec CSS custom properties (thème cohérent)
- Styles frontoffice isolés avec préfixe `.fo-*` (pas de conflit avec le backoffice)
- Animations : fade-in pages, slide-down alertes, animation modale
- Badges colorés pour les quantités : vert (> 10), orange (1-10), rouge (0)
- Modale de confirmation avant chaque suppression
- Messages de succès/erreur après chaque opération
- Design responsive (desktop, tablette, mobile) pour les deux parties
- Bouton de langue avec design moderne (pill shape, backdrop blur, animation de transition)

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

#### Table `paniers`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `session_id` | VARCHAR(255) | NOT NULL, UNIQUE |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `date_modification` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### Table `lignes_panier`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `panier_id` | BIGINT | FOREIGN KEY → paniers(id) ON DELETE CASCADE |
| `produit_id` | BIGINT | FOREIGN KEY → produits(id) ON DELETE CASCADE |
| `quantite` | INTEGER | NOT NULL, CHECK >= 1 |
| **Contrainte** | | UNIQUE (panier_id, produit_id) |

#### Table `commandes`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `reference` | VARCHAR(50) | NOT NULL, UNIQUE |
| `nom_client` | VARCHAR(100) | NOT NULL |
| `email_client` | VARCHAR(255) | - |
| `telephone_client` | VARCHAR(20) | - |
| `adresse_livraison` | VARCHAR(1000) | - |
| `statut` | VARCHAR(20) | NOT NULL, DEFAULT 'EN_ATTENTE' |
| `montant_total` | DECIMAL(12,2) | NOT NULL |
| `date_commande` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### Table `lignes_commande`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `commande_id` | BIGINT | FOREIGN KEY → commandes(id) ON DELETE CASCADE |
| `produit_id` | BIGINT | FOREIGN KEY → produits(id) |
| `nom_produit` | VARCHAR(100) | NOT NULL (snapshot) |
| `prix_unitaire` | DECIMAL(10,2) | NOT NULL (snapshot) |
| `quantite` | INTEGER | NOT NULL |
| `sous_total` | DECIMAL(12,2) | NOT NULL |

#### Index de performance

| Index | Table | Colonne |
|-------|-------|---------|
| `idx_produit_categorie` | produits | categorie_id |
| `idx_produit_nom` | produits | nom |
| `idx_categorie_nom` | categories | nom |
| `idx_panier_session` | paniers | session_id |
| `idx_ligne_panier_panier` | lignes_panier | panier_id |
| `idx_commande_reference` | commandes | reference |
| `idx_commande_statut` | commandes | statut |
| `idx_ligne_commande_commande` | lignes_commande | commande_id |

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

### 8.4 - Panier (`/api/panier`)

| Méthode | Endpoint | Description | Réponse |
|---------|----------|-------------|---------|
| `GET` | `/api/panier/{sessionId}` | Obtenir le panier d'une session | 200 + JSON Object |
| `POST` | `/api/panier/{sessionId}/produits/{produitId}?quantite=1` | Ajouter un produit au panier | 200 + JSON Object |
| `PUT` | `/api/panier/{sessionId}/produits/{produitId}?quantite=3` | Modifier la quantité d'un produit | 200 + JSON Object |
| `DELETE` | `/api/panier/{sessionId}/produits/{produitId}` | Supprimer un produit du panier | 200 + JSON Object |
| `DELETE` | `/api/panier/{sessionId}` | Vider entièrement le panier | 204 No Content |

**Exemple de réponse (GET)** :
```json
{
  "sessionId": "session-1708123456-abc1234",
  "lignes": [
    {
      "produitId": 1,
      "produitNom": "Donépézil 10mg",
      "produitPrix": 4500.00,
      "produitQuantiteStock": 150,
      "categorieNom": "Médicaments",
      "quantite": 2,
      "sousTotal": 9000.00
    }
  ],
  "nombreArticles": 2,
  "montantTotal": 9000.00
}
```

**Logique métier** :
- Le panier est créé automatiquement lors du premier ajout de produit
- La quantité est validée contre le stock disponible
- L'ajout d'un produit déjà dans le panier incrémente la quantité
- La session est identifiée par un ID généré côté client (stocké dans `localStorage`)

### 8.5 - Commandes (`/api/commandes`)

| Méthode | Endpoint | Description | Corps de la requête | Réponse |
|---------|----------|-------------|---------------------|---------|
| `POST` | `/api/commandes` | Créer une commande depuis le panier | JSON CreerCommandeDTO | 201 + JSON Object |
| `GET` | `/api/commandes` | Lister toutes les commandes (optionnel : `?statut=EN_ATTENTE`) | - | 200 + JSON Array |
| `GET` | `/api/commandes/{id}` | Obtenir une commande par ID | - | 200 + JSON Object |
| `GET` | `/api/commandes/reference/{reference}` | Obtenir une commande par référence | - | 200 + JSON Object |
| `PATCH` | `/api/commandes/{id}/statut?statut=CONFIRMEE` | Modifier le statut d'une commande | - | 200 + JSON Object |

**Exemple de corps JSON (POST)** :
```json
{
  "nomClient": "Ahmed Ben Salah",
  "emailClient": "ahmed@example.com",
  "telephoneClient": "+216 55 123 456",
  "adresseLivraison": "Tunis, Rue de la Liberté",
  "sessionId": "session-1708123456-abc1234"
}
```

**Exemple de réponse (GET)** :
```json
{
  "id": 1,
  "reference": "CMD-20260221-A7B3",
  "nomClient": "Ahmed Ben Salah",
  "emailClient": "ahmed@example.com",
  "telephoneClient": "+216 55 123 456",
  "adresseLivraison": "Tunis, Rue de la Liberté",
  "statut": "EN_ATTENTE",
  "montantTotal": 13500.00,
  "nombreArticles": 3,
  "dateCommande": "2026-02-21T14:30:00",
  "lignes": [
    {
      "produitId": 1,
      "nomProduit": "Donépézil 10mg",
      "prixUnitaire": 4500.00,
      "quantite": 3,
      "sousTotal": 13500.00
    }
  ]
}
```

**Logique métier** :
- La création de commande valide le stock de chaque produit, décrémente les quantités, génère une référence unique (`CMD-yyyyMMdd-XXXX`), crée des snapshots des lignes, et vide le panier
- L'annulation d'une commande (`statut = ANNULEE`) restaure automatiquement le stock des produits
- Les statuts possibles : `EN_ATTENTE` → `CONFIRMEE` → `EN_PREPARATION` → `EXPEDIEE` → `LIVREE` (ou `ANNULEE` à tout moment)

### 8.6 - Codes de réponse HTTP

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
| **Panier** | Gestion du panier d'achat par session | 5 endpoints |
| **Commandes** | Gestion des commandes et statuts | 5 endpoints |

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

### Vérification des services

| Service | URL | Attendu |
|---------|-----|---------|
| Eureka | http://localhost:8761 | Dashboard avec les services enregistrés |
| API Gateway | http://localhost:8080 | Passerelle active |
| Service Stock | http://localhost:8081/api/categories | Réponse JSON |
| Swagger UI | http://localhost:8081/api/swagger-ui.html | Documentation API interactive |

### Vérification du Frontend - URLs à tester

#### Frontoffice (site public)

| URL | Page | Ce qu'il faut vérifier |
|-----|------|------------------------|
| http://localhost:4200/ | Accueil | Hero section avec titre, 3 cartes stats (produits, catégories, valeur stock), grille de catégories cliquables, 6 derniers produits en cartes |
| http://localhost:4200/catalogue | Catalogue | Grille de produits (3 colonnes), barre de recherche, filtre par catégorie (dropdown), badges de stock colorés (vert/jaune/rouge) |
| http://localhost:4200/catalogue/1 | Détail Produit | Nom, description, prix (TND), indicateur de stock, lien catégorie cliquable, section "Produits similaires" |
| http://localhost:4200/categories/1 | Produits par Catégorie | En-tête avec nom + description de la catégorie, grille de produits filtrés, recherche dans la catégorie |
| http://localhost:4200/panier | Panier | Liste des articles avec contrôles quantité +/-, suppression, sous-totaux, total, bouton "Commander" |
| http://localhost:4200/commander | Commande | Formulaire client (nom*, email, téléphone, adresse) + récapitulatif commande |
| http://localhost:4200/commande/CMD-xxx | Confirmation | Page de succès avec référence, détails commande, boutons "Continuer" / "Accueil" |

#### Backoffice (administration)

| URL | Page | Ce qu'il faut vérifier |
|-----|------|------------------------|
| http://localhost:4200/admin | Tableau de Bord | Sidebar à gauche, 4 cartes stats, alertes stock, actions rapides, données récentes |
| http://localhost:4200/admin/categories | Liste Catégories | Tableau avec recherche, pagination (8/page), boutons Modifier/Supprimer |
| http://localhost:4200/admin/categories/ajouter | Nouvelle Catégorie | Formulaire avec validation (nom requis, 2-100 chars, description max 500) |
| http://localhost:4200/admin/categories/modifier/1 | Modifier Catégorie | Formulaire pré-rempli avec les données existantes |
| http://localhost:4200/admin/produits | Liste Produits | Tableau avec recherche, filtre catégorie, filtre stock, pagination (10/page) |
| http://localhost:4200/admin/produits/ajouter | Nouveau Produit | Formulaire avec dropdown catégorie, validation prix/quantité |
| http://localhost:4200/admin/produits/modifier/1 | Modifier Produit | Formulaire pré-rempli avec les données existantes |
| http://localhost:4200/admin/commandes | Commandes | Tableau avec recherche, filtre par statut (6 statuts), pagination, bouton "Voir" |
| http://localhost:4200/admin/commandes/1 | Détail Commande | Infos client, lignes articles, total + dropdown changement de statut |

#### Navigation entre Frontoffice et Backoffice

| Action | Depuis | Vers |
|--------|--------|------|
| Cliquer **"Administration"** dans la navbar publique | Frontoffice (n'importe quelle page) | `/admin` (tableau de bord) |
| Cliquer **"Voir le site"** dans le footer de la sidebar | Backoffice (n'importe quelle page) | `/` (accueil frontoffice) |

### Parcours de test complet

1. Ouvrir `http://localhost:4200/` → page d'accueil frontoffice avec hero, stats, catégories et derniers produits
2. Cliquer sur **"Parcourir le Catalogue"** → redirection vers `/catalogue` avec la grille de produits
3. Taper un nom dans la barre de recherche → les produits se filtrent en temps réel
4. Sélectionner une catégorie dans le dropdown → les produits se filtrent par catégorie
5. Cliquer sur **"Ajouter au panier"** sur une carte produit → le badge du panier dans la navbar s'incrémente
6. Cliquer sur une carte produit → page détail `/catalogue/:id` avec infos complètes, sélecteur de quantité et bouton "Ajouter au panier"
7. Ajuster la quantité et cliquer **"Ajouter au panier"** → confirmation visuelle (icône check)
8. Cliquer sur **"Panier"** dans la navbar → page `/panier` avec la liste des articles, contrôles quantité +/-, total
9. Modifier une quantité avec les boutons +/- → le sous-total et le total se mettent à jour
10. Cliquer **"Passer la commande"** → page `/commander` avec formulaire client et récapitulatif
11. Remplir le nom (obligatoire) et cliquer **"Confirmer la commande"** → redirection vers `/commande/CMD-xxx` avec confirmation
12. Vérifier la page de confirmation : icône succès, référence, détails de la commande
13. Cliquer sur le lien de catégorie dans un détail → page `/categories/:id` avec les produits de cette catégorie
14. Cliquer **"Administration"** dans la navbar → redirection vers `/admin` avec le dashboard backoffice
15. Vérifier que la sidebar affiche les liens vers `/admin/categories`, `/admin/produits`, `/admin/commandes`
16. Naviguer vers `/admin/commandes` → la commande créée apparaît avec le statut "En attente"
17. Cliquer **"Voir"** sur une commande → page détail avec infos client, articles, total
18. Changer le statut en "Confirmée" et cliquer **"Appliquer"** → message de succès, badge mis à jour
19. Changer le statut en "Annulée" → le stock des produits est restauré automatiquement
20. Naviguer vers `/admin/categories` → le CRUD fonctionne (ajouter, modifier, supprimer)
21. Naviguer vers `/admin/produits` → le CRUD fonctionne (ajouter, modifier, supprimer)
22. Cliquer **"Voir le site"** dans le footer de la sidebar → retour au frontoffice `/`
23. Cliquer le bouton **FR/EN** dans la navbar → toute l'interface bascule en anglais (titres, labels, panier, commande, filtres, messages)
24. Naviguer vers `/admin` → le backoffice est aussi en anglais (dashboard, sidebar, commandes, breadcrumbs, formulaires)
25. Recharger la page → la langue anglaise est conservée (persistance localStorage)
26. Cliquer **EN → FR** → retour au français immédiat sans rechargement

---

## 12. Captures et fonctionnalités

### Frontoffice (site public)

#### Page Accueil (`/`)

- Navbar horizontale avec liens Accueil, Catalogue, Administration, **bouton FR/EN** (pill shape)
- Hero section avec gradient, titre du projet et bouton "Parcourir le Catalogue"
- 3 cartes statistiques : nombre de produits, nombre de catégories, valeur totale du stock (TND)
- Grille de catégories cliquables avec icône, description et nombre de produits
- Section "Derniers Produits" : 6 cartes produits avec prix, badge de stock, lien vers le détail
- Footer avec branding et badges technologies (Angular 17, Spring Boot, PostgreSQL)

#### Page Catalogue (`/catalogue`)

- Grille responsive de cartes produits (3 colonnes desktop, 2 tablette, 1 mobile)
- Barre de recherche pour filtrer les produits par nom en temps réel
- Dropdown de filtre par catégorie
- Chaque carte affiche : nom, catégorie (badge), prix (TND), statut stock (En stock / Stock faible / Rupture)
- Clic sur une carte → page détail du produit
- État vide avec bouton de réinitialisation si aucun résultat
- Loading spinner pendant le chargement

#### Page Détail Produit (`/catalogue/:id`)

- Breadcrumb : Catalogue > Nom du produit
- Layout 2 colonnes : placeholder image + informations
- Informations complètes : nom, description, catégorie (lien cliquable), prix (TND)
- Indicateur de disponibilité : "En stock (X unités)" / "Stock faible (X unités)" / "Rupture de stock"
- Bouton "Retour au catalogue"
- Section "Produits similaires" : jusqu'à 4 produits de la même catégorie

#### Page Produits par Catégorie (`/categories/:id`)

- Breadcrumb : Accueil > Nom de la catégorie
- En-tête avec icône, nom et description de la catégorie
- Barre de recherche dans la catégorie + bouton "Tout parcourir"
- Grille de produits identique au catalogue
- État vide avec lien vers le catalogue complet

#### Page Panier (`/panier`)

- Breadcrumb : Accueil > Mon Panier
- Liste des articles avec icône produit, nom, catégorie, prix unitaire, stock disponible
- Contrôles quantité : boutons +/- avec limites (min 1, max stock disponible)
- Bouton de suppression par article + bouton "Vider le panier"
- Sidebar récapitulatif : nombre d'articles, sous-total, total (TND)
- Bouton "Passer la commande" → `/commander`
- Bouton "Continuer les achats" → `/catalogue`
- État vide avec bouton "Parcourir le catalogue"

#### Page Commander (`/commander`)

- Breadcrumb : Accueil > Panier > Finaliser la commande
- Formulaire client : nom complet (requis), email (validation format), téléphone, adresse de livraison
- Validation en temps réel avec messages d'erreur
- Sidebar récapitulatif : liste des produits avec quantités et prix, total
- Bouton "Confirmer la commande" avec spinner pendant le traitement
- Gestion d'erreurs (stock insuffisant, erreur serveur)

#### Page Confirmation (`/commande/:ref`)

- Icône de succès animée
- Référence de commande en grand format (CMD-yyyyMMdd-XXXX)
- Carte de détails : nom client, statut "En attente", lignes de commande avec totaux
- Boutons : "Continuer les achats" → `/catalogue`, "Accueil" → `/`

### Backoffice (administration)

#### Page Tableau de Bord (`/admin`)

- Layout backoffice avec sidebar fixe (gauche) et topbar (breadcrumbs + **bouton FR/EN** + horloge)
- 4 cartes statistiques : catégories, produits, stock faible (≤ 10), valeur totale stock (TND)
- Alerte rouge si produits en rupture de stock
- 3 boutons d'actions rapides : Nouvelle Catégorie, Nouveau Produit, Voir tout le Stock
- Aperçu des 5 dernières catégories avec nombre de produits
- Aperçu des 5 derniers produits avec prix (TND) et indicateur de stock coloré

#### Page Gestion des Catégories (`/admin/categories`)

- Barre de recherche en temps réel pour filtrer les catégories
- Tableau paginé : ID, Nom, Description, Nombre de produits, Date de création
- Bouton **Nouvelle Catégorie** pour ajouter
- Bouton **Modifier** (jaune) sur chaque ligne
- Bouton **Supprimer** (rouge) avec confirmation modale
- Compteur de résultats dynamique
- Message de succès/erreur après chaque opération

#### Page Formulaire Catégorie (`/admin/categories/ajouter` ou `/admin/categories/modifier/:id`)

- Champs : Nom (obligatoire, 2-100 caractères), Description (optionnel, max 500)
- Compteur de caractères en temps réel
- Validation visuelle (bordure rouge si invalide)
- Loading spinner pendant le chargement en modification
- Messages d'erreur de l'API affichés

#### Page Gestion des Produits (`/admin/produits`)

- Barre de recherche en temps réel
- Filtre par catégorie (liste déroulante)
- Filtre par niveau de stock : Tout, Normal (> 10), Faible (1-10), Rupture (0)
- Tableau paginé : ID, Nom, Description, Prix, Quantité (badge coloré), Catégorie, Date
- Bouton de réinitialisation des filtres
- Badges de quantité : vert (> 10), orange (1-10), rouge (0 - Rupture)
- Actions : Modifier, Supprimer avec confirmation

#### Page Formulaire Produit (`/admin/produits/ajouter` ou `/admin/produits/modifier/:id`)

- Champs : Nom, Description, Prix, Quantité, Catégorie (liste déroulante)
- Validation : nom obligatoire, prix > 0, quantité >= 0, catégorie obligatoire
- Aperçu de la valeur en stock en temps réel (prix x quantité)
- Indicateur d'alerte si stock faible ou en rupture
- Loading spinner et gestion d'erreurs

#### Page Gestion des Commandes (`/admin/commandes`)

- Barre de recherche par référence ou nom client en temps réel
- Filtre par statut : Tous, En attente, Confirmée, En préparation, Expédiée, Livrée, Annulée
- Tableau paginé : Référence, Client (nom + email), Articles, Montant (TND), Statut (badge coloré), Date
- Bouton "Voir" pour accéder au détail de chaque commande
- Compteur de résultats dynamique
- Loading spinner pendant le chargement

#### Page Détail Commande (`/admin/commandes/:id`)

- Carte informations : nom client, date de commande, email, téléphone, adresse, badge statut
- Tableau des articles commandés : nom produit, prix unitaire, quantité, sous-total, total
- Carte de changement de statut : dropdown avec 6 statuts + bouton "Appliquer"
- Messages de succès/erreur après modification
- Bouton "Retour à la liste"

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
