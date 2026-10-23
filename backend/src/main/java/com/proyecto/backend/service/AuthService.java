package com.proyecto.backend.service;

import com.proyecto.backend.dto.LoginDTO;
import com.proyecto.backend.dto.RegistroDTO;
import com.proyecto.backend.dto.RespuestaAuthDTO;
import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.Sesion;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.repository.SesionRepository;
import com.proyecto.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final SecureRandom ALEATORIO = new SecureRandom();
    private static final Duration DURACION_SESION = Duration.ofDays(7);
    private static final int EDAD_MINIMA = 13;
    private static final int EDAD_MAXIMA = 120;
    private static final int MAX_BYTES_CONTRASENA = 72;

    private final UsuarioRepository usuarios;
    private final SesionRepository sesiones;
    private final String correoAdmin;
    private final BCryptPasswordEncoder cifrador = new BCryptPasswordEncoder();

    public AuthService(UsuarioRepository usuarios,
                       SesionRepository sesiones,
                       @Value("${tienda.admin.correo:}") String correoAdmin) {
        this.usuarios = usuarios;
        this.sesiones = sesiones;
        this.correoAdmin = correoAdmin.trim().toLowerCase(Locale.ROOT);
    }

    @Transactional
    public RespuestaAuthDTO registrar(RegistroDTO datos) {
        if (!datos.contrasena().equals(datos.confirmacion())) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "Las contraseñas no coinciden");
        }
        if (excedeLimite(datos.contrasena())) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "La contraseña es demasiado larga");
        }
        validarEdad(datos.fechaNacimiento());

        String correo = datos.correo().trim().toLowerCase(Locale.ROOT);
        if (usuarios.existsByCorreo(correo)) {
            throw new ErrorApi(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo electrónico");
        }

        Usuario nuevo = usuarios.save(new Usuario(
                generarNombreInterno(),
                cifrador.encode(datos.contrasena()),
                datos.nombre().trim(),
                datos.apellido().trim(),
                correo,
                datos.fechaNacimiento()));

        aplicarRol(nuevo);
        return crearSesion(nuevo);
    }

    @Transactional
    public RespuestaAuthDTO iniciarSesion(LoginDTO datos) {
        String identificador = datos.identificador().trim().toLowerCase(Locale.ROOT);

        Usuario usuario = usuarios.findByCorreo(identificador)
                .or(() -> usuarios.findByNombreUsuario(identificador))
                .filter(u -> !excedeLimite(datos.contrasena())
                        && cifrador.matches(datos.contrasena(), u.getContrasenaHash()))
                .orElseThrow(() -> new ErrorApi(HttpStatus.UNAUTHORIZED,
                        "Correo o contraseña incorrectos"));

        aplicarRol(usuario);
        return crearSesion(usuario);
    }

    @Transactional
    public Optional<Usuario> usuarioDeToken(String token) {
        Optional<Sesion> sesion = sesiones.findByToken(token);
        if (sesion.isEmpty()) {
            return Optional.empty();
        }
        if (sesion.get().getExpira().isBefore(Instant.now())) {
            sesiones.delete(sesion.get());
            return Optional.empty();
        }
        return Optional.of(sesion.get().getUsuario());
    }

    @Transactional
    public void cerrarSesion(String token) {
        sesiones.deleteByToken(token);
    }

    // La cuenta cuyo correo coincide con tienda.admin.correo pasa a ser administradora.
    private void aplicarRol(Usuario usuario) {
        if (!correoAdmin.isEmpty()
                && correoAdmin.equals(usuario.getCorreo())
                && !usuario.esAdmin()) {
            usuario.asignarRol("ADMIN");
            usuarios.save(usuario);
        }
    }

    private void validarEdad(LocalDate nacimiento) {
        int edad = Period.between(nacimiento, LocalDate.now()).getYears();
        if (edad < EDAD_MINIMA) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST,
                    "Debes tener al menos " + EDAD_MINIMA + " años para crear una cuenta");
        }
        if (edad > EDAD_MAXIMA) {
            throw new ErrorApi(HttpStatus.BAD_REQUEST, "La fecha de nacimiento no es válida");
        }
    }

    private boolean excedeLimite(String contrasena) {
        return contrasena.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES_CONTRASENA;
    }

    private String generarNombreInterno() {
        String candidato;
        do {
            candidato = "u" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        } while (usuarios.existsByNombreUsuario(candidato));
        return candidato;
    }

    private RespuestaAuthDTO crearSesion(Usuario usuario) {
        String token = generarToken();
        sesiones.save(new Sesion(token, usuario, Instant.now().plus(DURACION_SESION)));
        return new RespuestaAuthDTO(token, usuario.nombreCompleto(), usuario.nombreRol());
    }

    private String generarToken() {
        byte[] bytes = new byte[32];
        ALEATORIO.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}