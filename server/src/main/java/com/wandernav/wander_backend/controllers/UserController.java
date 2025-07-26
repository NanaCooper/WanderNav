package com.wandernav.wander_backend.controllers;

import com.wandernav.wander_backend.models.User;
import com.wandernav.wander_backend.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User operations")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Operation(summary = "Get all users")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    @Operation(summary = "Get current authenticated user")
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(user);
    }

    @Operation(summary = "Create a new user")
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(user));
    }

    @Operation(summary = "Update user details by ID")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User updatedUser) {
        return userRepository.findById(id)
            .<ResponseEntity<?>>map(existingUser -> {
                existingUser.setUsername(updatedUser.getUsername());
                existingUser.setEmail(updatedUser.getEmail());
                return ResponseEntity.ok(userRepository.save(existingUser));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found"));
    }

    @Operation(summary = "Delete user by ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }
}
