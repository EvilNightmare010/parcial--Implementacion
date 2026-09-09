package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.CompetitorRequest;
import com.proyecto.parcial.entity.Competitor;
import com.proyecto.parcial.enums.CompetitorType;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.exception.ResourceNotFoundException;
import com.proyecto.parcial.repository.CompetitorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompetitorServiceTest {

    @Mock
    private CompetitorRepository competitorRepository;

    @InjectMocks
    private CompetitorService competitorService;

    // Test 1: Crear un competidor válido
    @Test
    void createCompetitor_ValidRequest_ReturnsCompetitor() {
        CompetitorRequest request = new CompetitorRequest("Little Lambda", "El Funcional", CompetitorType.DWARF, null, 65.0, 1.35, "Colombia");
        when(competitorRepository.findByNickname("El Funcional")).thenReturn(Optional.empty());
        when(competitorRepository.save(any(Competitor.class))).thenAnswer(i -> i.getArguments()[0]);

        Competitor result = competitorService.createCompetitor(request);

        assertNotNull(result);
        assertEquals("Little Lambda", result.getName());
        verify(competitorRepository).save(any(Competitor.class));
    }

    // Test 2: Rechazar apodo duplicado
    @Test
    void createCompetitor_DuplicateNickname_ThrowsException() {
        CompetitorRequest request = new CompetitorRequest("Byte", "El Camello", CompetitorType.CAMEL, null, 400.0, 2.0, "Egipto");
        when(competitorRepository.findByNickname("El Camello")).thenReturn(Optional.of(new Competitor()));

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> {
            competitorService.createCompetitor(request);
        });

        assertTrue(exception.getMessage().contains("ya está en uso"));
    }

    // Test 3: Retornar error 404 (Not Found) para recurso inexistente
    @Test
    void getCompetitorById_NotFound_ThrowsException() {
        when(competitorRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            competitorService.getCompetitorById(99L);
        });

        assertTrue(exception.getMessage().contains("No se encontró"));
    }
}