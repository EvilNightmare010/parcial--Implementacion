package com.proyecto.parcial.config;

import com.proyecto.parcial.entity.Competitor;
import com.proyecto.parcial.entity.Team;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.enums.CompetitorStatus;
import com.proyecto.parcial.enums.CompetitorType;
import com.proyecto.parcial.enums.Role;
import com.proyecto.parcial.repository.CompetitorRepository;
import com.proyecto.parcial.repository.TeamRepository;
import com.proyecto.parcial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompetitorRepository competitorRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Solo inyectamos datos si la base de datos está vacía
        if (userRepository.count() == 0) {
            
            // 1. Usuarios obligatorios
            User admin = User.builder()
                    .username("admin")
                    .email("admin@eia.edu.co")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMINISTRATOR)
                    .enabled(true)
                    .build();
                    
            User organizer = User.builder()
                    .username("organizer")
                    .email("organizer@eia.edu.co")
                    .passwordHash(passwordEncoder.encode("org123"))
                    .role(Role.ORGANIZER)
                    .enabled(true)
                    .build();
                    
            User viewer = User.builder()
                    .username("viewer")
                    .email("viewer@eia.edu.co")
                    .passwordHash(passwordEncoder.encode("view123"))
                    .role(Role.VIEWER)
                    .enabled(true)
                    .build();
            userRepository.saveAll(List.of(admin, organizer, viewer));

            // 2. Competidores: 5 Enanos, 2 Camellos, 2 Mediums
            Competitor d1 = buildCompetitor("Null Pointer", "null", CompetitorType.DWARF, 45.0, 1.10);
            Competitor d2 = buildCompetitor("Stack Overflow", "stack", CompetitorType.DWARF, 48.0, 1.15);
            Competitor d3 = buildCompetitor("Little Lambda", "lambda", CompetitorType.DWARF, 42.0, 1.05);
            Competitor d4 = buildCompetitor("Captain Cache", "cache", CompetitorType.DWARF, 50.0, 1.20);
            Competitor d5 = buildCompetitor("Tiny Docker", "docker", CompetitorType.DWARF, 46.0, 1.12);
            
            Competitor c1 = buildCompetitor("Byte", "byte_camel", CompetitorType.CAMEL, 450.0, 2.10);
            Competitor c2 = buildCompetitor("Pixel", "pixel_camel", CompetitorType.CAMEL, 480.0, 2.15);
            
            Competitor m1 = buildCompetitor("Centaur API", "centaur", CompetitorType.MEDIUM, 120.0, 1.60);
            Competitor m2 = buildCompetitor("Minotaur DB", "minotaur", CompetitorType.MEDIUM, 130.0, 1.65);
            
            competitorRepository.saveAll(List.of(d1, d2, d3, d4, d5, c1, c2, m1, m2));

            // 3. Equipos
            Team t1 = Team.builder().name("The Five Exceptions").coachName("Mr. Abandonado").maxMembers(5).status(CompetitorStatus.ACTIVE).build();
            Team t2 = Team.builder().name("Desert Storm").coachName("Al-Khuwarizmi").maxMembers(3).status(CompetitorStatus.ACTIVE).build();
            teamRepository.saveAll(List.of(t1, t2));

            System.out.println("✅ DATA SEEDING: Usuarios, Competidores y Equipos iniciales creados con éxito.");
        }
    }

    private Competitor buildCompetitor(String name, String nickname, CompetitorType type, double weight, double height) {
        return Competitor.builder()
                .name(name)
                .nickname(nickname)
                .type(type)
                .status(CompetitorStatus.ACTIVE)
                .weight(weight)
                .height(height)
                .build();
    }
}