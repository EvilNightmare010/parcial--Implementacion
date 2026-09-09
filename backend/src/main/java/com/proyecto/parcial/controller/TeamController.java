package com.proyecto.parcial.controller;

import com.proyecto.parcial.dto.TeamRequest;
import com.proyecto.parcial.entity.Team;
import com.proyecto.parcial.entity.TeamMember;
import com.proyecto.parcial.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<Team> createTeam(@Valid @RequestBody TeamRequest request) {
        return new ResponseEntity<>(teamService.createTeam(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @PostMapping("/{teamId}/members/{competitorId}")
    public ResponseEntity<TeamMember> addMember(@PathVariable Long teamId, @PathVariable Long competitorId) {
        return new ResponseEntity<>(teamService.addMemberToTeam(teamId, competitorId), HttpStatus.CREATED);
    }
}