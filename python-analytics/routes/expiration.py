"""
Analyse de péremption — Prédit quels produits vont expirer avant d'être vendus.
Utilise le taux de consommation réel vs la date d'expiration.
"""

from fastapi import APIRouter
from datetime import datetime, timedelta
import pandas as pd
from database import get_produits, get_ventes_par_produit

router = APIRouter()


@router.get("/expiration")
def analyser_peremption():
    """
    Analyse le risque de péremption pour chaque produit.
    Retourne un score de risque (0-100) et des recommandations.
    """
    produits = get_produits()
    ventes = get_ventes_par_produit()

    resultats = []
    now = datetime.now()

    for _, prod in produits.iterrows():
        produit_id = prod["id"]
        nom = prod["nom"]
        stock = prod["quantite"] or 0
        date_exp = prod["date_expiration"]
        categorie = prod["categorie_nom"] or "Non classé"

        # Trouver les ventes de ce produit
        vente = ventes[ventes["produit_id"] == produit_id]
        total_vendu_90j = int(vente["total_vendu"].sum()) if len(vente) > 0 else 0
        vente_par_jour = total_vendu_90j / 90.0

        # Jours avant expiration
        jours_avant_exp = None
        if date_exp and pd.notna(date_exp):
            date_exp_dt = pd.to_datetime(date_exp)
            jours_avant_exp = max(0, (date_exp_dt - pd.Timestamp(now)).days)

        # Calcul du risque
        risque_score = 0
        recommandation = ""
        statut = "OK"

        if jours_avant_exp is not None:
            if jours_avant_exp == 0:
                risque_score = 100
                statut = "EXPIRE"
                recommandation = "Produit expiré — retirer immédiatement du stock"
            elif vente_par_jour > 0:
                jours_pour_ecouler = stock / vente_par_jour
                if jours_pour_ecouler > jours_avant_exp:
                    # Stock ne sera pas écoulé avant expiration
                    surplus = stock - (vente_par_jour * jours_avant_exp)
                    risque_score = min(95, int((surplus / max(stock, 1)) * 100))
                    statut = "RISQUE_ELEVÉ" if risque_score > 60 else "ATTENTION"
                    recommandation = f"~{int(surplus)} unités risquent d'expirer. Envisager une promotion."
                else:
                    risque_score = max(0, 20 - jours_avant_exp)
                    statut = "OK"
                    recommandation = "Stock sera écoulé avant expiration"
            elif stock > 0:
                # Pas de ventes mais du stock
                risque_score = min(90, 50 + int((30 - min(jours_avant_exp, 30)) * 1.5))
                statut = "RISQUE_ELEVÉ" if jours_avant_exp < 30 else "ATTENTION"
                recommandation = f"Aucune vente récente — {stock} unités en stock, expire dans {jours_avant_exp}j"
        elif stock == 0:
            statut = "RUPTURE"
            recommandation = "Stock épuisé — réapprovisionner"

        resultats.append({
            "produitId": int(produit_id),
            "nom": nom,
            "categorie": categorie,
            "stock": int(stock),
            "ventesParJour": round(vente_par_jour, 2),
            "joursAvantExpiration": jours_avant_exp,
            "risqueScore": risque_score,
            "statut": statut,
            "recommandation": recommandation
        })

    # Trier par risque décroissant
    resultats.sort(key=lambda x: x["risqueScore"], reverse=True)

    # Résumé global
    total = len(resultats)
    expires = sum(1 for r in resultats if r["statut"] == "EXPIRE")
    risque_eleve = sum(1 for r in resultats if r["statut"] == "RISQUE_ELEVÉ")
    attention = sum(1 for r in resultats if r["statut"] == "ATTENTION")
    rupture = sum(1 for r in resultats if r["statut"] == "RUPTURE")

    return {
        "resume": {
            "totalProduits": total,
            "expires": expires,
            "risqueEleve": risque_eleve,
            "attention": attention,
            "rupture": rupture,
            "ok": total - expires - risque_eleve - attention - rupture
        },
        "produits": resultats
    }
