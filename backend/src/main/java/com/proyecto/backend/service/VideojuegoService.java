package com.proyecto.backend.service;

import com.proyecto.backend.model.Videojuego;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class VideojuegoService {

    private final List<Videojuego> juegos = new CopyOnWriteArrayList<>();
    private final AtomicInteger contador = new AtomicInteger(3);

    public VideojuegoService() {
        juegos.add(new Videojuego(1, "The Legend of Zelda", "Aventura"));
        juegos.add(new Videojuego(2, "Minecraft", "Sandbox"));
        juegos.add(new Videojuego(3, "FIFA", "Deportes"));
    }

    public List<Videojuego> obtenerTodos() {
        return juegos;
    }

    public Optional<Videojuego> obtenerPorId(int id) {
        return juegos.stream().filter(j -> j.id() == id).findFirst();
    }

    public Videojuego crear(Videojuego datos) {
        Videojuego nuevo = new Videojuego(contador.incrementAndGet(), datos.nombre(), datos.genero());
        juegos.add(nuevo);
        return nuevo;
    }

    public Optional<Videojuego> actualizar(int id, Videojuego datos) {
        for (int i = 0; i < juegos.size(); i++) {
            if (juegos.get(i).id() == id) {
                Videojuego actualizado = new Videojuego(id, datos.nombre(), datos.genero());
                juegos.set(i, actualizado);
                return Optional.of(actualizado);
            }
        }
        return Optional.empty();
    }

    public boolean eliminar(int id) {
        return juegos.removeIf(j -> j.id() == id);
    }
}