package com.proyecto.backend.controller;

import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.service.VideojuegoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/juegos")
public class VideojuegoController {

    private final VideojuegoService servicio;

    public VideojuegoController(VideojuegoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Videojuego> listar(@RequestAttribute("usuario") Usuario usuario) {
        return servicio.obtenerTodos(usuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Videojuego> obtener(@PathVariable Long id,
                                              @RequestAttribute("usuario") Usuario usuario) {
        return servicio.obtenerPorId(id, usuario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Videojuego> crear(@Valid @RequestBody Videojuego datos,
                                            @RequestAttribute("usuario") Usuario usuario) {
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crear(datos, usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Videojuego> actualizar(@PathVariable Long id,
                                                 @Valid @RequestBody Videojuego datos,
                                                 @RequestAttribute("usuario") Usuario usuario) {
        return servicio.actualizar(id, datos, usuario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/favorito")
    public ResponseEntity<Videojuego> alternarFavorito(@PathVariable Long id,
                                                       @RequestAttribute("usuario") Usuario usuario) {
        return servicio.alternarFavorito(id, usuario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
                                         @RequestAttribute("usuario") Usuario usuario) {
        return servicio.eliminar(id, usuario)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}