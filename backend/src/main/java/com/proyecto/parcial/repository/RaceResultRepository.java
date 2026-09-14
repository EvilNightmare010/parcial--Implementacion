package com.proyecto.parcial.repository;

import com.proyecto.parcial.entity.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {
    
    // Usamos @Query para apuntar explícitamente a idRace y evitar que Spring Boot crashee
    @Query("SELECT r FROM RaceResult r WHERE r.race.idRace = :raceId")
    List<RaceResult> findByRaceId(@Param("raceId") Long raceId);
}