package com.proyecto.backend.repository;

import com.proyecto.backend.model.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SesionRepository extends JpaRepository<Sesion, Long> {
    Optional<Sesion> findByToken(String token);
    void deleteByToken(String token);
}