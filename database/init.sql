-- =====================================================
-- Projet : Détection Maladie Alzheimer
-- Module : Gestion de Stock
-- Base de données : PostgreSQL
-- =====================================================

-- Création de la base de données
CREATE DATABASE alzheimer_stock
    WITH ENCODING 'UTF8'
    LC_COLLATE = 'fr_FR.UTF-8'
    LC_CTYPE = 'fr_FR.UTF-8';

-- Connexion à la base
\c alzheimer_stock;

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    prix DECIMAL(10, 2) NOT NULL CHECK (prix > 0),
    quantite INTEGER NOT NULL CHECK (quantite >= 0),
    categorie_id BIGINT NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categorie FOREIGN KEY (categorie_id)
        REFERENCES categories (id) ON DELETE CASCADE
);

-- Index pour les performances
CREATE INDEX idx_produit_categorie ON produits (categorie_id);
CREATE INDEX idx_produit_nom ON produits (nom);
CREATE INDEX idx_categorie_nom ON categories (nom);

-- Données de test
INSERT INTO categories (nom, description) VALUES
    ('Médicaments', 'Médicaments pour le traitement de la maladie d''Alzheimer'),
    ('Équipements Médicaux', 'Matériel et équipements pour le diagnostic'),
    ('Compléments Alimentaires', 'Suppléments nutritionnels recommandés'),
    ('Matériel de Rééducation', 'Outils pour la rééducation cognitive');

INSERT INTO produits (nom, description, prix, quantite, categorie_id) VALUES
    ('Donépézil 10mg', 'Inhibiteur de la cholinestérase - boîte de 30', 4500.00, 150, 1),
    ('Rivastigmine Patch', 'Patch transdermique 4.6mg/24h', 6200.00, 80, 1),
    ('Mémantine 20mg', 'Antagoniste des récepteurs NMDA - boîte de 28', 3800.00, 200, 1),
    ('Scanner IRM Portable', 'Appareil d''imagerie pour diagnostic précoce', 250000.00, 5, 2),
    ('Kit de Test Cognitif', 'Ensemble d''outils pour évaluation MMSE', 15000.00, 30, 2),
    ('Oméga-3 DHA', 'Capsules d''acides gras oméga-3 - 120 capsules', 2800.00, 300, 3),
    ('Vitamine E 400UI', 'Antioxydant - boîte de 60 capsules', 1500.00, 250, 3),
    ('Jeux de Mémoire', 'Set de jeux cognitifs pour stimulation', 8500.00, 45, 4),
    ('Tablette Cognitive', 'Tablette avec applications de rééducation', 35000.00, 20, 4);

-- =====================================================
-- Module : Panier & Commandes
-- =====================================================

-- Table des paniers (sessions d'achat)
CREATE TABLE IF NOT EXISTS paniers (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes de panier
CREATE TABLE IF NOT EXISTS lignes_panier (
    id BIGSERIAL PRIMARY KEY,
    panier_id BIGINT NOT NULL,
    produit_id BIGINT NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ligne_panier FOREIGN KEY (panier_id)
        REFERENCES paniers (id) ON DELETE CASCADE,
    CONSTRAINT fk_ligne_produit FOREIGN KEY (produit_id)
        REFERENCES produits (id),
    CONSTRAINT uq_panier_produit UNIQUE (panier_id, produit_id)
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS commandes (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(20) NOT NULL UNIQUE,
    nom_client VARCHAR(100) NOT NULL,
    email_client VARCHAR(150),
    telephone_client VARCHAR(20),
    adresse_livraison TEXT,
    statut VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE',
    montant_total DECIMAL(10, 2) NOT NULL,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des lignes de commande
CREATE TABLE IF NOT EXISTS lignes_commande (
    id BIGSERIAL PRIMARY KEY,
    commande_id BIGINT NOT NULL,
    produit_id BIGINT NOT NULL,
    nom_produit VARCHAR(100) NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    quantite INTEGER NOT NULL CHECK (quantite > 0),
    sous_total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_ligne_commande FOREIGN KEY (commande_id)
        REFERENCES commandes (id) ON DELETE CASCADE,
    CONSTRAINT fk_ligne_cmd_produit FOREIGN KEY (produit_id)
        REFERENCES produits (id)
);

-- Index pour les performances
CREATE INDEX idx_panier_session ON paniers (session_id);
CREATE INDEX idx_ligne_panier_panier ON lignes_panier (panier_id);
CREATE INDEX idx_commande_reference ON commandes (reference);
CREATE INDEX idx_commande_statut ON commandes (statut);
CREATE INDEX idx_ligne_commande_commande ON lignes_commande (commande_id);
