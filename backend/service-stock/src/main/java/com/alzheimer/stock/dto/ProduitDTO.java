package com.alzheimer.stock.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProduitDTO {

    private Long id;

    @NotBlank(message = "Le nom du produit est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nom;

    @Size(max = 500, message = "La description ne peut pas dépasser 500 caractères")
    private String description;

    @NotNull(message = "Le prix est obligatoire")
    @DecimalMin(value = "0.0", inclusive = false, message = "Le prix doit être supérieur à 0")
    private BigDecimal prix;

    @NotNull(message = "La quantité est obligatoire")
    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private Integer quantite;

    @Size(max = 500, message = "L'URL de l'image ne peut pas dépasser 500 caractères")
    private String imageUrl;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categorieId;

    private BigDecimal prixOriginal;
    private Boolean enPromo;
    private Integer remise;

    private LocalDate dateExpiration;
    private String numeroLot;
    private Integer joursAvantExpiration;
    private LocalDateTime dateFinPromo;

    private String categorieNom;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}
