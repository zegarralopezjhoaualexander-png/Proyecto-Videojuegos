package com.proyecto.backend.repository;

import com.proyecto.backend.model.Videojuego;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideojuegoRepository extends JpaRepository<Videojuego, Long> {
    List<Videojuego> findByUsuarioId(Long usuarioId);
    Optional<Videojuego> findByIdAndUsuarioId(Long id, Long usuarioId);
    List<Videojuego> findByUsuarioIsNull();
}