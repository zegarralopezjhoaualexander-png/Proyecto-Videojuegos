const API = "http://localhost:8080/api/juegos";

const lista = document.getElementById("listaJuegos");
const formulario = document.getElementById("formJuego");
const mensaje = document.getElementById("mensaje");
const inputNombre = document.getElementById("nombre");
const inputGenero = document.getElementById("genero");
const inputPlataforma = document.getElementById("plataforma");
const inputAnio = document.getElementById("anio");
const inputPuntuacion = document.getElementById("puntuacion");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");

const buscador = document.getElementById("buscador");
const filtroGenero = document.getElementById("filtroGenero");
const btnLimpiar = document.getElementById("btnLimpiar");
const contador = document.getElementById("contador");

let editandoId = null;
let todosLosJuegos = [];

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo;
}

function normalizar(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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
  inputPlataforma.value = juego.plataforma ?? "";
  inputAnio.value = juego.anio ?? "";
  inputPuntuacion.value = juego.puntuacion ?? "";
  btnGuardar.textContent = "Guardar cambios";
  tituloForm.textContent = "Editar videojuego";
  btnCancelar.hidden = false;
  mostrarMensaje("", "");
  document.getElementById("agregar").scrollIntoView({ behavior: "smooth" });
  inputNombre.focus();
}

function crearLinea(texto) {
  const linea = document.createElement("p");
  linea.textContent = texto;
  return linea;
}

function actualizarGeneros() {
  const seleccionado = filtroGenero.value;
  const generos = new Map();

  todosLosJuegos.forEach(juego => {
    const clave = normalizar(juego.genero);
    if (clave && !generos.has(clave)) generos.set(clave, juego.genero);
  });

  filtroGenero.innerHTML = "";
  filtroGenero.add(new Option("Todos los géneros", ""));

  [...generos.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "es"))
    .forEach(([clave, nombre]) => filtroGenero.add(new Option(nombre, clave)));

  filtroGenero.value = generos.has(seleccionado) ? seleccionado : "";
}

function mostrarJuegos() {
  const texto = normalizar(buscador.value);
  const genero = filtroGenero.value;

  const filtrados = todosLosJuegos.filter(juego => {
    const coincideTexto =
      !texto ||
      normalizar(juego.nombre).includes(texto) ||
      normalizar(juego.plataforma).includes(texto);
    const coincideGenero = !genero || normalizar(juego.genero) === genero;
    return coincideTexto && coincideGenero;
  });

  lista.innerHTML = "";

  if (todosLosJuegos.length === 0) {
    contador.textContent = "";
    lista.textContent = "Todavía no hay videojuegos. ¡Agrega el primero!";
    return;
  }

  contador.textContent =
    "Mostrando " + filtrados.length + " de " + todosLosJuegos.length + " videojuegos";

  if (filtrados.length === 0) {
    lista.textContent = "Ningún videojuego coincide con tu búsqueda.";
    return;
  }

  filtrados.forEach(juego => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const titulo = document.createElement("h3");
    titulo.textContent = juego.nombre;
    tarjeta.append(titulo, crearLinea("Género: " + juego.genero));

    if (juego.plataforma) tarjeta.append(crearLinea("Plataforma: " + juego.plataforma));
    if (juego.anio) tarjeta.append(crearLinea("Año: " + juego.anio));
    if (juego.puntuacion) tarjeta.append(crearLinea("Puntuación: ⭐ " + juego.puntuacion + "/10"));

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
    tarjeta.append(acciones);
    lista.appendChild(tarjeta);
  });
}

async function cargarJuegos() {
  try {
    const respuesta = await fetch(API);
    todosLosJuegos = await respuesta.json();

    actualizarGeneros();
    mostrarJuegos();
  } catch (error) {
    contador.textContent = "";
    lista.textContent = "No se pudo conectar con el backend. ¿Está corriendo?";
    console.error(error);
  }
}

buscador.addEventListener("input", mostrarJuegos);
filtroGenero.addEventListener("change", mostrarJuegos);

btnLimpiar.addEventListener("click", () => {
  buscador.value = "";
  filtroGenero.value = "";
  mostrarJuegos();
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: inputNombre.value.trim(),
    genero: inputGenero.value.trim(),
    plataforma: inputPlataforma.value.trim() || null,
    anio: inputAnio.value ? Number(inputAnio.value) : null,
    puntuacion: inputPuntuacion.value ? Number(inputPuntuacion.value) : null
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

    if (!respuesta.ok) {
      let texto = "No se pudo guardar el videojuego.";
      try {
        const error = await respuesta.json();
        if (error.mensaje) texto = error.mensaje;
      } catch (e) {}
      mostrarMensaje(texto, "error");
      return;
    }

    salirDeEdicion();
    mostrarMensaje(editando ? "Videojuego actualizado ✏️" : "Videojuego agregado ✅", "ok");
    cargarJuegos();
  } catch (error) {
    mostrarMensaje("No se pudo conectar con el backend.", "error");
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