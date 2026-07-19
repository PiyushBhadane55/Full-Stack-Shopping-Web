package com.portal.userservice.service;

import com.portal.userservice.dto.CredentialVerificationRequest;
import com.portal.userservice.dto.UserDTO;
import com.portal.userservice.dto.UserRegisterRequest;
import com.portal.userservice.model.User;
import com.portal.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDTO registerUser(UserRegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        String role = (request.getRole() == null || request.getRole().trim().isEmpty()) ? "USER" : request.getRole().toUpperCase();
        if (!role.equals("USER") && !role.equals("ADMIN")) {
            role = "USER";
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .role(role)
                .build();

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public Optional<UserDTO> verifyCredentials(CredentialVerificationRequest request) {
        return userRepository.findByUsername(request.getUsername())
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .map(this::mapToDTO);
    }

    public Optional<UserDTO> getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::mapToDTO);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUserRole(Long id, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        String upperRole = role.trim().toUpperCase();
        if (!upperRole.equals("USER") && !upperRole.equals("ADMIN")) {
            throw new IllegalArgumentException("Invalid role: must be USER or ADMIN");
        }
        
        user.setRole(upperRole);
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
