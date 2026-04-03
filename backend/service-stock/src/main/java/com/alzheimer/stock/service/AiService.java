package com.alzheimer.stock.service;

import com.alzheimer.stock.dto.AiChatRequestDTO;
import com.alzheimer.stock.dto.AiChatResponseDTO;
import com.alzheimer.stock.dto.AiDescriptionRequestDTO;

public interface AiService {

    AiChatResponseDTO chat(AiChatRequestDTO request);

    String genererDescription(AiDescriptionRequestDTO request);
}
