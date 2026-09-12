package com.proyecto.parcial.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proyecto.parcial.dto.CompetitorRequest;
import com.proyecto.parcial.entity.Competitor;
import com.proyecto.parcial.enums.CompetitorStatus;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.exception.ResourceNotFoundException;
import com.proyecto.parcial.repository.CompetitorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CompetitorService {

    private final CompetitorRepository competitorRepository;

    public Competitor createCompetitor(CompetitorRequest request) {
    // Regla de negocio: El apodo debe ser único
    if (competitorRepository.findByNickname(request.getNickname()).isPresent()) {
        throw new BusinessRuleException("El apodo '" + 
            request.getNickname() + "' ya está en uso. ¡Elige otro!");
    }

    // Regla de negocio: peso y altura deben ser positivos
    if (request.getWeight() == null || request.getWeight() <= 0) {
        throw new BusinessRuleException("El peso debe ser mayor a cero.");
    }

    if (request.getHeight() == null || request.getHeight() <= 0) {
        throw new BusinessRuleException("La altura debe ser mayor a cero.");
    }

    Competitor competitor = Competitor.builder()
            .name(request.getName())
            .nickname(request.getNickname())
            .type(request.getType())
            .birthDate(request.getBirthDate())
            .weight(request.getWeight())
            .height(request.getHeight())
            .originCountry(request.getOriginCountry())
            .status(CompetitorStatus.ACTIVE)
            .build();

    return competitorRepository.save(competitor);
    }
    
    public List<Competitor> getAllCompetitors() {
        return competitorRepository.findAll();
    }

    public Competitor getCompetitorById(Long id) {
        return competitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró ningún competidor con el ID: " + id));
    }
}