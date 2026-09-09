package com.proyecto.parcial.controller;

import com.proyecto.parcial.dto.RegistrationRequest;
import com.proyecto.parcial.entity.RaceRegistration;
import com.proyecto.parcial.service.RaceRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceRegistrationController {

    private final RaceRegistrationService registrationService;

    @PostMapping("/{raceId}/registrations")
    public ResponseEntity<RaceRegistration> register(
            @PathVariable Long raceId, 
            @RequestBody RegistrationRequest request, 
            Principal principal) {
        
        // Aseguramos que el ID de la URL sea el que se procesa
        request.setRaceId(raceId);
        
        return new ResponseEntity<>(registrationService.registerParticipant(request, principal.getName()), HttpStatus.CREATED);
    }
}