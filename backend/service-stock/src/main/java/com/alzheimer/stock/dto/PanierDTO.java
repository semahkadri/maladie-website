package com.alzheimer.stock.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PanierDTO {

    private Long id;
    private String sessionId;
    private List<LignePanierDTO> lignes;
    private int nombreArticles;
    private BigDecimal montantTotal;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}
