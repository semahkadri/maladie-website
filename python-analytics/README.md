# PharmaCare — Service d'Analyse Prédictive (Python)

## Présentation

Ce microservice Python utilise **FastAPI**, **Pandas** et **Scikit-learn** pour fournir des analyses prédictives avancées sur les données de stock pharmaceutique. Il se connecte à la **même base PostgreSQL** que le service-stock Java et expose des endpoints REST consommés par le frontend Angular.

---

## Technologies

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Python** | 3.10+ | Langage |
| **FastAPI** | 0.115 | Framework API REST |
| **Pandas** | 2.2 | Manipulation et analyse de données |
| **Scikit-learn** | 1.5 | Machine Learning (régression, détection d'anomalies) |
| **SQLAlchemy** | 2.0 | Connexion PostgreSQL (lecture seule) |
| **Uvicorn** | 0.30 | Serveur ASGI |

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Angular (4200)  │────▶│  Java/Spring     │────▶│  PostgreSQL     │
│  /admin/         │     │  service-stock   │     │  alzheimer_stock│
│  predictions     │     │  (8081)          │     │                 │
│                  │     └──────────────────┘     └────────┬────────┘
│                  │                                       │
│                  │     ┌──────────────────┐              │
│                  │────▶│  Python/FastAPI   │──────────────┘
│                  │     │  analytics       │  (lecture seule)
│                  │     │  (8083)          │
└─────────────────┘     └──────────────────┘
```

Le service Python lit les tables `produits`, `commandes` et `lignes_commande` — il ne modifie **jamais** les données.

---

## Modèles et Algorithmes

### 1. Analyse de Péremption (`/api/analytics/expiration`)

**Type** : Calcul basé sur des règles (Rule-Based)

**Comment ça marche** :
- Pour chaque produit, calcule le **taux de consommation journalier** (ventes des 90 derniers jours ÷ 90)
- Compare le stock actuel avec les jours restants avant expiration
- Si `stock / taux_consommation > jours_avant_expiration` → surplus qui va expirer

**Score de risque (0-100)** :
- 0 = aucun risque (stock sera écoulé avant expiration)
- 100 = produit déjà expiré

**Statuts** : `OK`, `ATTENTION`, `RISQUE_ÉLEVÉ`, `EXPIRÉ`, `RUPTURE`

**Input** : Tables `produits` (date_expiration, quantite) + `lignes_commande` (ventes)
**Output** : Score de risque + recommandation par produit

---

### 2. Prévision de Demande (`/api/analytics/demand-forecast`)

**Type** : Machine Learning supervisé — **Régression Linéaire** (scikit-learn)

**Comment ça marche** :
```
Données historiques (ventes par semaine) → LinearRegression.fit() → Prédiction 4 semaines
```

1. Agrège les ventes par **semaine** pour chaque produit
2. Entraîne un modèle `LinearRegression` sur l'historique
3. Prédit la demande des **4 prochaines semaines** (30 jours)
4. Calcule la **quantité à commander** = demande prévue + 20% marge - stock actuel

**Indicateurs** :
- **Tendance** : hausse / stable / baisse (basé sur le coefficient de la droite)
- **Confiance** : élevée (R² > 0.7), moyenne (0.4-0.7), faible (< 0.4)
- **R² Score** : mesure la qualité de la prédiction (0 = mauvais, 1 = parfait)

**Input** : Tables `commandes` + `lignes_commande` (historique des ventes)
**Output** : Demande prévisionnelle 30j + quantité recommandée + tendance + confiance

---

### 3. Détection d'Anomalies (`/api/analytics/dashboard`)

**Type** : Machine Learning non supervisé — **Isolation Forest** (scikit-learn)

**Comment ça marche** :
```
Ventes journalières (nb_articles, montant) → IsolationForest.fit_predict() → Jours anormaux
```

1. Agrège les ventes par **jour** (nombre d'articles + montant total)
2. Applique `IsolationForest(contamination=0.1)` — détecte les 10% de jours les plus inhabituels
3. Un jour avec 40 articles quand la moyenne est 12 → **anomalie détectée**

**Paramètres** :
- `contamination=0.1` : 10% des jours sont considérés anormaux
- `random_state=42` : résultats reproductibles
- Minimum 5 jours de données requis

**Input** : Table `commandes` (date, articles, montant par jour)
**Output** : Liste des jours anormaux avec détails

---

## Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/analytics/dashboard` | KPIs globaux + anomalies + alertes réapprovisionnement |
| GET | `/api/analytics/expiration` | Analyse péremption par produit |
| GET | `/api/analytics/demand-forecast` | Prévision de demande ML par produit |

**Documentation Swagger** : http://localhost:8083/docs

---

## Lancement

```bash
cd python-analytics
pip install -r requirements.txt
uvicorn main:app --port 8083 --reload
```

**Prérequis** :
- Python 3.10+
- PostgreSQL en cours d'exécution avec la base `alzheimer_stock`
- Configurer `.env` (copier depuis `.env.example`)

---

## Configuration

Fichier `.env` (copier `.env.example`) :
```
DATABASE_URL=postgresql://postgres:root@localhost:5432/alzheimer_stock
AI_API_KEY=your-openrouter-api-key-here
```

---

## Structure des fichiers

```
python-analytics/
├── main.py              # Point d'entrée FastAPI
├── database.py          # Connexion PostgreSQL + requêtes SQL
├── requirements.txt     # Dépendances Python
├── .env.example         # Template de configuration
├── .env                 # Configuration locale (gitignored)
├── seed_test_data.sql   # Données de test pour PostgreSQL
└── routes/
    ├── __init__.py
    ├── expiration.py    # Analyse de péremption (Rule-Based)
    ├── demand.py        # Prévision de demande (LinearRegression)
    └── predictions.py   # Dashboard + Anomalies (IsolationForest)
```
