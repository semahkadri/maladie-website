package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CategorieDTO;
import com.alzheimer.stock.dto.CommandeDTO;
import com.alzheimer.stock.dto.ProduitDTO;
import com.alzheimer.stock.dto.TableauDeBordDTO;
import com.alzheimer.stock.entite.*;
import com.alzheimer.stock.repository.CategorieRepository;
import com.alzheimer.stock.repository.CommandeRepository;
import com.alzheimer.stock.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableauDeBordServiceImpl implements TableauDeBordService {

    private final CategorieRepository categorieRepository;
    private final ProduitRepository produitRepository;
    private final CommandeRepository commandeRepository;

    @Override
    public TableauDeBordDTO obtenirTableauDeBord() {
        long totalCategories = categorieRepository.count();
        long totalProduits = produitRepository.count();
        long produitsStockBas = produitRepository.countByQuantiteLessThanEqual(10);
        long produitsEnRupture = produitRepository.countByQuantite(0);

        BigDecimal valeurTotaleStock = produitRepository.findAll().stream()
                .map(p -> p.getPrix().multiply(BigDecimal.valueOf(p.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Use JOIN FETCH to guarantee nombreProduits is computed correctly
        List<CategorieDTO> dernieresCategories = categorieRepository.findAllWithProduits()
                .stream()
                .map(this::convertirCategorieEnDTO)
                .collect(Collectors.toList());

        PageRequest derniers5 = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "dateCreation"));

        List<ProduitDTO> derniersProduits = produitRepository.findAll(derniers5)
                .getContent().stream()
                .map(this::convertirProduitEnDTO)
                .collect(Collectors.toList());

        // Order statistics
        long totalCommandes = commandeRepository.count();
        long commandesEnAttente = commandeRepository.countByStatut(StatutCommande.EN_ATTENTE);

        BigDecimal chiffreAffaires = commandeRepository.findAll().stream()
                .map(Commande::getMontantTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PageRequest derniers5Cmd = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "dateCommande"));
        List<CommandeDTO> dernieresCommandes = commandeRepository.findAll(derniers5Cmd)
                .getContent().stream()
                .map(this::convertirCommandeEnDTO)
                .collect(Collectors.toList());

        return TableauDeBordDTO.builder()
                .totalCategories(totalCategories)
                .totalProduits(totalProduits)
                .produitsStockBas(produitsStockBas)
                .produitsEnRupture(produitsEnRupture)
                .valeurTotaleStock(valeurTotaleStock)
                .dernieresCategories(dernieresCategories)
                .derniersProduits(derniersProduits)
                .totalCommandes(totalCommandes)
                .commandesEnAttente(commandesEnAttente)
                .chiffreAffaires(chiffreAffaires)
                .dernieresCommandes(dernieresCommandes)
                .build();
    }

    private CategorieDTO convertirCategorieEnDTO(Categorie categorie) {
        return CategorieDTO.builder()
                .id(categorie.getId())
                .nom(categorie.getNom())
                .description(categorie.getDescription())
                .dateCreation(categorie.getDateCreation())
                .dateModification(categorie.getDateModification())
                .nombreProduits(categorie.getProduits() != null ? categorie.getProduits().size() : 0)
                .build();
    }

    private CommandeDTO convertirCommandeEnDTO(Commande commande) {
        // Dashboard summary only — skip lazy-loaded lignes to avoid N+1 queries
        return CommandeDTO.builder()
                .id(commande.getId())
                .reference(commande.getReference())
                .nomClient(commande.getNomClient())
                .emailClient(commande.getEmailClient())
                .telephoneClient(commande.getTelephoneClient())
                .adresseLivraison(commande.getAdresseLivraison())
                .statut(commande.getStatut())
                .montantTotal(commande.getMontantTotal())
                .lignes(List.of())
                .nombreArticles(0)
                .dateCommande(commande.getDateCommande())
                .dateModification(commande.getDateModification())
                .build();
    }

    private ProduitDTO convertirProduitEnDTO(Produit produit) {
        return ProduitDTO.builder()
                .id(produit.getId())
                .nom(produit.getNom())
                .description(produit.getDescription())
                .prix(produit.getPrix())
                .quantite(produit.getQuantite())
                .imageUrl(produit.getImageUrl())
                .categorieId(produit.getCategorie().getId())
                .categorieNom(produit.getCategorie().getNom())
                .dateCreation(produit.getDateCreation())
                .dateModification(produit.getDateModification())
                .build();
    }
}
