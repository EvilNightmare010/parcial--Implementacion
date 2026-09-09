package com.proyecto.parcial.entity;

import com.proyecto.parcial.enums.CompetitorStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "team")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTeam;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompetitorStatus status; // Reusamos el estado ya que un equipo activo/suspendido aplica igual

    @Column(name = "coach_name")
    private String coachName;

    @Column(name = "max_members", nullable = false)
    private Integer maxMembers;

    @Builder.Default
    private Integer wins = 0;

    @Builder.Default
    private Integer losses = 0;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDate.now();
    }
}