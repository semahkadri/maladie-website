package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByCategorieId(Long categorieId);

    boolean existsByNomAndCategorieId(String nom, Long categorieId);

    long countByQuantiteLessThanEqual(int quantite);

    long countByQuantite(int quantite);
}
