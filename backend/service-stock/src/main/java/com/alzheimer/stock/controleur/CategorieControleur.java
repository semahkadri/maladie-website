package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.CategorieDTO;
import com.alzheimer.stock.service.CategorieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Catégories", description = "CRUD des catégories de stock")
public class CategorieControleur {

    private final CategorieService categorieService;

    @GetMapping
    @Operation(summary = "Lister toutes les catégories", description = "Retourne la liste complète des catégories avec le nombre de produits associés")
    public ResponseEntity<List<CategorieDTO>> listerToutesLesCategories() {
        return ResponseEntity.ok(categorieService.listerToutesLesCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une catégorie par ID")
    public ResponseEntity<CategorieDTO> obtenirCategorieParId(@PathVariable Long id) {
        return ResponseEntity.ok(categorieService.obtenirCategorieParId(id));
    }

    @PostMapping
    @Operation(summary = "Créer une nouvelle catégorie")
    public ResponseEntity<CategorieDTO> creerCategorie(@Valid @RequestBody CategorieDTO categorieDTO) {
        CategorieDTO creee = categorieService.creerCategorie(categorieDTO);
        return new ResponseEntity<>(creee, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une catégorie existante")
    public ResponseEntity<CategorieDTO> modifierCategorie(@PathVariable Long id,
                                                           @Valid @RequestBody CategorieDTO categorieDTO) {
        return ResponseEntity.ok(categorieService.modifierCategorie(id, categorieDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer une catégorie", description = "Supprime la catégorie et tous les produits associés (cascade)")
    public ResponseEntity<Void> supprimerCategorie(@PathVariable Long id) {
        categorieService.supprimerCategorie(id);
        return ResponseEntity.noContent().build();
    }
}
