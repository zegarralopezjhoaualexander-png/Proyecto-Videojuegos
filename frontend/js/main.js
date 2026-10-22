const API = "http://localhost:8080/api/juegos";
const API_AUTH = "http://localhost:8080/api/auth";

if (!localStorage.getItem("token")) {
  window.location.replace("login.html");
}

const lista = document.getElementById("listaJuegos");
const formulario = document.getElementById("formJuego");
const mensaje = document.getElementById("mensaje");
const panelFormulario = document.getElementById("panelFormulario");
const inputNombre = document.getElementById("nombre");
const inputGenero = document.getElementById("genero");
const inputPlataforma = document.getElementById("plataforma");
const inputAnio = document.getElementById("anio");
const inputPuntuacion = document.getElementById("puntuacion");
const inputImagen = document.getElementById("imagen");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloForm = document.getElementById("tituloForm");

const buscador = document.getElementById("buscador");
const filtroGenero = document.getElementById("filtroGenero");
const selectOrden = document.getElementById("ordenar");
const chkFavoritos = document.getElementById("soloFavoritos");
const btnLimpiar = document.getElementById("btnLimpiar");
const contador = document.getElementById("contador");

const statTotal = document.getElementById("statTotal");
const statGeneros = document.getElementById("statGeneros");
const statPromedio = document.getElementById("statPromedio");

const usuarioActual = document.getElementById("usuarioActual");
const btnSalir = document.getElementById("btnSalir");

let editandoId = null;
let todosLosJuegos = [];

usuarioActual.textContent = "👤 " + (localStorage.getItem("usuario") || "");

function cerrarSesionLocal() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  window.location.replace("login.html");
}

async function fetchAuth(url, opciones = {}) {
  const cabeceras = {
    ...(opciones.headers || {}),
    Authorization: "Bearer " + localStorage.getItem("token")
  };
  const respuesta = await fetch(url, { ...opciones, headers: cabeceras });
  if (respuesta.status === 401) {
    cerrarSesionLocal();
  }
  return respuesta;
}

btnSalir.addEventListener("click", async () => {
  try {
    await fetchAuth(API_AUTH + "/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  }
  cerrarSesionLocal();
});

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
  panelFormulario.classList.remove("editando");
}

function iniciarEdicion(juego) {
  editandoId = juego.id;
  inputNombre.value = juego.nombre;
  inputGenero.value = juego.genero;
  inputPlataforma.value = juego.plataforma ?? "";
  inputAnio.value = juego.anio ?? "";
  inputPuntuacion.value = juego.puntuacion ?? "";
  inputImagen.value = juego.imagen ?? "";
  btnGuardar.textContent = "Guardar cambios";
  tituloForm.textContent = "Editar videojuego";
  btnCancelar.hidden = false;
  panelFormulario.classList.add("editando");
  mostrarMensaje("", "");
  document.getElementById("agregar").scrollIntoView({ behavior: "smooth" });
  inputNombre.focus();
}

function actualizarEstadisticas() {
  statTotal.textContent = todosLosJuegos.length;

  const generos = new Set(
    todosLosJuegos.map(j => normalizar(j.genero)).filter(Boolean)
  );
  statGeneros.textContent = generos.size;

  const notas = todosLosJuegos
    .map(j => j.puntuacion)
    .filter(n => typeof n === "number");

  statPromedio.textContent = notas.length
    ? (notas.reduce((suma, n) => suma + n, 0) / notas.length).toFixed(1)
    : "—";
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

// Compara por un campo numérico; los juegos sin dato quedan siempre al final.
function compararNumero(campo, direccion) {
  return (a, b) => {
    const x = a[campo];
    const y = b[campo];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    return (x - y) * direccion;
  };
}

function ordenarJuegos(juegos) {
  const copia = [...juegos];

  switch (selectOrden.value) {
    case "reciente":
      return copia.sort((a, b) => b.id - a.id);
    case "nombre":
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
    case "puntuacion-desc":
      return copia.sort(compararNumero("puntuacion", -1));
    case "puntuacion-asc":
      return copia.sort(compararNumero("puntuacion", 1));
    case "anio-desc":
      return copia.sort(compararNumero("anio", -1));
    case "anio-asc":
      return copia.sort(compararNumero("anio", 1));
    default:
      return copia;
  }
}

function crearChip(texto) {
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = texto;
  return chip;
}

function crearImagen(juego) {
  const contenedor = document.createElement("div");
  contenedor.className = "imagen-juego";

  const mostrarRelleno = () => {
    contenedor.textContent = "🎮";
  };

  if (!juego.imagen) {
    mostrarRelleno();
    return contenedor;
  }

  const img = document.createElement("img");
  img.alt = "Portada de " + juego.nombre;
  img.loading = "lazy";
  img.referrerPolicy = "no-referrer";
  img.addEventListener("error", () => {
    img.remove();
    mostrarRelleno();
  });
  img.src = juego.imagen;
  contenedor.append(img);

  return contenedor;
}

function crearTarjeta(juego) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta";

  const encabezado = document.createElement("div");
  encabezado.className = "cabecera-tarjeta";

  const textos = document.createElement("div");

  const titulo = document.createElement("h3");
  titulo.textContent = juego.nombre;

  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta";
  etiqueta.textContent = juego.genero;

  textos.append(titulo);
  encabezado.append(textos);

  if (typeof juego.puntuacion === "number") {
    const nota = document.createElement("div");
    const nivel = juego.puntuacion >= 8 ? "alta" : juego.puntuacion >= 5 ? "media" : "baja";
    nota.className = "nota " + nivel;
    nota.textContent = juego.puntuacion;
    nota.title = "Puntuación: " + juego.puntuacion + "/10";
    encabezado.append(nota);
  }

  tarjeta.append(crearImagen(juego), encabezado, etiqueta);

  if (juego.plataforma || juego.anio) {
    const chips = document.createElement("div");
    chips.className = "chips";
    if (juego.plataforma) chips.append(crearChip("🕹️ " + juego.plataforma));
    if (juego.anio) chips.append(crearChip("📅 " + juego.anio));
    tarjeta.append(chips);
  }

  const acciones = document.createElement("div");
  acciones.className = "acciones acciones-tarjeta";

  const esFavorito = juego.favorito === true;
  const botonFav = document.createElement("button");
  botonFav.type = "button";
  botonFav.className = "fav" + (esFavorito ? " activo" : "");
  botonFav.textContent = esFavorito ? "★" : "☆";
  botonFav.title = esFavorito ? "Quitar de favoritos" : "Marcar como favorito";
  botonFav.setAttribute("aria-label", botonFav.title);
  botonFav.setAttribute("aria-pressed", String(esFavorito));
  botonFav.addEventListener("click", () => alternarFavorito(juego.id));

  const botonEditar = document.createElement("button");
  botonEditar.className = "editar";
  botonEditar.textContent = "Editar";
  botonEditar.addEventListener("click", () => iniciarEdicion(juego));

  const botonEliminar = document.createElement("button");
  botonEliminar.className = "eliminar";
  botonEliminar.textContent = "Eliminar";
  botonEliminar.addEventListener("click", () => eliminarJuego(juego.id));

  acciones.append(botonFav, botonEditar, botonEliminar);
  tarjeta.append(acciones);

  return tarjeta;
}

function mostrarVacio(texto) {
  const aviso = document.createElement("p");
  aviso.className = "vacio";
  aviso.textContent = texto;
  lista.appendChild(aviso);
}

function mostrarJuegos() {
  const texto = normalizar(buscador.value);
  const genero = filtroGenero.value;
  const soloFavoritos = chkFavoritos.checked;

  const filtrados = todosLosJuegos.filter(juego => {
    const coincideTexto =
      !texto ||
      normalizar(juego.nombre).includes(texto) ||
      normalizar(juego.plataforma).includes(texto);
    const coincideGenero = !genero || normalizar(juego.genero) === genero;
    const coincideFavorito = !soloFavoritos || juego.favorito === true;
    return coincideTexto && coincideGenero && coincideFavorito;
  });

  lista.innerHTML = "";

  if (todosLosJuegos.length === 0) {
    contador.textContent = "";
    mostrarVacio("Todavía no hay videojuegos. ¡Agrega el primero!");
    return;
  }

  contador.textContent =
    "Mostrando " + filtrados.length + " de " + todosLosJuegos.length + " videojuegos";

  if (filtrados.length === 0) {
    mostrarVacio(
      soloFavoritos && !texto && !genero
        ? "Todavía no tienes favoritos. Pulsa la estrella ☆ de un juego para marcarlo."
        : "Ningún videojuego coincide con tu búsqueda."
    );
    return;
  }

  ordenarJuegos(filtrados).forEach(juego => lista.appendChild(crearTarjeta(juego)));
}

async function cargarJuegos() {
  try {
    const respuesta = await fetchAuth(API);
    if (respuesta.status === 401) return;
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    todosLosJuegos = await respuesta.json();

    actualizarEstadisticas();
    actualizarGeneros();
    mostrarJuegos();
  } catch (error) {
    contador.textContent = "";
    lista.innerHTML = "";
    mostrarVacio("No se pudo conectar con el backend. ¿Está corriendo?");
    console.error(error);
  }
}

async function alternarFavorito(id) {
  try {
    const respuesta = await fetchAuth(API + "/" + id + "/favorito", { method: "PUT" });
    if (respuesta.status === 401) return;
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    const actualizado = await respuesta.json();
    todosLosJuegos = todosLosJuegos.map(j => (j.id === actualizado.id ? actualizado : j));
    mostrarJuegos();
  } catch (error) {
    mostrarMensaje("No se pudo cambiar el favorito.", "error");
    console.error(error);
  }
}

buscador.addEventListener("input", mostrarJuegos);
filtroGenero.addEventListener("change", mostrarJuegos);
selectOrden.addEventListener("change", mostrarJuegos);
chkFavoritos.addEventListener("change", mostrarJuegos);

btnLimpiar.addEventListener("click", () => {
  buscador.value = "";
  filtroGenero.value = "";
  selectOrden.value = "";
  chkFavoritos.checked = false;
  mostrarJuegos();
});

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: inputNombre.value.trim(),
    genero: inputGenero.value.trim(),
    plataforma: inputPlataforma.value.trim() || null,
    anio: inputAnio.value ? Number(inputAnio.value) : null,
    puntuacion: inputPuntuacion.value ? Number(inputPuntuacion.value) : null,
    imagen: inputImagen.value.trim() || null
  };

  const editando = editandoId !== null;
  const url = editando ? API + "/" + editandoId : API;
  const metodo = editando ? "PUT" : "POST";

  try {
    const respuesta = await fetchAuth(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (respuesta.status === 401) return;

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
    const respuesta = await fetchAuth(API + "/" + id, { method: "DELETE" });
    if (respuesta.status === 401) return;
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