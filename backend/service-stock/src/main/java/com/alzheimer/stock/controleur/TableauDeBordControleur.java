package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.TableauDeBordDTO;
import com.alzheimer.stock.service.TableauDeBordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tableau-de-bord")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Tableau de Bord", description = "Statistiques agrégées du stock")
public class TableauDeBordControleur {

    private final TableauDeBordService tableauDeBordService;

    @GetMapping
    @Operation(summary = "Obtenir le tableau de bord",
               description = "Retourne les statistiques agrégées : totaux, stock bas, ruptures, valeur totale, dernières catégories et produits")
    public ResponseEntity<TableauDeBordDTO> obtenirTableauDeBord() {
        return ResponseEntity.ok(tableauDeBordService.obtenirTableauDeBord());
    }
}
