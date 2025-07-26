package com.wandernav.wander_backend.controllers;

import com.wandernav.wander_backend.models.Route;
import com.wandernav.wander_backend.models.User;
import com.wandernav.wander_backend.repositories.RouteRepository;
import com.wandernav.wander_backend.repositories.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/routes")
@Tag(name = "Routes", description = "Manage routes composed of location IDs")
public class RouteController {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private UserRepository userRepository;

    @Operation(summary = "Get all routes (admin or debug only)")
    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeRepository.findAll());
    }

    @Operation(summary = "Get route by ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getRouteById(@PathVariable String id) {
        return routeRepository.findById(id)
            .<ResponseEntity<?>>map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Route not found"));
    }

    @Operation(summary = "Create a new route")
    @PostMapping
    public ResponseEntity<?> createRoute(@RequestBody Route route) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        User user = userOpt.get();
        route.setUserId(String.valueOf(user.getId())); // convert Long to String
        Route savedRoute = routeRepository.save(route);
        return ResponseEntity.ok(savedRoute);
    }

    @Operation(summary = "Update an existing route")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoute(@PathVariable String id, @RequestBody Route updatedRoute) {
        Optional<Route> routeOpt = routeRepository.findById(id);
        if (routeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Route not found");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        Route route = routeOpt.get();
        User user = userOpt.get();

        if (!route.getUserId().equals(String.valueOf(user.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can't edit another user's route.");
        }

        route.setName(updatedRoute.getName());
        route.setLocationIds(updatedRoute.getLocationIds());
        Route updated = routeRepository.save(route);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Delete a route")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoute(@PathVariable String id) {
        Optional<Route> routeOpt = routeRepository.findById(id);
        if (routeOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Route not found");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        Route route = routeOpt.get();
        User user = userOpt.get();

        if (!route.getUserId().equals(String.valueOf(user.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied. This route doesn't belong to you.");
        }

        routeRepository.delete(route);
        return ResponseEntity.ok("Route deleted successfully.");
    }

    @Operation(summary = "Get all routes owned by the current user")
    @GetMapping("/user/me")
    public ResponseEntity<?> getCurrentUserRoutes() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        }

        User user = userOpt.get();
        List<Route> routes = routeRepository.findByUserId(String.valueOf(user.getId()));
        return ResponseEntity.ok(routes);
    }
}
