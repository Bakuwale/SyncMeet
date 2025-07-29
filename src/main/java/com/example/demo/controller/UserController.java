package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/req/user")
public class UserController {

    private final UserRepository userRepository;
    private final Path fileStorageLocation;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
        // Create a directory to store uploaded profile photos
        this.fileStorageLocation = Paths.get("uploads/profile-photos").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping(value = "/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> uploadProfilePhoto(
            @RequestParam("profilePhoto") MultipartFile file,
            @RequestParam("email") String email) {
        
        try {
            // Find the user by email
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            
            // Generate a unique file name
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            // Copy the file to the target location
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Create a URL for the file
            String fileUrl = "/uploads/profile-photos/" + fileName;
            
            // Update the user's profile photo URL in the database
            User user = userOpt.get();
            user.setProfilePhotoUrl(fileUrl);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("photoUrl", fileUrl));
            
        } catch (IOException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not store file. Please try again."));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@RequestParam("email") String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        User user = userOpt.get();
        // Create a map with user data including profile photo URL
        Map<String, Object> userData = new java.util.HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        
        // Add profilePhotoUrl if available
        if (user.getProfilePhotoUrl() != null) {
            userData.put("profilePhotoUrl", user.getProfilePhotoUrl());
        }
        
        return ResponseEntity.ok(userData);
    }
}