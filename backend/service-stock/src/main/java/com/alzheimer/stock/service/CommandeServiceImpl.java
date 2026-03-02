package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CommandeDTO;
import com.alzheimer.stock.dto.CreerCommandeDTO;
import com.alzheimer.stock.dto.LigneCommandeDTO;
import com.alzheimer.stock.entite.*;
import com.alzheimer.stock.exception.ResourceIntrouvableException;
import com.alzheimer.stock.repository.CommandeRepository;
import com.alzheimer.stock.repository.PanierRepository;
import com.alzheimer.stock.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommandeServiceImpl implements CommandeService {

    private final CommandeRepository commandeRepository;
    private final PanierRepository panierRepository;
    private final ProduitRepository produitRepository;

    @Override
    public CommandeDTO creerCommande(CreerCommandeDTO dto) {
        Panier panier = panierRepository.findBySessionId(dto.getSessionId())
                .orElseThrow(() -> new ResourceIntrouvableException("Panier", "sessionId", dto.getSessionId()));

        if (panier.getLignes().isEmpty()) {
            throw new IllegalArgumentException("Le panier est vide");
        }

        // Validate stock and calculate total
        BigDecimal montantTotal = BigDecimal.ZERO;
        for (LignePanier ligne : panier.getLignes()) {
            Produit produit = ligne.getProduit();
            if (ligne.getQuantite() > produit.getQuantite()) {
                throw new IllegalArgumentException(
                        "Stock insuffisant pour \"" + produit.getNom() +
                                "\". Disponible : " + produit.getQuantite() +
                                ", demandé : " + ligne.getQuantite());
            }
            BigDecimal sousTotal = produit.getPrix().multiply(BigDecimal.valueOf(ligne.getQuantite()));
            montantTotal = montantTotal.add(sousTotal);
        }

        // Create order
        Commande commande = Commande.builder()
                .reference(genererReference())
                .nomClient(dto.getNomClient())
                .emailClient(dto.getEmailClient())
                .telephoneClient(dto.getTelephoneClient())
                .adresseLivraison(dto.getAdresseLivraison())
                .statut(StatutCommande.EN_ATTENTE)
                .montantTotal(montantTotal)
                .build();

        Commande sauvegardee = commandeRepository.save(commande);

        // Create order lines and decrement stock
        for (LignePanier lignePanier : panier.getLignes()) {
            Produit produit = lignePanier.getProduit();

            LigneCommande ligneCommande = LigneCommande.builder()
                    .commande(sauvegardee)
                    .produit(produit)
                    .nomProduit(produit.getNom())
                    .prixUnitaire(produit.getPrix())
                    .quantite(lignePanier.getQuantite())
                    .sousTotal(produit.getPrix().multiply(BigDecimal.valueOf(lignePanier.getQuantite())))
                    .build();
            sauvegardee.getLignes().add(ligneCommande);

            // Decrement stock
            produit.setQuantite(produit.getQuantite() - lignePanier.getQuantite());
            produitRepository.save(produit);
        }

        commandeRepository.save(sauvegardee);

        // Clear the cart
        panier.getLignes().clear();
        panierRepository.save(panier);

        // Detect zero-stock products (just report, do NOT delete them)
        List<String> nomsProduitsEpuises = new ArrayList<>();
        for (LigneCommande lc : sauvegardee.getLignes()) {
            Produit produit = lc.getProduit();
            if (produit != null && produit.getQuantite() == 0) {
                if (!nomsProduitsEpuises.contains(produit.getNom())) {
                    nomsProduitsEpuises.add(produit.getNom());
                }
            }
        }

        CommandeDTO commandeDTO = convertirEnDTO(sauvegardee);
        commandeDTO.setProduitsEpuises(nomsProduitsEpuises);

        return commandeDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommandeDTO> listerToutesLesCommandes() {
        return commandeRepository.findAllByOrderByDateCommandeDesc().stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommandeDTO> listerCommandesParStatut(StatutCommande statut) {
        return commandeRepository.findByStatutOrderByDateCommandeDesc(statut).stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CommandeDTO obtenirCommandeParId(Long id) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Commande", "id", id));
        return convertirEnDTO(commande);
    }

    @Override
    @Transactional(readOnly = true)
    public CommandeDTO obtenirCommandeParReference(String reference) {
        Commande commande = commandeRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceIntrouvableException("Commande", "reference", reference));
        return convertirEnDTO(commande);
    }

    @Override
    public CommandeDTO modifierStatut(Long id, StatutCommande statut) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Commande", "id", id));

        // Restore stock if cancelling (skip lines whose product was deleted)
        if (statut == StatutCommande.ANNULEE && commande.getStatut() != StatutCommande.ANNULEE) {
            for (LigneCommande ligne : commande.getLignes()) {
                Produit produit = ligne.getProduit();
                if (produit != null) {
                    produit.setQuantite(produit.getQuantite() + ligne.getQuantite());
                    produitRepository.save(produit);
                }
            }
        }

        commande.setStatut(statut);
        Commande modifiee = commandeRepository.save(commande);
        return convertirEnDTO(modifiee);
    }

    @Override
    @Transactional(readOnly = true)
    public long compterParStatut(StatutCommande statut) {
        return commandeRepository.countByStatut(statut);
    }

    private String genererReference() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = Long.toHexString(ThreadLocalRandom.current().nextLong(0x10000, 0xFFFFF)).toUpperCase();
        return "CMD-" + datePart + "-" + randomPart;
    }

    private CommandeDTO convertirEnDTO(Commande commande) {
        List<LigneCommandeDTO> lignesDTO = commande.getLignes().stream()
                .map(this::convertirLigneEnDTO)
                .collect(Collectors.toList());

        int nombreArticles = lignesDTO.stream()
                .mapToInt(LigneCommandeDTO::getQuantite)
                .sum();

        return CommandeDTO.builder()
                .id(commande.getId())
                .reference(commande.getReference())
                .nomClient(commande.getNomClient())
                .emailClient(commande.getEmailClient())
                .telephoneClient(commande.getTelephoneClient())
                .adresseLivraison(commande.getAdresseLivraison())
                .statut(commande.getStatut())
                .montantTotal(commande.getMontantTotal())
                .lignes(lignesDTO)
                .nombreArticles(nombreArticles)
                .dateCommande(commande.getDateCommande())
                .dateModification(commande.getDateModification())
                .build();
    }

    private LigneCommandeDTO convertirLigneEnDTO(LigneCommande ligne) {
        return LigneCommandeDTO.builder()
                .id(ligne.getId())
                .produitId(ligne.getProduit() != null ? ligne.getProduit().getId() : null)
                .nomProduit(ligne.getNomProduit())
                .prixUnitaire(ligne.getPrixUnitaire())
                .quantite(ligne.getQuantite())
                .sousTotal(ligne.getSousTotal())
                .build();
    }
}
