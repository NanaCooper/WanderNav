package com.wandernav.wander_backend.repositories;

import com.wandernav.wander_backend.models.Location;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LocationRepository extends MongoRepository<Location, String> {
    // Add custom queries here if needed later
}
