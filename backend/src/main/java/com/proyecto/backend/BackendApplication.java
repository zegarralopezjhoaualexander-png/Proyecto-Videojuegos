package com.proyecto.backend;

import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.repository.VideojuegoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner prepararCatalogo(VideojuegoRepository repositorio) {
        return args -> {
            // Los juegos de versiones anteriores no tenían precio ni stock.
            List<Videojuego> existentes = repositorio.findAll();
            for (Videojuego j : existentes) {
                if (j.getPrecio() == null) j.setPrecio(new BigDecimal("29.99"));
                if (j.getStock() == null) j.setStock(20);
            }
            repositorio.saveAll(existentes);

            // Solo se carga el catálogo inicial si la tienda tiene pocos juegos.
            if (repositorio.count() < 10) {
                for (Videojuego j : catalogoInicial()) {
                    if (!repositorio.existsByNombreIgnoreCase(j.getNombre())) {
                        repositorio.save(j);
                    }
                }
            }
        };
    }

    private static Videojuego juego(String nombre, String categoria, String plataforma, int anio,
                                    String precio, int stock, int puntuacion, String descripcion) {
        Videojuego j = new Videojuego();
        j.setNombre(nombre);
        j.setGenero(categoria);
        j.setPlataforma(plataforma);
        j.setAnio(anio);
        j.setPrecio(new BigDecimal(precio));
        j.setStock(stock);
        j.setPuntuacion(puntuacion);
        j.setDescripcion(descripcion);
        return j;
    }

    private static List<Videojuego> catalogoInicial() {
        return List.of(
                juego("The Legend of Zelda: Breath of the Wild", "Aventura", "Nintendo Switch", 2017, "59.99", 12, 10,
                        "Explora un enorme reino abierto y descubre tu propio camino."),
                juego("Super Mario Odyssey", "Plataformas", "Nintendo Switch", 2017, "59.99", 15, 9,
                        "Viaja por reinos increíbles junto a Mario y su gorra Cappy."),
                juego("Mario Kart 8 Deluxe", "Carreras", "Nintendo Switch", 2017, "59.99", 20, 9,
                        "Carreras caóticas para jugar solo o con amigos."),
                juego("Animal Crossing: New Horizons", "Simulación", "Nintendo Switch", 2020, "59.99", 10, 9,
                        "Construye tu isla desierta y vive a tu propio ritmo."),
                juego("Elden Ring", "RPG", "PlayStation 5", 2022, "59.99", 8, 10,
                        "Un mundo abierto oscuro y desafiante, lleno de jefes y secretos."),
                juego("God of War Ragnarök", "Acción", "PlayStation 5", 2022, "69.99", 9, 9,
                        "Kratos y Atreus se enfrentan al fin del mundo nórdico."),
                juego("Marvel's Spider-Man 2", "Acción", "PlayStation 5", 2023, "69.99", 7, 9,
                        "Recorre Nueva York columpiándote con dos Spider-Man."),
                juego("Resident Evil 4", "Terror", "PlayStation 5", 2023, "59.99", 6, 9,
                        "Nueva versión del clásico de supervivencia y terror."),
                juego("Street Fighter 6", "Lucha", "PlayStation 5", 2023, "59.99", 11, 8,
                        "Combates callejeros con un gran plantel de luchadores."),
                juego("Mortal Kombat 1", "Lucha", "PlayStation 5", 2023, "69.99", 5, 8,
                        "El universo de la saga reiniciado, con ejecuciones brutales."),
                juego("EA Sports FC 24", "Deportes", "PlayStation 5", 2023, "69.99", 14, 7,
                        "Fútbol con cientos de equipos y modos para jugar en línea."),
                juego("NBA 2K24", "Deportes", "PlayStation 5", 2023, "59.99", 10, 7,
                        "Baloncesto realista con modo carrera y equipos de toda la liga."),
                juego("Forza Horizon 5", "Carreras", "Xbox Series X", 2021, "59.99", 9, 9,
                        "Carreras en un gran mundo abierto inspirado en México."),
                juego("Halo Infinite", "Shooter", "Xbox Series X", 2021, "59.99", 8, 8,
                        "El Jefe Maestro vuelve en una campaña abierta y un multijugador veloz."),
                juego("Call of Duty: Modern Warfare III", "Shooter", "PlayStation 5", 2023, "69.99", 13, 6,
                        "Acción militar intensa, con campaña, multijugador y zombis."),
                juego("The Witcher 3: Wild Hunt", "RPG", "PC", 2015, "39.99", 18, 10,
                        "Caza monstruos y decide el destino de reinos enteros."),
                juego("Cyberpunk 2077", "RPG", "PC", 2020, "59.99", 12, 8,
                        "Rol en una ciudad futurista llena de tecnología y peligro."),
                juego("Baldur's Gate 3", "RPG", "PC", 2023, "59.99", 10, 10,
                        "Rol por turnos con decisiones que cambian toda la historia."),
                juego("Red Dead Redemption 2", "Aventura", "PC", 2018, "59.99", 9, 10,
                        "Una épica del Lejano Oeste con un mundo muy detallado."),
                juego("Grand Theft Auto V", "Acción", "PC", 2013, "29.99", 25, 9,
                        "Tres protagonistas, una ciudad enorme y mucho que hacer."),
                juego("Hades", "Roguelike", "PC", 2020, "24.99", 16, 9,
                        "Escapa del inframundo en combates rápidos que nunca se repiten."),
                juego("Hollow Knight", "Metroidvania", "PC", 2017, "14.99", 30, 9,
                        "Explora un reino subterráneo de insectos lleno de secretos."),
                juego("Celeste", "Plataformas", "Nintendo Switch", 2018, "19.99", 22, 9,
                        "Escala una montaña en un plataformas exigente y emotivo."),
                juego("Stardew Valley", "Simulación", "PC", 2016, "14.99", 40, 10,
                        "Hereda una granja y arma tu vida en el campo."),
                juego("The Sims 4", "Simulación", "PC", 2014, "19.99", 20, 7,
                        "Crea personajes, construye casas y cuenta tus propias historias."),
                juego("Portal 2", "Puzzle", "PC", 2011, "9.99", 35, 10,
                        "Resuelve puzles con portales en un laboratorio muy peculiar."),
                juego("Civilization VI", "Estrategia", "PC", 2016, "59.99", 10, 8,
                        "Guía a tu civilización desde la Edad de Piedra hasta el futuro."),
                juego("Age of Empires IV", "Estrategia", "PC", 2021, "59.99", 8, 8,
                        "Estrategia en tiempo real a través de siglos de historia."),
                juego("DOOM Eternal", "Shooter", "PC", 2020, "39.99", 12, 9,
                        "Disparos frenéticos contra hordas de demonios."),
                juego("Silent Hill 2", "Terror", "PC", 2024, "69.99", 6, 9,
                        "Nueva versión del clásico de terror psicológico.")
        );
    }
}