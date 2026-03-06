package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.EmailLogDTO;
import com.alzheimer.stock.entite.EmailLog;
import com.alzheimer.stock.repository.EmailLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "Emails", description = "Consultation des emails envoyés")
public class EmailLogControleur {

    private final EmailLogRepository emailLogRepository;

    @GetMapping
    @Operation(summary = "Lister tous les emails", description = "Retourne la liste de tous les emails envoyés, du plus récent au plus ancien")
    public ResponseEntity<List<EmailLogDTO>> listerTousLesEmails() {
        List<EmailLogDTO> emails = emailLogRepository.findAllByOrderByDateEnvoiDesc()
                .stream()
                .map(this::convertirEnDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(emails);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir un email par ID")
    public ResponseEntity<EmailLogDTO> obtenirEmailParId(@PathVariable Long id) {
        EmailLog email = emailLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Email non trouvé avec l'ID: " + id));
        return ResponseEntity.ok(convertirEnDTO(email));
    }

    @PutMapping("/{id}/lu")
    @Operation(summary = "Marquer un email comme lu")
    public ResponseEntity<EmailLogDTO> marquerCommeLu(@PathVariable Long id) {
        EmailLog email = emailLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Email non trouvé avec l'ID: " + id));
        email.setLu(true);
        emailLogRepository.save(email);
        return ResponseEntity.ok(convertirEnDTO(email));
    }

    @PutMapping("/tout-lu")
    @Operation(summary = "Marquer tous les emails comme lus")
    public ResponseEntity<Void> marquerToutCommeLu() {
        List<EmailLog> emails = emailLogRepository.findAll();
        emails.forEach(e -> e.setLu(true));
        emailLogRepository.saveAll(emails);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/non-lus/count")
    @Operation(summary = "Compter les emails non lus")
    public ResponseEntity<Map<String, Long>> compterNonLus() {
        long count = emailLogRepository.countByLuFalse();
        return ResponseEntity.ok(Map.of("count", count));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un email")
    public ResponseEntity<Void> supprimerEmail(@PathVariable Long id) {
        emailLogRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private EmailLogDTO convertirEnDTO(EmailLog email) {
        return EmailLogDTO.builder()
                .id(email.getId())
                .destinataire(email.getDestinataire())
                .sujet(email.getSujet())
                .contenuHtml(email.getContenuHtml())
                .type(email.getType())
                .referenceCommande(email.getReferenceCommande())
                .lu(email.getLu())
                .dateEnvoi(email.getDateEnvoi())
                .build();
    }
}
