const API = "http://localhost:8080/api/juegos";

const lista = document.getElementById("listaJuegos");
const formulario = document.getElementById("formJuego");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("nombre");
const inputGenero = document.getElementById("genero");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");

let editandoId = null;

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

function salirDeEdicion() {
  editandoId = null;
  formulario.reset();
  btnGuardar.textContent = "Agregar";
  tituloForm.textContent = "Agregar videojuego";
  btnCancelar.hidden = true;
}

function iniciarEdicion(juego) {
  editandoId = juego.id;
  inputNombre.value = juego.nombre;
  inputGenero.value = juego.genero;
  btnGuardar.textContent = "Guardar cambios";
  tituloForm.textContent = "Editar videojuego";
  btnCancelar.hidden = false;
  mostrarMensaje("", "");
  document.getElementById("agregar").scrollIntoView({ behavior: "smooth" });
  inputNombre.focus();
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

      const acciones = document.createElement("div");
      acciones.className = "acciones";

      const botonEditar = document.createElement("button");
      botonEditar.className = "editar";
      botonEditar.textContent = "Editar";
      botonEditar.addEventListener("click", () => iniciarEdicion(juego));

      const botonEliminar = document.createElement("button");
      botonEliminar.className = "eliminar";
      botonEliminar.textContent = "Eliminar";
      botonEliminar.addEventListener("click", () => eliminarJuego(juego.id));

      acciones.append(botonEditar, botonEliminar);
      tarjeta.append(titulo, genero, acciones);
      lista.appendChild(tarjeta);
    });
  } catch (error) {
    lista.textContent = "No se pudo conectar con el backend. ¿Está corriendo?";
    console.error(error);
  }
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: inputNombre.value.trim(),
    genero: inputGenero.value.trim()
  };

  const editando = editandoId !== null;
  const url = editando ? API + "/" + editandoId : API;
  const metodo = editando ? "PUT" : "POST";

  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    salirDeEdicion();
    mostrarMensaje(editando ? "Videojuego actualizado ✏️" : "Videojuego agregado ✅", "ok");
    cargarJuegos();
  } catch (error) {
    mostrarMensaje("No se pudo guardar el videojuego.", "error");
    console.error(error);
  }
});

btnCancelar.addEventListener("click", () => {
  salirDeEdicion();
  mostrarMensaje("", "");
});

async function eliminarJuego(id) {
  if (!confirm("¿Seguro que quieres eliminar este videojuego?")) return;

  try {
    const respuesta = await fetch(API + "/" + id, { method: "DELETE" });
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    if (editandoId === id) salirDeEdicion();
    mostrarMensaje("Videojuego eliminado 🗑️", "ok");
    cargarJuegos();
  } catch (error) {
    mostrarMensaje("No se pudo eliminar el videojuego.", "error");
    console.error(error);
  }
}

cargarJuegos();