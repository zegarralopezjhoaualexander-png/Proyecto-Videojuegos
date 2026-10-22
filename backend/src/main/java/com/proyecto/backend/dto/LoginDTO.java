package com.proyecto.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginDTO(
        @NotBlank(message = "Escribe tu correo electrónico o usuario")
        String identificador,

        @NotBlank(message = "Escribe tu contraseña")
        String contrasena) {
}