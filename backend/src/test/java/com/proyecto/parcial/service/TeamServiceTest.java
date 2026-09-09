package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.TeamRequest;
import com.proyecto.parcial.entity.Competitor;
import com.proyecto.parcial.entity.Team;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.repository.CompetitorRepository;
import com.proyecto.parcial.repository.TeamMemberRepository;
import com.proyecto.parcial.repository.TeamRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

    @Mock private TeamRepository teamRepository;
    @Mock private CompetitorRepository competitorRepository;
    @Mock private TeamMemberRepository teamMemberRepository;

    @InjectMocks private TeamService teamService;

    // Test 4: Rechazar creación si el nombre del equipo ya existe
    @Test
    void createTeam_DuplicateName_ThrowsException() {
        TeamRequest request = new TeamRequest("The Exceptions", "Desc", "Coach", 5);
        when(teamRepository.findByName("The Exceptions")).thenReturn(Optional.of(new Team()));

        assertThrows(BusinessRuleException.class, () -> teamService.createTeam(request));
    }

    // Test 5: Registrar a un competidor activo en un equipo exitosamente
    @Test
    void addMemberToTeam_Valid_Success() {
        Team team = Team.builder().idTeam(1L).maxMembers(5).build();
        Competitor competitor = Competitor.builder().idCompetitor(1L).name("Enano").build();

        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(competitorRepository.findById(1L)).thenReturn(Optional.of(competitor));
        when(teamMemberRepository.countByTeam(team)).thenReturn(2L);

        teamService.addMemberToTeam(1L, 1L);

        verify(competitorRepository).save(competitor);
        verify(teamMemberRepository).save(any());
        assertEquals(team, competitor.getTeam());
    }

    // Test 6: Rechazar si el competidor ya pertenece a un equipo
    @Test
    void addMemberToTeam_CompetitorAlreadyHasTeam_ThrowsException() {
        Team team1 = Team.builder().idTeam(1L).build();
        Team team2 = Team.builder().idTeam(2L).build();
        Competitor competitor = Competitor.builder().team(team1).build(); // Ya tiene equipo

        when(teamRepository.findById(2L)).thenReturn(Optional.of(team2));
        when(competitorRepository.findById(1L)).thenReturn(Optional.of(competitor));

        assertThrows(BusinessRuleException.class, () -> teamService.addMemberToTeam(2L, 1L));
    }

    // Test 7: Rechazar si el equipo excede la capacidad máxima
    @Test
    void addMemberToTeam_ExceedsCapacity_ThrowsException() {
        Team team = Team.builder().idTeam(1L).maxMembers(2).build();
        Competitor competitor = Competitor.builder().build();

        when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
        when(competitorRepository.findById(1L)).thenReturn(Optional.of(competitor));
        when(teamMemberRepository.countByTeam(team)).thenReturn(2L); // Ya tiene 2, el máximo es 2

        assertThrows(BusinessRuleException.class, () -> teamService.addMemberToTeam(1L, 1L));
    }
}