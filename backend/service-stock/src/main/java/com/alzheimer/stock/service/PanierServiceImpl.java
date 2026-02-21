package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.LignePanierDTO;
import com.alzheimer.stock.dto.PanierDTO;
import com.alzheimer.stock.entite.LignePanier;
import com.alzheimer.stock.entite.Panier;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.exception.ResourceIntrouvableException;
import com.alzheimer.stock.repository.LignePanierRepository;
import com.alzheimer.stock.repository.PanierRepository;
import com.alzheimer.stock.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PanierServiceImpl implements PanierService {

    private final PanierRepository panierRepository;
    private final LignePanierRepository lignePanierRepository;
    private final ProduitRepository produitRepository;

    @Override
    @Transactional(readOnly = true)
    public PanierDTO obtenirPanier(String sessionId) {
        Panier panier = panierRepository.findBySessionId(sessionId)
                .orElse(null);
        if (panier == null) {
            return PanierDTO.builder()
                    .sessionId(sessionId)
                    .lignes(List.of())
                    .nombreArticles(0)
                    .montantTotal(BigDecimal.ZERO)
                    .build();
        }
        return convertirEnDTO(panier);
    }

    @Override
    public PanierDTO ajouterProduit(String sessionId, Long produitId, int quantite) {
        Produit produit = produitRepository.findById(produitId)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", produitId));

        if (quantite < 1) {
            throw new IllegalArgumentException("La quantité doit être au moins 1");
        }

        Panier panier = panierRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    Panier nouveau = Panier.builder().sessionId(sessionId).build();
                    return panierRepository.save(nouveau);
                });

        LignePanier lignePanier = lignePanierRepository
                .findByPanierIdAndProduitId(panier.getId(), produitId)
                .orElse(null);

        if (lignePanier != null) {
            int nouvelleQuantite = lignePanier.getQuantite() + quantite;
            if (nouvelleQuantite > produit.getQuantite()) {
                throw new IllegalArgumentException(
                        "Stock insuffisant. Disponible : " + produit.getQuantite() +
                                ", demandé : " + nouvelleQuantite);
            }
            lignePanier.setQuantite(nouvelleQuantite);
            lignePanierRepository.save(lignePanier);
        } else {
            if (quantite > produit.getQuantite()) {
                throw new IllegalArgumentException(
                        "Stock insuffisant. Disponible : " + produit.getQuantite() +
                                ", demandé : " + quantite);
            }
            LignePanier nouvelle = LignePanier.builder()
                    .panier(panier)
                    .produit(produit)
                    .quantite(quantite)
                    .build();
            lignePanierRepository.save(nouvelle);
        }

        return obtenirPanier(sessionId);
    }

    @Override
    public PanierDTO modifierQuantite(String sessionId, Long produitId, int quantite) {
        Panier panier = panierRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceIntrouvableException("Panier", "sessionId", sessionId));

        LignePanier ligne = lignePanierRepository
                .findByPanierIdAndProduitId(panier.getId(), produitId)
                .orElseThrow(() -> new ResourceIntrouvableException("Ligne panier", "produitId", produitId));

        if (quantite <= 0) {
            lignePanierRepository.delete(ligne);
        } else {
            Produit produit = ligne.getProduit();
            if (quantite > produit.getQuantite()) {
                throw new IllegalArgumentException(
                        "Stock insuffisant. Disponible : " + produit.getQuantite() +
                                ", demandé : " + quantite);
            }
            ligne.setQuantite(quantite);
            lignePanierRepository.save(ligne);
        }

        return obtenirPanier(sessionId);
    }

    @Override
    public PanierDTO supprimerProduit(String sessionId, Long produitId) {
        Panier panier = panierRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceIntrouvableException("Panier", "sessionId", sessionId));

        LignePanier ligne = lignePanierRepository
                .findByPanierIdAndProduitId(panier.getId(), produitId)
                .orElseThrow(() -> new ResourceIntrouvableException("Ligne panier", "produitId", produitId));

        lignePanierRepository.delete(ligne);
        return obtenirPanier(sessionId);
    }

    @Override
    public void viderPanier(String sessionId) {
        panierRepository.findBySessionId(sessionId).ifPresent(panier -> {
            panier.getLignes().clear();
            panierRepository.save(panier);
        });
    }

    private PanierDTO convertirEnDTO(Panier panier) {
        List<LignePanierDTO> lignesDTO = panier.getLignes().stream()
                .map(this::convertirLigneEnDTO)
                .collect(Collectors.toList());

        int nombreArticles = lignesDTO.stream()
                .mapToInt(LignePanierDTO::getQuantite)
                .sum();

        BigDecimal montantTotal = lignesDTO.stream()
                .map(LignePanierDTO::getSousTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PanierDTO.builder()
                .id(panier.getId())
                .sessionId(panier.getSessionId())
                .lignes(lignesDTO)
                .nombreArticles(nombreArticles)
                .montantTotal(montantTotal)
                .dateCreation(panier.getDateCreation())
                .dateModification(panier.getDateModification())
                .build();
    }

    private LignePanierDTO convertirLigneEnDTO(LignePanier ligne) {
        Produit produit = ligne.getProduit();
        BigDecimal sousTotal = produit.getPrix().multiply(BigDecimal.valueOf(ligne.getQuantite()));

        return LignePanierDTO.builder()
                .id(ligne.getId())
                .produitId(produit.getId())
                .produitNom(produit.getNom())
                .produitPrix(produit.getPrix())
                .produitQuantiteStock(produit.getQuantite())
                .categorieNom(produit.getCategorie().getNom())
                .quantite(ligne.getQuantite())
                .sousTotal(sousTotal)
                .dateAjout(ligne.getDateAjout())
                .build();
    }
}
