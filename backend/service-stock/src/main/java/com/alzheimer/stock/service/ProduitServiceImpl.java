package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.ProduitDTO;
import com.alzheimer.stock.entite.Categorie;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.exception.ResourceIntrouvableException;
import com.alzheimer.stock.repository.CategorieRepository;
import com.alzheimer.stock.repository.LigneCommandeRepository;
import com.alzheimer.stock.repository.LignePanierRepository;
import com.alzheimer.stock.repository.ProduitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProduitServiceImpl implements ProduitService {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;
    private final LignePanierRepository lignePanierRepository;
    private final LigneCommandeRepository ligneCommandeRepository;
    private final FichierStorageService fichierStorageService;

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDTO> listerTousLesProduits() {
        return produitRepository.findAll()
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProduitDTO> listerProduitsParCategorie(Long categorieId) {
        return produitRepository.findByCategorieId(categorieId)
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProduitDTO obtenirProduitParId(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));
        return convertirEnDTO(produit);
    }

    @Override
    public ProduitDTO creerProduit(ProduitDTO produitDTO) {
        Categorie categorie = categorieRepository.findById(produitDTO.getCategorieId())
                .orElseThrow(() -> new ResourceIntrouvableException("Catégorie", "id", produitDTO.getCategorieId()));

        Produit produit = Produit.builder()
                .nom(produitDTO.getNom())
                .description(produitDTO.getDescription())
                .prix(produitDTO.getPrix())
                .quantite(produitDTO.getQuantite())
                .imageUrl(produitDTO.getImageUrl())
                .prixOriginal(produitDTO.getPrixOriginal())
                .enPromo(produitDTO.getEnPromo() != null ? produitDTO.getEnPromo() : false)
                .categorie(categorie)
                .build();

        Produit sauvegarde = produitRepository.save(produit);
        return convertirEnDTO(sauvegarde);
    }

    @Override
    public ProduitDTO modifierProduit(Long id, ProduitDTO produitDTO) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));

        Categorie categorie = categorieRepository.findById(produitDTO.getCategorieId())
                .orElseThrow(() -> new ResourceIntrouvableException("Catégorie", "id", produitDTO.getCategorieId()));

        produit.setNom(produitDTO.getNom());
        produit.setDescription(produitDTO.getDescription());
        produit.setPrix(produitDTO.getPrix());
        produit.setQuantite(produitDTO.getQuantite());
        produit.setImageUrl(produitDTO.getImageUrl());
        produit.setPrixOriginal(produitDTO.getPrixOriginal());
        produit.setEnPromo(produitDTO.getEnPromo() != null ? produitDTO.getEnPromo() : false);
        produit.setCategorie(categorie);

        Produit modifie = produitRepository.save(produit);
        return convertirEnDTO(modifie);
    }

    @Override
    public void supprimerProduit(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));
        // Delete image file from disk
        supprimerFichierImage(produit.getImageUrl());
        // Nullify order line references (preserve order history, just unlink product)
        ligneCommandeRepository.nullifyProduitReference(id);
        // Remove from all carts before deleting
        lignePanierRepository.deleteByProduitId(id);
        produitRepository.delete(produit);
    }

    @Override
    public ProduitDTO uploaderImage(Long id, MultipartFile fichier) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));

        // Delete old file if exists
        supprimerFichierImage(produit.getImageUrl());

        // Save new file
        String nomFichier = fichierStorageService.sauvegarder(fichier);

        // Build full URL
        String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(nomFichier)
                .toUriString();

        produit.setImageUrl(imageUrl);
        Produit sauvegarde = produitRepository.save(produit);
        return convertirEnDTO(sauvegarde);
    }

    @Override
    public ProduitDTO supprimerImage(Long id) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new ResourceIntrouvableException("Produit", "id", id));

        supprimerFichierImage(produit.getImageUrl());
        produit.setImageUrl(null);
        Produit sauvegarde = produitRepository.save(produit);
        return convertirEnDTO(sauvegarde);
    }

    private void supprimerFichierImage(String imageUrl) {
        if (imageUrl != null && imageUrl.contains("/uploads/")) {
            String nomFichier = imageUrl.substring(imageUrl.lastIndexOf("/uploads/") + "/uploads/".length());
            fichierStorageService.supprimer(nomFichier);
        }
    }

    private ProduitDTO convertirEnDTO(Produit produit) {
        Integer remise = null;
        if (Boolean.TRUE.equals(produit.getEnPromo()) && produit.getPrixOriginal() != null
                && produit.getPrixOriginal().compareTo(BigDecimal.ZERO) > 0
                && produit.getPrix().compareTo(produit.getPrixOriginal()) < 0) {
            remise = produit.getPrixOriginal().subtract(produit.getPrix())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(produit.getPrixOriginal(), 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        return ProduitDTO.builder()
                .id(produit.getId())
                .nom(produit.getNom())
                .description(produit.getDescription())
                .prix(produit.getPrix())
                .quantite(produit.getQuantite())
                .imageUrl(produit.getImageUrl())
                .prixOriginal(produit.getPrixOriginal())
                .enPromo(produit.getEnPromo())
                .remise(remise)
                .categorieId(produit.getCategorie().getId())
                .categorieNom(produit.getCategorie().getNom())
                .dateCreation(produit.getDateCreation())
                .dateModification(produit.getDateModification())
                .build();
    }
}
