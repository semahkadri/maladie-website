package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PanierRepository extends JpaRepository<Panier, Long> {

    Optional<Panier> findBySessionId(String sessionId);

    boolean existsBySessionId(String sessionId);

    @Query("SELECT DISTINCT p FROM Panier p LEFT JOIN FETCH p.lignes WHERE p.derniereActivite < :seuil AND SIZE(p.lignes) > 0")
    List<Panier> findExpiredPaniersWithItems(@Param("seuil") LocalDateTime seuil);
}
