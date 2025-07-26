package com.wandernav.wander_backend.controllers;

import com.wandernav.wander_backend.models.Location;
import com.wandernav.wander_backend.repositories.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Tag(name = "Search", description = "Search functionality for places, users, and hazards")
public class SearchController {

    @Autowired
    private LocationRepository locationRepository;

    @Operation(summary = "Search for places, users, or hazards")
    @PostMapping("/search")
    public ResponseEntity<?> search(@RequestBody SearchRequest request) {
        try {
            List<SearchResult> results = new ArrayList<>();
            
            switch (request.getType()) {
                case "places":
                    // Search through real locations in database
                    List<Location> locations = locationRepository.findAll();
                    String query = request.getQuery().toLowerCase();
                    
                    // Filter locations based on query
                    List<Location> matchingLocations = locations.stream()
                        .filter(location -> 
                            location.getName().toLowerCase().contains(query) ||
                            (location.getDescription() != null && location.getDescription().toLowerCase().contains(query))
                        )
                        .collect(Collectors.toList());
                    
                    // Convert to SearchResult format
                    for (Location location : matchingLocations) {
                        results.add(new SearchResult(
                            location.getId(),
                            location.getName(),
                            location.getDescription(),
                            location.getLatitude(),
                            location.getLongitude()
                        ));
                    }
                    break;
                    
                case "users":
                    // Mock user search for now
                    results.add(new SearchResult("1", "john_doe", "User", null, null));
                    results.add(new SearchResult("2", "jane_smith", "User", null, null));
                    break;
                    
                case "hazards":
                    // Mock hazard search for now
                    results.add(new SearchResult("1", "Construction Zone", "Road construction ahead", 40.7829, -73.9654));
                    results.add(new SearchResult("2", "Traffic Jam", "Heavy traffic on route", 40.7580, -73.9855));
                    break;
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Search failed: " + e.getMessage());
        }
    }

    // Request/Response classes
    public static class SearchRequest {
        private String query;
        private String type;
        private Double latitude;
        private Double longitude;

        // Getters and setters
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class SearchResult {
        private String id;
        private String name;
        private String description;
        private Double latitude;
        private Double longitude;

        public SearchResult(String id, String name, String description, Double latitude, Double longitude) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }
} 