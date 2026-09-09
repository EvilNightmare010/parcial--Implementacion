package com.proyecto.parcial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationRequest {
    private Long raceId;
    private Long competitorId; // Nulo si se inscribe un equipo
    private Long teamId;       // Nulo si se inscribe un individuo
    private Integer startingPosition;
    private String notes;
}