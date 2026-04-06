package com.alzheimer.stock.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Alzheimer - Service Stock API")
                        .version("1.0.0")
                        .description("API REST pour la gestion de stock du projet de Détection de la Maladie d'Alzheimer. "
                                + "Ce microservice gère les catégories, les produits et le tableau de bord.")
                        .contact(new Contact()
                                .name("Équipe Alzheimer Detection")
                                .email("contact@alzheimer-stock-clean.com")))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Service Stock (direct)"),
                        new Server().url("http://localhost:8080/api/stock").description("Via API Gateway")
                ));
    }
}
