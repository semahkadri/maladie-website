package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CategorieDTO;
import com.alzheimer.stock.entite.Categorie;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.exception.ResourceIntrouvableException;
import com.alzheimer.stock.repository.CategorieRepository;
import com.alzheimer.stock.repository.LigneCommandeRepository;
import com.alzheimer.stock.repository.LignePanierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CategorieServiceImpl implements CategorieService {

    private final CategorieRepository categorieRepository;
    private final LignePanierRepository lignePanierRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final FichierStorageService fichierStorageService;

    @Override
    @Transactional(readOnly = true)
    public List<CategorieDTO> listerToutesLesCategories() {
        return categorieRepository.findAllWithProduits()
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategorieDTO obtenirCategorieParId(Long id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Catégorie", "id", id));
        return convertirEnDTO(categorie);
    }

    @Override
    public CategorieDTO creerCategorie(CategorieDTO categorieDTO) {
        Categorie categorie = Categorie.builder()
                .nom(categorieDTO.getNom())
                .description(categorieDTO.getDescription())
                .build();
        Categorie sauvegardee = categorieRepository.save(categorie);
        return convertirEnDTO(sauvegardee);
    }

    @Override
    public CategorieDTO modifierCategorie(Long id, CategorieDTO categorieDTO) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Catégorie", "id", id));

        categorie.setNom(categorieDTO.getNom());
        categorie.setDescription(categorieDTO.getDescription());

        Categorie modifiee = categorieRepository.save(categorie);
        return convertirEnDTO(modifiee);
    }

    @Override
    public void supprimerCategorie(Long id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Catégorie", "id", id));

        // Clean up FK references and image files for all products before cascade delete
        if (categorie.getProduits() != null) {
            for (Produit produit : categorie.getProduits()) {
                // Delete product image file from disk
                supprimerFichierImage(produit.getImageUrl());
                ligneCommandeRepository.nullifyProduitReference(produit.getId());
                lignePanierRepository.deleteByProduitId(produit.getId());
            }
        }

        categorieRepository.delete(categorie);
    }

    private void supprimerFichierImage(String imageUrl) {
        if (imageUrl != null && imageUrl.contains("/uploads/")) {
            String nomFichier = imageUrl.substring(imageUrl.lastIndexOf("/uploads/") + "/uploads/".length());
            fichierStorageService.supprimer(nomFichier);
        }
    }

    private CategorieDTO convertirEnDTO(Categorie categorie) {
        return CategorieDTO.builder()
                .id(categorie.getId())
                .nom(categorie.getNom())
                .description(categorie.getDescription())
                .dateCreation(categorie.getDateCreation())
                .dateModification(categorie.getDateModification())
                .nombreProduits(categorie.getProduits() != null ? categorie.getProduits().size() : 0)
                .build();
    }
}
