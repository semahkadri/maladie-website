package com.alzheimer.stock.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLogDTO {

    private Long id;
    private String destinataire;
    private String sujet;
    private String contenuHtml;
    private String type;
    private String referenceCommande;
    private Boolean lu;
    private LocalDateTime dateEnvoi;
}
