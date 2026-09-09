package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.ResultRequest;
import com.proyecto.parcial.entity.*;
import com.proyecto.parcial.enums.ResultStatus;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.exception.ResourceNotFoundException;
import com.proyecto.parcial.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RaceResultService {

    private final RaceResultRepository resultRepository;
    private final RaceRegistrationRepository registrationRepository;
    private final RaceRepository raceRepository;
    private final CompetitorRepository competitorRepository;
    private final UserRepository userRepository;

    public RaceResult recordResult(Long raceId, ResultRequest request, String username) {
        
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new ResourceNotFoundException("Carrera no encontrada"));
                
        RaceRegistration registration = registrationRepository.findById(request.getRegistrationId())
                .orElseThrow(() -> new ResourceNotFoundException("Inscripción no encontrada"));
                
        User recordedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Regla: Un descalificado no puede ganar (No puede ser posición 1)
        if (request.getStatus() == ResultStatus.DISQUALIFIED && request.getFinalPosition() == 1) {
            throw new BusinessRuleException("Un participante descalificado no puede obtener el primer lugar.");
        }

        // Crear el resultado
        RaceResult result = RaceResult.builder()
                .race(race)
                .registration(registration)
                .startingPosition(registration.getStartingPosition())
                .finalPosition(request.getFinalPosition())
                .completionTimeSeconds(request.getCompletionTimeSeconds())
                .penaltyTimeSeconds(request.getPenaltyTimeSeconds() != null ? request.getPenaltyTimeSeconds() : 0.0)
                .status(request.getStatus())
                .notes(request.getNotes())
                .recordedBy(recordedBy)
                .build();

        // Actualizar estadísticas del competidor si fue individual
        if (registration.getCompetitor() != null) {
            Competitor competitor = registration.getCompetitor();
            competitor.setRacesCompleted(competitor.getRacesCompleted() + 1);
            
            if (request.getFinalPosition() == 1 && request.getStatus() == ResultStatus.FINISHED) {
                competitor.setWins(competitor.getWins() + 1);
            } else {
                competitor.setLosses(competitor.getLosses() + 1);
            }
            competitorRepository.save(competitor);
        }

        return resultRepository.save(result);
    }
}