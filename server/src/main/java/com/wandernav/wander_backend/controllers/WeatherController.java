package com.wandernav.wander_backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Weather", description = "Weather information for locations")
public class WeatherController {

    @Operation(summary = "Get weather information for a location")
    @GetMapping("/weather")
    public ResponseEntity<?> getWeather(
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        try {
            // Mock weather data - replace with actual weather API integration
            Map<String, Object> weatherData = new HashMap<>();
            weatherData.put("temp", 22.5);
            weatherData.put("description", "Partly cloudy");
            weatherData.put("icon", "02d");
            weatherData.put("locationName", "New York");
            weatherData.put("humidity", 65);
            weatherData.put("windSpeed", 12.5);
            
            return ResponseEntity.ok(weatherData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Weather request failed: " + e.getMessage());
        }
    }
} 