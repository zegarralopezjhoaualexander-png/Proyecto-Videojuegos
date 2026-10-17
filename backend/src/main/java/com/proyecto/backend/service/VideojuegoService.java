package com.proyecto.backend.service;

import com.proyecto.backend.model.Videojuego;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VideojuegoService {

    public List<Videojuego> obtenerTodos() {
        return List.of(
                new Videojuego(1, "The Legend of Zelda", "Aventura"),
                new Videojuego(2, "Minecraft", "Sandbox"),
                new Videojuego(3, "FIFA", "Deportes")
        );
    }
}