package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.AuditResponse;
import com.proyecto.parcial.entity.AuditLog;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    // Guarda usando la estructura relacional
    public void logAction(User user, String action, String entityType, Long idEntity) {
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .idEntity(idEntity)
                .build();
        auditLogRepository.save(log);
    }

    // Devuelve los logs mapeados al DTO limpio
    public List<AuditResponse> getAllLogs() {
        return auditLogRepository.findAll().stream()
                .map(log -> AuditResponse.builder()
                        .idAudit(log.getIdAudit())
                        .username(log.getUser().getUsername()) // Extraemos solo el nombre del usuario
                        .action(log.getAction())
                        .entityType(log.getEntityType())
                        .idEntity(log.getIdEntity())
                        .createdAt(log.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}