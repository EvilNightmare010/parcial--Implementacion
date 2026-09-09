package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.RaceRequest;
import com.proyecto.parcial.entity.Race;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.enums.RaceType;
import com.proyecto.parcial.exception.BusinessRuleException;
import com.proyecto.parcial.repository.RaceRepository;
import com.proyecto.parcial.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RaceServiceTest {

    @Mock private RaceRepository raceRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private RaceService raceService;

    // Test 8: Crear una carrera válida
    @Test
    void createRace_ValidRequest_Success() {
        RaceRequest req = new RaceRequest("Carrera", "Desc", LocalDateTime.now().plusDays(2), "A", "B", 100, 10, RaceType.MIXED, LocalDateTime.now().plusDays(1));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(new User()));
        when(raceRepository.save(any())).thenReturn(new Race());

        assertNotNull(raceService.createRace(req, "admin"));
    }

    // Test 9: Rechazar si la inscripción cierra después de la carrera
    @Test
    void createRace_DeadlineAfterScheduled_ThrowsException() {
        // La fecha límite es después de la carrera
        RaceRequest req = new RaceRequest("Carrera", "Desc", LocalDateTime.now().plusDays(1), "A", "B", 100, 10, RaceType.MIXED, LocalDateTime.now().plusDays(3));
        
        assertThrows(BusinessRuleException.class, () -> raceService.createRace(req, "admin"));
    }
}