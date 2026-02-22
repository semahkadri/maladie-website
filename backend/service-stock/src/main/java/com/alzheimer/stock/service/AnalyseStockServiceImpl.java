package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.AnalyseStockDTO;
import com.alzheimer.stock.dto.AnalyseStockDTO.*;
import com.alzheimer.stock.entite.Produit;
import com.alzheimer.stock.entite.StatutCommande;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced stock analysis service implementing:
 * - ABC/Pareto classification (revenue-based)
 * - Stock turnover rate
 * - Days of stock remaining
 * - Demand forecasting (Weighted Moving Average)
 * - Automatic reorder point calculation
 * - Composite stock health score (0-100)
 * - Trend detection (30-day comparison)
 * - Monthly sales trend with growth rate
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyseStockServiceImpl implements AnalyseStockService {

    private static final int LEAD_TIME_DAYS = 7;           // supplier lead time
    private static final int SAFETY_BUFFER_DAYS = 3;       // safety stock buffer
    private static final double[] WMA_WEIGHTS = {0.5, 0.3, 0.2}; // weighted moving average

    private final EntityManager em;

    @Override
    @SuppressWarnings("unchecked")
    public AnalyseStockDTO analyserStock() {
        // Eager-fetch categories to avoid N+1 lazy loading issues
        List<Produit> produits = em.createQuery(
            "SELECT p FROM Produit p JOIN FETCH p.categorie ORDER BY p.id", Produit.class)
            .getResultList();
        if (produits.isEmpty()) {
            return buildEmptyResult();
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime il90Jours = now.minusDays(90);
        LocalDateTime il60Jours = now.minusDays(60);
        LocalDateTime il30Jours = now.minusDays(30);

        // ── Query 1: 90-day sales per product (quantity + revenue) ──
        Map<Long, long[]> ventes90j = queryVentes(il90Jours, now);     // [qty, revenue*100]

        // ── Query 2: 30-day sales per product (quantity) ────────────
        Map<Long, Long> ventes30j = queryVentesQte(il30Jours, now);

        // ── Query 3: 30-60 day sales per product (quantity) ─────────
        Map<Long, Long> ventes30_60j = queryVentesQte(il60Jours, il30Jours);

        // ── Query 4: All-time revenue per product (for ABC) ─────────
        Map<Long, BigDecimal> caTotal = queryRevenuTotal();

        // ── Query 5: Monthly order totals (for trend chart) ─────────
        List<TendanceVentes> tendance = queryTendanceMensuelle();

        // ── Query 6: Total orders last 90 days ──────────────────────
        long totalCmd90j = countCommandes(il90Jours);

        // ── ABC classification ──────────────────────────────────────
        Map<Long, String> abcMap = calculerABC(produits, caTotal);

        // ── Per-product analysis ────────────────────────────────────
        List<AnalyseProduit> analyses = new ArrayList<>();
        double sommeRotation = 0;
        int nbRotation = 0;
        int enAlerte = 0;
        int enRupture = 0;
        BigDecimal valeurStock = BigDecimal.ZERO;
        BigDecimal ca90j = BigDecimal.ZERO;

        for (Produit p : produits) {
            Long pid = p.getId();
            int stock = p.getQuantite();

            // Sales data
            long[] data90 = ventes90j.getOrDefault(pid, new long[]{0, 0});
            int totalVendu90 = (int) data90[0];
            BigDecimal revenu90 = BigDecimal.valueOf(data90[1]).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            long vendu30 = ventes30j.getOrDefault(pid, 0L);
            long vendu30_60 = ventes30_60j.getOrDefault(pid, 0L);
            long vendu60_90 = totalVendu90 - vendu30 - vendu30_60;
            if (vendu60_90 < 0) vendu60_90 = 0;

            // Turnover rate: total sold / current stock
            double tauxRotation = stock > 0 ? (double) totalVendu90 / stock : (totalVendu90 > 0 ? 999.0 : 0.0);

            // Days of stock remaining
            double avgDailySales = totalVendu90 / 90.0;
            int joursRestant = avgDailySales > 0 ? (int) Math.round(stock / avgDailySales) : (stock > 0 ? 999 : 0);

            // Reorder point: (avg daily demand * lead time) + safety stock
            int pointReappro = (int) Math.ceil(avgDailySales * LEAD_TIME_DAYS + avgDailySales * SAFETY_BUFFER_DAYS);

            // Demand forecast: Weighted Moving Average of 3 monthly periods
            int prevision = calculerPrevision(vendu30, vendu30_60, vendu60_90);

            // Trend detection: compare last 30 days vs previous 30 days
            String tendanceProduit = detecterTendance(vendu30, vendu30_60);

            // ABC class
            String abc = abcMap.getOrDefault(pid, "C");

            // Health score
            int score = calculerScore(stock, pointReappro, tauxRotation, abc, tendanceProduit, joursRestant);

            boolean alerte = stock > 0 && stock <= pointReappro;
            if (alerte) enAlerte++;
            if (stock == 0) enRupture++;

            // Product stock value
            BigDecimal valeurProduit = p.getPrix().multiply(BigDecimal.valueOf(stock));
            valeurStock = valeurStock.add(valeurProduit);
            ca90j = ca90j.add(revenu90);

            if (tauxRotation < 900) {
                sommeRotation += tauxRotation;
                nbRotation++;
            }

            analyses.add(AnalyseProduit.builder()
                    .produitId(pid)
                    .produitNom(p.getNom())
                    .categorieNom(p.getCategorie() != null ? p.getCategorie().getNom() : "-")
                    .stockActuel(stock)
                    .totalVendu(totalVendu90)
                    .chiffreAffaires(revenu90)
                    .classificationABC(abc)
                    .tauxRotation(Math.round(tauxRotation * 100.0) / 100.0)
                    .joursStockRestant(Math.min(joursRestant, 999))
                    .pointReapprovisionnement(pointReappro)
                    .previsionDemandeMensuelle(prevision)
                    .scoreSante(score)
                    .tendance(tendanceProduit)
                    .alerteStock(alerte || stock == 0)
                    .build());
        }

        // Sort by health score ascending (worst first)
        analyses.sort(Comparator.comparingInt(AnalyseProduit::getScoreSante));

        // ── ABC summary ─────────────────────────────────────────────
        ResumeABC resumeABC = buildResumeABC(analyses);

        // ── Monthly growth ──────────────────────────────────────────
        double croissance = calculerCroissance(tendance);

        // ── Global indicators ───────────────────────────────────────
        IndicateursGlobaux indicateurs = IndicateursGlobaux.builder()
                .valeurTotaleStock(valeurStock)
                .tauxRotationMoyen(nbRotation > 0 ? Math.round(sommeRotation / nbRotation * 100.0) / 100.0 : 0)
                .produitsEnAlerte(enAlerte)
                .produitsEnRupture(enRupture)
                .chiffreAffaires90j(ca90j)
                .croissanceMensuelle(croissance)
                .totalProduits(produits.size())
                .totalCommandes90j((int) totalCmd90j)
                .build();

        return AnalyseStockDTO.builder()
                .analyseParProduit(analyses)
                .resumeABC(resumeABC)
                .indicateursGlobaux(indicateurs)
                .tendanceVentes(tendance)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    // DATA QUERIES
    // ═══════════════════════════════════════════════════════════════

    /** Returns map: produitId -> [totalQty, totalRevenue*100 (as long to avoid precision loss)] */
    private Map<Long, long[]> queryVentes(LocalDateTime depuis, LocalDateTime jusqua) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
            "SELECT lc.produit.id, SUM(lc.quantite), SUM(lc.sousTotal) " +
            "FROM LigneCommande lc " +
            "WHERE lc.produit IS NOT NULL " +
            "AND lc.commande.statut <> :annulee " +
            "AND lc.commande.dateCommande >= :depuis " +
            "AND lc.commande.dateCommande < :jusqua " +
            "GROUP BY lc.produit.id")
            .setParameter("annulee", StatutCommande.ANNULEE)
            .setParameter("depuis", depuis)
            .setParameter("jusqua", jusqua)
            .getResultList();

        Map<Long, long[]> map = new HashMap<>();
        for (Object[] row : rows) {
            Long pid = (Long) row[0];
            long qty = ((Number) row[1]).longValue();
            long rev = ((BigDecimal) row[2]).multiply(BigDecimal.valueOf(100)).longValue();
            map.put(pid, new long[]{qty, rev});
        }
        return map;
    }

    /** Returns map: produitId -> totalQuantitySold */
    private Map<Long, Long> queryVentesQte(LocalDateTime depuis, LocalDateTime jusqua) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
            "SELECT lc.produit.id, SUM(lc.quantite) " +
            "FROM LigneCommande lc " +
            "WHERE lc.produit IS NOT NULL " +
            "AND lc.commande.statut <> :annulee " +
            "AND lc.commande.dateCommande >= :depuis " +
            "AND lc.commande.dateCommande < :jusqua " +
            "GROUP BY lc.produit.id")
            .setParameter("annulee", StatutCommande.ANNULEE)
            .setParameter("depuis", depuis)
            .setParameter("jusqua", jusqua)
            .getResultList();

        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return map;
    }

    /** Returns map: produitId -> allTimeRevenue */
    private Map<Long, BigDecimal> queryRevenuTotal() {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
            "SELECT lc.produit.id, SUM(lc.sousTotal) " +
            "FROM LigneCommande lc " +
            "WHERE lc.produit IS NOT NULL " +
            "AND lc.commande.statut <> :annulee " +
            "GROUP BY lc.produit.id")
            .setParameter("annulee", StatutCommande.ANNULEE)
            .getResultList();

        Map<Long, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((Long) row[0], (BigDecimal) row[1]);
        }
        return map;
    }

    /** Returns monthly order aggregates */
    @SuppressWarnings("unchecked")
    private List<TendanceVentes> queryTendanceMensuelle() {
        List<Object[]> rows = em.createNativeQuery(
            "SELECT TO_CHAR(c.date_commande, 'YYYY-MM') AS mois, " +
            "COUNT(*), SUM(c.montant_total) " +
            "FROM commandes c " +
            "WHERE c.statut <> 'ANNULEE' " +
            "GROUP BY TO_CHAR(c.date_commande, 'YYYY-MM') " +
            "ORDER BY mois")
            .getResultList();

        List<TendanceVentes> list = new ArrayList<>();
        for (Object[] row : rows) {
            list.add(TendanceVentes.builder()
                    .periode((String) row[0])
                    .nombreCommandes(((Number) row[1]).longValue())
                    .chiffreAffaires(row[2] instanceof BigDecimal ? (BigDecimal) row[2]
                            : BigDecimal.valueOf(((Number) row[2]).doubleValue()))
                    .build());
        }
        return list;
    }

    private long countCommandes(LocalDateTime depuis) {
        return (long) em.createQuery(
            "SELECT COUNT(c) FROM Commande c " +
            "WHERE c.statut <> :annulee AND c.dateCommande >= :depuis")
            .setParameter("annulee", StatutCommande.ANNULEE)
            .setParameter("depuis", depuis)
            .getSingleResult();
    }

    // ═══════════════════════════════════════════════════════════════
    // ALGORITHMS
    // ═══════════════════════════════════════════════════════════════

    /**
     * ABC/Pareto classification:
     * - Sort products by all-time revenue DESC
     * - A = cumulative <= 80% of total revenue
     * - B = cumulative <= 95%
     * - C = rest
     */
    private Map<Long, String> calculerABC(List<Produit> produits, Map<Long, BigDecimal> caTotal) {
        BigDecimal totalCA = caTotal.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalCA.compareTo(BigDecimal.ZERO) == 0) {
            return produits.stream().collect(Collectors.toMap(Produit::getId, p -> "C"));
        }

        // Sort by revenue DESC
        List<Map.Entry<Long, BigDecimal>> sorted = new ArrayList<>(caTotal.entrySet());
        sorted.sort((a, b) -> b.getValue().compareTo(a.getValue()));

        Map<Long, String> abc = new HashMap<>();
        BigDecimal cumul = BigDecimal.ZERO;

        for (Map.Entry<Long, BigDecimal> entry : sorted) {
            cumul = cumul.add(entry.getValue());
            double ratio = cumul.doubleValue() / totalCA.doubleValue();

            if (ratio <= 0.80) {
                abc.put(entry.getKey(), "A");
            } else if (ratio <= 0.95) {
                abc.put(entry.getKey(), "B");
            } else {
                abc.put(entry.getKey(), "C");
            }
        }

        // Products with no sales → C
        for (Produit p : produits) {
            abc.putIfAbsent(p.getId(), "C");
        }

        return abc;
    }

    /**
     * Demand forecasting: Weighted Moving Average
     * weights = [0.5, 0.3, 0.2] for 3 monthly periods
     * month1 = last 30 days, month2 = 30-60 days, month3 = 60-90 days
     */
    private int calculerPrevision(long m1, long m2, long m3) {
        if (m1 == 0 && m2 == 0 && m3 == 0) return 0;

        // Determine how many periods have data
        int periodesActives = (m1 > 0 ? 1 : 0) + (m2 > 0 ? 1 : 0) + (m3 > 0 ? 1 : 0);

        if (periodesActives == 0) return 0;

        double forecast;
        if (m2 == 0 && m3 == 0) {
            // Only 1 period with data: use it directly
            forecast = m1;
        } else if (m3 == 0) {
            // 2 periods: reweight [0.6, 0.4]
            forecast = m1 * 0.6 + m2 * 0.4;
        } else {
            // 3 periods: full WMA
            forecast = m1 * WMA_WEIGHTS[0] + m2 * WMA_WEIGHTS[1] + m3 * WMA_WEIGHTS[2];
        }

        return (int) Math.round(forecast);
    }

    /**
     * Trend detection: compare current 30-day sales vs previous 30-day sales
     * > +10% = HAUSSE, < -10% = BAISSE, else STABLE
     */
    private String detecterTendance(long current, long previous) {
        if (previous == 0) {
            return current > 0 ? "HAUSSE" : "STABLE";
        }
        double growth = (double) (current - previous) / previous * 100;
        if (growth > 10) return "HAUSSE";
        if (growth < -10) return "BAISSE";
        return "STABLE";
    }

    /**
     * Composite stock health score (0-100):
     * 1. Stock level vs reorder point (30 pts)
     * 2. Turnover rate (25 pts)
     * 3. ABC revenue class (20 pts)
     * 4. Trend direction (15 pts)
     * 5. Days of stock remaining (10 pts)
     */
    private int calculerScore(int stock, int reorderPoint, double turnover,
                              String abc, String tendance, int joursRestant) {
        int score = 0;

        // 1. Stock level (30 pts)
        if (stock == 0) {
            score += 0;
        } else if (reorderPoint > 0 && stock > reorderPoint * 2) {
            score += 30;
        } else if (reorderPoint > 0 && stock > reorderPoint) {
            score += 20;
        } else if (stock > 0) {
            score += 10;
        }

        // 2. Turnover rate (25 pts) — higher is better
        if (turnover >= 3) score += 25;
        else if (turnover >= 2) score += 20;
        else if (turnover >= 1) score += 15;
        else if (turnover > 0) score += 5;

        // 3. ABC class (20 pts) — A products are most important
        switch (abc) {
            case "A": score += 20; break;
            case "B": score += 15; break;
            case "C": score += 10; break;
        }

        // 4. Trend (15 pts)
        switch (tendance) {
            case "HAUSSE": score += 15; break;
            case "STABLE": score += 10; break;
            case "BAISSE": score += 5; break;
        }

        // 5. Days remaining (10 pts)
        if (joursRestant > 30) score += 10;
        else if (joursRestant > 14) score += 7;
        else if (joursRestant > 7) score += 3;

        return Math.min(score, 100);
    }

    /** Month-over-month revenue growth % */
    private double calculerCroissance(List<TendanceVentes> tendance) {
        if (tendance.size() < 2) return 0;

        BigDecimal moisActuel = tendance.get(tendance.size() - 1).getChiffreAffaires();
        BigDecimal moisPrecedent = tendance.get(tendance.size() - 2).getChiffreAffaires();

        if (moisPrecedent.compareTo(BigDecimal.ZERO) == 0) {
            return moisActuel.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        double growth = moisActuel.subtract(moisPrecedent)
                .divide(moisPrecedent, 4, RoundingMode.HALF_UP)
                .doubleValue() * 100;

        return Math.round(growth * 10.0) / 10.0;
    }

    private ResumeABC buildResumeABC(List<AnalyseProduit> analyses) {
        int a = 0, b = 0, c = 0;
        BigDecimal caA = BigDecimal.ZERO, caB = BigDecimal.ZERO, caC = BigDecimal.ZERO;

        for (AnalyseProduit ap : analyses) {
            switch (ap.getClassificationABC()) {
                case "A": a++; caA = caA.add(ap.getChiffreAffaires()); break;
                case "B": b++; caB = caB.add(ap.getChiffreAffaires()); break;
                case "C": c++; caC = caC.add(ap.getChiffreAffaires()); break;
            }
        }

        BigDecimal total = caA.add(caB).add(caC);
        double pctA = total.compareTo(BigDecimal.ZERO) > 0
                ? caA.divide(total, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;
        double pctB = total.compareTo(BigDecimal.ZERO) > 0
                ? caB.divide(total, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;
        double pctC = total.compareTo(BigDecimal.ZERO) > 0
                ? 100 - pctA - pctB : 0;

        return ResumeABC.builder()
                .produitsA(a).produitsB(b).produitsC(c)
                .pourcentageCA_A(Math.round(pctA * 10.0) / 10.0)
                .pourcentageCA_B(Math.round(pctB * 10.0) / 10.0)
                .pourcentageCA_C(Math.round(pctC * 10.0) / 10.0)
                .build();
    }

    private AnalyseStockDTO buildEmptyResult() {
        return AnalyseStockDTO.builder()
                .analyseParProduit(List.of())
                .resumeABC(ResumeABC.builder()
                        .produitsA(0).produitsB(0).produitsC(0)
                        .pourcentageCA_A(0).pourcentageCA_B(0).pourcentageCA_C(0).build())
                .indicateursGlobaux(IndicateursGlobaux.builder()
                        .valeurTotaleStock(BigDecimal.ZERO)
                        .tauxRotationMoyen(0).produitsEnAlerte(0).produitsEnRupture(0)
                        .chiffreAffaires90j(BigDecimal.ZERO).croissanceMensuelle(0)
                        .totalProduits(0).totalCommandes90j(0).build())
                .tendanceVentes(List.of())
                .build();
    }
}
