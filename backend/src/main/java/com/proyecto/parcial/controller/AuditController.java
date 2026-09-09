package com.proyecto.parcial.controller;

import com.proyecto.parcial.dto.AuditResponse;
import com.proyecto.parcial.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditResponse>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getAllLogs());
    }
}