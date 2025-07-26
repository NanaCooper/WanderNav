package com.wander.api.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @GetMapping
    public String getRoute(@RequestParam String origin, @RequestParam String destination) {
        return "Optimized route from " + origin + " to " + destination;
    }

    @PostMapping("/recalculate")
    public String recalculateRoute(@RequestBody String payload) {
        return "Recalculating route: " + payload;
    }
}
--------------------------------          