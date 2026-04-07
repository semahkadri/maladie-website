"""
PharmaCare — Service d'Analyse Prédictive Python
=================================================
Microservice Python (FastAPI) qui se connecte à la même base PostgreSQL
que service-stock et fournit des analyses avancées par ML :

1. Prédiction de péremption (quels produits vont expirer avant d'être vendus)
2. Prévision de demande (combien commander pour chaque produit)
3. Détection d'anomalies de vente
4. Score de risque par produit

Lancement : uvicorn main:app --port 8083 --reload
Docs API  : http://localhost:8083/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="PharmaCare Analytics",
    description="Service d'analyse prédictive — péremption, demande, anomalies",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:8081"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from routes import predictions, expiration, demand

app.include_router(predictions.router, prefix="/api/analytics", tags=["Prédictions"])
app.include_router(expiration.router, prefix="/api/analytics", tags=["Péremption"])
app.include_router(demand.router, prefix="/api/analytics", tags=["Demande"])


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "service": "PharmaCare Analytics (Python)"}
