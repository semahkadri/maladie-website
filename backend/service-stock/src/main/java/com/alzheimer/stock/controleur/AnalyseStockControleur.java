package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.AnalyseStockDTO;
import com.alzheimer.stock.service.AnalyseStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analyse-stock")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
@Tag(name = "Analyse Stock", description = "Analyse avancée du stock (KPIs, ABC, tendances)")
public class AnalyseStockControleur {

    private final AnalyseStockService analyseStockService;

    @GetMapping
    @Operation(summary = "Analyser le stock", description = "Retourne les KPIs, classification ABC, tendances des ventes et analyse par produit")
    public ResponseEntity<AnalyseStockDTO> analyserStock() {
        return ResponseEntity.ok(analyseStockService.analyserStock());
    }
}
