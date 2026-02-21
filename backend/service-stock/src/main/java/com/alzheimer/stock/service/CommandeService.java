package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.CommandeDTO;
import com.alzheimer.stock.dto.CreerCommandeDTO;
import com.alzheimer.stock.entite.StatutCommande;

import java.util.List;

public interface CommandeService {

    CommandeDTO creerCommande(CreerCommandeDTO creerCommandeDTO);

    List<CommandeDTO> listerToutesLesCommandes();

    List<CommandeDTO> listerCommandesParStatut(StatutCommande statut);

    CommandeDTO obtenirCommandeParId(Long id);

    CommandeDTO obtenirCommandeParReference(String reference);

    CommandeDTO modifierStatut(Long id, StatutCommande statut);

    long compterParStatut(StatutCommande statut);
}
