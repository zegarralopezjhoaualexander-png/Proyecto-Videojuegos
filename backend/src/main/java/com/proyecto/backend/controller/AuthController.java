package com.proyecto.backend.controller;

import com.proyecto.backend.dto.LoginDTO;
import com.proyecto.backend.dto.RegistroDTO;
import com.proyecto.backend.dto.RespuestaAuthDTO;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/registro")
    public ResponseEntity<RespuestaAuthDTO> registro(@Valid @RequestBody RegistroDTO datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.registrar(datos));
    }

    @PostMapping("/login")
    public RespuestaAuthDTO login(@Valid @RequestBody LoginDTO datos) {
        return auth.iniciarSesion(datos);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestAttribute("token") String token) {
        auth.cerrarSesion(token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/yo")
    public Map<String, String> yo(@RequestAttribute("usuario") Usuario usuario) {
        return Map.of(
                "nombre", usuario.nombreCompleto(),
                "rol", usuario.nombreRol());
    }
}