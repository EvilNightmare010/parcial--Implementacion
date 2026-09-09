package com.proyecto.parcial.dto;

import com.proyecto.parcial.enums.CompetitorType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompetitorRequest {
    
    @NotBlank(message = "El nombre no puede estar vacío")
    private String name;

    @NotBlank(message = "El apodo no puede estar vacío")
    private String nickname;

    @NotNull(message = "El tipo de competidor es obligatorio")
    private CompetitorType type;

    private LocalDate birthDate;

    @NotNull(message = "El peso es obligatorio")
    @Positive(message = "El peso debe ser mayor a cero")
    private Double weight;

    @NotNull(message = "La altura es obligatoria")
    @Positive(message = "La altura debe ser mayor a cero")
    private Double height;

    private String originCountry;
}