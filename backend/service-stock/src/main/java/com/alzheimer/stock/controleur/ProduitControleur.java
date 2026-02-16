package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.ProduitDTO;
import com.alzheimer.stock.service.ProduitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Produits", description = "CRUD des produits de stock")
public class ProduitControleur {

    private final ProduitService produitService;

    @GetMapping
    @Operation(summary = "Lister tous les produits", description = "Retourne la liste complète des produits avec leurs catégories")
    public ResponseEntity<List<ProduitDTO>> listerTousLesProduits() {
        return ResponseEntity.ok(produitService.listerTousLesProduits());
    }

    @GetMapping("/categorie/{categorieId}")
    @Operation(summary = "Lister les produits par catégorie")
    public ResponseEntity<List<ProduitDTO>> listerProduitsParCategorie(@PathVariable Long categorieId) {
        return ResponseEntity.ok(produitService.listerProduitsParCategorie(categorieId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un produit par ID")
    public ResponseEntity<ProduitDTO> obtenirProduitParId(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.obtenirProduitParId(id));
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau produit")
    public ResponseEntity<ProduitDTO> creerProduit(@Valid @RequestBody ProduitDTO produitDTO) {
        ProduitDTO cree = produitService.creerProduit(produitDTO);
        return new ResponseEntity<>(cree, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier un produit existant")
    public ResponseEntity<ProduitDTO> modifierProduit(@PathVariable Long id,
                                                       @Valid @RequestBody ProduitDTO produitDTO) {
        return ResponseEntity.ok(produitService.modifierProduit(id, produitDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un produit")
    public ResponseEntity<Void> supprimerProduit(@PathVariable Long id) {
        produitService.supprimerProduit(id);
        return ResponseEntity.noContent().build();
    }
}
