package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.Commande;
import com.alzheimer.stock.entite.StatutCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommandeRepository extends JpaRepository<Commande, Long> {

    Optional<Commande> findByReference(String reference);

    List<Commande> findByStatutOrderByDateCommandeDesc(StatutCommande statut);

    List<Commande> findAllByOrderByDateCommandeDesc();

    long countByStatut(StatutCommande statut);

    @Query("SELECT COALESCE(SUM(c.montantTotal), 0) FROM Commande c")
    BigDecimal calculerChiffreAffairesTotal();
}
