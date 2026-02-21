package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanierRepository extends JpaRepository<Panier, Long> {

    Optional<Panier> findBySessionId(String sessionId);

    boolean existsBySessionId(String sessionId);
}
