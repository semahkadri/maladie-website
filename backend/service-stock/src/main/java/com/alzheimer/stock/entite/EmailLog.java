package com.alzheimer.stock.entite;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String destinataire;

    @Column(nullable = false)
    private String sujet;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenuHtml;

    @Column(nullable = false, length = 50)
    private String type; // CONFIRMATION, STATUT_CHANGE, ADMIN_NOTIFICATION

    @Column(length = 50)
    private String referenceCommande;

    @Column(nullable = false)
    @Builder.Default
    private Boolean lu = false;

    @CreationTimestamp
    @Column(name = "date_envoi", updatable = false)
    private LocalDateTime dateEnvoi;
}
