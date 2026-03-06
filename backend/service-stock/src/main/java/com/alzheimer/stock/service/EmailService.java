package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CommandeDTO;
import com.alzheimer.stock.entite.StatutCommande;

/**
 * Service d'envoi d'emails transactionnels pour PharmaCare.
 *
 * 3 types d'emails :
 * 1. Confirmation de commande → client
 * 2. Changement de statut → client
 * 3. Nouvelle commande → admin
 */
public interface EmailService {

    /** Send order confirmation email to customer */
    void envoyerConfirmationCommande(CommandeDTO commande);

    /** Send order status change email to customer */
    void envoyerChangementStatut(CommandeDTO commande, StatutCommande ancienStatut);

    /** Send new order notification email to admin */
    void envoyerNotificationAdmin(CommandeDTO commande);
}
