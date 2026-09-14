package com.proyecto.parcial.repository;

import com.proyecto.parcial.entity.RaceRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RaceRegistrationRepository extends JpaRepository<RaceRegistration, Long> {
    
    // Usamos @Query para apuntar explícitamente a idRace y evitar que Spring Boot crashee
    @Query("SELECT r FROM RaceRegistration r WHERE r.race.idRace = :raceId")
    List<RaceRegistration> findByRaceId(@Param("raceId") Long raceId);
}