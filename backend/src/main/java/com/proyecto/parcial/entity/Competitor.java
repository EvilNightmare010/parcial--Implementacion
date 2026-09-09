package com.proyecto.parcial.entity;

import com.proyecto.parcial.enums.CompetitorStatus;
import com.proyecto.parcial.enums.CompetitorType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "competitor")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCompetitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_team")
    private Team team; // Puede ser nulo si compite individualmente

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompetitorType type;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private Double height;

    @Column(name = "origin_country")
    private String originCountry;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompetitorStatus status;

    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @Builder.Default
    private Integer wins = 0;

    @Builder.Default
    private Integer losses = 0;

    @Column(name = "races_completed")
    @Builder.Default
    private Integer racesCompleted = 0;

    @PrePersist
    protected void onCreate() {
        this.registeredAt = LocalDateTime.now();
    }
}