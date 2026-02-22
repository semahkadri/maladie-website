package com.alzheimer.stock.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyseStockDTO {

    private List<AnalyseProduit> analyseParProduit;
    private ResumeABC resumeABC;
    private IndicateursGlobaux indicateursGlobaux;
    private List<TendanceVentes> tendanceVentes;

    // ─── Per-product analysis ────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalyseProduit {
        private Long produitId;
        private String produitNom;
        private String categorieNom;
        private int stockActuel;
        private int totalVendu;                   // total sold last 90 days
        private BigDecimal chiffreAffaires;        // revenue last 90 days
        private String classificationABC;          // "A", "B", "C"
        private double tauxRotation;               // turnover rate (90d)
        private int joursStockRestant;             // estimated days of stock
        private int pointReapprovisionnement;      // reorder point
        private int previsionDemandeMensuelle;     // weighted moving avg forecast
        private int scoreSante;                    // health score 0-100
        private String tendance;                   // "HAUSSE", "STABLE", "BAISSE"
        private boolean alerteStock;               // stock below reorder point
    }

    // ─── ABC summary ─────────────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumeABC {
        private int produitsA;
        private int produitsB;
        private int produitsC;
        private double pourcentageCA_A;
        private double pourcentageCA_B;
        private double pourcentageCA_C;
    }

    // ─── Global KPIs ─────────────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IndicateursGlobaux {
        private BigDecimal valeurTotaleStock;      // sum(prix * quantite) all products
        private double tauxRotationMoyen;          // avg turnover rate
        private int produitsEnAlerte;              // stock < reorder point
        private int produitsEnRupture;             // stock == 0
        private BigDecimal chiffreAffaires90j;     // revenue last 90 days
        private double croissanceMensuelle;        // month-over-month growth %
        private int totalProduits;
        private int totalCommandes90j;
    }

    // ─── Monthly sales trend ─────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TendanceVentes {
        private String periode;                    // "2026-01"
        private BigDecimal chiffreAffaires;
        private long nombreCommandes;
    }
}
