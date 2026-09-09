package com.proyecto.parcial.repository;

import com.proyecto.parcial.entity.Team;
import com.proyecto.parcial.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    // Spring Data JPA creará automáticamente la consulta SQL para contar miembros
    long countByTeam(Team team); 
}