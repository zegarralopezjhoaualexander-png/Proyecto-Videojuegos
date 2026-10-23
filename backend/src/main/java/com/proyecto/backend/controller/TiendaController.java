package com.proyecto.backend.controller;

import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.service.VideojuegoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tienda/juegos")
public class TiendaController {

    private final VideojuegoService servicio;

    public TiendaController(VideojuegoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Videojuego> listar() {
        return servicio.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Videojuego> obtener(@PathVariable Long id) {
        return servicio.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}