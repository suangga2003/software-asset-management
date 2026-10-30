package com.example.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "architecturecomponent")
public class ArchitectureComponent extends PanacheEntity {
    public String componentName;
    public String componentType;
    public String networkAccess;
    public String description;
    public boolean active;
}