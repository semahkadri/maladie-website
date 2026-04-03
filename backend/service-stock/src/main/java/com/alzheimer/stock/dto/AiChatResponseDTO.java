package com.alzheimer.stock.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatResponseDTO {

    private String reponse;

    @Builder.Default
    private List<ProduitDTO> produitsSugeres = new ArrayList<>();
}
