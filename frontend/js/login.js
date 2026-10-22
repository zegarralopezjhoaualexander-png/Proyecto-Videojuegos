const API_AUTH = "http://localhost:8080/api/auth";

if (localStorage.getItem("token")) {
  window.location.replace("index.html");
}

const formulario = document.getElementById("formLogin");
const paso1 = document.getElementById("paso1");
const paso2 = document.getElementById("paso2");
const titulo = document.getElementById("titulo");
const subtitulo = document.getElementById("subtitulo");
const inputId = document.getElementById("identificador");
const inputClave = document.getElementById("contrasena");
const chipTexto = document.getElementById("chipTexto");
const avatar = document.getElementById("avatar");
const btnAtras = document.getElementById("btnAtras");
const btnSiguiente = document.getElementById("btnSiguiente");
const chkMostrar = document.getElementById("mostrar");
const errorGeneral = document.getElementById("errorGeneral");

let paso = 1;

function mostrarError(campo, texto) {
  document.getElementById("error-" + campo).textContent = texto;
  document.getElementById("campo-" + campo).classList.toggle("con-error", Boolean(texto));
}

function limpiarErrores() {
  mostrarError("identificador", "");
  mostrarError("contrasena", "");
  errorGeneral.textContent = "";
}

function irAlPaso(numero) {
  paso = numero;
  limpiarErrores();

  paso1.hidden = numero !== 1;
  paso2.hidden = numero !== 2;

  if (numero === 1) {
    titulo.textContent = "Iniciar sesión";
    subtitulo.textContent = "Ir a Proyecto Videojuegos";
    btnSiguiente.textContent = "Siguiente";
    inputClave.value = "";
    chkMostrar.checked = false;
    inputClave.type = "password";
    inputId.focus();
  } else {
    titulo.textContent = "Te damos la bienvenida";
    subtitulo.textContent = "";
    btnSiguiente.textContent = "Iniciar sesión";
    const identificador = inputId.value.trim();
    chipTexto.textContent = identificador;
    avatar.textContent = identificador.charAt(0).toUpperCase();
    inputClave.focus();
  }
}

btnAtras.addEventListener("click", () => irAlPaso(1));

chkMostrar.addEventListener("change", () => {
  inputClave.type = chkMostrar.checked ? "text" : "password";
});

inputId.addEventListener("input", () => mostrarError("identificador", ""));
inputClave.addEventListener("input", () => mostrarError("contrasena", ""));

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  limpiarErrores();

  if (paso === 1) {
    if (!inputId.value.trim()) {
      mostrarError("identificador", "Escribe tu correo electrónico o usuario");
      inputId.focus();
      return;
    }
    irAlPaso(2);
    return;
  }

  if (!inputClave.value) {
    mostrarError("contrasena", "Escribe tu contraseña");
    inputClave.focus();
    return;
  }

  btnSiguiente.disabled = true;

  try {
    const respuesta = await fetch(API_AUTH + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identificador: inputId.value.trim(),
        contrasena: inputClave.value
      })
    });

    const cuerpo = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      mostrarError("contrasena", cuerpo.mensaje || "No se pudo iniciar sesión.");
      inputClave.focus();
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