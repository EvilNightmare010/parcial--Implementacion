package com.proyecto.parcial.dto;

import com.proyecto.parcial.enums.RaceType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RaceRequest {

    @NotBlank(message = "El nombre de la carrera no puede estar vacío")
    private String nameRace;

    private String description;

    @NotNull(message = "La fecha programada es obligatoria")
    @Future(message = "La carrera no puede programarse en el pasado")
    private LocalDateTime scheduledAt;

    @NotBlank(message = "La ubicación de inicio es obligatoria")
    private String startLocation;

    @NotBlank(message = "La ubicación final es obligatoria")
    private String endLocation;

    @NotNull(message = "La distancia es obligatoria")
    @Positive(message = "La distancia debe ser mayor a cero")
    private Integer distanceMeters;

    @NotNull(message = "El número máximo de participantes es obligatorio")
    @Positive(message = "La capacidad debe ser mayor a cero")
    private Integer maxParticipants;

    @NotNull(message = "El tipo de carrera es obligatorio")
    private RaceType raceType;

    @NotNull(message = "La fecha límite de registro es obligatoria")
    @Future(message = "La fecha límite no puede estar en el pasado")
    private LocalDateTime registrationDeadline;
}