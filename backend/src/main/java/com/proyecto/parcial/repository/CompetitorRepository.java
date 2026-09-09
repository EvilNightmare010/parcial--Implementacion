package com.proyecto.parcial.repository;

import com.proyecto.parcial.entity.Competitor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompetitorRepository extends JpaRepository<Competitor, Long> {
    Optional<Competitor> findByNickname(String nickname);
}