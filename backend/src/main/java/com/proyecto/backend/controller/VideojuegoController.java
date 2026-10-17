package com.proyecto.backend.controller;

import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.service.VideojuegoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/juegos")
@CrossOrigin(origins = "*")
public class VideojuegoController {

    private final VideojuegoService servicio;

    public VideojuegoController(VideojuegoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Videojuego> listar() {
        return servicio.obtenerTodos();
    }
}