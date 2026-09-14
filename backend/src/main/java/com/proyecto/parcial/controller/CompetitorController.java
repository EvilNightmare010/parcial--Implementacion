package com.proyecto.parcial.controller;

import com.proyecto.parcial.dto.CompetitorRequest;
import com.proyecto.parcial.entity.Competitor;
import com.proyecto.parcial.service.CompetitorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/competitors")
@RequiredArgsConstructor
public class CompetitorController {

    private final CompetitorService competitorService;

    @PostMapping
    public ResponseEntity<Competitor> createCompetitor(@Valid @RequestBody CompetitorRequest request) {
        return new ResponseEntity<>(competitorService.createCompetitor(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Competitor>> getAllCompetitors() {
        return ResponseEntity.ok(competitorService.getAllCompetitors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Competitor> getCompetitorById(@PathVariable Long id) {
        return ResponseEntity.ok(competitorService.getCompetitorById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Competitor> updateCompetitor(@PathVariable Long id, @Valid @RequestBody CompetitorRequest request) {
        return ResponseEntity.ok(competitorService.updateCompetitor(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Competitor> updateCompetitorStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(competitorService.updateStatus(id, payload.get("status")));
    }
}