package com.proyecto.backend.config;

import com.proyecto.backend.exception.ErrorApi;
import com.proyecto.backend.model.Usuario;
import com.proyecto.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AutenticacionInterceptor implements HandlerInterceptor {

    private final AuthService auth;

    public AutenticacionInterceptor(AuthService auth) {
        this.auth = auth;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String cabecera = request.getHeader("Authorization");
        if (cabecera == null || !cabecera.startsWith("Bearer ")) {
            throw new ErrorApi(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión");
        }

        String token = cabecera.substring(7).trim();
        Usuario usuario = auth.usuarioDeToken(token)
                .orElseThrow(() -> new ErrorApi(HttpStatus.UNAUTHORIZED,
                        "Tu sesión expiró. Inicia sesión de nuevo"));

        // Todo lo que cuelga de /api/admin es solo para administradores.
        if (request.getRequestURI().startsWith("/api/admin") && !usuario.esAdmin()) {
            throw new ErrorApi(HttpStatus.FORBIDDEN, "No tienes permiso para hacer esto");
        }

        request.setAttribute("usuario", usuario);
        request.setAttribute("token", token);
        return true;
    }
}