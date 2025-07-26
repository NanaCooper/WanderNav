package com.wandernav.wander_backend.controllers;

import com.wandernav.wander_backend.models.Location;
import com.wandernav.wander_backend.repositories.LocationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@Tag(name = "Locations", description = "Manage geographic locations")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @Operation(summary = "Get all locations")
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    @Operation(summary = "Get location by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable String id) {
        return locationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new location")
    @PostMapping
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        return ResponseEntity.ok(locationRepository.save(location));
    }

    @Operation(summary = "Update a location")
    @PutMapping("/{id}")
    public ResponseEntity<Location> updateLocation(@PathVariable String id, @RequestBody Location updatedLocation) {
        return locationRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedLocation.getName());
                    existing.setLatitude(updatedLocation.getLatitude());
                    existing.setLongitude(updatedLocation.getLongitude());
                    existing.setDescription(updatedLocation.getDescription());
                    return ResponseEntity.ok(locationRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a location")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocation(@PathVariable String id) {
        if (locationRepository.existsById(id)) {
            locationRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
