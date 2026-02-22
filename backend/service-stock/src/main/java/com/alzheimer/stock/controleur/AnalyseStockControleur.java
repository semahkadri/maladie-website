package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.AnalyseStockDTO;
import com.alzheimer.stock.service.AnalyseStockService;
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
public class AnalyseStockControleur {

    private final AnalyseStockService analyseStockService;

    @GetMapping
    public ResponseEntity<AnalyseStockDTO> analyserStock() {
        return ResponseEntity.ok(analyseStockService.analyserStock());
    }
}
