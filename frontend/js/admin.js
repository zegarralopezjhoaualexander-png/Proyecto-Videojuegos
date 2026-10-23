const API_TIENDA = "http://localhost:8080/api/tienda/juegos";
const API_ADMIN = "http://localhost:8080/api/admin/juegos";
const API_AUTH = "http://localhost:8080/api/auth";
const moneda = new Intl.NumberFormat("es", { style: "currency", currency: "USD" });

if (!localStorage.getItem("token")) {
  window.location.replace("login.html");
}

const contenido = document.getElementById("contenido");
const usuarioActual = document.getElementById("usuarioActual");
const btnSalir = document.getElementById("btnSalir");

const formulario = document.getElementById("formJuego");
const mensaje = document.getElementById("mensaje");
const panelFormulario = document.getElementById("panelFormulario");
const tituloForm = document.getElementById("tituloForm");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const listaCategorias = document.getElementById("categorias");

const campos = {
  nombre: document.getElementById("nombre"),
  genero: document.getElementById("genero"),
  plataforma: document.getElementById("plataforma"),
  anio: document.getElementById("anio"),
  precio: document.getElementById("precio"),
  stock: document.getElementById("stock"),
  puntuacion: document.getElementById("puntuacion"),
  imagen: document.getElementById("imagen"),
  descripcion: document.getElementById("descripcion")
};

const buscador = document.getElementById("buscador");
const contador = document.getElementById("contador");
const cuerpoTabla = document.getElementById("cuerpoTabla");

let editandoId = null;
let todosLosJuegos = [];

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
  if (respuesta.status === 401) cerrarSesionLocal();
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
  tituloForm.textContent = "Agregar juego";
  btnCancelar.hidden = true;
  panelFormulario.classList.remove("editando");
}

function iniciarEdicion(juego) {
  editandoId = juego.id;
  campos.nombre.value = juego.nombre;
  campos.genero.value = juego.genero;
  campos.plataforma.value = juego.plataforma ?? "";
  campos.anio.value = juego.anio ?? "";
  campos.precio.value = juego.precio ?? "";
  campos.stock.value = juego.stock ?? "";
  campos.puntuacion.value = juego.puntuacion ?? "";
  campos.imagen.value = juego.imagen ?? "";
  campos.descripcion.value = juego.descripcion ?? "";
  btnGuardar.textContent = "Guardar cambios";
  tituloForm.textContent = "Editar juego";
  btnCancelar.hidden = false;
  panelFormulario.classList.add("editando");
  mostrarMensaje("", "");
  window.scrollTo({ top: 0, behavior: "smooth" });
  campos.nombre.focus();
}

function actualizarCategorias() {
  const categorias = new Set(todosLosJuegos.map(j => j.genero).filter(Boolean));
  listaCategorias.innerHTML = "";
  [...categorias]
    .sort((a, b) => a.localeCompare(b, "es"))
    .forEach(categoria => {
      const opcion = document.createElement("option");
      opcion.value = categoria;
      listaCategorias.append(opcion);
    });
}

function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  return celda;
}

function mostrarTabla() {
  const texto = normalizar(buscador.value);

  const filtrados = todosLosJuegos.filter(juego =>
    !texto ||
    normalizar(juego.nombre).includes(texto) ||
    normalizar(juego.genero).includes(texto));

  cuerpoTabla.innerHTML = "";
  contador.textContent =
    "Mostrando " + filtrados.length + " de " + todosLosJuegos.length + " juegos";

  filtrados.forEach(juego => {
    const fila = document.createElement("tr");

    fila.append(
      crearCelda(juego.nombre),
      crearCelda(juego.genero),
      crearCelda(juego.plataforma || "—"),
      crearCelda(juego.precio == null ? "—" : moneda.format(juego.precio)),
      crearCelda(juego.stock ?? 0)
    );

    const celdaAcciones = document.createElement("td");
    const acciones = document.createElement("div");
    acciones.className = "acciones-fila";

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.className = "editar";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", () => iniciarEdicion(juego));

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "eliminar";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => eliminarJuego(juego));

    acciones.append(botonEditar, botonEliminar);
    celdaAcciones.append(acciones);
    fila.append(celdaAcciones);
    cuerpoTabla.append(fila);
  });
}

async function cargarJuegos() {
  try {
    const respuesta = await fetch(API_TIENDA);
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    todosLosJuegos = await respuesta.json();
    actualizarCategorias();
    mostrarTabla();
  } catch (error) {
    contador.textContent = "No se pudo conectar con el backend. ¿Está corriendo?";
    console.error(error);
  }
}

buscador.addEventListener("input", mostrarTabla);

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: campos.nombre.value.trim(),
    genero: campos.genero.value.trim(),
    plataforma: campos.plataforma.value.trim() || null,
    anio: campos.anio.value ? Number(campos.anio.value) : null,
    precio: campos.precio.value === "" ? null : Number(campos.precio.value),
    stock: campos.stock.value === "" ? null : Number(campos.stock.value),
    puntuacion: campos.puntuacion.value ? Number(campos.puntuacion.value) : null,
    imagen: campos.imagen.value.trim() || null,
    descripcion: campos.descripcion.value.trim() || null
  };

  const editando = editandoId !== null;
  const url = editando ? API_ADMIN + "/" + editandoId : API_ADMIN;

  try {
    const respuesta = await fetchAuth(url, {
      method: editando ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    if (respuesta.status === 401) return;

    if (!respuesta.ok) {
      let texto = "No se pudo guardar el juego.";
      try {
        const error = await respuesta.json();
        if (error.mensaje) texto = error.mensaje;
      } catch (e) {}
      mostrarMensaje(texto, "error");
      return;
    }

    salirDeEdicion();
    mostrarMensaje(editando ? "Juego actualizado ✏️" : "Juego agregado ✅", "ok");
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

async function eliminarJuego(juego) {
  if (!confirm("¿Eliminar \"" + juego.nombre + "\" de la tienda?")) return;

  try {
    const respuesta = await fetchAuth(API_ADMIN + "/" + juego.id, { method: "DELETE" });
    if (respuesta.status === 401) return;
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    if (editandoId === juego.id) salirDeEdicion();
    mostrarMensaje("Juego eliminado 🗑️", "ok");
    cargarJuegos();
  } catch (error) {
    mostrarMensaje("No se pudo eliminar el juego.", "error");
    console.error(error);
  }
}

// Solo los administradores pueden ver esta página (el servidor también lo comprueba).
async function verificarAdministrador() {
  try {
    const respuesta = await fetchAuth(API_AUTH + "/yo");
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    const datos = await respuesta.json();
    if (datos.rol !== "ADMIN") {
      alert("Solo los administradores pueden entrar al panel.");
      window.location.replace("index.html");
      return;
    }

    usuarioActual.textContent = "👤 " + datos.nombre;
    contenido.hidden = false;
    cargarJuegos();
  } catch (error) {
    console.error(error);
    alert("No se pudo conectar con el backend. ¿Está corriendo?");
  }
}

verificarAdministrador();