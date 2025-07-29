package com.example.demo.service;

import java.util.Optional;
import java.util.UUID;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User signup(String name, String email, String rawPassword) throws Exception {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new Exception("Email already in use");
        }
        String hashedPassword = passwordEncoder.encode(rawPassword);
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        return userRepository.save(user);
    }

    public User login(String email, String rawPassword) throws Exception {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            throw new Exception("Invalid credentials");
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new Exception("Invalid credentials");
        }
        return user;
    }
    
    public void sendPasswordResetEmail(String email) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Don't reveal that the email doesn't exist (security best practice)
            return;
        }
        
        // Generate a reset token
        String resetToken = UUID.randomUUID().toString();
        
        // In a real application, you would:
        // 1. Store the token in the database with an expiration time
        // 2. Send an email with a link containing the token
        
        // For this example, we'll just log that we would send an email
        System.out.println("Would send password reset email to: " + email);
        System.out.println("Reset token: " + resetToken);
    }
}