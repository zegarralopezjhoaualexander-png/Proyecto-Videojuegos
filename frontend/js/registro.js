const API_AUTH = "http://localhost:8080/api/auth";
const EDAD_MINIMA = 13;
const EDAD_MAXIMA = 120;

if (localStorage.getItem("token")) {
  window.location.replace("index.html");
}

const formulario = document.getElementById("formRegistro");
const pasos = [...document.querySelectorAll(".paso")];
const tituloPaso = document.getElementById("tituloPaso");
const subtituloPaso = document.getElementById("subtituloPaso");
const indicadorPaso = document.getElementById("indicadorPaso");
const enlaceLogin = document.getElementById("enlaceLogin");
const btnAtras = document.getElementById("btnAtras");
const btnSiguiente = document.getElementById("btnSiguiente");
const errorGeneral = document.getElementById("errorGeneral");
const chkMostrar = document.getElementById("mostrar");
const barra = document.getElementById("barraFuerza");
const textoFuerza = document.getElementById("textoFuerza");

const campos = {
  nombre: document.getElementById("nombre"),
  apellido: document.getElementById("apellido"),
  fechaNacimiento: document.getElementById("fechaNacimiento"),
  correo: document.getElementById("correo"),
  contrasena: document.getElementById("contrasena"),
  confirmacion: document.getElementById("confirmacion")
};

const camposPorPaso = [
  ["nombre", "apellido"],
  ["fechaNacimiento", "correo"],
  ["contrasena", "confirmacion"]
];

const textosPaso = [
  ["Crea tu cuenta", "Escribe tu nombre"],
  ["Información básica", "Escribe tu fecha de nacimiento y tu correo"],
  ["Crea una contraseña segura", "Usa 12 caracteres o más, con mayúsculas, minúsculas, números y símbolos"]
];

const reglaNombre = /^[\p{L} .'-]+$/u;
const reglaCorreo = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

let pasoActual = 0;

// La fecha de nacimiento no puede ser posterior a hoy.
const ahora = new Date();
campos.fechaNacimiento.max = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);

function mostrarError(campo, texto) {
  document.getElementById("error-" + campo).textContent = texto;
  document.getElementById("campo-" + campo).classList.toggle("con-error", Boolean(texto));
  campos[campo].setAttribute("aria-invalid", texto ? "true" : "false");
}

function calcularEdad(iso) {
  const partes = iso.split("-").map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return null;

  const [anio, mes, dia] = partes;
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;
  const todaviaNoCumple =
    hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia);
  if (todaviaNoCumple) edad--;
  return edad;
}

function evaluarContrasena(valor) {
  const requisitos = {
    longitud: valor.length >= 12,
    mayuscula: /\p{Lu}/u.test(valor),
    minuscula: /\p{Ll}/u.test(valor),
    numero: /\d/.test(valor),
    simbolo: /[^\p{L}\d\s]/u.test(valor)
  };
  const cumplidos = Object.values(requisitos).filter(Boolean).length;
  return { requisitos, cumplidos, cumpleTodo: cumplidos === 5 };
}

function actualizarMedidor() {
  const valor = campos.contrasena.value;
  const { requisitos, cumplidos } = evaluarContrasena(valor);

  Object.entries(requisitos).forEach(([clave, cumple]) => {
    document.getElementById("req-" + clave).classList.toggle("ok", cumple);
  });

  let nivel = 0;
  let texto = "";

  if (valor.length > 0) {
    if (cumplidos <= 2) { nivel = 1; texto = "Muy débil"; }
    else if (cumplidos === 3) { nivel = 2; texto = "Débil"; }
    else if (cumplidos === 4) { nivel = 3; texto = "Casi lista"; }
    else if (valor.length >= 16) { nivel = 5; texto = "Muy fuerte"; }
    else { nivel = 4; texto = "Fuerte"; }
  }

  barra.style.width = nivel * 20 + "%";
  barra.dataset.nivel = nivel;
  textoFuerza.textContent = texto ? "Seguridad de la contraseña: " + texto : "";
}

function validar(campo) {
  const valor = campos[campo].value;
  let error = "";

  switch (campo) {
    case "nombre":
    case "apellido": {
      const texto = valor.trim();
      if (!texto) error = campo === "nombre" ? "Escribe tu nombre" : "Escribe tu apellido";
      else if (texto.length > 50) error = "No puede superar los 50 caracteres";
      else if (!reglaNombre.test(texto)) error = "Usa solo letras, espacios, punto, guion o apóstrofo";
      break;
    }
    case "fechaNacimiento": {
      if (!valor) {
        error = "Escribe tu fecha de nacimiento";
      } else {
        const edad = calcularEdad(valor);
        if (edad === null || edad < 0 || edad > EDAD_MAXIMA) error = "Escribe una fecha válida";
        else if (edad < EDAD_MINIMA) error = "Debes tener al menos " + EDAD_MINIMA + " años";
      }
      break;
    }
    case "correo": {
      const texto = valor.trim();
      if (!texto) error = "Escribe tu correo electrónico";
      else if (!reglaCorreo.test(texto)) error = "Escribe un correo electrónico válido";
      break;
    }
    case "contrasena": {
      if (!valor) error = "Escribe una contraseña";
      else if (!evaluarContrasena(valor).cumpleTodo) error = "La contraseña no cumple todos los requisitos";
      break;
    }
    case "confirmacion": {
      if (!valor) error = "Confirma tu contraseña";
      else if (valor !== campos.contrasena.value) error = "Las contraseñas no coinciden";
      break;
    }
  }

  mostrarError(campo, error);
  return error === "";
}

function validarPaso(indice) {
  // map evalúa todos los campos para mostrar todos los errores a la vez.
  return camposPorPaso[indice].map(validar).every(Boolean);
}

function irAlPaso(indice) {
  pasoActual = indice;
  errorGeneral.textContent = "";

  pasos.forEach((paso, i) => { paso.hidden = i !== indice; });

  tituloPaso.textContent = textosPaso[indice][0];
  subtituloPaso.textContent = textosPaso[indice][1];
  indicadorPaso.textContent = "Paso " + (indice + 1) + " de " + pasos.length;

  enlaceLogin.hidden = indice !== 0;
  btnAtras.hidden = indice === 0;
  btnSiguiente.textContent = indice === pasos.length - 1 ? "Crear cuenta" : "Siguiente";

  campos[camposPorPaso[indice][0]].focus();
}

function enfocarPrimerError() {
  const primero = camposPorPaso[pasoActual].find(
    campo => document.getElementById("campo-" + campo).classList.contains("con-error")
  );
  if (primero) campos[primero].focus();
}

Object.keys(campos).forEach(campo => {
  campos[campo].addEventListener("blur", () => {
    if (campos[campo].value) validar(campo);
  });

  campos[campo].addEventListener("input", () => {
    const tieneError = document.getElementById("campo-" + campo).classList.contains("con-error");
    if (tieneError) validar(campo);

    if (campo === "contrasena") {
      actualizarMedidor();
      if (campos.confirmacion.value) validar("confirmacion");
    }
  });
});

chkMostrar.addEventListener("change", () => {
  const tipo = chkMostrar.checked ? "text" : "password";
  campos.contrasena.type = tipo;
  campos.confirmacion.type = tipo;
});

btnAtras.addEventListener("click", () => irAlPaso(pasoActual - 1));

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!validarPaso(pasoActual)) {
    enfocarPrimerError();
    return;
  }

  if (pasoActual < pasos.length - 1) {
    irAlPaso(pasoActual + 1);
    return;
  }

  for (let i = 0; i < pasos.length; i++) {
    if (!validarPaso(i)) {
      irAlPaso(i);
      enfocarPrimerError();
      return;
    }
  }

  const datos = {
    nombre: campos.nombre.value.trim(),
    apellido: campos.apellido.value.trim(),
    fechaNacimiento: campos.fechaNacimiento.value,
    correo: campos.correo.value.trim(),
    contrasena: campos.contrasena.value,
    confirmacion: campos.confirmacion.value
  };

  btnSiguiente.disabled = true;

  try {
    const respuesta = await fetch(API_AUTH + "/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const cuerpo = await respuesta.json().catch(() => ({}));

    if (respuesta.status === 409) {
      irAlPaso(1);
      mostrarError("correo", cuerpo.mensaje || "Ese correo ya está en uso");
      campos.correo.focus();
      return;
    }

    if (!respuesta.ok) {
      errorGeneral.textContent = cuerpo.mensaje || "No se pudo crear la cuenta.";
      return;
    }

    localStorage.setItem("token", cuerpo.token);
    localStorage.setItem("usuario", cuerpo.nombre);
    window.location.replace("index.html");
  } catch (error) {
    errorGeneral.textContent = "No se pudo conectar con el backend. ¿Está corriendo?";
    console.error(error);
  } finally {
    btnSiguiente.disabled = false;
  }
});

irAlPaso(0);