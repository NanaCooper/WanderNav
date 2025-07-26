package com.wandernav.wander_backend.repositories;

import com.wandernav.wander_backend.models.Route;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RouteRepository extends MongoRepository<Route, String> {
    List<Route> findByUserId(String userId);
}
