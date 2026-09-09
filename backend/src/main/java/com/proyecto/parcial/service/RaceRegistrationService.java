package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.RegistrationRequest;
import com.proyecto.parcial.entity.*;
import com.proyecto.parcial.enums.RaceType;
import com.proyecto.parcial.enums.RegistrationStatus;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.exception.ResourceNotFoundException;
import com.proyecto.parcial.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RaceRegistrationService {

    private final RaceRegistrationRepository registrationRepository;
    private final RaceRepository raceRepository;
    private final CompetitorRepository competitorRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    public RaceRegistration registerParticipant(RegistrationRequest request, String username) {
        // Buscar la carrera y al usuario que registra
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrera no encontrada"));
        User registeredBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Regla de Negocio: Validar la fecha límite
        if (LocalDateTime.now().isAfter(race.getRegistrationDeadline())) {
            throw new BusinessRuleException("Las inscripciones para esta carrera ya están cerradas.");
        }

        Competitor competitor = null;
        Team team = null;

        // Regla de Negocio: Validar el tipo de carrera y los participantes
        if (race.getRaceType() == RaceType.INDIVIDUAL) {
            if (request.getCompetitorId() == null) {
                throw new BusinessRuleException("Para una carrera INDIVIDUAL, debe enviar el ID del competidor.");
            }
            competitor = competitorRepository.findById(request.getCompetitorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Competidor no encontrado"));
        } else if (race.getRaceType() == RaceType.TEAM) {
            if (request.getTeamId() == null) {
                throw new BusinessRuleException("Para una carrera por EQUIPOS, debe enviar el ID del equipo.");
            }
            team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Equipo no encontrado"));
        } else {
            // Es MIXED, debe venir uno de los dos
            if (request.getCompetitorId() != null) {
                competitor = competitorRepository.findById(request.getCompetitorId()).orElse(null);
            } else if (request.getTeamId() != null) {
                team = teamRepository.findById(request.getTeamId()).orElse(null);
            }
            if (competitor == null && team == null) {
                throw new BusinessRuleException("Para una carrera MIXTA, debe enviar un competidor o un equipo válido.");
            }
        }

        // Crear el registro (Todo registro nuevo entra como PENDING según las reglas)
        RaceRegistration registration = RaceRegistration.builder()
                .race(race)
                .competitor(competitor)
                .team(team)
                .status(RegistrationStatus.PENDING)
                .startingPosition(request.getStartingPosition())
                .notes(request.getNotes())
                .registeredBy(registeredBy)
                .build();

        return registrationRepository.save(registration);
    }
}