package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.ResultRequest;
import com.proyecto.parcial.entity.Race;
import com.proyecto.parcial.entity.RaceRegistration;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.enums.ResultStatus;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RaceResultServiceTest {

    @Mock private RaceResultRepository resultRepository;
    @Mock private RaceRegistrationRepository registrationRepository;
    @Mock private RaceRepository raceRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private RaceResultService resultService;

    // Test 13: Un participante descalificado no puede ser primero (ganador)
    @Test
    void recordResult_DisqualifiedWinner_ThrowsException() {
        when(raceRepository.findById(1L)).thenReturn(Optional.of(new Race()));
        when(registrationRepository.findById(1L)).thenReturn(Optional.of(new RaceRegistration()));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(new User()));

        ResultRequest request = new ResultRequest(1L, 1, 100.0, 0.0, ResultStatus.DISQUALIFIED, "Trampa");

        BusinessRuleException exception = assertThrows(BusinessRuleException.class, () -> resultService.recordResult(1L, request, "admin"));
        assert(exception.getMessage().contains("no puede obtener el primer lugar"));
    }

    // Test 14: Guardar resultado exitosamente
    @Test
    void recordResult_Valid_Success() {
        when(raceRepository.findById(1L)).thenReturn(Optional.of(new Race()));
        when(registrationRepository.findById(1L)).thenReturn(Optional.of(new RaceRegistration()));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(new User()));

        ResultRequest request = new ResultRequest(1L, 2, 120.5, 0.0, ResultStatus.FINISHED, "OK");

        resultService.recordResult(1L, request, "admin");

        verify(resultRepository).save(any());
    }

    // Test 15: Excepción al intentar guardar resultado en una inscripción inexistente
    @Test
    void recordResult_RegistrationNotFound_ThrowsException() {
        when(raceRepository.findById(1L)).thenReturn(Optional.of(new Race()));
        when(registrationRepository.findById(99L)).thenReturn(Optional.empty()); // No existe

        ResultRequest request = new ResultRequest(99L, 1, 100.0, 0.0, ResultStatus.FINISHED, "OK");

        assertThrows(RuntimeException.class, () -> resultService.recordResult(1L, request, "admin"));
    }
}