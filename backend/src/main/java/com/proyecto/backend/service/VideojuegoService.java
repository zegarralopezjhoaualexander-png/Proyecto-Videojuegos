package com.proyecto.backend.service;

import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.repository.VideojuegoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VideojuegoService {

    private final VideojuegoRepository repositorio;

    public VideojuegoService(VideojuegoRepository repositorio) {
        this.repositorio = repositorio;
    }

    public List<Videojuego> obtenerTodos() {
        return repositorio.findAll();
    }

    public Optional<Videojuego> obtenerPorId(Long id) {
        return repositorio.findById(id);
    }

    public Videojuego crear(Videojuego datos) {
        datos.setId(null);
        return repositorio.save(datos);
    }

    public Optional<Videojuego> actualizar(Long id, Videojuego datos) {
        return repositorio.findById(id).map(juego -> {
            juego.setNombre(datos.getNombre());
            juego.setGenero(datos.getGenero());
            juego.setPlataforma(datos.getPlataforma());
            juego.setAnio(datos.getAnio());
            juego.setPuntuacion(datos.getPuntuacion());
            juego.setImagen(datos.getImagen());
            return repositorio.save(juego);
        });
    }

    public boolean eliminar(Long id) {
        if (!repositorio.existsById(id)) {
            return false;
        }
        repositorio.deleteById(id);
        return true;
    }
}