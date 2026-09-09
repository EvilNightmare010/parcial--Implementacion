package com.proyecto.parcial.entity;

import com.proyecto.parcial.enums.ResultStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "race_result")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaceResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_race", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_registration", nullable = false)
    private RaceRegistration registration;

    @Column(name = "starting_position")
    private Integer startingPosition;

    @Column(name = "final_position")
    private Integer finalPosition;

    @Column(name = "completion_time_seconds")
    private Double completionTimeSeconds;

    @Column(name = "penalty_time_seconds")
    @Builder.Default
    private Double penaltyTimeSeconds = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResultStatus status;

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
    }
}