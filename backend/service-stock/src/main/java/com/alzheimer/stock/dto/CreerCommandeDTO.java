package com.alzheimer.stock.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreerCommandeDTO {

    @NotBlank(message = "Le nom du client est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nomClient;

    @Email(message = "L'email doit être valide")
    private String emailClient;

    @Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    private String telephoneClient;

    @Size(max = 1000, message = "L'adresse ne peut pas dépasser 1000 caractères")
    private String adresseLivraison;

    @NotBlank(message = "L'identifiant de session est obligatoire")
    private String sessionId;
}
