package com.proyecto.parcial.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proyecto.parcial.dto.RaceRequest;
import com.proyecto.parcial.entity.Race;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.enums.RaceStatus;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.exception.ResourceNotFoundException;
import com.proyecto.parcial.repository.RaceRepository;
import com.proyecto.parcial.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RaceService {

    private final RaceRepository raceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public Race createRace(RaceRequest request, String organizerUsername) {

        // Regla de negocio: La carrera debe estar programada en el futuro
        if (request.getScheduledAt().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessRuleException("La carrera debe estar programada para una fecha futura.");
        }
        // Regla de Negocio: La fecha límite de registro debe ser antes de la carrera
        if (request.getRegistrationDeadline().isAfter(request.getScheduledAt()) || 
            request.getRegistrationDeadline().isEqual(request.getScheduledAt())) {
            throw new BusinessRuleException("La fecha límite de inscripción debe ser estrictamente anterior a la fecha de la carrera.");
        }

        // Buscamos al usuario que hizo la petición para ponerlo como organizador
        User organizer = userRepository.findByUsername(organizerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Organizador no encontrado"));

        Race race = Race.builder()
                .organizer(organizer)
                .nameRace(request.getNameRace())
                .description(request.getDescription())
                .scheduledAt(request.getScheduledAt())
                .startLocation(request.getStartLocation())
                .endLocation(request.getEndLocation())
                .distanceMeters(request.getDistanceMeters())
                .maxParticipants(request.getMaxParticipants())
                .raceType(request.getRaceType())
                .status(RaceStatus.DRAFT) // Las carreras siempre nacen en estado "Borrador"
                .registrationDeadline(request.getRegistrationDeadline())
                .build();

        // Guardamos la carrera primero, luego auditamos la acción, y finalmente retornamos
        Race savedRace = raceRepository.save(race);

        auditService.logAction(
                organizer,
                "CREATE_RACE",
                "RACE",
                savedRace.getIdRace()
        );

        return savedRace;
    }

    public List<Race> getAllRaces() {
        return raceRepository.findAll();
    }

    public Race getRaceById(Long id) {
        return raceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Carrera no encontrada con el ID: " + id));
    }
}