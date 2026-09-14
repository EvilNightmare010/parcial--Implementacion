package com.proyecto.parcial.controller;

import com.proyecto.parcial.entity.RaceResult;
import com.proyecto.parcial.repository.RaceResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/standings")
@RequiredArgsConstructor
public class StandingsController {

    private final RaceResultRepository raceResultRepository;

    @GetMapping("/competitors")
    public ResponseEntity<List<Map<String, Object>>> getCompetitorStandings() {
        return ResponseEntity.ok(calculateStandings(false));
    }

    @GetMapping("/teams")
    public ResponseEntity<List<Map<String, Object>>> getTeamStandings() {
        return ResponseEntity.ok(calculateStandings(true));
    }

    private List<Map<String, Object>> calculateStandings(boolean isTeam) {
        List<RaceResult> results = raceResultRepository.findAll();
        Map<String, Integer> pointsMap = new HashMap<>();
        Map<String, Integer> winsMap = new HashMap<>();

        for (RaceResult r : results) {
            // Solo procesamos resultados finalizados y con posición asignada
            if ("FINISHED".equalsIgnoreCase(r.getStatus().name()) && r.getFinalPosition() != null) {
                
                String name = null;
                // Dependiendo del endpoint, extraemos el nombre del equipo o del competidor
                if (isTeam && r.getRegistration().getTeam() != null) {
                    name = r.getRegistration().getTeam().getName();
                } else if (!isTeam && r.getRegistration().getCompetitor() != null) {
                    name = r.getRegistration().getCompetitor().getName();
                }

                if (name != null) {
                    int pts = calculatePoints(r.getFinalPosition());
                    pointsMap.put(name, pointsMap.getOrDefault(name, 0) + pts);
                    
                    if (r.getFinalPosition() == 1) {
                        winsMap.put(name, winsMap.getOrDefault(name, 0) + 1);
                    } else {
                        winsMap.putIfAbsent(name, 0); 
                    }
                }
            }
        }

        // Formateamos la respuesta como espera el frontend
        List<Map<String, Object>> standings = new ArrayList<>();
        for (String name : pointsMap.keySet()) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("name", name);
            map.put("points", pointsMap.get(name));
            map.put("wins", winsMap.getOrDefault(name, 0));
            standings.add(map);
        }

        // Ordenamos por puntos (de mayor a menor)
        standings.sort((a, b) -> Integer.compare((Integer) b.get("points"), (Integer) a.get("points")));

        return standings;
    }

    private int calculatePoints(int position) {
        return switch (position) {
            case 1 -> 10;
            case 2 -> 7;
            case 3 -> 5;
            case 4 -> 3;
            case 5 -> 1;
            default -> 0; // Did not finish o Disqualified no suman puntos
        };
    }
}