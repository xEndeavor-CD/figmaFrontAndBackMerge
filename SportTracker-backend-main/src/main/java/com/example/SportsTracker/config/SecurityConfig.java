package com.example.SportsTracker.config;

import com.example.SportsTracker.core.model.Role;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security configuration for the SportsTracker backend.
 *
 * Auth model: session-cookie based (Spring Session + MongoDB store).
 * CORS: configured to accept requests from the Vite dev server on :5173.
 *
 * Future considerations:
 *   - Add allowed origins to an application.properties list for env-based config
 *   - Add HTTPS-only cookie flag for production (serializer.setSecure(true))
 *   - Migrate to JWT if moving to a stateless/mobile-first architecture
 *   - Add rate-limiting filter before the session filter
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ── Beans ──────────────────────────────────────────────────────────────────

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Session cookie settings.
     * SameSite=Lax allows cross-origin GETs (e.g. navigating to the site)
     * while blocking dangerous cross-site POST requests.
     *
     * For production, also set: serializer.setSecure(true) and update sameSite to "Strict".
     */
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setUseHttpOnlyCookie(true);
        serializer.setSameSite("Lax");
        // serializer.setSecure(true); // TODO: enable in production (HTTPS required)
        return serializer;
    }

    /**
     * CORS policy.
     * Allows the Vite dev server (localhost:5173) to make credentialed requests.
     *
     * To add more origins (staging, production CDN, etc.) extend the allowedOrigins list.
     * Future: read origins from application.properties → @Value injection.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed frontend origins — extend this list for staging / production URLs
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",   // Vite dev server
                "http://localhost:4173"    // Vite preview server
                // "https://stickleague.gg" // TODO: add production URL
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        // Must be true so the browser sends the session cookie cross-origin
        config.setAllowCredentials(true);

        config.setMaxAge(3600L); // preflight cache duration (seconds)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    // ── Security filter chain ──────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF disabled — session cookie is SameSite=Lax which mitigates CSRF
                // for browser clients.  Re-evaluate if adding mobile/native clients.
                .csrf(AbstractHttpConfigurer::disable)

                // Wire the CORS bean defined above
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Return JSON error responses (not HTML redirect) for API clients
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden"))
                )

                .authorizeHttpRequests(auth -> auth

                        // ── Public endpoints ────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/signup",
                                "/api/auth/signin").permitAll()

                        .requestMatchers(HttpMethod.GET,
                                "/",
                                "/quests",
                                "/esports",
                                "/football",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/static/**",
                                "/favicon.ico",
                                "/api/quests/leaderboard",
                                "/api/football/standings/**",
                                "/api/football/leagues",
                                "/api/football/fixtures",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**").permitAll()

                        // ── Admin-only write endpoints ───────────────────────────
                        // Future: consider a ROLE_ORGANIZER between USER and ADMIN
                        .requestMatchers(HttpMethod.POST,
                                "/api/tournaments",
                                "/api/quests",
                                "/api/football/leagues",
                                "/api/football/leagues/sync/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,
                                "/api/tournaments/*",
                                "/api/quests/*",
                                "/api/quests/submissions/*/review",
                                "/api/football/leagues/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE,
                                "/api/tournaments/*",
                                "/api/quests/*",
                                "/api/football/leagues/*").hasRole("ADMIN")

                        // ── Everything else requires a valid session ─────────────
                        .anyRequest().authenticated()
                )

                // Bridge custom HttpSession context into Spring Security context.
                // This filter reads USER_ID + USER_ROLES from the session and builds
                // a UsernamePasswordAuthenticationToken so @PreAuthorize / hasRole work.
                .addFilterBefore(new OncePerRequestFilter() {
                    @Override
                    @SuppressWarnings("unchecked")
                    protected void doFilterInternal(HttpServletRequest request,
                                                    HttpServletResponse response,
                                                    FilterChain filterChain)
                            throws ServletException, IOException {

                        HttpSession session = request.getSession(false);
                        if (session != null
                                && session.getAttribute("USER_ID") != null
                                && SecurityContextHolder.getContext().getAuthentication() == null) {

                            List<Role> roles = (List<Role>) session.getAttribute("USER_ROLES");
                            List<SimpleGrantedAuthority> authorities = roles != null
                                    ? roles.stream()
                                           .map(role -> new SimpleGrantedAuthority(role.name()))
                                           .collect(Collectors.toList())
                                    : List.of();

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            session.getAttribute("USER_ID"), null, authorities);

                            SecurityContextHolder.getContext().setAuthentication(authToken);
                        }
                        filterChain.doFilter(request, response);
                    }
                }, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}