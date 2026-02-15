package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CategorieDTO;
import com.alzheimer.stock.dto.ProduitDTO;
import com.alzheimer.stock.dto.TableauDeBordDTO;
import com.alzheimer.stock.entite.Categorie;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.repository.CategorieRepository;
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

    @Override
    public TableauDeBordDTO obtenirTableauDeBord() {
        long totalCategories = categorieRepository.count();
        long totalProduits = produitRepository.count();
        long produitsStockBas = produitRepository.countByQuantiteLessThanEqual(10);
        long produitsEnRupture = produitRepository.countByQuantite(0);

        BigDecimal valeurTotaleStock = produitRepository.findAll().stream()
                .map(p -> p.getPrix().multiply(BigDecimal.valueOf(p.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PageRequest derniers5 = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "dateCreation"));

        List<CategorieDTO> dernieresCategories = categorieRepository.findAll(derniers5)
                .getContent().stream()
                .map(this::convertirCategorieEnDTO)
                .collect(Collectors.toList());

        List<ProduitDTO> derniersProduits = produitRepository.findAll(derniers5)
                .getContent().stream()
                .map(this::convertirProduitEnDTO)
                .collect(Collectors.toList());

        return TableauDeBordDTO.builder()
                .totalCategories(totalCategories)
                .totalProduits(totalProduits)
                .produitsStockBas(produitsStockBas)
                .produitsEnRupture(produitsEnRupture)
                .valeurTotaleStock(valeurTotaleStock)
                .dernieresCategories(dernieresCategories)
                .derniersProduits(derniersProduits)
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

    private ProduitDTO convertirProduitEnDTO(Produit produit) {
        return ProduitDTO.builder()
                .id(produit.getId())
                .nom(produit.getNom())
                .description(produit.getDescription())
                .prix(produit.getPrix())
                .quantite(produit.getQuantite())
                .categorieId(produit.getCategorie().getId())
                .categorieNom(produit.getCategorie().getNom())
                .dateCreation(produit.getDateCreation())
                .dateModification(produit.getDateModification())
                .build();
    }
}
