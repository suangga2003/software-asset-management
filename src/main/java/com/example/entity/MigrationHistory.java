package com.example.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.time.LocalDate;

@Entity
public class MigrationHistory extends PanacheEntity {

    @Column(nullable = false)
    public String appName;

    @Column(nullable = false)
    public LocalDate migrationDate;

    public String targetVersion;

    public String status; // e.g., SUCCESS, FAILED
}