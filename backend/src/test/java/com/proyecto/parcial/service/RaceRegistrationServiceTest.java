package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.RegistrationRequest;
import com.proyecto.parcial.entity.Race;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.enums.RaceType;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RaceRegistrationServiceTest {

    @Mock private RaceRegistrationRepository registrationRepository;
    @Mock private RaceRepository raceRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private RaceRegistrationService registrationService;

    // Test 10: Rechazar inscripción después de la fecha límite
    @Test
    void registerParticipant_AfterDeadline_ThrowsException() {
        Race race = Race.builder().registrationDeadline(LocalDateTime.now().minusDays(1)).build(); // La fecha límite fue ayer
        when(raceRepository.findById(1L)).thenReturn(Optional.of(race));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(new User()));

        RegistrationRequest request = new RegistrationRequest(1L, 1L, null, 1, "Notas");
        
        assertThrows(BusinessRuleException.class, () -> registrationService.registerParticipant(request, "admin"));
    }

    // Test 11: Rechazar un equipo en una carrera individual
    @Test
    void registerParticipant_TeamInIndividualRace_ThrowsException() {
        Race race = Race.builder().registrationDeadline(LocalDateTime.now().plusDays(1)).raceType(RaceType.INDIVIDUAL).build();
        when(raceRepository.findById(1L)).thenReturn(Optional.of(race));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(new User()));

        // Enviamos ID de equipo pero no de competidor
        RegistrationRequest request = new RegistrationRequest(1L, null, 1L, 1, "Notas");

        assertThrows(BusinessRuleException.class, () -> registrationService.registerParticipant(request, "admin"));
    }
    
    // Test 12: Rechazar participante en carrera de equipos sin enviar equipo
    @Test
    void registerParticipant_IndividualInTeamRace_ThrowsException() {
        Race race = Race.builder().registrationDeadline(LocalDateTime.now().plusDays(1)).raceType(RaceType.TEAM).build();
        when(raceRepository.findById(1L)).thenReturn(Optional.of(race));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(new User()));

        RegistrationRequest request = new RegistrationRequest(1L, 1L, null, 1, "Notas");

        assertThrows(BusinessRuleException.class, () -> registrationService.registerParticipant(request, "admin"));
    }
}