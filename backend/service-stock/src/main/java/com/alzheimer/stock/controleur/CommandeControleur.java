package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.CommandeDTO;
import com.alzheimer.stock.dto.CreerCommandeDTO;
import com.alzheimer.stock.entite.StatutCommande;
import com.alzheimer.stock.service.CommandeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Commandes", description = "Gestion des commandes")
public class CommandeControleur {

    private final CommandeService commandeService;

    @PostMapping
    @Operation(summary = "Créer une commande", description = "Crée une commande à partir du panier, décrémente le stock")
    public ResponseEntity<CommandeDTO> creerCommande(@Valid @RequestBody CreerCommandeDTO creerCommandeDTO) {
        CommandeDTO commande = commandeService.creerCommande(creerCommandeDTO);
        return new ResponseEntity<>(commande, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Lister toutes les commandes")
    public ResponseEntity<List<CommandeDTO>> listerCommandes(
            @RequestParam(required = false) StatutCommande statut) {
        if (statut != null) {
            return ResponseEntity.ok(commandeService.listerCommandesParStatut(statut));
        }
        return ResponseEntity.ok(commandeService.listerToutesLesCommandes());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir une commande par ID")
    public ResponseEntity<CommandeDTO> obtenirCommande(@PathVariable Long id) {
        return ResponseEntity.ok(commandeService.obtenirCommandeParId(id));
    }

    @GetMapping("/reference/{reference}")
    @Operation(summary = "Obtenir une commande par référence")
    public ResponseEntity<CommandeDTO> obtenirCommandeParReference(@PathVariable String reference) {
        return ResponseEntity.ok(commandeService.obtenirCommandeParReference(reference));
    }

    @PatchMapping("/{id}/statut")
    @Operation(summary = "Modifier le statut d'une commande")
    public ResponseEntity<CommandeDTO> modifierStatut(
            @PathVariable Long id,
            @RequestParam StatutCommande statut) {
        return ResponseEntity.ok(commandeService.modifierStatut(id, statut));
    }
}
