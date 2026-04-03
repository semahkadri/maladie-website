package com.alzheimer.stock.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AiChatRequestDTO {

    private String message;
    private List<ConversationMessage> historique = new ArrayList<>();
    private String langue = "fr";

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ConversationMessage {
        private String role;    // "user" or "assistant"
        private String contenu;
    }
}
