package com.proyecto.backend.service;

import com.proyecto.backend.model.Usuario;
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

    public List<Videojuego> obtenerTodos(Usuario usuario) {
        return repositorio.findByUsuarioId(usuario.getId());
    }

    public Optional<Videojuego> obtenerPorId(Long id, Usuario usuario) {
        return repositorio.findByIdAndUsuarioId(id, usuario.getId());
    }

    public Videojuego crear(Videojuego datos, Usuario usuario) {
        datos.setId(null);
        datos.setFavorito(false);
        datos.asignarPropietario(usuario);
        return repositorio.save(datos);
    }

    public Optional<Videojuego> actualizar(Long id, Videojuego datos, Usuario usuario) {
        return repositorio.findByIdAndUsuarioId(id, usuario.getId()).map(juego -> {
            juego.setNombre(datos.getNombre());
            juego.setGenero(datos.getGenero());
            juego.setPlataforma(datos.getPlataforma());
            juego.setAnio(datos.getAnio());
            juego.setPuntuacion(datos.getPuntuacion());
            juego.setImagen(datos.getImagen());
            return repositorio.save(juego);
        });
    }

    public Optional<Videojuego> alternarFavorito(Long id, Usuario usuario) {
        return repositorio.findByIdAndUsuarioId(id, usuario.getId()).map(juego -> {
            juego.setFavorito(!Boolean.TRUE.equals(juego.getFavorito()));
            return repositorio.save(juego);
        });
    }

    public boolean eliminar(Long id, Usuario usuario) {
        return repositorio.findByIdAndUsuarioId(id, usuario.getId())
                .map(juego -> {
                    repositorio.delete(juego);
                    return true;
                })
                .orElse(false);
    }
}