package com.alzheimer.stock.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LignePanierDTO {

    private Long id;

    @NotNull(message = "L'identifiant du produit est obligatoire")
    private Long produitId;

    private String produitNom;
    private BigDecimal produitPrix;
    private BigDecimal produitPrixOriginal;
    private Boolean produitEnPromo;
    private Integer produitQuantiteStock;
    private String produitImageUrl;
    private String categorieNom;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 1, message = "La quantité doit être au moins 1")
    private Integer quantite;

    private BigDecimal sousTotal;
    private LocalDateTime dateAjout;
}
