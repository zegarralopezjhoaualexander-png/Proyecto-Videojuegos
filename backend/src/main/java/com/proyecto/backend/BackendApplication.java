package com.proyecto.backend;

import com.proyecto.backend.model.Videojuego;
import com.proyecto.backend.repository.VideojuegoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner cargarDatos(VideojuegoRepository repositorio) {
        return args -> {
            if (repositorio.count() == 0) {
                repositorio.save(new Videojuego("The Legend of Zelda", "Aventura"));
                repositorio.save(new Videojuego("Minecraft", "Sandbox"));
                repositorio.save(new Videojuego("FIFA", "Deportes"));
            }
        };
    }
}