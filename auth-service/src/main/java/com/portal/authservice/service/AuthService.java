package com.portal.authservice.service;

import com.portal.authservice.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final RestTemplate restTemplate;
    private final JwtService jwtService;

    @Value("${user-service.url}")
    private String userServiceUrl;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public LoginResponse authenticate(LoginRequest loginRequest) {
        String verifyUrl = userServiceUrl + "/verify";
        CredentialVerificationRequest request = new CredentialVerificationRequest(
                loginRequest.getUsername(),
                loginRequest.getPassword()
        );

        try {
            ResponseEntity<UserDTO> response = restTemplate.postForEntity(verifyUrl, request, UserDTO.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                UserDTO user = response.getBody();
                String token = jwtService.generateToken(user.getUsername(), user.getId(), user.getRole());
                long expiresAt = System.currentTimeMillis() + jwtExpiration;

                return LoginResponse.builder()
                        .token(token)
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .userId(user.getId())
                        .expiresAt(expiresAt)
                        .build();
            }
        } catch (HttpClientErrorException.Unauthorized e) {
            throw new IllegalArgumentException("Invalid username or password");
        } catch (Exception e) {
            throw new RuntimeException("User Service is currently unavailable or returned an error: " + e.getMessage());
        }
        throw new IllegalArgumentException("Invalid username or password");
    }

    public TokenValidationResponse validateToken(String token) {
        boolean isValid = jwtService.validateToken(token);
        if (isValid) {
            try {
                String username = jwtService.extractUsername(token);
                Long userId = jwtService.extractUserId(token);
                String role = jwtService.extractRole(token);
                return TokenValidationResponse.builder()
                        .valid(true)
                        .username(username)
                        .userId(userId)
                        .role(role)
                        .build();
            } catch (Exception e) {
                return TokenValidationResponse.builder().valid(false).build();
            }
        }
        return TokenValidationResponse.builder().valid(false).build();
    }
}
