package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.LignePanier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LignePanierRepository extends JpaRepository<LignePanier, Long> {

    Optional<LignePanier> findByPanierIdAndProduitId(Long panierId, Long produitId);

    void deleteByProduitId(Long produitId);
}
