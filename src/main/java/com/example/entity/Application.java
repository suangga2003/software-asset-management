package com.example.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "applications")
public class Application extends PanacheEntity {
    public String appName;
    public String owner;
    public String status;
    public String servers;

    // 1. Topology
    public String topologyLevel0;       // Reference to main architecture blueprint category
    public String topologyLevel1Web;      // Web tier / UI details
    public String topologyLevel1Backend;  // Backend services / APIs
    public String topologyLevel1Database; // Connected database instances
    public String interconnections;       // Service-to-service or appliance routing links

    // 2. Technology Information
    public boolean sourceCodeAvailable;
    public String programmingLanguage;    // e.g., "Java 25 (Quarkus)", "Node.js 20"
    public String osVersion;              // e.g., "Ubuntu 22.04 LTS / RHEL 9"
    public boolean cicdAvailable;         // e.g., True (GitLab CI)

    // 3. Application History
    public LocalDate firstReleaseDate;
    public String changeHistory;          // Summary of recent major migrations/versions
    public LocalDate sunsetDate;          // Planned retirement date (if applicable)
}