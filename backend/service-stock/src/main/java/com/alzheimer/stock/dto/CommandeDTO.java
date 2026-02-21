package com.alzheimer.stock.dto;

import com.alzheimer.stock.entite.StatutCommande;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommandeDTO {

    private Long id;
    private String reference;
    private String nomClient;
    private String emailClient;
    private String telephoneClient;
    private String adresseLivraison;
    private StatutCommande statut;
    private BigDecimal montantTotal;
    private List<LigneCommandeDTO> lignes;
    private int nombreArticles;
    private LocalDateTime dateCommande;
    private LocalDateTime dateModification;
}
