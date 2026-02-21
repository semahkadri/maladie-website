package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.PanierDTO;

public interface PanierService {

    PanierDTO obtenirPanier(String sessionId);

    PanierDTO ajouterProduit(String sessionId, Long produitId, int quantite);

    PanierDTO modifierQuantite(String sessionId, Long produitId, int quantite);

    PanierDTO supprimerProduit(String sessionId, Long produitId);

    void viderPanier(String sessionId);
}
