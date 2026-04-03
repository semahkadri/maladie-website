package com.alzheimer.stock.entite;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "produits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prix;

    @Column(nullable = false)
    private Integer quantite;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "prix_original", precision = 10, scale = 2)
    private BigDecimal prixOriginal;

    @Column(name = "en_promo")
    private Boolean enPromo = false;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(name = "numero_lot", length = 100)
    private String numeroLot;

    @Column(name = "date_fin_promo")
    private LocalDateTime dateFinPromo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @UpdateTimestamp
    @Column(name = "date_modification")
    private LocalDateTime dateModification;
}
