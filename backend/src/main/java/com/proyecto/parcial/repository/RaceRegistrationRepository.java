package com.proyecto.parcial.repository;

import com.proyecto.parcial.entity.RaceRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RaceRegistrationRepository extends JpaRepository<RaceRegistration, Long> {
}