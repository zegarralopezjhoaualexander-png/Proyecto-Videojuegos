# 🎮 Proyecto Videojuegos

Aplicación web para administrar un catálogo de videojuegos. Permite **ver, agregar, editar y eliminar** juegos desde una página conectada a una API REST con base de datos.

## Tecnologías

| Parte | Tecnologías |
|---|---|
| Frontend | HTML, CSS y JavaScript |
| Backend | Java 17, Spring Boot, Spring Web, Spring Data JPA, Bean Validation |
| Base de datos | H2 (guardada en archivo) |
| Herramientas | IntelliJ IDEA, Visual Studio Code, Git y GitHub |

## Estructura del proyecto

```
Proyecto-Videojuegos/
├── backend/     API REST con Spring Boot
│   └── src/main/java/com/proyecto/backend/
│       ├── controller/   Recibe las peticiones
│       ├── service/      Lógica de negocio
│       ├── repository/   Acceso a la base de datos
│       ├── model/        Entidad Videojuego
│       └── exception/    Manejo de errores
├── frontend/    Página web
│   ├── index.html
│   ├── css/estilos.css
│   └── js/main.js
└── README.md
```

## Requisitos

- Java 17 o superior
- IntelliJ IDEA (o cualquier IDE que abra proyectos Maven)
- Visual Studio Code con la extensión **Live Server**
- Git

## Cómo ejecutarlo

### 1. Clonar el repositorio

```bash
git clone https://github.com/zegarralopezjhoaualexander-png/Proyecto-Videojuegos.git
```

### 2. Iniciar el backend

1. Abre la carpeta `backend` en IntelliJ IDEA.
2. Espera a que Maven descargue las dependencias.
3. Ejecuta la clase `BackendApplication`.
4. La API queda disponible en `http://localhost:8080/api/juegos`.

También se puede iniciar desde la terminal, dentro de la carpeta `backend`:

```bash
./mvnw spring-boot:run
```

### 3. Abrir el frontend

1. Abre la carpeta `frontend` en Visual Studio Code.
2. Clic derecho sobre `index.html` → **Open with Live Server**.
3. La página se abre en el navegador, normalmente en `http://127.0.0.1:5500`.

> El backend debe estar corriendo antes de abrir la página.

## API

Ruta base: `http://localhost:8080/api/juegos`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/juegos` | Lista todos los videojuegos |
| GET | `/api/juegos/{id}` | Obtiene un videojuego por su id |
| POST | `/api/juegos` | Agrega un videojuego |
| PUT | `/api/juegos/{id}` | Edita un videojuego |
| DELETE | `/api/juegos/{id}` | Elimina un videojuego |

Ejemplo de cuerpo para `POST` y `PUT`:

```json
{
  "nombre": "Minecraft",
  "genero": "Sandbox"
}
```

## Validaciones

- `nombre` y `genero` son obligatorios y no pueden estar vacíos.
- `nombre` admite hasta 100 caracteres y `genero` hasta 50.
- Si los datos no son válidos, la API responde con código `400` y un mensaje, por ejemplo:

```json
{ "mensaje": "El nombre es obligatorio" }
```

## Base de datos

Los datos se guardan en un archivo de H2 dentro de `backend/data/`, así que no se pierden al reiniciar la aplicación. Esa carpeta está en el `.gitignore` y no se sube a GitHub. La primera vez que se ejecuta, se cargan tres juegos de ejemplo.

## Autor

Tu Nombre
