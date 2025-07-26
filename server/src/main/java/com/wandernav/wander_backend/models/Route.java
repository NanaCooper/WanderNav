package com.wandernav.wander_backend.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;
;

@Document(collection = "routes")
public class Route {

    @Id
    private String id;

    private String name;
    private String userId; // Reference to User.id
    private List<String> locationIds; // Each is a Location.id

    public Route() {}

    public Route(String name, String userId, List<String> locationIds) {
        this.name = name;
        this.userId = userId;
        this.locationIds = locationIds;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<String> getLocationIds() { return locationIds; }
    public void setLocationIds(List<String> locationIds) { this.locationIds = locationIds; }
}
