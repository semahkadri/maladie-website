# Guide d'Installation Complet - Projet Détection Maladie Alzheimer

## Module : Gestion de Stock (Catégorie / Produit)

### Architecture Microservices

```
alzheimer-detection/
├── backend/
│   ├── pom.xml                    (Parent POM Maven)
│   ├── eureka-server/             (Découverte de services - port 8761)
│   ├── api-gateway/               (Passerelle API - port 8080)
│   └── service-stock/             (Gestion Stock CRUD - port 8081)
├── frontend/
│   └── alzheimer-app/             (Angular 17 - port 4200)
└── database/
    └── init.sql                   (Script SQL PostgreSQL)
```

---

## ÉTAPE 1 : Prérequis à installer

### 1.1 - Installer Java JDK 17

1. Télécharger Java JDK 17 depuis : https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. Choisir **Windows x64 Installer**
3. Installer dans le chemin par défaut : `C:\Program Files\Java\jdk-17`
4. **Configurer JAVA_HOME** :
   - Clic droit sur **Ce PC** > **Propriétés**
   - Cliquer sur **Paramètres système avancés**
   - Cliquer sur **Variables d'environnement**
   - Dans **Variables système**, cliquer **Nouveau** :
     - Nom de la variable : `JAVA_HOME`
     - Valeur de la variable : `C:\Program Files\Java\jdk-17`
   - Cliquer **OK**
   - Dans **Variables système**, trouver **Path**, cliquer **Modifier**
   - Cliquer **Nouveau** et ajouter : `%JAVA_HOME%\bin`
   - Cliquer **OK** partout
5. **Vérifier** : Ouvrir un nouveau terminal (cmd) et taper :
   ```
   java -version
   ```
   Résultat attendu : `java version "17.x.x"`

### 1.2 - Installer Apache Maven

1. Télécharger Maven depuis : https://maven.apache.org/download.cgi
2. Télécharger le fichier **Binary zip archive** (apache-maven-3.9.x-bin.zip)
3. Extraire dans `C:\Program Files\apache-maven-3.9.x`
4. **Configurer la variable d'environnement** :
   - Ouvrir **Variables d'environnement** (comme pour JAVA_HOME)
   - Dans **Variables système**, cliquer **Nouveau** :
     - Nom : `MAVEN_HOME`
     - Valeur : `C:\Program Files\apache-maven-3.9.x` (le chemin exact)
   - Modifier **Path** et ajouter : `%MAVEN_HOME%\bin`
5. **Vérifier** : Ouvrir un nouveau terminal et taper :
   ```
   mvn --version
   ```
   Résultat attendu : `Apache Maven 3.9.x`

### 1.3 - Installer Node.js et Angular CLI

1. Télécharger Node.js LTS depuis : https://nodejs.org/
2. Installer avec les options par défaut
3. **Vérifier** : Ouvrir un terminal et taper :
   ```
   node --version
   npm --version
   ```
4. **Installer Angular CLI** globalement :
   ```
   npm install -g @angular/cli@17
   ```
5. **Vérifier** :
   ```
   ng version
   ```

### 1.4 - Installer PostgreSQL

1. Télécharger PostgreSQL depuis : https://www.postgresql.org/download/windows/
2. Installer avec les options par défaut
3. **IMPORTANT** : Pendant l'installation, on vous demande un mot de passe pour l'utilisateur `postgres`.
   - Retenir ce mot de passe (exemple : `root`)
4. Port par défaut : `5432` (ne pas changer)
5. **Vérifier** : Ouvrir **pgAdmin 4** (installé avec PostgreSQL) et se connecter

---

## ÉTAPE 2 : Créer la base de données

### Option A : Via pgAdmin (interface graphique)

1. Ouvrir **pgAdmin 4**
2. Se connecter au serveur PostgreSQL local
3. Clic droit sur **Databases** > **Create** > **Database**
4. Nom : `alzheimer_stock`
5. Cliquer **Save**

### Option B : Via le terminal

```
psql -U postgres -h localhost
```
Entrer le mot de passe, puis :
```sql
CREATE DATABASE alzheimer_stock;
\q
```

---

## ÉTAPE 3 : Configurer le mot de passe PostgreSQL dans le projet

1. Ouvrir le fichier :
   ```
   alzheimer-detection/backend/service-stock/src/main/resources/application.yml
   ```
2. Modifier la ligne `password` avec votre mot de passe PostgreSQL :
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/alzheimer_stock
       username: postgres
       password: root    # <-- METTRE VOTRE MOT DE PASSE ICI
   ```
3. Sauvegarder le fichier

---

## ÉTAPE 4 : Compiler le backend (les 3 microservices)

Ouvrir un terminal à la racine du projet backend :

```
cd alzheimer-detection/backend
```

Lancer la compilation :

```
mvn clean install -DskipTests
```

**Attendre** la fin (première fois = téléchargement des dépendances, peut prendre 5-10 minutes).

Résultat attendu :
```
[INFO] Reactor Summary:
[INFO] Alzheimer Detection - Parent .............. SUCCESS
[INFO] Serveur Eureka - Découverte de Services ... SUCCESS
[INFO] Passerelle API - Gateway .................. SUCCESS
[INFO] Service Stock - Gestion de Stock .......... SUCCESS
[INFO] BUILD SUCCESS
```

Si vous voyez **BUILD SUCCESS**, tout est bon !

---

## ÉTAPE 5 : Lancer les microservices backend

**IMPORTANT** : Lancer dans l'ordre suivant, chaque service dans un terminal séparé.

### Terminal 1 : Eureka Server (lancer en PREMIER, attendre 15 secondes)

```
cd alzheimer-detection/backend/eureka-server
mvn spring-boot:run
```

Attendre le message :
```
Started EurekaServerApplication in X seconds
```

Vérifier dans le navigateur : http://localhost:8761

### Terminal 2 : API Gateway

```
cd alzheimer-detection/backend/api-gateway
mvn spring-boot:run
```

Attendre le message :
```
Started ApiGatewayApplication in X seconds
```

### Terminal 3 : Service Stock

```
cd alzheimer-detection/backend/service-stock
mvn spring-boot:run
```

Attendre le message :
```
Started ServiceStockApplication in X seconds
```

Vérifier que les tables sont créées automatiquement dans PostgreSQL (via pgAdmin > alzheimer_stock > Schemas > public > Tables).

---

## ÉTAPE 6 : Installer et lancer le frontend Angular

Ouvrir un **Terminal 4** :

```
cd alzheimer-detection/frontend/alzheimer-app
npm install
```

Attendre la fin de l'installation (peut prendre 2-5 minutes).

Puis lancer :

```
ng serve --open
```

Le navigateur s'ouvrira automatiquement sur : http://localhost:4200

---

## ÉTAPE 7 : Tester les APIs

### 7.1 - URLs de vérification dans le navigateur

| URL | Description |
|-----|-------------|
| http://localhost:8761 | Dashboard Eureka (voir les services) |
| http://localhost:8081/api/categories | Liste des catégories (JSON) |
| http://localhost:8081/api/produits | Liste des produits (JSON) |
| http://localhost:8081/api/tableau-de-bord | Statistiques agrégées du stock (JSON) |
| **http://localhost:8081/api/swagger-ui.html** | **Documentation interactive Swagger UI** |
| **http://localhost:4200** | **Interface backoffice Angular** |

### 7.2 - Tester avec Swagger UI (recommandé)

Ouvrir **http://localhost:8081/api/swagger-ui.html** dans le navigateur. Swagger UI permet de :

- Visualiser tous les endpoints groupés par catégorie (Tableau de Bord, Catégories, Produits)
- Cliquer **"Try it out"** sur n'importe quel endpoint pour le tester
- Voir la structure JSON attendue pour chaque requête
- Voir les codes de réponse possibles et les contraintes de validation

> Swagger UI est intégré au projet et ne nécessite aucune installation. Il remplace Postman pour les tests rapides.

### 7.3 - Tester avec Postman (alternative)

Télécharger Postman : https://www.postman.com/downloads/

#### CRUD Catégories

**1. Créer une catégorie** - `POST`
- URL : `http://localhost:8081/api/categories`
- Headers : `Content-Type: application/json`
- Body (raw JSON) :
```json
{
  "nom": "Médicaments",
  "description": "Médicaments pour le traitement de la maladie d'Alzheimer"
}
```
- Réponse attendue (201 Created) :
```json
{
  "id": 1,
  "nom": "Médicaments",
  "description": "Médicaments pour le traitement de la maladie d'Alzheimer",
  "dateCreation": "2026-02-14T22:38:38.332545",
  "dateModification": "2026-02-14T22:38:38.332545",
  "nombreProduits": 0
}
```

**2. Lister toutes les catégories** - `GET`
- URL : `http://localhost:8081/api/categories`
- Réponse : tableau JSON de toutes les catégories

**3. Obtenir une catégorie par ID** - `GET`
- URL : `http://localhost:8081/api/categories/1`

**4. Modifier une catégorie** - `PUT`
- URL : `http://localhost:8081/api/categories/1`
- Headers : `Content-Type: application/json`
- Body :
```json
{
  "nom": "Médicaments Alzheimer",
  "description": "Description modifiée"
}
```

**5. Supprimer une catégorie** - `DELETE`
- URL : `http://localhost:8081/api/categories/1`
- Réponse attendue : 204 No Content

---

#### CRUD Produits

**1. Créer un produit** - `POST`
- URL : `http://localhost:8081/api/produits`
- Headers : `Content-Type: application/json`
- Body :
```json
{
  "nom": "Donépézil 10mg",
  "description": "Inhibiteur de la cholinestérase - boîte de 30",
  "prix": 4500.00,
  "quantite": 150,
  "categorieId": 1
}
```
- **IMPORTANT** : `categorieId` doit correspondre à un ID de catégorie existante

**2. Lister tous les produits** - `GET`
- URL : `http://localhost:8081/api/produits`

**3. Lister les produits d'une catégorie** - `GET`
- URL : `http://localhost:8081/api/produits/categorie/1`

**4. Obtenir un produit par ID** - `GET`
- URL : `http://localhost:8081/api/produits/1`

**5. Modifier un produit** - `PUT`
- URL : `http://localhost:8081/api/produits/1`
- Headers : `Content-Type: application/json`
- Body :
```json
{
  "nom": "Donépézil 20mg",
  "description": "Nouvelle description",
  "prix": 5000.00,
  "quantite": 200,
  "categorieId": 1
}
```

**6. Supprimer un produit** - `DELETE`
- URL : `http://localhost:8081/api/produits/1`
- Réponse attendue : 204 No Content

---

### 7.3 - Tester via le Frontend Angular

1. Ouvrir http://localhost:4200
2. La page d'accueil affiche la **liste des catégories**
3. Cliquer sur **Nouvelle Catégorie** pour ajouter
4. Remplir le formulaire et cliquer **Créer**
5. Cliquer sur **Modifier** (bouton jaune) pour éditer
6. Cliquer sur **Supprimer** (bouton rouge) pour supprimer (avec confirmation)
7. Dans la barre de navigation, cliquer sur **Produits** pour gérer les produits
8. Même principe : Ajouter, Modifier, Supprimer
9. Le filtre par catégorie permet de filtrer les produits

---

## ÉTAPE 8 : Tester les validations

### Essayer de créer une catégorie sans nom :
```json
{
  "nom": "",
  "description": "Test"
}
```
Réponse attendue : **400 Bad Request** avec message d'erreur de validation.

### Essayer de créer un produit avec un prix négatif :
```json
{
  "nom": "Test",
  "prix": -10,
  "quantite": 5,
  "categorieId": 1
}
```
Réponse attendue : **400 Bad Request**.

### Essayer d'accéder à une catégorie inexistante :
- URL : `http://localhost:8081/api/categories/999`
- Réponse attendue : **404 Not Found** avec message "Catégorie introuvable avec id : '999'"

---

## Résumé des ports et URLs

| Service | Port | URL |
|---------|------|-----|
| Eureka Server | 8761 | http://localhost:8761 |
| API Gateway | 8080 | http://localhost:8080 |
| Service Stock | 8081 | http://localhost:8081 |
| **Swagger UI** | **8081** | **http://localhost:8081/api/swagger-ui.html** |
| OpenAPI JSON | 8081 | http://localhost:8081/api/v3/api-docs |
| **Frontend Backoffice** | **4200** | **http://localhost:4200** |
| PostgreSQL | 5432 | localhost:5432 |

## Ordre de démarrage obligatoire

1. PostgreSQL (déjà en service si installé)
2. Eureka Server (attendre 15 sec)
3. API Gateway
4. Service Stock
5. Frontend Angular (`ng serve`)

## Pour arrêter les services

- Appuyer sur `Ctrl + C` dans chaque terminal
- Ou fermer les terminaux

## Checklist de vérification rapide

Après chaque étape, vérifiez que tout est OK avant de passer à la suivante :

```
[ ] Étape 1 : Prérequis installés
    [ ] java -version          → affiche "17.x.x"
    [ ] mvn --version          → affiche "Apache Maven 3.x.x"
    [ ] node --version         → affiche "v18.x.x" ou plus
    [ ] ng version             → affiche "Angular CLI: 17.x.x"
    [ ] pgAdmin s'ouvre et se connecte au serveur

[ ] Étape 2 : Base de données créée
    [ ] Dans pgAdmin : alzheimer_stock apparaît dans Databases

[ ] Étape 3 : Mot de passe configuré
    [ ] Le fichier application.yml contient votre mot de passe

[ ] Étape 4 : Build réussi
    [ ] Le terminal affiche "BUILD SUCCESS"
    [ ] Les 3 modules affichent "SUCCESS"

[ ] Étape 5 : Backend lancé (3 terminaux ouverts)
    [ ] http://localhost:8761 → Dashboard Eureka visible
    [ ] http://localhost:8081/api/categories → affiche "[]"
    [ ] http://localhost:8081/api/swagger-ui.html → Swagger UI visible
    [ ] http://localhost:8081/api/tableau-de-bord → JSON avec statistiques
    [ ] Dans pgAdmin : tables "categories" et "produits" créées

[ ] Étape 6 : Frontend lancé
    [ ] http://localhost:4200 → Interface backoffice Angular visible
    [ ] La sidebar affiche "Tableau de Bord", "Catégories", "Produits"
    [ ] Le Dashboard affiche les 4 cartes de statistiques

[ ] Étape 7 : Tests CRUD OK (via Swagger UI ou Postman)
    [ ] Créer une catégorie → 201
    [ ] Lister les catégories → la catégorie apparaît
    [ ] Modifier la catégorie → le nom change
    [ ] Créer un produit → 201
    [ ] Lister les produits → le produit apparaît
    [ ] Supprimer le produit → 204
    [ ] Tableau de bord → statistiques mises à jour
    [ ] Vérifier sur http://localhost:4200 que les données apparaissent
```

---

## ÉTAPE 9 : Scénario de test complet (pas à pas)

Ce scénario vous guide à tester **toutes les fonctionnalités** du projet de bout en bout.

### 9.1 - Tester dans le navigateur (vérification rapide)

1. Ouvrir **http://localhost:8761**
   - Vous devez voir le **Dashboard Eureka**
   - Dans la section **"Instances currently registered with Eureka"**, vous devez voir :
     - `SERVICE-STOCK` avec le statut **UP**
     - `API-GATEWAY` avec le statut **UP**

2. Ouvrir **http://localhost:8081/api/categories**
   - Vous devez voir `[]` (tableau JSON vide) si aucune catégorie n'existe
   - Ou une liste de catégories si vous en avez déjà créé

3. Ouvrir **http://localhost:8081/api/swagger-ui.html**
   - Vous devez voir l'interface **Swagger UI** avec 3 groupes d'API :
     - **Tableau de Bord** (1 endpoint)
     - **Catégories** (5 endpoints)
     - **Produits** (6 endpoints)

4. Ouvrir **http://localhost:4200**
   - L'interface backoffice Angular s'affiche avec la sidebar à gauche
   - Le Dashboard affiche les 4 cartes de statistiques

### 9.2 - Test complet avec Postman (étape par étape)

Ouvrir **Postman** et suivre ces étapes dans l'ordre :

#### A. Créer 3 catégories

**Requête 1** : `POST http://localhost:8081/api/categories`
- Onglet **Headers** : ajouter `Content-Type` = `application/json`
- Onglet **Body** > **raw** > **JSON** :
```json
{
  "nom": "Medicaments",
  "description": "Medicaments pour le traitement de la maladie Alzheimer"
}
```
- Cliquer **Send**
- Vérifier : Status **201 Created**, la réponse contient `"id": 1`

**Requête 2** : `POST http://localhost:8081/api/categories`
```json
{
  "nom": "Equipements Medicaux",
  "description": "Materiel et equipements pour le diagnostic"
}
```
- Vérifier : `"id": 2`

**Requête 3** : `POST http://localhost:8081/api/categories`
```json
{
  "nom": "Complements Alimentaires",
  "description": "Supplements nutritionnels recommandes"
}
```
- Vérifier : `"id": 3`

#### B. Vérifier les catégories créées

**Requête 4** : `GET http://localhost:8081/api/categories`
- Vérifier : Status **200 OK**, vous voyez les 3 catégories

**Requête 5** : `GET http://localhost:8081/api/categories/1`
- Vérifier : Status **200 OK**, vous voyez la catégorie "Medicaments"

#### C. Modifier une catégorie

**Requête 6** : `PUT http://localhost:8081/api/categories/1`
```json
{
  "nom": "Medicaments Alzheimer",
  "description": "Tous les medicaments pour le traitement"
}
```
- Vérifier : Status **200 OK**, le nom a changé

#### D. Créer des produits

**Requête 7** : `POST http://localhost:8081/api/produits`
```json
{
  "nom": "Donepezil 10mg",
  "description": "Inhibiteur de la cholinesterase - boite de 30",
  "prix": 4500.00,
  "quantite": 150,
  "categorieId": 1
}
```
- Vérifier : Status **201 Created**, `"categorieNom": "Medicaments Alzheimer"`

**Requête 8** : `POST http://localhost:8081/api/produits`
```json
{
  "nom": "Rivastigmine Patch",
  "description": "Patch transdermique 4.6mg/24h",
  "prix": 6200.00,
  "quantite": 80,
  "categorieId": 1
}
```

**Requête 9** : `POST http://localhost:8081/api/produits`
```json
{
  "nom": "Scanner IRM Portable",
  "description": "Appareil imagerie pour diagnostic precoce",
  "prix": 250000.00,
  "quantite": 5,
  "categorieId": 2
}
```

#### E. Vérifier les produits

**Requête 10** : `GET http://localhost:8081/api/produits`
- Vérifier : 3 produits dans la liste

**Requête 11** : `GET http://localhost:8081/api/produits/categorie/1`
- Vérifier : Seulement les 2 produits de la catégorie "Medicaments Alzheimer"

**Requête 12** : `GET http://localhost:8081/api/produits/categorie/2`
- Vérifier : Seulement le "Scanner IRM Portable"

#### F. Modifier un produit

**Requête 13** : `PUT http://localhost:8081/api/produits/1`
```json
{
  "nom": "Donepezil 20mg",
  "description": "Dosage augmente",
  "prix": 5000.00,
  "quantite": 200,
  "categorieId": 1
}
```
- Vérifier : le prix et la quantité ont changé

#### G. Tester les erreurs

**Requête 14** : `POST http://localhost:8081/api/categories` (nom vide)
```json
{
  "nom": "",
  "description": "Test"
}
```
- Vérifier : Status **400 Bad Request**, message d'erreur de validation

**Requête 15** : `GET http://localhost:8081/api/categories/999`
- Vérifier : Status **404 Not Found**, message "introuvable"

**Requête 16** : `POST http://localhost:8081/api/produits` (catégorie inexistante)
```json
{
  "nom": "Test",
  "description": "Test",
  "prix": 100.00,
  "quantite": 10,
  "categorieId": 999
}
```
- Vérifier : Status **404 Not Found**

#### H. Supprimer

**Requête 17** : `DELETE http://localhost:8081/api/produits/1`
- Vérifier : Status **204 No Content**

**Requête 18** : `GET http://localhost:8081/api/produits`
- Vérifier : Le produit supprimé n'apparaît plus

#### I. Supprimer une catégorie (cascade)

**Requête 19** : `DELETE http://localhost:8081/api/categories/1`
- Vérifier : Status **204 No Content**
- **IMPORTANT** : Tous les produits de cette catégorie sont aussi supprimés (CASCADE)

**Requête 20** : `GET http://localhost:8081/api/produits`
- Vérifier : Les produits de la catégorie 1 ont disparu, il reste seulement le Scanner IRM

### 9.3 - Tester via l'interface Angular

1. Ouvrir **http://localhost:4200**
2. Vous voyez les catégories restantes dans le tableau
3. Cliquer **Nouvelle Catégorie**
   - Remplir : Nom = "Test Angular", Description = "Cree depuis Angular"
   - Cliquer **Créer**
   - Vous êtes redirigé vers la liste, la catégorie apparaît
4. Cliquer **Modifier** sur la catégorie créée
   - Changer le nom, cliquer **Modifier**
   - Le nom est mis à jour dans la liste
5. Cliquer **Produits** dans la sidebar
6. Cliquer **Nouveau Produit**
   - Remplir les champs, choisir une catégorie dans la liste déroulante
   - Cliquer **Créer**
7. Utiliser le **filtre par catégorie** pour filtrer les produits
8. Cliquer **Supprimer** sur un produit
   - La modale de confirmation s'affiche
   - Cliquer **Supprimer** pour confirmer
   - Le produit disparaît de la liste

### 9.4 - Tableau récapitulatif des tests

| # | Test | Méthode | URL | Résultat attendu |
|---|------|---------|-----|------------------|
| 1 | Créer catégorie | POST | /api/categories | 201 Created |
| 2 | Lister catégories | GET | /api/categories | 200 + tableau JSON |
| 3 | Obtenir catégorie | GET | /api/categories/1 | 200 + objet JSON |
| 4 | Modifier catégorie | PUT | /api/categories/1 | 200 + objet modifié |
| 5 | Supprimer catégorie | DELETE | /api/categories/1 | 204 No Content |
| 6 | Créer produit | POST | /api/produits | 201 Created |
| 7 | Lister produits | GET | /api/produits | 200 + tableau JSON |
| 8 | Produits par catégorie | GET | /api/produits/categorie/1 | 200 + tableau filtré |
| 9 | Obtenir produit | GET | /api/produits/1 | 200 + objet JSON |
| 10 | Modifier produit | PUT | /api/produits/1 | 200 + objet modifié |
| 11 | Supprimer produit | DELETE | /api/produits/1 | 204 No Content |
| 12 | Validation nom vide | POST | /api/categories | 400 Bad Request |
| 13 | Ressource inexistante | GET | /api/categories/999 | 404 Not Found |
| 14 | Tableau de bord | GET | /api/tableau-de-bord | 200 + statistiques agrégées |
| 15 | Swagger UI | Navigateur | /api/swagger-ui.html | Documentation interactive |
| 16 | Interface backoffice | Navigateur | http://localhost:4200 | Dashboard + CRUD visuel OK |

---

## En cas de problème

| Problème | Solution |
|----------|----------|
| `JAVA_HOME is not defined` | Configurer la variable d'environnement JAVA_HOME (voir Étape 1.1) |
| `mvn: command not found` | Configurer la variable d'environnement MAVEN_HOME dans Path (voir Étape 1.2) |
| `ng: command not found` | Exécuter `npm install -g @angular/cli@17` |
| `Connection refused port 5432` | Vérifier que PostgreSQL est lancé (Services Windows > postgresql) |
| `password authentication failed` | Vérifier le mot de passe dans `application.yml` |
| `Port already in use` | Fermer le service qui utilise le port ou changer le port dans `application.yml` |
| `BUILD FAILURE` sur Maven | Vérifier la connexion internet (téléchargement des dépendances) |
| Eureka non accessible | S'assurer que le port 8761 est libre et que Eureka a fini de démarrer |
| `npm install` échoue | Vérifier la connexion internet, essayer `npm cache clean --force` puis réessayer |
| Les données n'apparaissent pas dans Angular | Vérifier que le Service Stock tourne sur le port 8081 |
| CORS error dans la console Angular | Vérifier que l'API Gateway est lancé et configuré |
| Les tables ne se créent pas | Vérifier que la base `alzheimer_stock` existe dans pgAdmin |
