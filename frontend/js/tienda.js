const API_TIENDA = "http://localhost:8080/api/tienda/juegos";
const API_AUTH = "http://localhost:8080/api/auth";
const CLAVE_CARRITO = "carrito";
const moneda = new Intl.NumberFormat("es", { style: "currency", currency: "USD" });

const EMOJIS = {
  accion: "💥", aventura: "🗺️", rpg: "⚔️", deportes: "⚽", carreras: "🏎️",
  shooter: "🔫", terror: "👻", estrategia: "♟️", simulacion: "🏡", puzzle: "🧩",
  plataformas: "🍄", lucha: "🥊", sandbox: "⛏️", roguelike: "🎲", metroidvania: "🦇"
};

const lista = document.getElementById("listaJuegos");
const buscador = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroPlataforma = document.getElementById("filtroPlataforma");
const selectOrden = document.getElementById("ordenar");
const chkStock = document.getElementById("soloStock");
const btnLimpiar = document.getElementById("btnLimpiar");
const contador = document.getElementById("contador");

const statJuegos = document.getElementById("statJuegos");
const statCategorias = document.getElementById("statCategorias");
const statPlataformas = document.getElementById("statPlataformas");

const enlaceAdmin = document.getElementById("enlaceAdmin");
const enlaceLogin = document.getElementById("enlaceLogin");
const usuarioActual = document.getElementById("usuarioActual");
const btnSalir = document.getElementById("btnSalir");

const btnCarrito = document.getElementById("btnCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const panelCarrito = document.getElementById("panelCarrito");
const fondoCarrito = document.getElementById("fondoCarrito");
const btnCerrarCarrito = document.getElementById("btnCerrarCarrito");
const itemsCarrito = document.getElementById("itemsCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const btnFinalizar = document.getElementById("btnFinalizar");
const btnVaciar = document.getElementById("btnVaciar");
const avisoCarrito = document.getElementById("avisoCarrito");

let todosLosJuegos = [];
let carrito = leerCarrito();

function normalizar(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ---------- Sesión ---------- */

function limpiarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

async function mostrarSesion() {
  const token = localStorage.getItem("token");
  if (!token) {
    enlaceLogin.hidden = false;
    return;
  }

  try {
    const respuesta = await fetch(API_AUTH + "/yo", {
      headers: { Authorization: "Bearer " + token }
    });

    if (respuesta.status === 401) {
      limpiarSesion();
      enlaceLogin.hidden = false;
      return;
    }
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    const datos = await respuesta.json();
    usuarioActual.textContent = "👤 " + datos.nombre;
    usuarioActual.hidden = false;
    btnSalir.hidden = false;
    enlaceAdmin.hidden = datos.rol !== "ADMIN";
  } catch (error) {
    enlaceLogin.hidden = false;
    console.error(error);
  }
}

btnSalir.addEventListener("click", async () => {
  try {
    await fetch(API_AUTH + "/logout", {
      method: "POST",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
  } catch (error) {
    console.error(error);
  }
  limpiarSesion();
  window.location.reload();
});

/* ---------- Carrito ---------- */

// El carrito se guarda como { idDelJuego: cantidad } en el navegador.
function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "{}");
    const limpio = {};
    Object.entries(guardado).forEach(([id, cantidad]) => {
      const n = Number(cantidad);
      if (Number.isInteger(n) && n > 0) limpio[id] = n;
    });
    return limpio;
  } catch (error) {
    return {};
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (error) {
    console.error(error);
  }
}

function juegoPorId(id) {
  return todosLosJuegos.find(j => String(j.id) === String(id));
}

function mostrarAviso(texto) {
  avisoCarrito.textContent = texto;
}

// Quita del carrito los juegos que ya no existen y ajusta las cantidades al stock.
function sincronizarCarrito() {
  let huboCambios = false;

  Object.keys(carrito).forEach(id => {
    const juego = juegoPorId(id);
    const stock = juego ? (juego.stock ?? 0) : 0;

    if (!juego || stock <= 0) {
      delete carrito[id];
      huboCambios = true;
    } else if (carrito[id] > stock) {
      carrito[id] = stock;
      huboCambios = true;
    }
  });

  if (huboCambios) {
    guardarCarrito();
    mostrarAviso("Actualizamos tu carrito según el stock disponible.");
  }
}

function totalUnidades() {
  return Object.values(carrito).reduce((suma, cantidad) => suma + cantidad, 0);
}

function totalPrecio() {
  return Object.entries(carrito).reduce((suma, [id, cantidad]) => {
    const juego = juegoPorId(id);
    return suma + (juego && juego.precio != null ? Number(juego.precio) * cantidad : 0);
  }, 0);
}

function agregarAlCarrito(juego, boton) {
  const stock = juego.stock ?? 0;
  const actual = carrito[juego.id] || 0;
  const textoOriginal = "🛒 Agregar al carrito";

  if (actual >= stock) {
    boton.textContent = "Ya tienes todo el stock";
    setTimeout(() => { boton.textContent = textoOriginal; }, 1500);
    return;
  }

  carrito[juego.id] = actual + 1;
  guardarCarrito();
  mostrarAviso("");
  renderCarrito();

  boton.textContent = "✓ Agregado";
  setTimeout(() => { boton.textContent = textoOriginal; }, 1000);
}

function cambiarCantidad(id, cambio) {
  const juego = juegoPorId(id);
  if (!juego) return;

  const nueva = (carrito[id] || 0) + cambio;

  if (nueva <= 0) {
    delete carrito[id];
    mostrarAviso("");
  } else if (nueva > (juego.stock ?? 0)) {
    mostrarAviso("No hay más unidades disponibles de " + juego.nombre + ".");
    return;
  } else {
    carrito[id] = nueva;
    mostrarAviso("");
  }

  guardarCarrito();
  renderCarrito();
}

function quitarDelCarrito(id) {
  delete carrito[id];
  guardarCarrito();
  mostrarAviso("");
  renderCarrito();
}

function crearMiniatura(juego) {
  const mini = document.createElement("div");
  mini.className = "carrito-mini";

  const mostrarRelleno = () => {
    mini.textContent = emojiDe(juego.genero);
  };

  if (!juego.imagen) {
    mostrarRelleno();
    return mini;
  }

  const img = document.createElement("img");
  img.alt = "";
  img.referrerPolicy = "no-referrer";
  img.addEventListener("error", () => {
    img.remove();
    mostrarRelleno();
  });
  img.src = juego.imagen;
  mini.append(img);

  return mini;
}

function crearBotonCantidad(texto, etiqueta, accion) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  boton.setAttribute("aria-label", etiqueta);
  boton.addEventListener("click", accion);
  return boton;
}

function renderCarrito() {
  const ids = Object.keys(carrito).filter(id => juegoPorId(id));

  contadorCarrito.textContent = totalUnidades();
  itemsCarrito.innerHTML = "";

  if (ids.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "Tu carrito está vacío. Agrega algún juego del catálogo.";
    itemsCarrito.append(vacio);
    totalCarrito.textContent = moneda.format(0);
    btnFinalizar.disabled = true;
    btnVaciar.disabled = true;
    return;
  }

  btnFinalizar.disabled = false;
  btnVaciar.disabled = false;

  ids.forEach(id => {
    const juego = juegoPorId(id);
    const cantidad = carrito[id];
    const precioUnitario = juego.precio == null ? 0 : Number(juego.precio);

    const fila = document.createElement("div");
    fila.className = "carrito-item";

    const info = document.createElement("div");
    info.className = "carrito-info";

    const nombre = document.createElement("strong");
    nombre.textContent = juego.nombre;

    const detalle = document.createElement("span");
    detalle.textContent = (juego.plataforma ? juego.plataforma + " · " : "") + moneda.format(precioUnitario);

    const controles = document.createElement("div");
    controles.className = "carrito-cantidad";

    const unidades = document.createElement("span");
    unidades.textContent = cantidad;

    controles.append(
      crearBotonCantidad("−", "Quitar una unidad de " + juego.nombre, () => cambiarCantidad(id, -1)),
      unidades,
      crearBotonCantidad("+", "Agregar una unidad de " + juego.nombre, () => cambiarCantidad(id, 1))
    );

    info.append(nombre, detalle, controles);

    const lateral = document.createElement("div");
    lateral.className = "carrito-lateral";

    const subtotal = document.createElement("strong");
    subtotal.textContent = moneda.format(precioUnitario * cantidad);

    const quitar = document.createElement("button");
    quitar.type = "button";
    quitar.className = "carrito-quitar";
    quitar.textContent = "Quitar";
    quitar.addEventListener("click", () => quitarDelCarrito(id));

    lateral.append(subtotal, quitar);

    fila.append(crearMiniatura(juego), info, lateral);
    itemsCarrito.append(fila);
  });

  totalCarrito.textContent = moneda.format(totalPrecio());
}

function abrirCarrito() {
  renderCarrito();
  panelCarrito.hidden = false;
  fondoCarrito.hidden = false;
}

function cerrarCarrito() {
  panelCarrito.hidden = true;
  fondoCarrito.hidden = true;
}

btnCarrito.addEventListener("click", abrirCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
fondoCarrito.addEventListener("click", cerrarCarrito);

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && !panelCarrito.hidden) cerrarCarrito();
});

btnVaciar.addEventListener("click", () => {
  if (!confirm("¿Vaciar el carrito?")) return;
  carrito = {};
  guardarCarrito();
  mostrarAviso("");
  renderCarrito();
});

btnFinalizar.addEventListener("click", () => {
  mostrarAviso("El pago llegará en la siguiente fase. Tu carrito se guarda mientras tanto.");
});

/* ---------- Catálogo ---------- */

function emojiDe(categoria) {
  return EMOJIS[normalizar(categoria)] || "🎮";
}

function llenarSelect(select, textoTodos, valores) {
  const seleccionado = select.value;
  const mapa = new Map();

  valores.forEach(valor => {
    const clave = normalizar(valor);
    if (clave && !mapa.has(clave)) mapa.set(clave, valor);
  });

  select.innerHTML = "";
  select.add(new Option(textoTodos, ""));

  [...mapa.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "es"))
    .forEach(([clave, nombre]) => select.add(new Option(nombre, clave)));

  select.value = mapa.has(seleccionado) ? seleccionado : "";
  return mapa.size;
}

function actualizarFiltros() {
  const categorias = llenarSelect(
    filtroCategoria, "Todas las categorías", todosLosJuegos.map(j => j.genero));
  const plataformas = llenarSelect(
    filtroPlataforma, "Todas las plataformas", todosLosJuegos.map(j => j.plataforma));

  statJuegos.textContent = todosLosJuegos.length;
  statCategorias.textContent = categorias;
  statPlataformas.textContent = plataformas;
}

function compararNumero(campo, direccion) {
  return (a, b) => {
    const x = a[campo] == null ? null : Number(a[campo]);
    const y = b[campo] == null ? null : Number(b[campo]);
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    return (x - y) * direccion;
  };
}

function ordenarJuegos(juegos) {
  const copia = [...juegos];

  switch (selectOrden.value) {
    case "precio-asc": return copia.sort(compararNumero("precio", 1));
    case "precio-desc": return copia.sort(compararNumero("precio", -1));
    case "nombre":
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
    case "puntuacion-desc": return copia.sort(compararNumero("puntuacion", -1));
    case "anio-desc": return copia.sort(compararNumero("anio", -1));
    case "reciente": return copia.sort((a, b) => b.id - a.id);
    default: return copia;
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
    contenedor.textContent = emojiDe(juego.genero);
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

  const titulo = document.createElement("h3");
  titulo.textContent = juego.nombre;
  encabezado.append(titulo);

  if (typeof juego.puntuacion === "number") {
    const nota = document.createElement("div");
    const nivel = juego.puntuacion >= 8 ? "alta" : juego.puntuacion >= 5 ? "media" : "baja";
    nota.className = "nota " + nivel;
    nota.textContent = juego.puntuacion;
    nota.title = "Puntuación: " + juego.puntuacion + "/10";
    encabezado.append(nota);
  }

  const etiqueta = document.createElement("span");
  etiqueta.className = "etiqueta";
  etiqueta.textContent = juego.genero;

  tarjeta.append(crearImagen(juego), encabezado, etiqueta);

  if (juego.plataforma || juego.anio) {
    const chips = document.createElement("div");
    chips.className = "chips";
    if (juego.plataforma) chips.append(crearChip("🕹️ " + juego.plataforma));
    if (juego.anio) chips.append(crearChip("📅 " + juego.anio));
    tarjeta.append(chips);
  }

  if (juego.descripcion) {
    const descripcion = document.createElement("p");
    descripcion.className = "descripcion";
    descripcion.textContent = juego.descripcion;
    tarjeta.append(descripcion);
  }

  const pie = document.createElement("div");
  pie.className = "pie-tarjeta";

  const precio = document.createElement("span");
  precio.className = "precio";
  precio.textContent = juego.precio == null ? "Sin precio" : moneda.format(juego.precio);

  const stock = document.createElement("span");
  const unidades = juego.stock ?? 0;
  if (unidades <= 0) {
    stock.className = "stock agotado";
    stock.textContent = "Agotado";
  } else if (unidades <= 5) {
    stock.className = "stock poco";
    stock.textContent = "Quedan " + unidades;
  } else {
    stock.className = "stock";
    stock.textContent = "Disponible";
  }

  pie.append(precio, stock);
  tarjeta.append(pie);

  const botonAgregar = document.createElement("button");
  botonAgregar.type = "button";
  botonAgregar.className = "boton-agregar";

  if (unidades <= 0 || juego.precio == null) {
    botonAgregar.textContent = unidades <= 0 ? "Agotado" : "No disponible";
    botonAgregar.disabled = true;
  } else {
    botonAgregar.textContent = "🛒 Agregar al carrito";
    botonAgregar.addEventListener("click", () => agregarAlCarrito(juego, botonAgregar));
  }

  tarjeta.append(botonAgregar);

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
  const categoria = filtroCategoria.value;
  const plataforma = filtroPlataforma.value;
  const soloStock = chkStock.checked;

  const filtrados = todosLosJuegos.filter(juego => {
    const coincideTexto =
      !texto ||
      normalizar(juego.nombre).includes(texto) ||
      normalizar(juego.genero).includes(texto) ||
      normalizar(juego.plataforma).includes(texto);
    const coincideCategoria = !categoria || normalizar(juego.genero) === categoria;
    const coincidePlataforma = !plataforma || normalizar(juego.plataforma) === plataforma;
    const coincideStock = !soloStock || (juego.stock ?? 0) > 0;
    return coincideTexto && coincideCategoria && coincidePlataforma && coincideStock;
  });

  lista.innerHTML = "";

  if (todosLosJuegos.length === 0) {
    contador.textContent = "";
    mostrarVacio("La tienda todavía no tiene juegos.");
    return;
  }

  contador.textContent =
    "Mostrando " + filtrados.length + " de " + todosLosJuegos.length + " juegos";

  if (filtrados.length === 0) {
    mostrarVacio("Ningún juego coincide con tu búsqueda.");
    return;
  }

  ordenarJuegos(filtrados).forEach(juego => lista.appendChild(crearTarjeta(juego)));
}

async function cargarJuegos() {
  try {
    const respuesta = await fetch(API_TIENDA);
    if (!respuesta.ok) throw new Error("Error " + respuesta.status);

    todosLosJuegos = await respuesta.json();
    sincronizarCarrito();
    actualizarFiltros();
    mostrarJuegos();
    renderCarrito();
  } catch (error) {
    contador.textContent = "";
    lista.innerHTML = "";
    mostrarVacio("No se pudo conectar con el backend. ¿Está corriendo?");
    console.error(error);
  }
}

buscador.addEventListener("input", mostrarJuegos);
filtroCategoria.addEventListener("change", mostrarJuegos);
filtroPlataforma.addEventListener("change", mostrarJuegos);
selectOrden.addEventListener("change", mostrarJuegos);
chkStock.addEventListener("change", mostrarJuegos);

btnLimpiar.addEventListener("click", () => {
  buscador.value = "";
  filtroCategoria.value = "";
  filtroPlataforma.value = "";
  selectOrden.value = "";
  chkStock.checked = false;
  mostrarJuegos();
});

mostrarSesion();
renderCarrito();
cargarJuegos();