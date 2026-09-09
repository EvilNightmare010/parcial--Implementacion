package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.TeamRequest;
import com.proyecto.parcial.entity.Competitor;
import com.proyecto.parcial.entity.Team;
import com.proyecto.parcial.entity.TeamMember;
import com.proyecto.parcial.enums.CompetitorStatus;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.exception.ResourceNotFoundException;
import com.proyecto.parcial.repository.CompetitorRepository;
import com.proyecto.parcial.repository.TeamMemberRepository;
import com.proyecto.parcial.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final CompetitorRepository competitorRepository;
    private final TeamMemberRepository teamMemberRepository;

    public Team createTeam(TeamRequest request) {
        if (teamRepository.findByName(request.getName()).isPresent()) {
            throw new BusinessRuleException("Ya existe un equipo llamado '" + request.getName() + "'");
        }

        Team team = Team.builder()
                .name(request.getName())
                .description(request.getDescription())
                .coachName(request.getCoachName())
                .maxMembers(request.getMaxMembers())
                .status(CompetitorStatus.ACTIVE)
                .build();

        return teamRepository.save(team);
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public TeamMember addMemberToTeam(Long teamId, Long competitorId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado"));
                
        Competitor competitor = competitorRepository.findById(competitorId)
                .orElseThrow(() -> new ResourceNotFoundException("Competidor no encontrado"));

        // Regla 1: Un competidor no puede estar en varios equipos a la vez
        if (competitor.getTeam() != null) {
            throw new BusinessRuleException("El competidor " + competitor.getName() + " ya pertenece a un equipo.");
        }

        // Regla 2: Validar la capacidad máxima
        long currentMembers = teamMemberRepository.countByTeam(team);
        if (currentMembers >= team.getMaxMembers()) {
            throw new BusinessRuleException("El equipo " + team.getName() + " ya alcanzó su límite máximo de " + team.getMaxMembers() + " miembros.");
        }

        // Si pasa las reglas, asociamos el competidor al equipo
        competitor.setTeam(team);
        competitorRepository.save(competitor); // Actualizamos la tabla COMPETITOR

        // Guardamos el registro histórico en TEAM_MEMBER
        TeamMember memberRecord = TeamMember.builder()
                .team(team)
                .competitor(competitor)
                .build();
                
        return teamMemberRepository.save(memberRecord);
    }
}