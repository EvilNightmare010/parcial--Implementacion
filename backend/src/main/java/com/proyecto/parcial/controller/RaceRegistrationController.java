package com.proyecto.parcial.controller;

import com.proyecto.parcial.dto.RegistrationRequest;
import com.proyecto.parcial.entity.RaceRegistration;
import com.proyecto.parcial.service.RaceRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api") // Se cambia a /api para soportar ambas rutas del módulo
@RequiredArgsConstructor
public class RaceRegistrationController {

    private final RaceRegistrationService registrationService;

    @PostMapping("/races/{raceId}/registrations")
    public ResponseEntity<RaceRegistration> register(
            @PathVariable Long raceId, 
            @RequestBody RegistrationRequest request, 
            Principal principal) {
        
        request.setRaceId(raceId);
        return new ResponseEntity<>(registrationService.registerParticipant(request, principal.getName()), HttpStatus.CREATED);
    }

    // NUEVO: Listar las inscripciones de una carrera (Evita el 405 Method Not Allowed)
    @GetMapping("/races/{raceId}/registrations")
    public ResponseEntity<List<RaceRegistration>> getRegistrationsByRace(@PathVariable Long raceId) {
        return ResponseEntity.ok(registrationService.getRegistrationsByRaceId(raceId));
    }

    // NUEVO: Aprobar o rechazar (Usado por los botones del Organizador)
    @PatchMapping("/registrations/{id}/{action}")
    public ResponseEntity<RaceRegistration> decideRegistration(
            @PathVariable Long id, 
            @PathVariable String action,
            @RequestBody(required = false) Map<String, String> payload,
            Principal principal) {
            
        String reason = (payload != null) ? payload.get("reason") : null;
        return ResponseEntity.ok(registrationService.decideRegistration(id, action, reason, principal.getName()));
    }
}