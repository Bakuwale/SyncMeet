package com.example.demo.controller;

import java.util.Map;

import com.example.demo.entity.User;
import com.example.demo.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/req")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(value = "/signup", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        try {
            User user = authService.signup(
                body.get("name"),
                body.get("email"),
                body.get("password")
            );
            return ResponseEntity.ok(Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            User user = authService.login(
                body.get("email"),
                body.get("password")
            );
            return ResponseEntity.ok(Map.of("id", user.getId(), "email", user.getEmail(), "name", user.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping(value = "/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            authService.sendPasswordResetEmail(email);
            // Always return success even if email doesn't exist (security best practice)
            return ResponseEntity.ok(Map.of("message", "If an account with this email exists, a password reset link has been sent"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}