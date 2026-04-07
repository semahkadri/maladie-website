"""
Prévision de demande — Utilise scikit-learn pour prédire la demande future
et recommander les quantités de réapprovisionnement optimales.
"""

from fastapi import APIRouter
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from database import get_commandes, get_produits

router = APIRouter()


@router.get("/demand-forecast")
def prevoir_demande():
    """
    Prévision de demande par produit pour les 30 prochains jours.
    Utilise une régression linéaire sur l'historique des ventes.
    """
    commandes = get_commandes()
    produits = get_produits()

    if commandes.empty:
        return {"message": "Pas assez de données de ventes", "previsions": []}

    # Convertir les dates
    commandes["date_commande"] = pd.to_datetime(commandes["date_commande"])

    # Filtrer les commandes non annulées
    commandes = commandes[commandes["statut"] != "ANNULEE"]

    previsions = []

    for _, prod in produits.iterrows():
        produit_id = prod["id"]
        nom = prod["nom"]
        stock_actuel = prod["quantite"] or 0
        prix = float(prod["prix"]) if prod["prix"] else 0

        # Ventes de ce produit par semaine
        ventes_produit = commandes[commandes["produit_id"] == produit_id].copy()

        if ventes_produit.empty:
            previsions.append({
                "produitId": int(produit_id),
                "nom": nom,
                "stockActuel": int(stock_actuel),
                "demandePrevisionnelle30j": 0,
                "quantiteRecommandee": max(0, 5 - int(stock_actuel)),
                "confiance": "faible",
                "tendance": "stable"
            })
            continue

        # Agréger par semaine
        ventes_produit["semaine"] = ventes_produit["date_commande"].dt.isocalendar().week.astype(int)
        ventes_produit["annee"] = ventes_produit["date_commande"].dt.year
        hebdo = ventes_produit.groupby(["annee", "semaine"])["quantite"].sum().reset_index()
        hebdo["index_semaine"] = range(len(hebdo))

        if len(hebdo) < 2:
            # Pas assez de données pour la régression
            moy = float(hebdo["quantite"].mean())
            previsions.append({
                "produitId": int(produit_id),
                "nom": nom,
                "stockActuel": int(stock_actuel),
                "demandePrevisionnelle30j": int(moy * 4),
                "quantiteRecommandee": max(0, int(moy * 4) - int(stock_actuel)),
                "confiance": "faible",
                "tendance": "stable"
            })
            continue

        # Régression linéaire
        X = hebdo[["index_semaine"]].values
        y = hebdo["quantite"].values

        model = LinearRegression()
        model.fit(X, y)

        # Prédire les 4 prochaines semaines
        prochaines = np.array([[len(hebdo) + i] for i in range(4)])
        predictions = model.predict(prochaines)
        demande_30j = max(0, int(sum(predictions)))

        # Tendance
        coef = model.coef_[0]
        if coef > 0.5:
            tendance = "hausse"
        elif coef < -0.5:
            tendance = "baisse"
        else:
            tendance = "stable"

        # Confiance basée sur R²
        r2 = model.score(X, y)
        confiance = "élevée" if r2 > 0.7 else "moyenne" if r2 > 0.4 else "faible"

        # Quantité à commander (demande prévue - stock actuel + marge de sécurité 20%)
        marge = int(demande_30j * 0.2)
        quantite_recommandee = max(0, demande_30j + marge - int(stock_actuel))

        previsions.append({
            "produitId": int(produit_id),
            "nom": nom,
            "stockActuel": int(stock_actuel),
            "demandePrevisionnelle30j": demande_30j,
            "quantiteRecommandee": quantite_recommandee,
            "confiance": confiance,
            "tendance": tendance,
            "r2Score": round(r2, 3)
        })

    # Trier par quantité recommandée décroissante
    previsions.sort(key=lambda x: x["quantiteRecommandee"], reverse=True)

    return {
        "periode": "30 jours",
        "methode": "Régression Linéaire (scikit-learn)",
        "totalProduits": len(previsions),
        "previsions": previsions
    }
