package com.proyecto.parcial.dto;

import jakarta.validation.constraints.NotBlank;
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
public class TeamRequest {
    
    @NotBlank(message = "El nombre del equipo no puede estar vacío")
    private String name;
    
    private String description;
    
    private String coachName;
    
    @NotNull(message = "El máximo de miembros es obligatorio")
    @Positive(message = "El número máximo de miembros debe ser mayor a cero")
    private Integer maxMembers;
}