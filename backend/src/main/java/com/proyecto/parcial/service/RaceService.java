package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.RaceRequest;
import com.proyecto.parcial.entity.Race;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.enums.RaceStatus;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.exception.ResourceNotFoundException;
import com.proyecto.parcial.repository.RaceRepository;
import com.proyecto.parcial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RaceService {

    private final RaceRepository raceRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public Race createRace(RaceRequest request, String organizerUsername) {
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
}