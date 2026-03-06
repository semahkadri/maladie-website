package com.alzheimer.stock.repository;

import com.alzheimer.stock.entite.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    List<EmailLog> findAllByOrderByDateEnvoiDesc();

    long countByLuFalse();
}
