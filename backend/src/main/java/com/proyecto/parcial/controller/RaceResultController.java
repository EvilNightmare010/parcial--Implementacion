package com.proyecto.parcial.controller;

import com.proyecto.parcial.dto.ResultRequest;
import com.proyecto.parcial.entity.RaceResult;
import com.proyecto.parcial.service.RaceResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
public class RaceResultController {

    private final RaceResultService resultService;

    @PostMapping("/{raceId}/results")
    public ResponseEntity<RaceResult> recordResult(
            @PathVariable Long raceId,
            @Valid @RequestBody ResultRequest request,
            Principal principal) {
            
        return new ResponseEntity<>(resultService.recordResult(raceId, request, principal.getName()), HttpStatus.CREATED);
    }
}