package com.example.resource;

import com.example.dto.DashboardMetricsDto;
import com.example.entity.Application;
import com.example.entity.MigrationHistory;
import jakarta.annotation.security.PermitAll;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/dashboard")
@Produces(MediaType.APPLICATION_JSON)
@ApplicationScoped
public class DashboardResource {

    @GET
    @PermitAll
    public DashboardMetricsDto getDashboardSummary() {
        DashboardMetricsDto dto = new DashboardMetricsDto();

        // Total application count metric[cite: 1]
        dto.appCount = Application.count();

        // History of last migrations ordered by date descending (limited to top 10 recent)[cite: 1]
        dto.lastMigrations = MigrationHistory.find("ORDER BY migrationDate DESC").range(0, 9).list();

        return dto;
    }
}