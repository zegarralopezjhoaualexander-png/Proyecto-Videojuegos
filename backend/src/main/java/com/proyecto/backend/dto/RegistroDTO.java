package com.proyecto.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegistroDTO(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 50, message = "El nombre no puede superar los 50 caracteres")
        @Pattern(regexp = "^[\\p{L} .'-]+$",
                message = "El nombre solo puede tener letras, espacios, punto, guion o apóstrofo")
        String nombre,

        @NotBlank(message = "El apellido es obligatorio")
        @Size(max = 50, message = "El apellido no puede superar los 50 caracteres")
        @Pattern(regexp = "^[\\p{L} .'-]+$",
                message = "El apellido solo puede tener letras, espacios, punto, guion o apóstrofo")
        String apellido,

        @NotNull(message = "La fecha de nacimiento es obligatoria")
        @Past(message = "La fecha de nacimiento debe ser anterior a hoy")
        LocalDate fechaNacimiento,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Size(max = 254, message = "El correo no puede superar los 254 caracteres")
        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}$",
                message = "Escribe un correo electrónico válido")
        String correo,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 12, max = 72, message = "La contraseña debe tener entre 12 y 72 caracteres")
        @Pattern(regexp = "^(?=.*\\p{Ll})(?=.*\\p{Lu})(?=.*\\d)(?=.*[^\\p{L}\\d\\s]).+$",
                message = "La contraseña debe incluir mayúscula, minúscula, número y símbolo")
        String contrasena,

        @NotBlank(message = "Confirma tu contraseña")
        String confirmacion) {
}