package com.example.SportsTracker.core.dto;

import com.example.SportsTracker.core.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Auth response returned from signup, signin, and GET /api/auth/me.
 *
 * Future fields to consider:
 *   - avatarUrl    : profile picture URL
 *   - displayName  : in-game nickname override
 *   - teamId       : linked team ID once teams feature is active
 *   - xp / level   : gamification stats for the leaderboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    // ── Core identity ──────────────────────────────────────────────────────────
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private List<Role> roles;

    // ── Future extensibility slots ─────────────────────────────────────────────
    // private String avatarUrl;
    // private String displayName;
    // private String teamId;
    // private int xp;
    // private int level;
}