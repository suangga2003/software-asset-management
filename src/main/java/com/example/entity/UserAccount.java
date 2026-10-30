package com.example.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_accounts")
public class UserAccount extends PanacheEntity {

    @Column(nullable = false, unique = true)
    public String username;

    @Column(nullable = false)
    public String password; // In a production app, use BCrypt hashes

    @Column(nullable = false)
    public String role; // e.g., 'IT-Architect', 'Viewer'

    public String fullName;

    public static UserAccount findByUsername(String username) {
        return find("username", username).firstResult();
    }
}