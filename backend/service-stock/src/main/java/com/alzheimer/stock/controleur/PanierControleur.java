package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.PanierDTO;
import com.alzheimer.stock.service.PanierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/panier")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Panier", description = "Gestion du panier d'achat")
public class PanierControleur {

    private final PanierService panierService;

    @GetMapping("/{sessionId}")
    @Operation(summary = "Obtenir le panier", description = "Retourne le panier associé à la session")
    public ResponseEntity<PanierDTO> obtenirPanier(@PathVariable String sessionId) {
        return ResponseEntity.ok(panierService.obtenirPanier(sessionId));
    }

    @PostMapping("/{sessionId}/produits/{produitId}")
    @Operation(summary = "Ajouter un produit au panier")
    public ResponseEntity<PanierDTO> ajouterProduit(
            @PathVariable String sessionId,
            @PathVariable Long produitId,
            @RequestParam(defaultValue = "1") int quantite) {
        return ResponseEntity.ok(panierService.ajouterProduit(sessionId, produitId, quantite));
    }

    @PutMapping("/{sessionId}/produits/{produitId}")
    @Operation(summary = "Modifier la quantité d'un produit dans le panier")
    public ResponseEntity<PanierDTO> modifierQuantite(
            @PathVariable String sessionId,
            @PathVariable Long produitId,
            @RequestParam int quantite) {
        return ResponseEntity.ok(panierService.modifierQuantite(sessionId, produitId, quantite));
    }

    @DeleteMapping("/{sessionId}/produits/{produitId}")
    @Operation(summary = "Supprimer un produit du panier")
    public ResponseEntity<PanierDTO> supprimerProduit(
            @PathVariable String sessionId,
            @PathVariable Long produitId) {
        return ResponseEntity.ok(panierService.supprimerProduit(sessionId, produitId));
    }

    @DeleteMapping("/{sessionId}")
    @Operation(summary = "Vider le panier")
    public ResponseEntity<Void> viderPanier(@PathVariable String sessionId) {
        panierService.viderPanier(sessionId);
        return ResponseEntity.noContent().build();
    }
}
