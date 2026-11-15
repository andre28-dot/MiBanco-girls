// ===== Panel del cliente: su cuenta, depósitos, retiros, movimientos y resumen =====
import { FiltroTipo, Movimiento, ResultadoOperacion } from "../types/tipos.js";
import { sesion } from "../services/estado.js";
import { consultarMiCuenta } from "../functions/consultaCuentas.js";
import { filtrarMovimientosPorTipo, obtenerMovimientosDeCuenta } from "../functions/historial.js";
import { calcularResumen } from "../functions/resumen.js";
import { depositar } from "../functions/depositos.js";
import { retirar } from "../functions/retiros.js";
import {
  crearCelda, cuerpoDeTabla, dinero, el, etiquetaEstado, etiquetaTipo, leerFiltroTipo,
  marcarFiltroActivo, mostrarAviso, obtenerEntrada, obtenerFormulario, textoANumero,
} from "./utilidades.js";

// Filtro que está seleccionado en la tabla de movimientos
let filtroTipoActual: FiltroTipo = "todos";

// ---------- Tablas ----------

// Crea UNA fila (<tr>) para un movimiento: ID, tipo, monto y fecha.
function crearFilaMovimiento(movimiento: Movimiento): HTMLTableRowElement {
  const fila = document.createElement("tr");

  // El monto lleva "+" y color verde si es depósito; "−" y color rojo si es retiro
  let signo = "−";
  let claseMonto = "monto-retiro";
  if (movimiento.tipo === "deposito") {
    signo = "+";
    claseMonto = "monto-deposito";
  }

  const celdaId = crearCelda(String(movimiento.id));
  const celdaTipo = document.createElement("td");
  celdaTipo.innerHTML = etiquetaTipo(movimiento.tipo); // etiquetaTipo devuelve el <span> de color
  const celdaMonto = crearCelda(signo + dinero(movimiento.monto), claseMonto);
  const celdaFecha = crearCelda(movimiento.fecha);

  fila.append(celdaId, celdaTipo, celdaMonto, celdaFecha);
  return fila;
}

// Llena el <tbody> de una tabla con los movimientos de la lista.
// La lista está ordenada del más antiguo al más reciente; se recorre de atrás hacia
// adelante para que el movimiento más reciente aparezca primero en la tabla.
function llenarTablaMovimientos(idTabla: string, lista: Movimiento[]): void {
  const cuerpo = cuerpoDeTabla(idTabla);
  cuerpo.innerHTML = ""; // borra las filas anteriores antes de volver a dibujar

  for (let i = lista.length - 1; i >= 0; i--) {
    cuerpo.appendChild(crearFilaMovimiento(lista[i]));
  }
}

// ---------- Dibujar el panel ----------

// Vuelve a dibujar todo lo del cliente con los datos actuales.
export function dibujarPanelCliente(): void {
  const cuenta = consultarMiCuenta();
  if (cuenta === undefined) {
    return; // no hay cliente con sesión abierta
  }

  // Datos de la cuenta y saldos
  el("dd-titular").textContent = cuenta.titular;
  el("dd-id").textContent = String(cuenta.id);
  el("dd-estado").innerHTML = etiquetaEstado(cuenta.estado);
  el("dd-saldo").textContent = dinero(cuenta.saldo);
  el("saldo-deposito").textContent = dinero(cuenta.saldo);
  el("saldo-retiro").textContent = dinero(cuenta.saldo);

  // Tabla "Últimos movimientos": solo los 5 más recientes
  const todos = obtenerMovimientosDeCuenta(cuenta.id);
  const ultimosCinco = todos.slice(-5);
  llenarTablaMovimientos("tabla-ultimos", ultimosCinco);
  el("vacio-ultimos").hidden = todos.length > 0;

  // Tabla "Movimientos": aplica el filtro elegido (Todos / Depósitos / Retiros)
  const visibles = filtrarMovimientosPorTipo(todos, filtroTipoActual);
  llenarTablaMovimientos("tabla-movimientos", visibles);

  // Mensaje cuando la tabla queda vacía (hay dos casos distintos)
  const mensajeVacio = el("vacio-movimientos");
  mensajeVacio.hidden = visibles.length > 0;
  if (todos.length === 0) {
    mensajeVacio.textContent = "Todavía no tiene movimientos en esta sesión.";
  } else {
    mensajeVacio.textContent = "No hay resultados para el tipo de movimiento seleccionado.";
  }
  marcarFiltroActivo("filtros-cliente", filtroTipoActual);

  // Resumen: los totales se calculan con el historial real
  const resumen = calcularResumen(cuenta.id);
  el("res-depositado").textContent = dinero(resumen.totalDepositado);
  el("res-retirado").textContent = dinero(resumen.totalRetirado);
  el("res-cantidad").textContent = String(todos.length);
  el("res-saldo").textContent = dinero(cuenta.saldo);
}

// ---------- Eventos ----------

// Se ejecuta cuando el cliente envía el formulario de DEPÓSITO.
function alEnviarDeposito(evento: Event): void {
  evento.preventDefault(); // evita que el formulario recargue la página

  // El cliente no escribe su ID: se usa el de la sesión abierta
  if (sesion.cuentaId === null) {
    mostrarAviso("Inicie sesión para operar.", false);
    return;
  }

  const campoMonto = obtenerEntrada("monto-deposito");
  const monto = textoANumero(campoMonto.value);
  const resultado = depositar(sesion.cuentaId, monto);
  terminarOperacion(resultado, campoMonto);
}

// Se ejecuta cuando el cliente envía el formulario de RETIRO.
function alEnviarRetiro(evento: Event): void {
  evento.preventDefault();

  if (sesion.cuentaId === null) {
    mostrarAviso("Inicie sesión para operar.", false);
    return;
  }

  const campoMonto = obtenerEntrada("monto-retiro");
  const monto = textoANumero(campoMonto.value);
  const resultado = retirar(sesion.cuentaId, monto);
  terminarOperacion(resultado, campoMonto);
}

// Parte final igual para depósitos y retiros: avisar, limpiar el campo y redibujar.
function terminarOperacion(resultado: ResultadoOperacion, campoMonto: HTMLInputElement): void {
  mostrarAviso(resultado.mensaje, resultado.exito);
  if (resultado.exito) {
    campoMonto.value = "";
  }
  dibujarPanelCliente();
}

// Se ejecuta cuando se pulsa uno de los botones Todos / Depósitos / Retiros.
// Cada botón del HTML trae su valor en el atributo data-tipo (todos, deposito o retiro).
function alPulsarFiltro(boton: HTMLElement): void {
  const filtro = leerFiltroTipo(boton.dataset.tipo);
  if (filtro === null) {
    return; // el botón no tiene un valor válido
  }
  filtroTipoActual = filtro;
  dibujarPanelCliente();
}

// Conecta cada elemento con su evento. Se llama una sola vez al iniciar la aplicación.
export function configurarPanelCliente(): void {
  // Formularios: evento "submit" (al pulsar el botón o la tecla Enter)
  el("form-depositar").addEventListener("submit", alEnviarDeposito);
  el("form-retirar").addEventListener("submit", alEnviarRetiro);

  // Botones de filtro: evento "click". Se recorre cada botón del grupo
  // y cada uno llama a alPulsarFiltro enviándose a sí mismo.
  const botonesFiltro = el("filtros-cliente").querySelectorAll<HTMLElement>("button");
  for (const boton of botonesFiltro) {
    boton.addEventListener("click", function () {
      alPulsarFiltro(boton);
    });
  }
}

// ---------- Limpiar ----------

// Borra de la pantalla toda la información del cliente (se usa al cerrar sesión).
export function limpiarPanelCliente(): void {
  filtroTipoActual = "todos";

  const idsDeTextos = [
    "dd-titular", "dd-id", "dd-estado", "dd-saldo", "saldo-deposito", "saldo-retiro",
    "res-depositado", "res-retirado", "res-cantidad", "res-saldo",
  ];
  for (const id of idsDeTextos) {
    el(id).textContent = "";
  }

  cuerpoDeTabla("tabla-ultimos").innerHTML = "";
  cuerpoDeTabla("tabla-movimientos").innerHTML = "";
  obtenerFormulario("form-depositar").reset();
  obtenerFormulario("form-retirar").reset();
  marcarFiltroActivo("filtros-cliente", "todos");
}
