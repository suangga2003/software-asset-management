package com.example.dto;

import com.example.entity.MigrationHistory;
import java.util.List;

public class DashboardMetricsDto {
    public long appCount;
    public List<MigrationHistory> lastMigrations;
}