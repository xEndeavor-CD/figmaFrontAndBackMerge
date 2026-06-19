package com.example.SportsTracker.core.service;

import com.example.SportsTracker.core.dto.AuthResponse;
import com.example.SportsTracker.core.dto.SigninRequest;
import com.example.SportsTracker.core.dto.SignupRequest;
import com.example.SportsTracker.core.model.Role;
import com.example.SportsTracker.core.model.User;
import com.example.SportsTracker.core.repository.UserRepository;
import com.example.SportsTracker.exception.DuplicateResourcesException;
import com.example.SportsTracker.exception.UnauthorizedException;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Core authentication service.
 *
 * Session attributes written on sign-in:
 *   USER_ID    – MongoDB ObjectId string of the authenticated user
 *   USER_ROLES – List<Role> used by SecurityConfig to build Spring Security context
 *
 * Future considerations:
 *   - Add email-verification flow (send token, verify endpoint)
 *   - Add password-reset flow
 *   - Add OAuth2 / social sign-in bridge
 *   - Add rate-limiting / brute-force protection
 *   - Add refresh-token support if migrating from session to JWT
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Signup ────────────────────────────────────────────────────────────────

    public AuthResponse signup(SignupRequest request) {

        // Duplicate checks
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourcesException("Email is already in use");
        }

        // Derive username: use explicit value if provided, otherwise build from
        // firstName + lastName (e.g. "John Doe").  Uniqueness checked below.
        String resolvedUsername = (request.getUsername() != null && !request.getUsername().isBlank())
                ? request.getUsername().trim()
                : (request.getFirstName().trim() + " " + request.getLastName().trim());

        if (userRepository.existsByUsername(resolvedUsername)) {
            throw new DuplicateResourcesException("Username is already in use");
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .username(resolvedUsername)
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(List.of(Role.ROLE_USER))
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);

        return mapToAuthResponse(savedUser);
    }

    // ── Signin ────────────────────────────────────────────────────────────────

    public AuthResponse signin(SigninRequest request, HttpSession session) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Write session attributes consumed by SecurityConfig filter
        session.setAttribute("USER_ID", user.getId());
        session.setAttribute("USER_ROLES", user.getRoles());

        // Future: session.setAttribute("USER_TEAM_ID", user.getTeamId());

        return mapToAuthResponse(user);
    }

    // ── Signout ───────────────────────────────────────────────────────────────

    public void signout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private AuthResponse mapToAuthResponse(User user) {
        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roles(user.getRoles())
                // Future: .avatarUrl(user.getAvatarUrl())
                // Future: .teamId(user.getTeamId())
                .build();
    }
}