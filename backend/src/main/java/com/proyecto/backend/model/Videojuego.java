package com.proyecto.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
public class Videojuego {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @NotBlank(message = "El género es obligatorio")
    @Size(max = 50, message = "El género no puede superar los 50 caracteres")
    private String genero;

    @Size(max = 50, message = "La plataforma no puede superar los 50 caracteres")
    private String plataforma;

    @Min(value = 1950, message = "El año debe ser 1950 o posterior")
    @Max(value = 2100, message = "El año no puede ser mayor a 2100")
    private Integer anio;

    @Min(value = 1, message = "La puntuación mínima es 1")
    @Max(value = 10, message = "La puntuación máxima es 10")
    private Integer puntuacion;

    @Column(length = 500)
    @Size(max = 500, message = "El enlace de la imagen no puede superar los 500 caracteres")
    @Pattern(regexp = "^(https?://|img/).+",
            message = "La imagen debe ser un enlace http(s) o una ruta que empiece por img/")
    private String imagen;

    // Boolean (y no boolean) para que los juegos ya guardados queden en null
    // y la base de datos se actualice sin errores. null se trata como "no favorito".
    private Boolean favorito;

    @ManyToOne
    private Usuario usuario;

    public Videojuego() {}

    public Videojuego(String nombre, String genero) {
        this.nombre = nombre;
        this.genero = genero;
    }

    // Estos dos métodos no se llaman get/set a propósito:
    // así el dueño nunca se envía ni se recibe por JSON.
    public Usuario propietario() { return usuario; }
    public void asignarPropietario(Usuario usuario) { this.usuario = usuario; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    public String getPlataforma() { return plataforma; }
    public void setPlataforma(String plataforma) { this.plataforma = plataforma; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Integer getPuntuacion() { return puntuacion; }
    public void setPuntuacion(Integer puntuacion) { this.puntuacion = puntuacion; }
    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }
    public Boolean getFavorito() { return favorito; }
    public void setFavorito(Boolean favorito) { this.favorito = favorito; }
}