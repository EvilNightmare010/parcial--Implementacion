package com.proyecto.parcial.controller;

import com.proyecto.parcial.repository.CompetitorRepository;
import com.proyecto.parcial.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/standings")
@RequiredArgsConstructor
public class StandingsController {

    private final CompetitorRepository competitorRepository;
    private final TeamRepository teamRepository; // Inyectamos el repositorio de equipos

    // Mantiene funcionando el Dashboard principal
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getStandings() {
        var competitors = competitorRepository.findAll();
        var standings = competitors.stream()
                .sorted((a, b) -> Integer.compare(
                        b.getWins() != null ? b.getWins() : 0, 
                        a.getWins() != null ? a.getWins() : 0))
                .map(c -> Map.<String, Object>of(
                        "name", c.getName(),
                        "points", (c.getWins() != null ? c.getWins() : 0) * 10
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(standings);
    }

    // Endpoint para la pestaña de Competidores
    @GetMapping("/competitors")
    public ResponseEntity<List<Map<String, Object>>> getCompetitorStandings() {
        var competitors = competitorRepository.findAll();
        var standings = competitors.stream()
                .sorted((a, b) -> Integer.compare(
                        b.getWins() != null ? b.getWins() : 0, 
                        a.getWins() != null ? a.getWins() : 0))
                .map(c -> Map.<String, Object>of(
                        "name", c.getName(),
                        "wins", c.getWins() != null ? c.getWins() : 0,
                        "points", (c.getWins() != null ? c.getWins() : 0) * 10
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(standings);
    }

    // Endpoint para la pestaña de Equipos
    @GetMapping("/teams")
    public ResponseEntity<List<Map<String, Object>>> getTeamStandings() {
        var teams = teamRepository.findAll();
        var standings = teams.stream()
                .sorted((a, b) -> Integer.compare(
                        b.getWins() != null ? b.getWins() : 0, 
                        a.getWins() != null ? a.getWins() : 0))
                .map(t -> Map.<String, Object>of(
                        "name", t.getName(),
                        "wins", t.getWins() != null ? t.getWins() : 0,
                        "points", (t.getWins() != null ? t.getWins() : 0) * 10
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(standings);
    }
}