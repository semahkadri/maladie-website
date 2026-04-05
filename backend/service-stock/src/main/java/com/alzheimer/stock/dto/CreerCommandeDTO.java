package com.alzheimer.stock.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[2-9][0-9]{7}$", message = "Le téléphone doit être un numéro tunisien valide (8 chiffres, commence par 2-9)")
    @Size(min = 8, max = 8, message = "Le téléphone doit contenir exactement 8 chiffres")
    private String telephoneClient;

    @NotBlank(message = "L'adresse de livraison est obligatoire")
    @Size(max = 1000, message = "L'adresse ne peut pas dépasser 1000 caractères")
    private String adresseLivraison;

    @NotBlank(message = "L'identifiant de session est obligatoire")
    private String sessionId;
}
