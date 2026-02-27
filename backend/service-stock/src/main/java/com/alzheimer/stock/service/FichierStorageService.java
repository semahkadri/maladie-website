package com.alzheimer.stock.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FichierStorageService {

    private static final Set<String> TYPES_AUTORISES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );
    private static final long TAILLE_MAX = 5 * 1024 * 1024; // 5 MB

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path cheminUpload;

    @PostConstruct
    public void init() {
        cheminUpload = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(cheminUpload);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire d'uploads : " + cheminUpload, e);
        }
    }

    public void valider(MultipartFile fichier) {
        if (fichier.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide.");
        }
        if (!TYPES_AUTORISES.contains(fichier.getContentType())) {
            throw new IllegalArgumentException(
                    "Format non supporté. Formats acceptés : JPEG, PNG, GIF, WebP.");
        }
        if (fichier.getSize() > TAILLE_MAX) {
            throw new IllegalArgumentException(
                    "Le fichier dépasse la taille maximale autorisée (5 Mo).");
        }
    }

    public String sauvegarder(MultipartFile fichier) {
        valider(fichier);

        String extension = "";
        String originalName = fichier.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String nomFichier = UUID.randomUUID() + extension;

        try {
            Path destination = cheminUpload.resolve(nomFichier).normalize();
            // Path traversal protection
            if (!destination.startsWith(cheminUpload)) {
                throw new IllegalArgumentException("Chemin de fichier invalide.");
            }
            Files.copy(fichier.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return nomFichier;
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier.", e);
        }
    }

    public void supprimer(String nomFichier) {
        if (nomFichier == null || nomFichier.isBlank()) return;
        try {
            Path fichier = cheminUpload.resolve(nomFichier).normalize();
            if (!fichier.startsWith(cheminUpload)) {
                throw new IllegalArgumentException("Chemin de fichier invalide.");
            }
            Files.deleteIfExists(fichier);
        } catch (IOException e) {
            // Log but don't fail — file may already be gone
        }
    }
}
