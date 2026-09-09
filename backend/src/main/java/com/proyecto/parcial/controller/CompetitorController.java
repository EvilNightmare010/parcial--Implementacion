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
}