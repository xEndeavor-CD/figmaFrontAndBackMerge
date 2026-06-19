package com.example.SportsTracker.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request body for POST /api/auth/signup.
 *
 * Frontend form fields → backend mapping:
 *   firstName + lastName → stored individually; username auto-derived as
 *   "firstName lastName" if not provided separately.
 *
 * Future fields to consider adding:
 *   - dateOfBirth  : age-gate / profile
 *   - country      : region-based matchmaking
 *   - inviteCode   : referral / closed-beta gate
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    /**
     * Optional explicit username handle.
     * If omitted the service will auto-generate one from firstName + lastName.
     */
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}