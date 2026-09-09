package com.proyecto.parcial.service;

import com.proyecto.parcial.dto.AuthResponse;
import com.proyecto.parcial.dto.LoginRequest;
import com.proyecto.parcial.dto.RegisterRequest;
import com.proyecto.parcial.entity.User;
import com.proyecto.parcial.repository.UserRepository;
import com.proyecto.parcial.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Construir el usuario con la contraseña encriptada
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .build();

        // Guardarlo en la base de datos
        userRepository.save(user);

        // Generar el token JWT
        String jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .message("Usuario registrado exitosamente")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Spring Security valida si las credenciales son correctas (si no, lanza error automático)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Buscamos al usuario en la BD
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        // Generamos el token
        String jwtToken = jwtService.generateToken(user);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .message("Login exitoso")
                .build();
    }
}