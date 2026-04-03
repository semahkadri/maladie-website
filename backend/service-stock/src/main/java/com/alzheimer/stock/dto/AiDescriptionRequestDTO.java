package com.alzheimer.stock.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiDescriptionRequestDTO {

    private String nomProduit;
    private String categorie;
    private Double prix;
    private String langue = "fr";
}
