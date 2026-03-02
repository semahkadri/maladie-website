package com.alzheimer.stock.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Background task that runs every 5 minutes to clean expired carts.
 * Carts expire after 20 minutes of inactivity.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PanierExpirationTache {

    private final PanierServiceImpl panierService;

    @Scheduled(fixedRate = 5 * 60 * 1000) // every 5 minutes
    public void nettoyerPaniersExpires() {
        try {
            panierService.nettoyerPaniersExpires();
        } catch (Exception e) {
            log.error("Erreur lors du nettoyage des paniers expirés", e);
        }
    }
}
