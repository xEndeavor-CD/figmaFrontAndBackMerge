package com.example.SportsTracker.core.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Core user entity stored in MongoDB.
 *
 * Fields intentionally left extensible:
 *   - avatarUrl   : future profile/avatar support
 *   - displayName : future in-game display-name override
 *   - teamId      : future player ↔ team linking
 *   - xp / level  : future gamification layer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    // ── Identity ──────────────────────────────────────────────────────────────
    private String username;   // unique handle (e.g. "stick_captain")
    private String firstName;  // given name from registration form
    private String lastName;   // family name from registration form
    private String email;
    private String password;   // BCrypt-encoded

    // ── Access control ────────────────────────────────────────────────────────
    private List<Role> roles;
    private boolean enabled;

    // ── Future extensibility slots (leave null until implemented) ─────────────
    // private String avatarUrl;
    // private String displayName;
    // private String teamId;
    // private int xp;
    // private int level;

    // ── Audit ─────────────────────────────────────────────────────────────────
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}