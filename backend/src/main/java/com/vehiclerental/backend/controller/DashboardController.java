package com.vehiclerental.backend.controller;

import com.vehiclerental.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.cache.annotation.CacheEvict;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @DeleteMapping("/cache")
    @PreAuthorize("hasRole('ADMIN')")
    @CacheEvict(value = "cars", allEntries = true)
    public ResponseEntity<Map<String, String>> purgeCache() {
        return ResponseEntity.ok(Map.of("message", "Global car cache purged successfully"));
    }
}
