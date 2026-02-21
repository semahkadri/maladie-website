package com.alzheimer.stock.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GestionGlobaleExceptions {

    @ExceptionHandler(ResourceIntrouvableException.class)
    public ResponseEntity<Map<String, Object>> gererResourceIntrouvable(ResourceIntrouvableException ex) {
        Map<String, Object> erreur = new HashMap<>();
        erreur.put("timestamp", LocalDateTime.now());
        erreur.put("message", ex.getMessage());
        erreur.put("statut", HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(erreur, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> gererValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> erreur = new HashMap<>();
        Map<String, String> erreurs = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach(error -> {
            String champ = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            erreurs.put(champ, message);
        });

        erreur.put("timestamp", LocalDateTime.now());
        erreur.put("message", "Erreur de validation");
        erreur.put("erreurs", erreurs);
        erreur.put("statut", HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(erreur, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> gererArgumentIllegal(IllegalArgumentException ex) {
        Map<String, Object> erreur = new HashMap<>();
        erreur.put("timestamp", LocalDateTime.now());
        erreur.put("message", ex.getMessage());
        erreur.put("statut", HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(erreur, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> gererExceptionGenerale(Exception ex) {
        Map<String, Object> erreur = new HashMap<>();
        erreur.put("timestamp", LocalDateTime.now());
        erreur.put("message", "Une erreur interne est survenue");
        erreur.put("detail", ex.getMessage());
        erreur.put("statut", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(erreur, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
