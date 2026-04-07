"""
Connexion à la base PostgreSQL (même base que service-stock Java).
Lecture seule — ce service ne modifie jamais les données.
"""

import os
from sqlalchemy import create_engine, text
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost:5432/alzheimer_stock")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def get_produits() -> pd.DataFrame:
    """Récupère tous les produits avec leur catégorie."""
    query = text("""
        SELECT p.id, p.nom, p.prix, p.quantite, p.date_expiration,
               p.numero_lot, p.en_promo, p.date_creation,
               c.nom AS categorie_nom
        FROM produits p
        LEFT JOIN categories c ON p.categorie_id = c.id
        ORDER BY p.id
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


def get_commandes() -> pd.DataFrame:
    """Récupère toutes les commandes avec leurs lignes."""
    query = text("""
        SELECT c.id AS commande_id, c.date_commande, c.statut, c.montant_total,
               lc.produit_id, lc.nom_produit, lc.quantite, lc.prix_unitaire, lc.sous_total
        FROM commandes c
        JOIN lignes_commande lc ON lc.commande_id = c.id
        ORDER BY c.date_commande DESC
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)


def get_ventes_par_produit() -> pd.DataFrame:
    """Agrège les ventes par produit sur les 90 derniers jours."""
    query = text("""
        SELECT lc.produit_id, lc.nom_produit,
               SUM(lc.quantite) AS total_vendu,
               SUM(lc.sous_total) AS chiffre_affaires,
               COUNT(DISTINCT c.id) AS nb_commandes
        FROM lignes_commande lc
        JOIN commandes c ON c.id = lc.commande_id
        WHERE c.date_commande >= NOW() - INTERVAL '90 days'
          AND c.statut NOT IN ('ANNULEE')
        GROUP BY lc.produit_id, lc.nom_produit
        ORDER BY total_vendu DESC
    """)
    with engine.connect() as conn:
        return pd.read_sql(query, conn)
