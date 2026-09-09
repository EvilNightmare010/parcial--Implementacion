package com.proyecto.parcial.dto;

import com.proyecto.parcial.enums.ResultStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResultRequest {

    @NotNull(message = "El ID del registro es obligatorio")
    private Long registrationId;

    @NotNull(message = "La posición final es obligatoria")
    @Positive(message = "La posición final debe ser mayor a cero")
    private Integer finalPosition;

    @NotNull(message = "El tiempo de finalización es obligatorio")
    @Positive(message = "El tiempo debe ser mayor a cero")
    private Double completionTimeSeconds;

    private Double penaltyTimeSeconds;

    @NotNull(message = "El estado del resultado es obligatorio")
    private ResultStatus status;

    private String notes;
}