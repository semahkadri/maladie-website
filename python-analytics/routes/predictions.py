"""
Prédictions globales — Tableau de bord analytique combinant
péremption, demande, et détection d'anomalies.
"""

from fastapi import APIRouter
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from database import get_commandes, get_produits, get_ventes_par_produit

router = APIRouter()


@router.get("/dashboard")
def dashboard_analytique():
    """
    Tableau de bord analytique global avec KPIs avancés.
    Combine toutes les analyses Python en un seul endpoint.
    """
    produits = get_produits()
    ventes = get_ventes_par_produit()
    commandes = get_commandes()

    now = datetime.now()

    # --- KPI 1 : Produits proches de l'expiration ---
    produits_exp = produits[produits["date_expiration"].notna()].copy()
    produits_exp["date_expiration"] = pd.to_datetime(produits_exp["date_expiration"])
    produits_exp["jours_restants"] = (produits_exp["date_expiration"] - pd.Timestamp(now)).dt.days

    expires = int((produits_exp["jours_restants"] <= 0).sum())
    expire_30j = int(((produits_exp["jours_restants"] > 0) & (produits_exp["jours_restants"] <= 30)).sum())
    expire_90j = int(((produits_exp["jours_restants"] > 30) & (produits_exp["jours_restants"] <= 90)).sum())

    # --- KPI 2 : Valeur du stock à risque ---
    produits_risque = produits_exp[produits_exp["jours_restants"] <= 30].copy()
    valeur_risque = float((produits_risque["prix"] * produits_risque["quantite"]).sum()) if not produits_risque.empty else 0

    # --- KPI 3 : Taux de rotation global ---
    total_vendu = float(ventes["total_vendu"].sum()) if not ventes.empty else 0
    total_stock = float(produits["quantite"].sum()) if not produits.empty else 1
    taux_rotation = round(total_vendu / max(total_stock, 1), 2)

    # --- KPI 4 : Détection d'anomalies de ventes ---
    anomalies = []
    if not commandes.empty:
        commandes_copy = commandes.copy()
        commandes_copy["date_commande"] = pd.to_datetime(commandes_copy["date_commande"])

        # Agréger par jour
        journalier = commandes_copy.groupby(commandes_copy["date_commande"].dt.date).agg(
            nb_articles=("quantite", "sum"),
            montant=("sous_total", "sum")
        ).reset_index()

        if len(journalier) >= 5:
            # Isolation Forest pour détecter les jours anormaux
            X = journalier[["nb_articles", "montant"]].values
            iso = IsolationForest(contamination=0.1, random_state=42)
            journalier["anomalie"] = iso.fit_predict(X)

            jours_anormaux = journalier[journalier["anomalie"] == -1]
            for _, jour in jours_anormaux.iterrows():
                anomalies.append({
                    "date": str(jour["date_commande"]),
                    "articles": int(jour["nb_articles"]),
                    "montant": round(float(jour["montant"]), 2),
                    "type": "ventes_inhabituelles"
                })

    # --- KPI 5 : Top produits à réapprovisionner ---
    produits_reappro = []
    for _, prod in produits.iterrows():
        stock = prod["quantite"] or 0
        vente = ventes[ventes["produit_id"] == prod["id"]]
        vendu_90j = float(vente["total_vendu"].sum()) if len(vente) > 0 else 0
        vente_jour = vendu_90j / 90.0

        if vente_jour > 0:
            jours_stock = stock / vente_jour
            if jours_stock < 14:  # Moins de 2 semaines de stock
                produits_reappro.append({
                    "produitId": int(prod["id"]),
                    "nom": prod["nom"],
                    "stock": int(stock),
                    "ventesParJour": round(vente_jour, 1),
                    "joursDeStock": round(jours_stock, 1),
                    "urgence": "critique" if jours_stock < 7 else "attention"
                })

    produits_reappro.sort(key=lambda x: x["joursDeStock"])

    return {
        "genereLe": now.isoformat(),
        "methode": "Python — Pandas + Scikit-learn (Isolation Forest)",
        "kpis": {
            "produitsExpires": expires,
            "expireDans30j": expire_30j,
            "expireDans90j": expire_90j,
            "valeurStockRisque": round(valeur_risque, 2),
            "tauxRotation90j": taux_rotation,
            "anomaliesDetectees": len(anomalies)
        },
        "alertesReapprovisionnement": produits_reappro[:10],
        "anomaliesVentes": anomalies[:10]
    }
