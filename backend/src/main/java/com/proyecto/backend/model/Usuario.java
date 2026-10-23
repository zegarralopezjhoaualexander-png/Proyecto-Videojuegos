package com.proyecto.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Identificador interno heredado de versiones anteriores.
    @Column(nullable = false, unique = true, length = 30)
    private String nombreUsuario;

    @Column(nullable = false)
    private String contrasenaHash;

    @Column(length = 50)
    private String nombre;

    @Column(length = 50)
    private String apellido;

    @Column(unique = true, length = 254)
    private String correo;

    private LocalDate fechaNacimiento;

    // "ADMIN" o vacío (cliente). Es nullable para que las cuentas viejas sigan funcionando.
    @Column(length = 20)
    private String rol;

    public Usuario() {}

    public Usuario(String nombreUsuario, String contrasenaHash, String nombre,
                   String apellido, String correo, LocalDate fechaNacimiento) {
        this.nombreUsuario = nombreUsuario;
        this.contrasenaHash = contrasenaHash;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.fechaNacimiento = fechaNacimiento;
    }

    public Long getId() { return id; }
    public String getNombreUsuario() { return nombreUsuario; }
    public String getContrasenaHash() { return contrasenaHash; }
    public String getNombre() { return nombre; }
    public String getApellido() { return apellido; }
    public String getCorreo() { return correo; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }

    public boolean esAdmin() { return "ADMIN".equals(rol); }
    public void asignarRol(String rol) { this.rol = rol; }
    public String nombreRol() { return esAdmin() ? "ADMIN" : "CLIENTE"; }

    public String nombreCompleto() {
        if (nombre == null || nombre.isBlank()) {
            return nombreUsuario;
        }
        return (nombre + " " + (apellido == null ? "" : apellido)).trim();
    }
}