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
- **Uploader des images produit** par glisser-déposer (drag & drop) avec stockage sur disque, validation (JPEG/PNG/GIF/WebP, 5 Mo max) et aperçu instantané
- Gérer un **panier d'achat** (ajout, modification quantité, suppression) avec sessions anonymes et **expiration automatique** des paniers inactifs
- Gérer les **commandes** (création depuis le panier, suivi de statut, gestion administrative)
- Fournir un **tableau de bord** avec statistiques agrégées (totaux, stock bas, ruptures, valeur totale, commandes, chiffre d'affaires)
- Assurer la **traçabilité** avec dates de création et de modification
- Fournir une **interface backoffice** professionnelle pour les administrateurs (sous `/admin`)
- Fournir une **interface frontoffice** publique avec catalogue, panier et passage de commande (sous `/`)
- Fournir une **analyse de stock avancée** avec classification ABC, indicateurs de performance (KPI), tendance des ventes, scores de santé produit et prévisions de réapprovisionnement
- Proposer une **interface bilingue FR/EN** avec bouton de changement de langue et persistance du choix
- Offrir un **mode sombre / clair** (Dark / Light mode) avec persistance du choix dans `localStorage`
- Exposer des **API REST documentées** (Swagger/OpenAPI) pour l'intégration avec les autres modules
- **Servir les images uploadées** via un endpoint statique (`/uploads/**`) avec configuration CORS

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
                                    ┌────────┴─────────┐
                                    │                  │
                                    ▼                  ▼
                           ┌──────────────┐   ┌──────────────┐
                           │  PostgreSQL   │   │   uploads/   │
                           │  alzheimer_  │   │  (images     │
                           │  stock       │   │   produits)   │
                           │  Port: 5432  │   │              │
                           └──────────────┘   └──────────────┘
```

### Rôle de chaque composant

| Composant | Rôle | Port |
|-----------|------|------|
| **Eureka Server** | Registre de découverte de services. Tous les microservices s'y enregistrent automatiquement au démarrage. Permet la résolution dynamique des adresses. | 8761 |
| **API Gateway** | Point d'entrée unique pour le frontend en production. Route les requêtes vers les microservices. Gère le CORS et le load balancing. | 8080 |
| **Service Stock** | Microservice métier responsable de la gestion des catégories, produits (avec upload d'images), panier (avec expiration automatique), commandes, tableau de bord, analyse de stock et chatbot IA. Expose les API REST CRUD, l'upload de fichiers, l'analyse avancée (KPIs, ABC, tendances), le chatbot IA (OpenRouter) et la documentation Swagger. | 8081 |
| **Python Analytics** | Service d'analyse prédictive avec Machine Learning. Analyse de péremption (rule-based), prévision de demande (LinearRegression), détection d'anomalies (IsolationForest). Se connecte à la même base PostgreSQL en lecture seule. | 8083 |
| **Frontend Angular** | Interface web comprenant un **frontoffice** public (catalogue, panier, commande, détail produit, catégories, chatbot IA) et un **backoffice** d'administration (sidebar, tableau de bord, CRUD catégories/produits, gestion commandes, analyse de stock, prédictions IA Python). Supporte le mode sombre/clair et le bilingue FR/EN. | 4200 |
| **PostgreSQL** | Système de gestion de base de données relationnelle stockant les catégories, produits, paniers, commandes et leurs lignes. | 5432 |
| **uploads/** | Répertoire de stockage physique des images produit sur le disque. Créé automatiquement au démarrage du service. Les fichiers sont nommés avec un UUID pour éviter les collisions. | - |

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
| Spring Multipart | 3.2.4 | Upload de fichiers (images produit, 5 Mo max) |
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

### Service d'Analyse Prédictive (Python)

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| Python | 3.10+ | Langage pour le machine learning |
| FastAPI | 0.115 | Framework API REST (port 8083) |
| Pandas | 2.2 | Manipulation et analyse de données |
| Scikit-learn | 1.5 | Machine Learning (régression linéaire, Isolation Forest) |
| SQLAlchemy | 2.0 | Connexion PostgreSQL (lecture seule) |

### Chatbot IA (OpenRouter)

| Technologie | Détail |
|-------------|--------|
| API Provider | OpenRouter (modèles gratuits) |
| Modèle principal | Qwen 3.6 Plus |
| Modèles fallback | Arcee Trinity, Nvidia Nemotron, Liquid LFM |
| Protocole | API compatible OpenAI (REST) |
| Intégration backend | Java `HttpClient` → OpenRouter API |
| Frontend | Widget de chat flottant Angular |
| Fonctionnalités | Conseil pharmaceutique, suggestion de produits du catalogue, bilingue FR/EN |

### Base de données

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| PostgreSQL | 15+ | SGBD relationnel principal |
| Hibernate | 6.4 | ORM pour le mapping objet-relationnel (Java) |
| SQLAlchemy | 2.0 | ORM pour le service Python (lecture seule) |

---

## 4. Structure du projet

```
alzheimer-stock-clean/
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
│       ├── uploads/                                     # Images produit (gitignored, créé auto)
│       └── src/main/
│           ├── java/com/alzheimer/stock/
│           │   ├── ServiceStockApplication.java         # Point d'entrée
│           │   ├── config/
│           │   │   ├── OpenApiConfig.java               # Configuration Swagger/OpenAPI
│           │   │   ├── WebConfig.java                   # Servir /uploads/** + CORS images
│           │   │   └── SchedulingConfig.java            # Activation des tâches planifiées
│           │   ├── entite/
│           │   │   ├── Categorie.java                   # Entité JPA Catégorie
│           │   │   ├── Produit.java                     # Entité JPA Produit (avec imageUrl)
│           │   │   ├── Panier.java                      # Entité JPA Panier (session + expiration)
│           │   │   ├── LignePanier.java                 # Entité JPA Ligne de panier
│           │   │   ├── Commande.java                    # Entité JPA Commande
│           │   │   ├── LigneCommande.java               # Entité JPA Ligne de commande
│           │   │   └── StatutCommande.java              # Enum des statuts de commande
│           │   ├── dto/
│           │   │   ├── CategorieDTO.java                # Objet de transfert Catégorie
│           │   │   ├── ProduitDTO.java                  # Objet de transfert Produit (avec imageUrl)
│           │   │   ├── TableauDeBordDTO.java            # Objet de transfert Dashboard
│           │   │   ├── PanierDTO.java                   # Objet de transfert Panier (avec expiration)
│           │   │   ├── LignePanierDTO.java              # Objet de transfert Ligne Panier
│           │   │   ├── CommandeDTO.java                 # Objet de transfert Commande
│           │   │   ├── LigneCommandeDTO.java            # Objet de transfert Ligne Commande
│           │   │   ├── CreerCommandeDTO.java            # DTO création commande (checkout)
│           │   │   └── AnalyseStockDTO.java             # DTO analyse de stock (KPIs, ABC, tendances)
│           │   ├── repository/
│           │   │   ├── CategorieRepository.java         # Accès données Catégorie
│           │   │   ├── ProduitRepository.java           # Accès données Produit
│           │   │   ├── PanierRepository.java            # Accès données Panier (+ requêtes expiration)
│           │   │   ├── LignePanierRepository.java       # Accès données Ligne Panier
│           │   │   ├── LigneCommandeRepository.java     # Accès données Ligne Commande (nullify refs)
│           │   │   └── CommandeRepository.java          # Accès données Commande
│           │   ├── service/
│           │   │   ├── CategorieService.java            # Interface service Catégorie
│           │   │   ├── CategorieServiceImpl.java        # Implémentation Catégorie
│           │   │   ├── ProduitService.java              # Interface service Produit (+ image upload)
│           │   │   ├── ProduitServiceImpl.java          # Implémentation Produit (+ image upload)
│           │   │   ├── FichierStorageService.java       # Stockage fichiers (upload, validation, suppression)
│           │   │   ├── TableauDeBordService.java        # Interface service Dashboard
│           │   │   ├── TableauDeBordServiceImpl.java    # Implémentation Dashboard
│           │   │   ├── PanierService.java               # Interface service Panier
│           │   │   ├── PanierServiceImpl.java           # Implémentation Panier (+ expiration)
│           │   │   ├── PanierExpirationTache.java       # Tâche planifiée : purge paniers expirés
│           │   │   ├── CommandeService.java             # Interface service Commande
│           │   │   ├── CommandeServiceImpl.java         # Implémentation Commande
│           │   │   ├── AnalyseStockService.java         # Interface service Analyse Stock
│           │   │   └── AnalyseStockServiceImpl.java     # Implémentation Analyse Stock (ABC, KPIs, prévisions)
│           │   ├── controleur/
│           │   │   ├── CategorieControleur.java         # REST Controller Catégorie
│           │   │   ├── ProduitControleur.java           # REST Controller Produit (+ upload image)
│           │   │   ├── TableauDeBordControleur.java     # REST Controller Dashboard
│           │   │   ├── PanierControleur.java            # REST Controller Panier
│           │   │   ├── CommandeControleur.java          # REST Controller Commande
│           │   │   └── AnalyseStockControleur.java      # REST Controller Analyse Stock
│           │   └── exception/
│           │       ├── ResourceIntrouvableException.java # Exception 404
│           │       └── GestionGlobaleExceptions.java     # Gestionnaire global d'erreurs (+ MaxUploadSize)
│           └── resources/
│               ├── application.yml                      # Configuration + DB + Swagger + Multipart
│               └── data.sql                             # Données initiales de test
│
├── frontend/
│   └── alzheimer-app/
│       ├── angular.json                                 # Configuration Angular
│       ├── package.json                                 # Dépendances npm
│       ├── tsconfig.json                                # Configuration TypeScript
│       └── src/
│           ├── index.html                               # Page HTML principale
│           ├── main.ts                                  # Point d'entrée Angular
│           ├── styles.css                               # Styles globaux (backoffice + frontoffice .fo-* + dark mode)
│           ├── environments/
│           │   ├── environment.ts                       # Config développement (port 8081)
│           │   └── environment.prod.ts                  # Config production (gateway 8080)
│           └── app/
│               ├── app.component.ts                     # Composant racine (simple <router-outlet>)
│               ├── app.config.ts                        # Configuration application
│               ├── app.routes.ts                        # Routes : frontoffice (/) + backoffice (/admin)
│               ├── modeles/
│               │   ├── categorie.model.ts               # Interface Catégorie
│               │   ├── produit.model.ts                 # Interface Produit (avec imageUrl)
│               │   ├── tableau-de-bord.model.ts         # Interface Tableau de Bord
│               │   ├── panier.model.ts                  # Interface Panier + LignePanier (avec expiration)
│               │   ├── commande.model.ts                # Interface Commande + CreerCommande
│               │   └── analyse-stock.model.ts           # Interfaces AnalyseStock, AnalyseProduit, KPIs
│               ├── services/
│               │   ├── categorie.service.ts             # Service HTTP Catégorie
│               │   ├── produit.service.ts               # Service HTTP Produit (+ uploaderImage, supprimerImage)
│               │   ├── tableau-de-bord.service.ts       # Service HTTP Dashboard
│               │   ├── panier.service.ts                # Service HTTP Panier (BehaviorSubject + expiration)
│               │   ├── commande.service.ts              # Service HTTP Commande
│               │   ├── analyse-stock.service.ts         # Service HTTP Analyse Stock
│               │   ├── traduction.service.ts            # Service i18n FR/EN (dictionnaire ~460 clés + toggle)
│               │   └── theme.service.ts                 # Service Dark/Light mode (localStorage + CSS)
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
│                   │   │   └── panier.component.ts       # Panier d'achat (quantités, total, expiration)
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
│                   ├── produit/
│                   │   ├── liste-produits/
│                   │   │   └── liste-produits.component.ts  # Liste (recherche, filtres, pagination)
│                   │   └── formulaire-produit/
│                   │       └── formulaire-produit.component.ts  # Formulaire CRUD + upload image drag & drop
│                   └── analyse-stock/
│                       └── analyse-stock.component.ts   # Dashboard analyse stock (KPIs, ABC, tendances)
│
├── database/
│   └── init.sql                                         # Script d'initialisation SQL
│
├── .gitignore                                           # Exclusions (node_modules, target, uploads/, etc.)
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
| `/api/stock/analyse-stock` | `/api/analyse-stock` | `service-stock` |

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
│   Service        │  ← Logique métier, conversion DTO ↔ Entité, stockage fichiers
│   (service/)     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Repo   │ │  Fichier     │
│ JPA    │ │  Storage     │
│        │ │  (uploads/)  │
└────┬───┘ └──────────────┘
     │
     ▼
┌──────────────────┐
│   PostgreSQL     │  ← Stockage persistant
│   (alzheimer_stock)
└──────────────────┘
```

#### Configuration Multipart (upload de fichiers)

```yaml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 5MB
      max-request-size: 10MB

app:
  upload:
    dir: uploads
```

#### Service de stockage de fichiers (`FichierStorageService`)

| Méthode | Description |
|---------|-------------|
| `sauvegarder(MultipartFile)` | Valide le fichier, génère un nom UUID, sauvegarde dans `uploads/`, retourne le nom de fichier |
| `supprimer(String)` | Supprime un fichier du disque (avec protection contre le path traversal) |
| `valider(MultipartFile)` | Vérifie le type MIME (JPEG, PNG, GIF, WebP) et la taille (max 5 Mo) |
| `@PostConstruct init()` | Crée automatiquement le répertoire `uploads/` au démarrage |

**Sécurité** : chaque chemin résolu est vérifié pour rester dans le répertoire d'upload (protection path traversal).

#### Configuration Web (`WebConfig`)

- Mappe `/uploads/**` vers le répertoire physique `uploads/` pour servir les images statiquement
- Configure CORS pour `/uploads/**` depuis `http://localhost:4200`

#### Tâche planifiée (`PanierExpirationTache`)

- Exécutée périodiquement via `@Scheduled`
- Purge automatiquement les paniers inactifs depuis trop longtemps
- Libère les ressources et maintient la base de données propre

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
| `imageUrl` | String | URL complète de l'image uploadée (ex: `http://localhost:8081/uploads/uuid.jpg`) |
| `categorie` | Categorie | ManyToOne, obligatoire |
| `dateCreation` | LocalDateTime | Automatique, non modifiable |
| `dateModification` | LocalDateTime | Automatique |

**Panier** (`Panier.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `sessionId` | String | Obligatoire, unique (identifiant session anonyme) |
| `lignes` | List\<LignePanier\> | Relation OneToMany, cascade ALL |
| `derniereActivite` | LocalDateTime | Timestamp de la dernière interaction (pour expiration) |
| `dateCreation` | LocalDateTime | Automatique, non modifiable |
| `dateModification` | LocalDateTime | Automatique |

**LignePanier** (`LignePanier.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `panier` | Panier | ManyToOne, obligatoire |
| `produit` | Produit | ManyToOne, obligatoire |
| `quantite` | Integer | Obligatoire, min 1 |
| `dateAjout` | LocalDateTime | Automatique |

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
| `dateModification` | LocalDateTime | Automatique |

**LigneCommande** (`LigneCommande.java`)

| Champ | Type | Contraintes |
|-------|------|-------------|
| `id` | Long | Clé primaire, auto-générée |
| `commande` | Commande | ManyToOne, obligatoire |
| `produit` | Produit | ManyToOne, nullable (nullifié si le produit est supprimé) |
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
│              │                 │ imageUrl     │
│              │                 │ categorie_id │
└──────────────┘                 │ dateCreation │
                                 │ dateMod...   │
                                 └──────────────┘

┌──────────────┐       1    *    ┌──────────────┐         *    1    ┌──────────────┐
│   Panier     │ ───────────────►│ LignePanier  │ ◄───────────────│   Produit    │
│              │                 │              │                  │              │
│ id           │                 │ id           │                  │              │
│ sessionId    │                 │ panier_id    │                  │              │
│ derniere     │                 │ produit_id   │                  │              │
│  Activite    │                 │ quantite     │                  │              │
│ dateCreation │                 │ dateAjout    │                  │              │
│ dateMod...   │                 └──────────────┘                  └──────────────┘
└──────────────┘

┌──────────────┐       1    *    ┌───────────────┐        *   0..1  ┌──────────────┐
│  Commande    │ ───────────────►│LigneCommande  │ ◄───────────────│   Produit    │
│              │                 │               │                  │              │
│ id           │                 │ id            │                  │              │
│ reference    │                 │ commande_id   │                  │              │
│ nomClient    │                 │ produit_id    │                  │              │
│ emailClient  │                 │ nomProduit    │                  │              │
│ statut       │                 │ prixUnitaire  │                  │              │
│ montantTotal │                 │ quantite      │                  │              │
│ dateCommande │                 │ sousTotal     │                  │              │
│ dateMod...   │                 └───────────────┘                  │              │
└──────────────┘                                                    └──────────────┘

- Une catégorie peut contenir plusieurs produits (OneToMany)
- Un produit appartient à une seule catégorie (ManyToOne)
- La suppression d'une catégorie entraîne la suppression de ses produits (CASCADE)
- La suppression d'un produit supprime aussi son image du disque
- Un panier contient plusieurs lignes de panier (OneToMany)
- Chaque ligne de panier référence un produit avec une quantité
- Les paniers inactifs sont purgés automatiquement par une tâche planifiée
- Une commande contient plusieurs lignes de commande (snapshots du nom et du prix)
- La suppression d'un produit nullifie la référence dans les lignes de commande existantes (préservation de l'historique)
- L'annulation d'une commande restaure automatiquement le stock des produits
- L'analyse de stock est calculée dynamiquement à partir des tables produits, commandes et lignes_commande (pas de table dédiée)
```

#### Pattern DTO (Data Transfer Object)

Les DTOs sont utilisés pour :
- **Découpler** la couche de présentation de la couche de persistance
- **Contrôler** les données exposées via l'API
- **Valider** les données entrantes avec des annotations Jakarta Validation
- **Agréger** les données pour le tableau de bord (`TableauDeBordDTO`) et l'analyse de stock (`AnalyseStockDTO`)

**TableauDeBordDTO** - Agrégation des statistiques :

| Champ | Type | Description |
|-------|------|-------------|
| `totalCategories` | long | Nombre total de catégories |
| `totalProduits` | long | Nombre total de produits |
| `produitsStockBas` | long | Produits avec quantité <= 10 |
| `produitsEnRupture` | long | Produits avec quantité = 0 |
| `valeurTotaleStock` | BigDecimal | Somme (prix × quantité) de tous les produits |
| `totalCommandes` | long | Nombre total de commandes |
| `commandesEnAttente` | long | Commandes avec statut EN_ATTENTE |
| `chiffreAffaires` | BigDecimal | Somme des montants de toutes les commandes |
| `dernieresCategories` | List\<CategorieDTO\> | 5 dernières catégories créées |
| `derniersProduits` | List\<ProduitDTO\> | 5 derniers produits créés |
| `dernieresCommandes` | List\<CommandeDTO\> | 5 dernières commandes passées |

**AnalyseStockDTO** - Analyse avancée du stock :

Le DTO principal contient 4 sous-objets imbriqués :

| Sous-objet | Description |
|------------|-------------|
| `indicateursGlobaux` | Indicateurs de performance globaux (KPIs) |
| `resumeABC` | Résumé de la classification ABC |
| `analyseParProduit` | Analyse détaillée produit par produit |
| `tendanceVentes` | Historique mensuel du chiffre d'affaires |

**IndicateursGlobaux** - KPIs du stock :

| KPI | Type | Définition simple |
|-----|------|-------------------|
| `totalProduits` | int | Nombre total de produits en stock |
| `totalCommandes90j` | int | Combien de commandes ont été passées ces 90 derniers jours |
| `valeurTotaleStock` | BigDecimal | Valeur totale du stock = somme de (prix × quantité) pour chaque produit |
| `chiffreAffaires90j` | BigDecimal | Total des ventes (en TND) sur les 90 derniers jours |
| `croissanceMensuelle` | double | Variation en % entre le CA du mois dernier et celui d'avant. Positif = hausse, négatif = baisse |
| `tauxRotationMoyen` | double | En moyenne, combien de fois le stock a été vendu et renouvelé (sur 90 jours). Plus c'est élevé, mieux c'est |
| `produitsEnAlerte` | int | Nombre de produits dont le stock actuel est en dessous du point de réapprovisionnement |
| `produitsEnRupture` | int | Nombre de produits avec un stock = 0 |

**ResumeABC** - Classification ABC (méthode Pareto) :

La méthode ABC classe les produits selon leur contribution au chiffre d'affaires total :

| Champ | Type | Définition simple |
|-------|------|-------------------|
| `produitsA` | int | Produits qui génèrent **80%** du CA (les plus importants, à surveiller de près) |
| `produitsB` | int | Produits qui génèrent les **15%** suivants du CA (importance moyenne) |
| `produitsC` | int | Produits qui génèrent les **5%** restants du CA (moins critiques) |
| `pourcentageCA_A` | double | % exact du CA généré par les produits A |
| `pourcentageCA_B` | double | % exact du CA généré par les produits B |
| `pourcentageCA_C` | double | % exact du CA généré par les produits C |

**AnalyseProduit** - Analyse par produit :

| Champ | Type | Définition simple |
|-------|------|-------------------|
| `produitId` | Long | Identifiant du produit |
| `produitNom` | String | Nom du produit |
| `categorieNom` | String | Catégorie du produit |
| `stockActuel` | int | Quantité actuellement disponible en stock |
| `totalVendu` | int | Unités vendues sur les 90 derniers jours |
| `chiffreAffaires` | BigDecimal | Revenus générés par ce produit sur 90 jours |
| `classificationABC` | String | Classe A, B ou C selon la contribution au CA (voir ci-dessus) |
| `tauxRotation` | double | Nombre de fois que le stock a été vendu et renouvelé. Ex: 3.0 = vendu 3 fois son stock |
| `joursStockRestant` | int | Estimation du nombre de jours avant rupture (basé sur la vitesse de vente actuelle) |
| `pointReapprovisionnement` | int | Seuil en dessous duquel il faut recommander. Prend en compte le délai de livraison (7j) + marge de sécurité (3j) |
| `previsionDemandeMensuelle` | int | Prévision du nombre d'unités qui seront vendues le mois prochain (moyenne mobile pondérée) |
| `tendance` | String | Direction des ventes : `HAUSSE` (↑ > +10%), `STABLE` (→), `BAISSE` (↓ > -10%) |
| `scoreSante` | int | Score de 0 à 100 reflétant la "bonne santé" du produit en stock. Calculé à partir du stock, de la rotation, de la classe ABC, de la tendance et des jours restants |
| `alerteStock` | boolean | `true` si le stock actuel est en dessous du point de réapprovisionnement |

**Calcul du Score de Santé** (0-100 points) :

| Critère | Points max | Explication |
|---------|-----------|-------------|
| Niveau de stock vs point de réappro | 30 pts | Stock >= réappro = 30 pts, sinon proportionnel |
| Taux de rotation | 25 pts | ≥ 3x = 25 pts, ≥ 2x = 20 pts, ≥ 1x = 15 pts, > 0 = 5 pts |
| Classification ABC | 20 pts | A = 20 pts, B = 15 pts, C = 10 pts |
| Tendance des ventes | 15 pts | Hausse = 15 pts, Stable = 10 pts, Baisse = 5 pts |
| Jours de stock restant | 10 pts | > 30j = 10 pts, > 14j = 7 pts, > 7j = 3 pts |

**TendanceVentes** - Tendance mensuelle :

| Champ | Type | Définition simple |
|-------|------|-------------------|
| `periode` | String | Mois au format YYYY-MM (ex: "2026-01") |
| `chiffreAffaires` | BigDecimal | Total des ventes de ce mois |
| `nombreCommandes` | long | Nombre de commandes passées ce mois |

#### Gestion des erreurs

Le projet implémente un gestionnaire global d'exceptions (`@RestControllerAdvice`) :

| Exception | Code HTTP | Description |
|-----------|-----------|-------------|
| `ResourceIntrouvableException` | 404 | Ressource non trouvée |
| `MethodArgumentNotValidException` | 400 | Erreur de validation des champs |
| `IllegalArgumentException` | 400 | Erreur de logique métier (stock insuffisant, panier vide, format fichier invalide, etc.) |
| `MaxUploadSizeExceededException` | 400 | Fichier uploadé dépasse la taille maximale (5 Mo) |
| `Exception` (générique) | 500 | Erreur interne du serveur |

Format de réponse d'erreur :
```json
{
  "timestamp": "2026-02-28T14:30:00",
  "message": "Le fichier dépasse la taille maximale autorisée (5 Mo).",
  "statut": 400
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
- **FileReader API** : Aperçu instantané des images avant upload

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
│   ├── /panier                 → PanierComponent (panier d'achat avec expiration)
│   ├── /commander              → CommanderComponent (formulaire de commande)
│   └── /commande/:ref          → ConfirmationCommandeComponent (confirmation)
│
├── /admin                ─── LayoutBackofficeComponent (sidebar + topbar + footer)
│   ├── /admin                  → TableauDeBordComponent (dashboard)
│   ├── /admin/categories       → ListeCategoriesComponent (CRUD)
│   ├── /admin/categories/ajouter       → FormulaireCategorieComponent
│   ├── /admin/categories/modifier/:id  → FormulaireCategorieComponent
│   ├── /admin/produits         → ListeProduitsComponent (CRUD)
│   ├── /admin/produits/ajouter         → FormulaireProduitComponent (+ upload image)
│   ├── /admin/produits/modifier/:id    → FormulaireProduitComponent (+ upload image)
│   ├── /admin/commandes        → ListeCommandesComponent (gestion)
│   ├── /admin/commandes/:id    → DetailCommandeComponent (détail + changement statut)
│   └── /admin/analyse-stock    → AnalyseStockComponent (KPIs, ABC, tendances)
│
└── /**                   ─── Redirection vers /
```

#### Layout Frontoffice (site public)

- **Navbar horizontale** : Logo, liens Accueil / Catalogue / Panier (avec badge compteur), bouton "Administration", **bouton FR/EN**, **bouton Dark/Light mode** (lune/soleil)
- **Zone de contenu** : Pages publiques en lecture seule
- **Footer** : Branding projet + badges technologies
- **Responsive** : Menu hamburger sur mobile

#### Layout Backoffice (administration)

- **Sidebar fixe** (gauche) : Navigation avec icônes, sections groupées (Principal, Gestion, Analyse, Actions Rapides), lien "Voir le site" pour retourner au frontoffice
- **Topbar** (haut) : Breadcrumbs dynamiques, **bouton FR/EN**, **bouton Dark/Light mode** (lune/soleil), horloge en temps réel
- **Zone de contenu** : Zone scrollable avec padding et max-width
- **Responsive** : Sidebar en overlay sur mobile avec bouton hamburger

### 6.3 - Composants

#### Frontoffice (pages publiques, lecture seule)

| Composant | Route | Description |
|-----------|-------|-------------|
| `LayoutFrontofficeComponent` | - | Shell public : navbar horizontale (panier badge, bouton FR/EN, bouton dark/light mode) + router-outlet + footer |
| `AccueilComponent` | `/` | Page d'accueil : hero section, 3 stats (produits, catégories, valeur stock), grille catégories, 6 derniers produits avec images |
| `CatalogueComponent` | `/catalogue` | Grille de produits responsive (3/2/1 colonnes), recherche, filtre catégorie, badges stock, bouton "Ajouter au panier", images produit |
| `DetailProduitComponent` | `/catalogue/:id` | Détail complet : image produit, prix, stock, catégorie, description, sélecteur quantité + "Ajouter au panier", produits similaires |
| `CategorieProduitsComponent` | `/categories/:id` | En-tête catégorie + grille de produits filtrés avec images, recherche dans la catégorie |
| `PanierComponent` | `/panier` | Panier d'achat : liste articles avec images, contrôles quantité +/-, suppression, sous-totaux, total, compteur d'expiration, bouton "Commander" |
| `CommanderComponent` | `/commander` | Formulaire checkout : nom (requis), email, téléphone, adresse + récapitulatif commande avec images |
| `ConfirmationCommandeComponent` | `/commande/:ref` | Page de confirmation : icône succès, référence commande, détails, boutons "Continuer" / "Accueil" |

#### Backoffice (administration, CRUD)

| Composant | Route | Description |
|-----------|-------|-------------|
| `LayoutBackofficeComponent` | - | Shell admin : sidebar + topbar + router-outlet + footer |
| `SidebarComponent` | - | Sidebar de navigation + topbar avec breadcrumbs, bouton FR/EN, bouton dark/light mode et horloge |
| `TableauDeBordComponent` | `/admin` | Dashboard avec 4+ cartes stats, alertes rupture, actions rapides, dernières données |
| `ListeCategoriesComponent` | `/admin/categories` | Tableau avec recherche, pagination, actions CRUD |
| `FormulaireCategorieComponent` | `/admin/categories/ajouter` | Formulaire de création de catégorie |
| `FormulaireCategorieComponent` | `/admin/categories/modifier/:id` | Formulaire de modification de catégorie |
| `ListeProduitsComponent` | `/admin/produits` | Tableau avec recherche, filtres (catégorie, stock), pagination, images miniatures, actions CRUD |
| `FormulaireProduitComponent` | `/admin/produits/ajouter` | Formulaire de création avec **upload image drag & drop**, aperçu, validation |
| `FormulaireProduitComponent` | `/admin/produits/modifier/:id` | Formulaire de modification avec **changement / suppression d'image** |
| `ListeCommandesComponent` | `/admin/commandes` | Tableau avec recherche, filtre par statut, pagination, bouton "Voir" pour chaque commande |
| `DetailCommandeComponent` | `/admin/commandes/:id` | Détail commande : infos client, lignes articles, total + changement de statut (dropdown + bouton "Appliquer") |
| `AnalyseStockComponent` | `/admin/analyse-stock` | Dashboard d'analyse avancée : 7 KPIs, classification ABC, graphique tendance des ventes, tableau produits avec filtres/tri, scores de santé |

### 6.4 - Services

| Service | Méthodes | Description |
|---------|----------|-------------|
| `CategorieService` | `listerTout()`, `obtenirParId()`, `creer()`, `modifier()`, `supprimer()` | Appels HTTP vers `/api/categories` |
| `ProduitService` | `listerTout()`, `listerParCategorie()`, `obtenirParId()`, `creer()`, `modifier()`, `supprimer()`, **`uploaderImage()`**, **`supprimerImage()`** | Appels HTTP vers `/api/produits` (+ upload multipart pour les images) |
| `TableauDeBordService` | `obtenirTableauDeBord()` | Appel HTTP unique vers `/api/tableau-de-bord` |
| `PanierService` | `chargerPanier()`, `ajouterProduit()`, `modifierQuantite()`, `supprimerProduit()`, `viderPanier()` | Appels HTTP vers `/api/panier` + état réactif via `BehaviorSubject` + gestion expiration |
| `CommandeService` | `creerCommande()`, `listerTout()`, `obtenirParId()`, `obtenirParReference()`, `modifierStatut()` | Appels HTTP vers `/api/commandes` |
| `AnalyseStockService` | `analyserStock()` | Appel HTTP vers `/api/analyse-stock` — retourne les KPIs, ABC, tendances et analyses par produit |
| `TraductionService` | `tr()`, `setLang()`, `toggleLang()` | Service i18n FR/EN : dictionnaire centralisé (~460 clés), persistance localStorage |
| `ThemeService` | `toggle()`, `setTheme()`, `isDark`, `isLight` | Gestion du mode sombre/clair : attribut `data-theme` sur `<html>`, persistance localStorage |

### 6.5 - Environnements

| Fichier | API URL | Usage |
|---------|---------|-------|
| `environment.ts` | `http://localhost:8081/api` | Développement (appel direct au service-stock) |
| `environment.prod.ts` | `http://localhost:8080/api/stock` | Production (via API Gateway) |

### 6.6 - Fonctionnalités de l'interface

**Frontoffice (site public)** :
- Page d'accueil avec hero section, statistiques, catégories et produits récents avec images
- Catalogue de produits en grille responsive avec recherche, filtre par catégorie, images produit et bouton "Ajouter au panier"
- Page détail produit avec image, informations complètes, sélecteur de quantité, bouton "Ajouter au panier" et produits similaires
- Page catégorie avec produits filtrés, images et recherche
- Panier d'achat avec images miniatures, contrôles quantité, suppression, sous-totaux, total et **compteur d'expiration**
- Formulaire de commande (checkout) avec validation et récapitulatif
- Page de confirmation de commande avec référence et détails
- Navigation : navbar horizontale avec icône panier (badge compteur), bouton "Administration" vers le backoffice

**Backoffice - Tableau de bord** :
- 4+ cartes statistiques : catégories, produits, stock faible (≤ 10), valeur totale du stock (TND), commandes, chiffre d'affaires
- Alerte rouge si des produits sont en rupture de stock
- 3 boutons d'actions rapides (nouvelle catégorie, nouveau produit, voir le stock)
- Aperçu des 5 dernières catégories et 5 derniers produits
- Aperçu des 5 dernières commandes
- Loading spinner pendant le chargement
- Gestion d'erreur avec bouton "Réessayer"

**Backoffice - Listes (Catégories / Produits)** :
- Barre de recherche en temps réel
- Filtre par catégorie (produits)
- Filtre par niveau de stock : normal, faible, rupture (produits)
- Pagination client-side (8 catégories / 10 produits par page)
- Images miniatures dans la liste des produits
- Bouton de réinitialisation des filtres
- Loading spinner pendant le chargement
- États vides illustrés avec boutons d'action

**Backoffice - Formulaire Produit (avec upload d'image)** :
- Validation en temps réel (champs obligatoires, longueur, format)
- **Zone de glisser-déposer (drag & drop)** pour l'upload d'image : cliquer ou glisser un fichier
- **Aperçu instantané** de l'image sélectionnée avant sauvegarde (via `FileReader`)
- **Boutons "Changer" et "Supprimer"** quand une image existe déjà
- **Validation côté client** : formats acceptés (JPEG, PNG, GIF, WebP), taille maximale (5 Mo)
- **Messages d'erreur** dédiés pour format invalide ou taille dépassée
- **Sauvegarde en deux étapes** : 1) Enregistrement des données JSON, 2) Upload du fichier image via endpoint dédié
- Aperçu de la valeur en stock en temps réel (prix × quantité)
- Indicateur de stock faible / rupture
- Spinner sur le bouton pendant la soumission
- Messages d'erreur de l'API affichés à l'utilisateur

**Backoffice - Analyse de Stock** (`/admin/analyse-stock`) :
- 7 cartes KPI : total produits, commandes (90j), chiffre d'affaires (90j), croissance mensuelle, produits en alerte, produits en rupture, taux de rotation moyen
- Classification ABC avec barres de progression : catégories A (produits à forte valeur), B (intermédiaire), C (faible valeur) avec pourcentages de chiffre d'affaires
- Graphique de tendance des ventes sur les 12 derniers mois (barres horizontales responsive)
- Tableau d'analyse par produit : classification ABC, stock actuel, unités vendues, chiffre d'affaires, taux de rotation, jours de stock restant, point de réapprovisionnement, prévision de demande mensuelle, tendance (hausse/stable/baisse), score de santé (barre de progression colorée)
- Filtres : par classification ABC (A/B/C), par alerte stock (en alerte / rupture)
- Tri : par score de santé, chiffre d'affaires, taux de rotation, niveau de stock
- Légende explicative des indicateurs clés
- Loading spinner et gestion d'erreurs avec bouton "Réessayer"

**Traduction FR/EN (i18n)** :
- Bouton pill-shaped avec globe icon (FR | EN) dans la navbar frontoffice et la topbar backoffice
- **Tous les textes** de l'application traduits : titres, labels, messages, placeholders, validations, alertes, pagination, messages d'upload
- `TraductionService` centralisé avec dictionnaire de ~460 clés organisées par composant
- Persistance du choix de langue dans `localStorage` (survit au rechargement de page)
- Interpolation de paramètres dynamiques : `{nom}`, `{n}`, etc.
- Format de date adapté au locale (`fr-FR` / `en-US`) dans la topbar
- Traductions professionnelles et naturelles (pas de traduction littérale mot-à-mot)

**Mode Sombre / Clair (Dark / Light mode)** :
- Bouton toggle circulaire (icône lune/soleil) dans la navbar frontoffice et la topbar backoffice
- `ThemeService` centralisé avec persistance du choix dans `localStorage`
- Transition fluide entre les thèmes via CSS custom properties (`html[data-theme="dark"]`)
- **Toutes les pages** adaptées : frontoffice (accueil, catalogue, détail, panier, commande) et backoffice (dashboard, listes, formulaires, commandes, analyse stock)
- Couleurs adaptées : arrière-plans sombres, textes clairs, bordures subtiles, ombres profondes
- Composants Bootstrap surchargés : tables, formulaires, modales, badges, pagination, alertes
- Icône dynamique : lune (mode clair actif) → soleil (mode sombre actif)
- Indépendant de la langue : le thème et la langue se gèrent séparément

**UI/UX** :
- Design professionnel avec CSS custom properties (thème cohérent, dark/light mode)
- Styles frontoffice isolés avec préfixe `.fo-*` (pas de conflit avec le backoffice)
- Animations : fade-in pages, slide-down alertes, animation modale, rotation icône thème
- Badges colorés pour les quantités : vert (> 10), orange (1-10), rouge (0)
- Zone d'upload d'image avec effet de survol et de glissement (drag-over highlight)
- Modale de confirmation avant chaque suppression
- Messages de succès/erreur après chaque opération
- Design responsive (desktop, tablette, mobile) pour les deux parties
- Bouton de langue avec design moderne (pill shape, backdrop blur, animation de transition)
- Bouton de thème avec design circulaire et animation de rotation au survol

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
| `image_url` | VARCHAR(500) | URL complète de l'image uploadée (nullable) |
| `categorie_id` | BIGINT | FOREIGN KEY → categories(id) ON DELETE CASCADE |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `date_modification` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### Table `paniers`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `session_id` | VARCHAR(100) | NOT NULL, UNIQUE |
| `derniere_activite` | TIMESTAMP | Dernière interaction (utilisé pour l'expiration) |
| `date_creation` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `date_modification` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### Table `lignes_panier`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `panier_id` | BIGINT | FOREIGN KEY → paniers(id) ON DELETE CASCADE |
| `produit_id` | BIGINT | FOREIGN KEY → produits(id) |
| `quantite` | INTEGER | NOT NULL, CHECK > 0 |
| `date_ajout` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| **Contrainte** | | UNIQUE (panier_id, produit_id) |

#### Table `commandes`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `reference` | VARCHAR(20) | NOT NULL, UNIQUE |
| `nom_client` | VARCHAR(100) | NOT NULL |
| `email_client` | VARCHAR(150) | - |
| `telephone_client` | VARCHAR(20) | - |
| `adresse_livraison` | TEXT | - |
| `statut` | VARCHAR(30) | NOT NULL, DEFAULT 'EN_ATTENTE' |
| `montant_total` | DECIMAL(10,2) | NOT NULL |
| `date_commande` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `date_modification` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

#### Table `lignes_commande`

| Colonne | Type | Contrainte |
|---------|------|------------|
| `id` | BIGSERIAL | PRIMARY KEY |
| `commande_id` | BIGINT | FOREIGN KEY → commandes(id) ON DELETE CASCADE |
| `produit_id` | BIGINT | FOREIGN KEY → produits(id), NULLABLE (nullifié si produit supprimé) |
| `nom_produit` | VARCHAR(100) | NOT NULL (snapshot) |
| `prix_unitaire` | DECIMAL(10,2) | NOT NULL (snapshot) |
| `quantite` | INTEGER | NOT NULL, CHECK > 0 |
| `sous_total` | DECIMAL(10,2) | NOT NULL |

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

### 7.3 - Stockage des images

Les images produit sont **stockées sur le disque** dans le répertoire `uploads/` (au même niveau que `src/`), pas en base de données. Seule l'**URL complète** est enregistrée dans la colonne `image_url` de la table `produits`.

Exemple de valeur stockée : `http://localhost:8081/uploads/774d1ebc-d75c-4c50-bf8a-c327413c11d9.png`

Le répertoire `uploads/` est :
- Créé automatiquement au démarrage du service (`@PostConstruct`)
- Exclu du contrôle de version (`.gitignore`)
- Servi statiquement via `/uploads/**` (configuré dans `WebConfig`)

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
  "totalCommandes": 15,
  "commandesEnAttente": 3,
  "chiffreAffaires": 125000.00,
  "dernieresCategories": [
    { "id": 4, "nom": "Matériel de Rééducation", "nombreProduits": 2 }
  ],
  "derniersProduits": [
    { "id": 9, "nom": "Tablette Cognitive", "prix": 35000.00, "quantite": 20, "imageUrl": "http://localhost:8081/uploads/abc123.jpg" }
  ],
  "dernieresCommandes": [
    { "id": 5, "reference": "CMD-20260228-A7B3", "nomClient": "Ahmed", "montantTotal": 9000.00, "statut": "EN_ATTENTE" }
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
  "dateCreation": "2026-02-28T14:30:00",
  "dateModification": "2026-02-28T14:30:00",
  "nombreProduits": 3
}
```

### 8.3 - Produits (`/api/produits`)

| Méthode | Endpoint | Description | Corps / Params | Réponse |
|---------|----------|-------------|----------------|---------|
| `GET` | `/api/produits` | Lister tous les produits | - | 200 + JSON Array |
| `GET` | `/api/produits/{id}` | Obtenir un produit par ID | - | 200 + JSON Object |
| `GET` | `/api/produits/categorie/{categorieId}` | Lister les produits d'une catégorie | - | 200 + JSON Array |
| `POST` | `/api/produits` | Créer un nouveau produit | JSON ProduitDTO | 201 + JSON Object |
| `PUT` | `/api/produits/{id}` | Modifier un produit | JSON ProduitDTO | 200 + JSON Object |
| `DELETE` | `/api/produits/{id}` | Supprimer un produit (+ image sur disque) | - | 204 No Content |
| `POST` | `/api/produits/{id}/image` | **Uploader une image** | `multipart/form-data` (champ `fichier`) | 200 + JSON Object |
| `DELETE` | `/api/produits/{id}/image` | **Supprimer l'image** d'un produit | - | 200 + JSON Object |

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

**Exemple de réponse (GET)** :
```json
{
  "id": 1,
  "nom": "Donépézil 10mg",
  "description": "Inhibiteur de la cholinestérase - boîte de 30",
  "prix": 4500.00,
  "quantite": 150,
  "imageUrl": "http://localhost:8081/uploads/774d1ebc-d75c-4c50-bf8a-c327413c11d9.jpg",
  "categorieId": 1,
  "categorieNom": "Médicaments",
  "dateCreation": "2026-02-28T14:30:00",
  "dateModification": "2026-02-28T14:30:00"
}
```

**Upload d'image — Détails techniques** :

| Paramètre | Valeur |
|-----------|--------|
| Content-Type | `multipart/form-data` |
| Nom du champ | `fichier` |
| Formats acceptés | JPEG, PNG, GIF, WebP |
| Taille maximale | 5 Mo |
| Nommage | UUID + extension originale (ex: `774d1ebc-...-.jpg`) |
| Stockage | Répertoire `uploads/` sur le disque |
| URL retournée | `http://localhost:8081/uploads/<uuid>.<ext>` (générée dynamiquement via `ServletUriComponentsBuilder`) |

**Comportement de l'upload** :
- Si le produit a déjà une image, l'**ancien fichier est supprimé** du disque avant de sauvegarder le nouveau
- La suppression d'un produit (`DELETE /api/produits/{id}`) supprime aussi son **fichier image du disque**
- La suppression de l'image (`DELETE /api/produits/{id}/image`) supprime le fichier et met `imageUrl` à `null`

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
      "produitImageUrl": "http://localhost:8081/uploads/774d1ebc.jpg",
      "categorieNom": "Médicaments",
      "quantite": 2,
      "sousTotal": 9000.00
    }
  ],
  "nombreArticles": 2,
  "montantTotal": 9000.00,
  "expireA": "2026-02-28T16:30:00"
}
```

**Logique métier** :
- Le panier est créé automatiquement lors du premier ajout de produit
- La quantité est validée contre le stock disponible
- L'ajout d'un produit déjà dans le panier incrémente la quantité
- La session est identifiée par un ID généré côté client (stocké dans `localStorage`)
- Le champ `derniereActivite` est mis à jour à chaque interaction
- Les **paniers inactifs** sont purgés automatiquement par une tâche planifiée (`PanierExpirationTache`)
- Le frontend affiche un **compteur d'expiration** pour informer l'utilisateur

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
  "reference": "CMD-20260228-A7B3",
  "nomClient": "Ahmed Ben Salah",
  "emailClient": "ahmed@example.com",
  "telephoneClient": "+216 55 123 456",
  "adresseLivraison": "Tunis, Rue de la Liberté",
  "statut": "EN_ATTENTE",
  "montantTotal": 13500.00,
  "nombreArticles": 3,
  "dateCommande": "2026-02-28T14:30:00",
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
- La suppression d'un produit nullifie la référence (`produit_id = NULL`) dans les lignes de commande existantes, préservant l'historique (le `nomProduit` et `prixUnitaire` sont des snapshots)
- Les statuts possibles : `EN_ATTENTE` → `CONFIRMEE` → `EN_PREPARATION` → `EXPEDIEE` → `LIVREE` (ou `ANNULEE` à tout moment)

### 8.6 - Analyse Stock (`/api/analyse-stock`)

| Méthode | Endpoint | Description | Réponse |
|---------|----------|-------------|---------|
| `GET` | `/api/analyse-stock` | Analyse complète du stock (KPIs, ABC, tendances, prévisions) | 200 + JSON Object |

**Exemple de réponse** :
```json
{
  "indicateursGlobaux": {
    "totalProduits": 9,
    "totalCommandes90j": 15,
    "valeurTotaleStock": 2547100.00,
    "tauxRotationMoyen": 2.3,
    "chiffreAffaires90j": 125000.00,
    "croissanceMensuelle": 12.5,
    "produitsEnAlerte": 3,
    "produitsEnRupture": 1
  },
  "resumeABC": {
    "produitsA": 2,
    "produitsB": 3,
    "produitsC": 4,
    "pourcentageCA_A": 65.0,
    "pourcentageCA_B": 25.0,
    "pourcentageCA_C": 10.0
  },
  "tendanceVentes": [
    { "periode": "2025-12", "chiffreAffaires": 42000.00, "nombreCommandes": 5 }
  ],
  "analyseParProduit": [
    {
      "produitId": 1,
      "produitNom": "Donépézil 10mg",
      "categorieNom": "Médicaments",
      "stockActuel": 150,
      "totalVendu": 45,
      "joursStockRestant": 100,
      "chiffreAffaires": 202500.00,
      "classificationABC": "A",
      "tauxRotation": 3.2,
      "alerteStock": false,
      "scoreSante": 85,
      "pointReapprovisionnement": 30,
      "previsionDemandeMensuelle": 15,
      "tendance": "HAUSSE"
    }
  ]
}
```

### 8.7 - Fichiers statiques (`/uploads/**`)

| Méthode | Endpoint | Description | Réponse |
|---------|----------|-------------|---------|
| `GET` | `/uploads/{filename}` | Récupérer une image produit uploadée | 200 + fichier image |

Les images sont servies directement par Spring via `WebMvcConfigurer.addResourceHandlers()`. Le CORS est configuré pour permettre l'accès depuis `http://localhost:4200`.

### 8.8 - Codes de réponse HTTP

| Code | Signification | Quand |
|------|---------------|-------|
| `200` | Succès | GET, PUT, POST image réussis |
| `201` | Créé | POST réussi (produit, catégorie, commande) |
| `204` | Pas de contenu | DELETE réussi |
| `400` | Requête invalide | Erreur de validation, fichier trop gros, format non supporté |
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
| **Produits** | CRUD des produits de stock + upload/suppression d'image | 8 endpoints |
| **Panier** | Gestion du panier d'achat par session | 5 endpoints |
| **Commandes** | Gestion des commandes et statuts | 5 endpoints |
| **Analyse Stock** | Analyse avancée du stock (KPIs, ABC, tendances) | 1 endpoint |

### Fonctionnalités Swagger UI

- **Try it out** : Tester chaque endpoint directement depuis le navigateur
- **Modèles** : Visualiser la structure des DTOs (CategorieDTO, ProduitDTO, TableauDeBordDTO)
- **Upload** : Tester l'upload d'image directement via le formulaire Swagger (multipart/form-data)
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
# → Le répertoire uploads/ est créé automatiquement au démarrage

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
| Uploads | http://localhost:8081/uploads/ | Répertoire créé automatiquement au démarrage |
| Swagger UI | http://localhost:8081/api/swagger-ui.html | Documentation API interactive |
| Répertoire uploads | `backend/service-stock/uploads/` | Répertoire créé automatiquement |

### Vérification du Frontend - URLs à tester

#### Frontoffice (site public)

| URL | Page | Ce qu'il faut vérifier |
|-----|------|------------------------|
| http://localhost:4200/ | Accueil | Hero section avec titre, 3 cartes stats, grille de catégories cliquables, 6 derniers produits avec images |
| http://localhost:4200/catalogue | Catalogue | Grille de produits avec images, barre de recherche, filtre par catégorie, badges de stock colorés |
| http://localhost:4200/catalogue/1 | Détail Produit | Image produit, nom, description, prix, indicateur de stock, produits similaires, bouton panier |
| http://localhost:4200/categories/1 | Produits par Catégorie | En-tête catégorie, grille de produits avec images, recherche |
| http://localhost:4200/panier | Panier | Liste des articles avec images, contrôles quantité +/-, total, compteur d'expiration |
| http://localhost:4200/commander | Commande | Formulaire client (nom*, email, téléphone, adresse) + récapitulatif |
| http://localhost:4200/commande/CMD-xxx | Confirmation | Page de succès avec référence et détails commande |

#### Backoffice (administration)

| URL | Page | Ce qu'il faut vérifier |
|-----|------|------------------------|
| http://localhost:4200/admin | Tableau de Bord | Sidebar, cartes stats, alertes stock, actions rapides, données récentes |
| http://localhost:4200/admin/categories | Liste Catégories | Tableau avec recherche, pagination, boutons Modifier/Supprimer |
| http://localhost:4200/admin/categories/ajouter | Nouvelle Catégorie | Formulaire avec validation |
| http://localhost:4200/admin/produits | Liste Produits | Tableau avec images miniatures, recherche, filtres, pagination |
| http://localhost:4200/admin/produits/ajouter | Nouveau Produit | Formulaire avec **zone d'upload drag & drop**, aperçu image |
| http://localhost:4200/admin/produits/modifier/1 | Modifier Produit | Formulaire avec image existante, boutons **Changer / Supprimer** |
| http://localhost:4200/admin/commandes | Commandes | Tableau avec recherche, filtre par statut, pagination |
| http://localhost:4200/admin/commandes/1 | Détail Commande | Infos client, articles, total + changement de statut |
| http://localhost:4200/admin/analyse-stock | Analyse Stock | 7 KPIs, classification ABC, graphique tendances, tableau produits |

#### Navigation entre Frontoffice et Backoffice

| Action | Depuis | Vers |
|--------|--------|------|
| Cliquer **"Administration"** dans la navbar publique | Frontoffice (n'importe quelle page) | `/admin` (tableau de bord) |
| Cliquer **"Voir le site"** dans le footer de la sidebar | Backoffice (n'importe quelle page) | `/` (accueil frontoffice) |

### Parcours de test complet

1. Ouvrir `http://localhost:4200/` → page d'accueil frontoffice avec hero, stats, catégories et derniers produits
2. Cliquer sur **"Parcourir le Catalogue"** → redirection vers `/catalogue` avec la grille de produits et images
3. Taper un nom dans la barre de recherche → les produits se filtrent en temps réel
4. Sélectionner une catégorie dans le dropdown → les produits se filtrent par catégorie
5. Cliquer sur **"Ajouter au panier"** sur une carte produit → le badge du panier dans la navbar s'incrémente
6. Cliquer sur une carte produit → page détail `/catalogue/:id` avec image, infos complètes, sélecteur de quantité
7. Ajuster la quantité et cliquer **"Ajouter au panier"** → confirmation visuelle
8. Cliquer sur **"Panier"** dans la navbar → page `/panier` avec images, contrôles quantité, total et compteur d'expiration
9. Modifier une quantité avec les boutons +/- → le sous-total et le total se mettent à jour
10. Cliquer **"Passer la commande"** → page `/commander` avec formulaire client et récapitulatif
11. Remplir le nom (obligatoire), téléphone, adresse et cliquer **"Confirmer la commande"** → redirection vers `/commande/CMD-xxx`
12. Vérifier la page de confirmation : icône succès, référence, détails de la commande
13. Cliquer **"Administration"** dans la navbar → redirection vers `/admin` avec le dashboard backoffice
14. Naviguer vers `/admin/produits` → vérifier que les produits avec images les affichent en miniature
15. Cliquer **"Nouveau Produit"** → formulaire avec zone de glisser-déposer pour l'image
16. **Glisser une image** sur la zone → aperçu instantané apparaît
17. Remplir les champs et sauvegarder → le produit est créé, l'image est uploadée, fichier visible dans `uploads/`
18. **Modifier le produit** → l'image existante s'affiche avec boutons "Changer" et "Supprimer"
19. Cliquer **"Changer"** → sélectionner une nouvelle image → l'ancien fichier est supprimé, le nouveau est sauvegardé
20. Cliquer **"Supprimer"** → la zone de drop réapparaît, l'image est supprimée du disque
21. **Supprimer le produit** → vérifier que le fichier image est aussi supprimé de `uploads/`
22. Tenter d'uploader un fichier **non-image** (ex: `.pdf`) → message d'erreur "Format non supporté"
23. Tenter d'uploader une image **> 5 Mo** → message d'erreur "Taille maximale dépassée"
24. Naviguer vers `/admin/commandes` → la commande créée apparaît avec le statut "En attente"
25. Cliquer **"Voir"** → page détail avec infos client, articles, total
26. Changer le statut en "Confirmée" et cliquer **"Appliquer"** → message de succès
27. Changer le statut en "Annulée" → le stock des produits est restauré automatiquement
28. Cliquer le bouton **FR/EN** dans la navbar → toute l'interface bascule en anglais (tous les textes, y compris les messages d'upload)
29. Naviguer vers `/admin` → le backoffice est aussi en anglais
30. Recharger la page → la langue anglaise est conservée (persistance localStorage)
31. Cliquer **EN → FR** → retour au français immédiat sans rechargement
32. Cliquer le bouton **lune** dans la navbar → l'interface passe en **mode sombre**, l'icône devient un soleil
33. Naviguer entre les pages → le thème sombre est conservé partout (y compris la zone d'upload)
34. Recharger la page → le mode sombre est conservé (persistance localStorage)
35. Cliquer le bouton **soleil** → retour au mode clair immédiat
36. Naviguer vers `/admin/analyse-stock` → dashboard d'analyse avec 7 KPIs, classification ABC, graphique de tendance
37. Filtrer par classification **A** → seuls les produits de catégorie A s'affichent
38. Vérifier les scores de santé → barres de progression colorées (vert ≥ 70, orange ≥ 40, rouge < 40)

---

## 12. Captures et fonctionnalités

### Frontoffice (site public)

#### Page Accueil (`/`)

- Navbar horizontale avec liens Accueil, Catalogue, Administration, **bouton FR/EN** (pill shape), **bouton dark/light mode** (lune/soleil)
- Hero section avec gradient, titre du projet et bouton "Parcourir le Catalogue"
- 3 cartes statistiques : nombre de produits, nombre de catégories, valeur totale du stock (TND)
- Grille de catégories cliquables avec icône, description et nombre de produits
- Section "Derniers Produits" : 6 cartes produits avec **images**, prix, badge de stock, lien vers le détail
- Footer avec branding et badges technologies (Angular 17, Spring Boot, PostgreSQL)

#### Page Catalogue (`/catalogue`)

- Grille responsive de cartes produits (3 colonnes desktop, 2 tablette, 1 mobile) avec **images produit**
- Barre de recherche pour filtrer les produits par nom en temps réel
- Dropdown de filtre par catégorie
- Chaque carte affiche : **image**, nom, catégorie (badge), prix (TND), statut stock, bouton "Ajouter au panier"
- Clic sur une carte → page détail du produit
- État vide avec bouton de réinitialisation si aucun résultat
- Loading spinner pendant le chargement

#### Page Détail Produit (`/catalogue/:id`)

- Breadcrumb : Catalogue > Nom du produit
- Layout 2 colonnes : **image du produit** (uploadée ou placeholder) + informations
- Informations complètes : nom, description, catégorie (lien cliquable), prix (TND)
- Indicateur de disponibilité : "En stock (X unités)" / "Stock faible (X unités)" / "Rupture de stock"
- Sélecteur de quantité + bouton "Ajouter au panier"
- Bouton "Retour au catalogue"
- Section "Produits similaires" : jusqu'à 4 produits de la même catégorie avec images

#### Page Produits par Catégorie (`/categories/:id`)

- Breadcrumb : Accueil > Nom de la catégorie
- En-tête avec icône, nom et description de la catégorie
- Barre de recherche dans la catégorie + bouton "Tout parcourir"
- Grille de produits avec **images** identique au catalogue
- État vide avec lien vers le catalogue complet

#### Page Panier (`/panier`)

- Breadcrumb : Accueil > Mon Panier
- Liste des articles avec **image produit**, nom, catégorie, prix unitaire, stock disponible
- Contrôles quantité : boutons +/- avec limites (min 1, max stock disponible)
- **Compteur d'expiration** : affiche le temps restant avant l'expiration du panier
- Bouton de suppression par article + bouton "Vider le panier"
- Sidebar récapitulatif : nombre d'articles, sous-total, total (TND)
- Bouton "Passer la commande" → `/commander`
- Bouton "Continuer les achats" → `/catalogue`
- État vide avec bouton "Parcourir le catalogue"

#### Page Commander (`/commander`)

- Breadcrumb : Accueil > Panier > Finaliser la commande
- Formulaire client : nom complet (requis), email (validation format), téléphone (requis), adresse de livraison (requis)
- Validation en temps réel avec messages d'erreur
- Sidebar récapitulatif : liste des produits avec **images**, quantités et prix, total
- Bouton "Confirmer la commande" avec spinner pendant le traitement
- Gestion d'erreurs (stock insuffisant, erreur serveur)

#### Page Confirmation (`/commande/:ref`)

- Icône de succès animée
- Référence de commande en grand format (CMD-yyyyMMdd-XXXX)
- Carte de détails : nom client, statut "En attente", lignes de commande avec totaux
- Boutons : "Continuer les achats" → `/catalogue`, "Accueil" → `/`

### Backoffice (administration)

#### Page Tableau de Bord (`/admin`)

- Layout backoffice avec sidebar fixe (gauche) et topbar (breadcrumbs + **bouton FR/EN** + **bouton dark/light mode** + horloge)
- Cartes statistiques : catégories, produits, stock faible (≤ 10), valeur totale stock (TND), commandes, en attente, chiffre d'affaires
- Alerte rouge si produits en rupture de stock
- 3 boutons d'actions rapides : Nouvelle Catégorie, Nouveau Produit, Voir tout le Stock
- Aperçu des 5 dernières catégories, 5 derniers produits (avec images) et 5 dernières commandes
- Loading spinner et gestion d'erreur avec bouton "Réessayer"

#### Page Gestion des Catégories (`/admin/categories`)

- Barre de recherche en temps réel pour filtrer les catégories
- Tableau paginé : ID, Nom, Description, Nombre de produits, Date de création
- Bouton **Nouvelle Catégorie** pour ajouter
- Bouton **Modifier** (jaune) sur chaque ligne
- Bouton **Supprimer** (rouge) avec confirmation modale
- Compteur de résultats dynamique
- Message de succès/erreur après chaque opération

#### Page Formulaire Catégorie (`/admin/categories/ajouter` ou `modifier/:id`)

- Champs : Nom (obligatoire, 2-100 caractères), Description (optionnel, max 500)
- Compteur de caractères en temps réel
- Validation visuelle (bordure rouge si invalide)
- Loading spinner pendant le chargement en modification
- Messages d'erreur de l'API affichés

#### Page Gestion des Produits (`/admin/produits`)

- Barre de recherche en temps réel
- Filtre par catégorie (liste déroulante)
- Filtre par niveau de stock : Tout, Normal (> 10), Faible (1-10), Rupture (0)
- Tableau paginé : ID, **Image miniature**, Nom, Description, Prix, Quantité (badge coloré), Catégorie, Date
- Bouton de réinitialisation des filtres
- Badges de quantité : vert (> 10), orange (1-10), rouge (0 - Rupture)
- Actions : Modifier, Supprimer avec confirmation

#### Page Formulaire Produit (`/admin/produits/ajouter` ou `modifier/:id`)

- Champs : Nom, Description, Prix, Quantité, **Image**, Catégorie (liste déroulante)
- **Zone de glisser-déposer (drag & drop)** : bordure en pointillés, icône cloud, texte d'invitation
- **Effet visuel au survol** : la zone change de couleur quand un fichier est glissé au-dessus
- **Aperçu instantané** : l'image sélectionnée s'affiche immédiatement (via `FileReader`)
- **Boutons "Changer" et "Supprimer"** visibles quand une image existe
- **Validation côté client** : formats acceptés (JPEG, PNG, GIF, WebP), taille max (5 Mo)
- **Messages d'erreur bilingues** pour format invalide ou fichier trop gros
- Validation standard : nom obligatoire, prix > 0, quantité >= 0, catégorie obligatoire
- Aperçu de la valeur en stock en temps réel (prix × quantité)
- Indicateur d'alerte si stock faible ou en rupture
- Spinner sur le bouton et gestion d'erreurs

#### Page Gestion des Commandes (`/admin/commandes`)

- Barre de recherche par référence ou nom client en temps réel
- Filtre par statut : Tous, En attente, Confirmée, En préparation, Expédiée, Livrée, Annulée
- Tableau paginé : Référence, Client (nom + email), Articles, Montant (TND), Statut (badge coloré), Date
- Bouton "Voir" pour accéder au détail de chaque commande

#### Page Détail Commande (`/admin/commandes/:id`)

- Carte informations : nom client, date de commande, email, téléphone, adresse, badge statut
- Tableau des articles commandés : nom produit, prix unitaire, quantité, sous-total, total
- Carte de changement de statut : dropdown avec 6 statuts + bouton "Appliquer"
- Messages de succès/erreur après modification
- Bouton "Retour à la liste"

#### Page Analyse Stock (`/admin/analyse-stock`)

- **Ligne 1** : 4 cartes KPI — total produits, commandes (90 jours), chiffre d'affaires (90j), taux de croissance mensuelle (avec indicateur tendance)
- **Ligne 2** : 3 cartes KPI — produits en alerte, produits en rupture, taux de rotation moyen
- **Carte Classification ABC** : barres de progression montrant la répartition A/B/C avec nombre de produits et pourcentage du CA
- **Graphique Tendance des Ventes** : barres horizontales représentant le chiffre d'affaires des 12 derniers mois
- **Tableau Analyse par Produit** : filtres (ABC, alerte), tri (score, CA, rotation, stock), colonnes complètes avec scores de santé (barres colorées)
- **Carte Légende** : explication du taux de rotation, point de réapprovisionnement et score de santé

#### Mode Sombre / Clair (Dark / Light mode)

- **Bouton toggle** circulaire avec icône Bootstrap : `bi-moon-fill` (lune) en mode clair, `bi-sun-fill` (soleil) en mode sombre
- Présent dans la **navbar frontoffice** et la **topbar backoffice**
- **Transition fluide** : `background-color 0.3s ease` sur `<html>`
- **Variables CSS dark** : ~20 variables surchargées (`--bg`, `--bg-card`, `--text-primary`, `--border`, `--shadow`, `--sidebar-bg`, etc.)
- **Composants Bootstrap** surchargés : tables, formulaires, modales, pagination, alertes, badges, dropdowns
- **Zone d'upload** adaptée au mode sombre (bordures et arrière-plan)
- **Persistance** : choix stocké dans `localStorage`, appliqué dès le chargement
- **Toutes les pages** adaptées : frontoffice et backoffice

### Swagger UI (`/api/swagger-ui.html`)

- Documentation interactive de tous les endpoints
- 6 groupes : Tableau de Bord, Catégories, Produits, Panier, Commandes, Analyse Stock
- **Test d'upload d'image** directement depuis l'interface Swagger
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
