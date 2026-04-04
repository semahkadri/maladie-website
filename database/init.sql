-- =====================================================
-- Projet : PharmaCare — Gestion de Stock
-- Base de données : PostgreSQL
-- Version : 2.0  (promo + expiry + email_logs)
-- =====================================================

-- Création de la base de données
CREATE DATABASE alzheimer_stock
    WITH ENCODING 'UTF8'
    LC_COLLATE = 'fr_FR.UTF-8'
    LC_CTYPE = 'fr_FR.UTF-8';

-- Connexion à la base
\c alzheimer_stock;

-- =====================================================
--  TABLE : categories
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id                  BIGSERIAL PRIMARY KEY,
    nom                 VARCHAR(100) NOT NULL UNIQUE,
    description         VARCHAR(500),
    date_creation       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
--  TABLE : produits
--
--  New columns vs original schema:
--    image_url          — public URL for product image
--    prix_original      — pre-discount price (NULL = no promo ever set)
--    en_promo           — TRUE while the promotion is active
--    date_fin_promo     — promo expiry timestamp; backend computes
--                         isPromoActive = en_promo AND date_fin_promo > NOW()
--    date_expiration    — pharmaceutical expiry date (product shelf life)
--    numero_lot         — batch / lot number for traceability
-- =====================================================
CREATE TABLE IF NOT EXISTS produits (
    id                  BIGSERIAL PRIMARY KEY,
    nom                 VARCHAR(100) NOT NULL,
    description         VARCHAR(500),
    prix                DECIMAL(10, 2) NOT NULL CHECK (prix > 0),
    quantite            INTEGER NOT NULL CHECK (quantite >= 0),
    image_url           VARCHAR(500),
    prix_original       DECIMAL(10, 2),
    en_promo            BOOLEAN DEFAULT FALSE,
    date_fin_promo      TIMESTAMP,
    date_expiration     DATE,
    numero_lot          VARCHAR(50),
    categorie_id        BIGINT NOT NULL,
    date_creation       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categorie FOREIGN KEY (categorie_id)
        REFERENCES categories (id) ON DELETE CASCADE
);

-- =====================================================
--  TABLE : paniers
-- =====================================================
CREATE TABLE IF NOT EXISTS paniers (
    id                  BIGSERIAL PRIMARY KEY,
    session_id          VARCHAR(100) NOT NULL UNIQUE,
    date_creation       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
--  TABLE : lignes_panier
-- =====================================================
CREATE TABLE IF NOT EXISTS lignes_panier (
    id                  BIGSERIAL PRIMARY KEY,
    panier_id           BIGINT NOT NULL,
    produit_id          BIGINT NOT NULL,
    quantite            INTEGER NOT NULL CHECK (quantite > 0),
    date_ajout          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ligne_panier  FOREIGN KEY (panier_id)  REFERENCES paniers  (id) ON DELETE CASCADE,
    CONSTRAINT fk_ligne_produit FOREIGN KEY (produit_id) REFERENCES produits (id),
    CONSTRAINT uq_panier_produit UNIQUE (panier_id, produit_id)
);

-- =====================================================
--  TABLE : commandes
-- =====================================================
CREATE TABLE IF NOT EXISTS commandes (
    id                  BIGSERIAL PRIMARY KEY,
    reference           VARCHAR(20) NOT NULL UNIQUE,
    nom_client          VARCHAR(100) NOT NULL,
    email_client        VARCHAR(150),
    telephone_client    VARCHAR(20),
    adresse_livraison   TEXT,
    statut              VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE',
    montant_total       DECIMAL(10, 2) NOT NULL,
    date_commande       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
--  TABLE : lignes_commande
--
--  New column vs original schema:
--    prix_original_unitaire — snapshot of prix_original at order time
--                             (NULL if product was not on promo)
-- =====================================================
CREATE TABLE IF NOT EXISTS lignes_commande (
    id                      BIGSERIAL PRIMARY KEY,
    commande_id             BIGINT NOT NULL,
    produit_id              BIGINT NOT NULL,
    nom_produit             VARCHAR(100) NOT NULL,
    prix_unitaire           DECIMAL(10, 2) NOT NULL,
    prix_original_unitaire  DECIMAL(10, 2),
    quantite                INTEGER NOT NULL CHECK (quantite > 0),
    sous_total              DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_ligne_commande     FOREIGN KEY (commande_id) REFERENCES commandes (id) ON DELETE CASCADE,
    CONSTRAINT fk_ligne_cmd_produit  FOREIGN KEY (produit_id)  REFERENCES produits  (id)
);

-- =====================================================
--  TABLE : email_logs
--
--  Stores every outbound e-mail (order confirmations, etc.)
--  for audit and debug purposes.
--
--  Columns:
--    type               — CONFIRMATION | STATUT_CHANGE | ADMIN_NOTIFICATION
--    reference_commande — order reference string (e.g. CMD-2026-00001)
--    lu                 — whether the admin has read/acknowledged the log
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
    id                  BIGSERIAL PRIMARY KEY,
    destinataire        VARCHAR(150) NOT NULL,
    sujet               VARCHAR(255) NOT NULL,
    contenu_html        TEXT NOT NULL,
    type                VARCHAR(50) NOT NULL,
    reference_commande  VARCHAR(50),
    lu                  BOOLEAN NOT NULL DEFAULT FALSE,
    date_envoi          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
--  INDEXES
-- =====================================================
CREATE INDEX idx_produit_categorie       ON produits       (categorie_id);
CREATE INDEX idx_produit_nom             ON produits       (nom);
CREATE INDEX idx_produit_en_promo        ON produits       (en_promo);
CREATE INDEX idx_produit_date_expiration ON produits       (date_expiration);
CREATE INDEX idx_categorie_nom           ON categories     (nom);
CREATE INDEX idx_panier_session          ON paniers        (session_id);
CREATE INDEX idx_ligne_panier_panier     ON lignes_panier  (panier_id);
CREATE INDEX idx_commande_reference      ON commandes      (reference);
CREATE INDEX idx_commande_statut         ON commandes      (statut);
CREATE INDEX idx_ligne_commande_commande ON lignes_commande(commande_id);
CREATE INDEX idx_email_reference         ON email_logs     (reference_commande);
CREATE INDEX idx_email_type              ON email_logs     (type);
CREATE INDEX idx_email_lu               ON email_logs     (lu);
