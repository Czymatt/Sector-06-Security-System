
let segundosRestantes = 180;
let intervalo = null;

const temporizador = document.getElementById("temporizador");
const mensaje = document.getElementById("mensaje");
const btnIniciar = document.getElementById("btnIniciar");
const btnReiniciar = document.getElementById("btnReiniciar");

function mostrarTiempo() {
  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;

  temporizador.textContent =
    String(minutos).padStart(2, "0") + ":" +
    String(segundos).padStart(2, "0");
}

btnIniciar.addEventListener("click", function () {
  btnIniciar.disabled = true;
  mensaje.textContent = "Desafío en curso...";
  mensaje.className = "alert alert-info";

  intervalo = setInterval(function () {
    segundosRestantes--;
    mostrarTiempo();

    if (segundosRestantes === 0) {
      clearInterval(intervalo);
      intervalo = null;

      mensaje.textContent = "SYSTEM BREACHED — YOU HAVE BEEN HACKED";
      mensaje.className = "alert alert-danger";
    }
  }, 1000);
});

btnReiniciar.addEventListener("click", function () {
  clearInterval(intervalo);
  intervalo = null;

  segundosRestantes = 180;
  mostrarTiempo();

  mensaje.textContent = "Presioná INICIAR para comenzar";
  mensaje.className = "alert alert-secondary";
  btnIniciar.disabled = false;
});