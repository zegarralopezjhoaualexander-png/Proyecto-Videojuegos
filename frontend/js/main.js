const API = "http://localhost:8080/api/juegos";

const lista = document.getElementById("listaJuegos");
const formulario = document.getElementById("formJuego");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

async function cargarJuegos() {
  try {
    const respuesta = await fetch(API);
    const juegos = await respuesta.json();

    lista.innerHTML = "";

    if (juegos.length === 0) {
      lista.textContent = "Todavía no hay videojuegos. ¡Agrega el primero!";
      return;
    }

    juegos.forEach(juego => {
      const tarjeta = document.createElement("article");
      tarjeta.className = "tarjeta";

      const titulo = document.createElement("h3");
      titulo.textContent = juego.nombre;

      const genero = document.createElement("p");
      genero.textContent = "Género: " + juego.genero;

      const boton = document.createElement("button");
      boton.className = "eliminar";
      boton.textContent = "Eliminar";
      boton.addEventListener("click", () => eliminarJuego(juego.id));

      tarjeta.append(titulo, genero, boton);
      lista.appendChild(tarjeta);
    });
  } catch (error) {
    lista.textContent = "No se pudo conectar con el backend. ¿Está corriendo?";
    console.error(error);
  }
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const nuevo = {
    nombre: document.getElementById("nombre").value.trim(),
    genero: document.getElementById("genero").value.trim()
  };

  try {
    const respuesta = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo)
    });

    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    formulario.reset();
    mostrarMensaje("Videojuego agregado ✅", "ok");
    cargarJuegos();
  } catch (error) {
    mostrarMensaje("No se pudo agregar el videojuego.", "error");
    console.error(error);
  }
});

async function eliminarJuego(id) {
  if (!confirm("¿Seguro que quieres eliminar este videojuego?")) return;

  try {
    const respuesta = await fetch(API + "/" + id, { method: "DELETE" });
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    mostrarMensaje("Videojuego eliminado 🗑️", "ok");
    cargarJuegos();
  } catch (error) {
    mostrarMensaje("No se pudo eliminar el videojuego.", "error");
    console.error(error);
  }
}

cargarJuegos();