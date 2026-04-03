package com.alzheimer.stock.controleur;

import com.alzheimer.stock.dto.AiChatRequestDTO;
import com.alzheimer.stock.dto.AiChatResponseDTO;
import com.alzheimer.stock.dto.AiDescriptionRequestDTO;
import com.alzheimer.stock.service.AiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Tag(name = "AI Assistant", description = "Endpoints pour l'assistant IA PharmaCare")
public class AiControleur {

    private final AiService aiService;

    @PostMapping("/chat")
    @Operation(summary = "Chat avec l'assistant IA", description = "Envoie un message à l'assistant IA et reçoit une réponse avec produits suggérés")
    public ResponseEntity<AiChatResponseDTO> chat(@RequestBody AiChatRequestDTO request) {
        return ResponseEntity.ok(aiService.chat(request));
    }

    @PostMapping("/generer-description")
    @Operation(summary = "Générer une description de produit", description = "Génère une description commerciale pour un produit via IA")
    public ResponseEntity<String> genererDescription(@RequestBody AiDescriptionRequestDTO request) {
        return ResponseEntity.ok(aiService.genererDescription(request));
    }
}
