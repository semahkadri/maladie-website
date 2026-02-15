package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.TableauDeBordDTO;
import com.alzheimer.stock.service.TableauDeBordService;
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
public class TableauDeBordControleur {

    private final TableauDeBordService tableauDeBordService;

    @GetMapping
    public ResponseEntity<TableauDeBordDTO> obtenirTableauDeBord() {
        return ResponseEntity.ok(tableauDeBordService.obtenirTableauDeBord());
    }
}
