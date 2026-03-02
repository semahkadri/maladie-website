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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PanierServiceImpl implements PanierService {

    private static final int EXPIRATION_MINUTES = 20;

    private final PanierRepository panierRepository;
    private final LignePanierRepository lignePanierRepository;
    private final ProduitRepository produitRepository;

    @Override
    public PanierDTO obtenirPanier(String sessionId) {
        Panier panier = panierRepository.findBySessionId(sessionId)
                .orElse(null);

        if (panier == null) {
            return panierVide(sessionId);
        }

        // Check expiration: if last activity > 20 min ago, clear the cart
        if (estExpire(panier)) {
            log.info("Panier session={} expiré après {} minutes d'inactivité, vidage automatique",
                    sessionId, EXPIRATION_MINUTES);
            panier.getLignes().clear();
            panier.setDerniereActivite(LocalDateTime.now());
            panierRepository.save(panier);
            return panierVide(sessionId);
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
                    Panier nouveau = Panier.builder()
                            .sessionId(sessionId)
                            .derniereActivite(LocalDateTime.now())
                            .build();
                    return panierRepository.save(nouveau);
                });

        // If cart was expired, clear it first then proceed
        if (estExpire(panier)) {
            panier.getLignes().clear();
            panierRepository.saveAndFlush(panier);
        }

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

        // Reset expiration timer
        toucherPanier(panier);

        return obtenirPanier(sessionId);
    }

    @Override
    public PanierDTO modifierQuantite(String sessionId, Long produitId, int quantite) {
        Panier panier = panierRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceIntrouvableException("Panier", "sessionId", sessionId));

        if (estExpire(panier)) {
            panier.getLignes().clear();
            panier.setDerniereActivite(LocalDateTime.now());
            panierRepository.save(panier);
            return panierVide(sessionId);
        }

        LignePanier ligne = lignePanierRepository
                .findByPanierIdAndProduitId(panier.getId(), produitId)
                .orElseThrow(() -> new ResourceIntrouvableException("Ligne panier", "produitId", produitId));

        if (quantite <= 0) {
            panier.getLignes().remove(ligne);
            panierRepository.saveAndFlush(panier);
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

        // Reset expiration timer
        toucherPanier(panier);

        return obtenirPanier(sessionId);
    }

    @Override
    public PanierDTO supprimerProduit(String sessionId, Long produitId) {
        Panier panier = panierRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceIntrouvableException("Panier", "sessionId", sessionId));

        if (estExpire(panier)) {
            panier.getLignes().clear();
            panier.setDerniereActivite(LocalDateTime.now());
            panierRepository.save(panier);
            return panierVide(sessionId);
        }

        boolean removed = panier.getLignes().removeIf(
            l -> l.getProduit().getId().equals(produitId));

        if (!removed) {
            throw new ResourceIntrouvableException("Ligne panier", "produitId", produitId);
        }

        panierRepository.saveAndFlush(panier);

        // Reset expiration timer
        toucherPanier(panier);

        return obtenirPanier(sessionId);
    }

    @Override
    public void viderPanier(String sessionId) {
        panierRepository.findBySessionId(sessionId).ifPresent(panier -> {
            panier.getLignes().clear();
            panier.setDerniereActivite(LocalDateTime.now());
            panierRepository.save(panier);
        });
    }

    /**
     * Called by scheduled task to clean all expired carts.
     */
    public void nettoyerPaniersExpires() {
        LocalDateTime seuil = LocalDateTime.now().minusMinutes(EXPIRATION_MINUTES);
        List<Panier> expires = panierRepository.findExpiredPaniersWithItems(seuil);

        if (!expires.isEmpty()) {
            log.info("Nettoyage automatique : {} panier(s) expiré(s)", expires.size());
            for (Panier panier : expires) {
                panier.getLignes().clear();
                panier.setDerniereActivite(LocalDateTime.now());
                panierRepository.save(panier);
            }
        }
    }

    // ─── Private helpers ─────────────────────────────────────────

    private boolean estExpire(Panier panier) {
        if (panier.getDerniereActivite() == null) {
            // No activity recorded — treat as expired if cart has been around for a while
            return panier.getDateCreation() != null
                    && panier.getDateCreation().plusMinutes(EXPIRATION_MINUTES).isBefore(LocalDateTime.now());
        }
        return panier.getDerniereActivite()
                .plusMinutes(EXPIRATION_MINUTES)
                .isBefore(LocalDateTime.now());
    }

    private void toucherPanier(Panier panier) {
        panier.setDerniereActivite(LocalDateTime.now());
        panierRepository.save(panier);
    }

    private PanierDTO panierVide(String sessionId) {
        return PanierDTO.builder()
                .sessionId(sessionId)
                .lignes(List.of())
                .nombreArticles(0)
                .montantTotal(BigDecimal.ZERO)
                .build();
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

        LocalDateTime expireA = panier.getDerniereActivite() != null
                ? panier.getDerniereActivite().plusMinutes(EXPIRATION_MINUTES)
                : null;

        return PanierDTO.builder()
                .id(panier.getId())
                .sessionId(panier.getSessionId())
                .lignes(lignesDTO)
                .nombreArticles(nombreArticles)
                .montantTotal(montantTotal)
                .derniereActivite(panier.getDerniereActivite())
                .expireA(expireA)
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
                .produitImageUrl(produit.getImageUrl())
                .categorieNom(produit.getCategorie().getNom())
                .quantite(ligne.getQuantite())
                .sousTotal(sousTotal)
                .dateAjout(ligne.getDateAjout())
                .build();
    }
}
