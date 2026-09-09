package com.proyecto.parcial.controller;

import com.proyecto.parcial.dto.RaceRequest;
import com.proyecto.parcial.entity.Race;
import com.proyecto.parcial.service.RaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceController {

    private final RaceService raceService;

    @PostMapping
    public ResponseEntity<Race> createRace(@Valid @RequestBody RaceRequest request, Principal principal) {
        // principal.getName() nos da el 'username' del usuario autenticado
        return new ResponseEntity<>(raceService.createRace(request, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Race>> getAllRaces() {
        return ResponseEntity.ok(raceService.getAllRaces());
    }
}