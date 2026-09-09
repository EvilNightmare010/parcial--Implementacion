package com.proyecto.parcial.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditResponse {
    private Long idAudit;
    private String username;
    private String action;
    private String entityType;
    private Long idEntity;
    private LocalDateTime createdAt;
}