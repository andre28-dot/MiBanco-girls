// ===== Panel del administrador: cuentas, registro, historial general y totales =====
import { Cuenta, EstadoCuenta, FiltroTipo, Movimiento, ResultadoOperacion } from "../types/tipos.js";
import { buscarCuentaPorId, obtenerCuentas } from "../functions/consultaCuentas.js";
import { buscarCuentas, filtrarCuentasPorEstado } from "../functions/busquedasFiltros.js";
import { filtrarMovimientosPorTipo, obtenerTodosLosMovimientos } from "../functions/historial.js";
import { calcularResumenGeneral } from "../functions/resumen.js";
import { cambiarEstadoCuenta, modificarCuenta, registrarCuenta } from "../functions/administracion.js";
import { mostrarSeccion } from "./navegacion.js";
import {
  crearCelda, cuerpoDeTabla, dinero, el, etiquetaEstado, etiquetaTipo, leerFiltroEstado,
  leerFiltroTipo, marcarFiltroActivo, mostrarAviso, obtenerEntrada, obtenerFormulario,
  obtenerSelect, textoANumero,
} from "./utilidades.js";

// Filtro seleccionado en la tabla del historial general
let filtroTipoActual: FiltroTipo = "todos";

// ---------- Tabla de cuentas ----------

// Crea una fila (<tr>) para una cuenta, con sus botones "Editar" y "Activar/Desactivar".
function crearFilaCuenta(cuenta: Cuenta): HTMLTableRowElement {
  const fila = document.createElement("tr");

  // Celdas con datos (textContent: el nombre se muestra como texto, nunca como HTML)
  const celdaId = crearCelda(String(cuenta.id));
  const celdaTitular = crearCelda(cuenta.titular);
  const celdaEstado = document.createElement("td");
  celdaEstado.innerHTML = etiquetaEstado(cuenta.estado); // devuelve el <span> de color
  const celdaSaldo = crearCelda(dinero(cuenta.saldo));

  // Botón "Editar": al hacer clic se llama a entrarModoEdicion enviándole ESTA cuenta
  const botonEditar = document.createElement("button");
  botonEditar.type = "button";
  botonEditar.className = "btn-editar";
  botonEditar.textContent = "Editar";
  botonEditar.addEventListener("click", function () {
    entrarModoEdicion(cuenta);
  });

  // Botón de estado: dice "Desactivar" si la cuenta está activa y "Activar" si no
  const botonEstado = document.createElement("button");
  botonEstado.type = "button";
  botonEstado.className = "btn-estado";
  if (cuenta.estado === "activa") {
    botonEstado.textContent = "Desactivar";
  } else {
    botonEstado.textContent = "Activar";
  }
  botonEstado.addEventListener("click", function () {
    alPulsarCambiarEstado(cuenta);
  });

  // Celda de acciones con los dos botones (el " " deja un espacio entre ellos)
  const celdaAcciones = document.createElement("td");
  celdaAcciones.className = "acciones";
  celdaAcciones.append(botonEditar, " ", botonEstado);

  fila.append(celdaId, celdaTitular, celdaEstado, celdaSaldo, celdaAcciones);
  return fila;
}

// Dibuja la tabla de cuentas aplicando la búsqueda y el filtro de estado.
function dibujarCuentas(): void {
  const textoBuscado = obtenerEntrada("buscar-cuenta").value;
  const estadoElegido = obtenerSelect("filtro-estado").value;
  const filtroEstado = leerFiltroEstado(estadoElegido);

  // Primero se busca por nombre o ID y después se filtra por estado
  const encontradas = buscarCuentas(obtenerCuentas(), textoBuscado);
  const visibles = filtrarCuentasPorEstado(encontradas, filtroEstado);

  const cuerpo = cuerpoDeTabla("tabla-cuentas");
  cuerpo.innerHTML = ""; // borra las filas anteriores
  for (const cuenta of visibles) {
    cuerpo.appendChild(crearFilaCuenta(cuenta));
  }

  // Si no hay resultados se muestra el mensaje
  el("vacio-cuentas").hidden = visibles.length > 0;
}

// ---------- Tabla del historial general ----------

function crearFilaHistorial(movimiento: Movimiento): HTMLTableRowElement {
  const fila = document.createElement("tr");

  // El titular se busca con el ID de cuenta del movimiento
  let nombreTitular = "—";
  const cuenta = buscarCuentaPorId(movimiento.cuentaId);
  if (cuenta !== undefined) {
    nombreTitular = cuenta.titular;
  }

  let signo = "−";
  let claseMonto = "monto-retiro";
  if (movimiento.tipo === "deposito") {
    signo = "+";
    claseMonto = "monto-deposito";
  }

  const celdaId = crearCelda(String(movimiento.id));
  const celdaCuenta = crearCelda(String(movimiento.cuentaId));
  const celdaTitular = crearCelda(nombreTitular);
  const celdaTipo = document.createElement("td");
  celdaTipo.innerHTML = etiquetaTipo(movimiento.tipo);
  const celdaMonto = crearCelda(signo + dinero(movimiento.monto), claseMonto);
  const celdaFecha = crearCelda(movimiento.fecha);

  fila.append(celdaId, celdaCuenta, celdaTitular, celdaTipo, celdaMonto, celdaFecha);
  return fila;
}

function dibujarHistorial(): void {
  const todos = obtenerTodosLosMovimientos();
  const visibles = filtrarMovimientosPorTipo(todos, filtroTipoActual);

  // Se recorre de atrás hacia adelante para mostrar primero el movimiento más reciente
  const cuerpo = cuerpoDeTabla("tabla-historial");
  cuerpo.innerHTML = "";
  for (let i = visibles.length - 1; i >= 0; i--) {
    cuerpo.appendChild(crearFilaHistorial(visibles[i]));
  }

  const mensajeVacio = el("vacio-historial");
  mensajeVacio.hidden = visibles.length > 0;
  if (todos.length === 0) {
    mensajeVacio.textContent = "Todavía no hay movimientos registrados en esta sesión.";
  } else {
    mensajeVacio.textContent = "No hay resultados para el tipo de movimiento seleccionado.";
  }
  marcarFiltroActivo("filtros-admin", filtroTipoActual);
}

// ---------- Totales ----------

// Cuenta cuántas cuentas de la lista tienen el estado indicado.
function contarCuentasPorEstado(lista: Cuenta[], estado: EstadoCuenta): number {
  let cantidad = 0;
  for (const cuenta of lista) {
    if (cuenta.estado === estado) {
      cantidad++;
    }
  }
  return cantidad;
}

function dibujarTotales(): void {
  const cuentas = obtenerCuentas();
  const resumen = calcularResumenGeneral();

  el("total-cuentas").textContent = String(cuentas.length);
  el("total-activas").textContent = String(contarCuentasPorEstado(cuentas, "activa"));
  el("total-inactivas").textContent = String(contarCuentasPorEstado(cuentas, "inactiva"));
  el("total-depositado").textContent = dinero(resumen.totalDepositado);
  el("total-retirado").textContent = dinero(resumen.totalRetirado);
  el("total-movimientos").textContent = String(obtenerTodosLosMovimientos().length);
}

// Vuelve a dibujar todo el panel del administrador.
export function dibujarPanelAdmin(): void {
  dibujarCuentas();
  dibujarHistorial();
  dibujarTotales();
}

// ---------- Formulario: registrar o modificar ----------

// Deja el formulario listo para REGISTRAR una cuenta nueva.
function salirModoEdicion(): void {
  obtenerFormulario("form-cuenta").reset();
  obtenerEntrada("cuenta-editando").value = ""; // campo oculto: vacío = cuenta nueva
  obtenerEntrada("cuenta-saldo").disabled = false;
  obtenerSelect("cuenta-estado").disabled = false;
  el("titulo-formulario").textContent = "Registrar nueva cuenta";
}

// Carga los datos de una cuenta en el formulario para MODIFICARLA.
// Solo se pueden cambiar titular y PIN; el saldo y el estado se muestran bloqueados.
function entrarModoEdicion(cuenta: Cuenta): void {
  obtenerEntrada("cuenta-editando").value = String(cuenta.id); // campo oculto: guarda qué cuenta se edita
  obtenerEntrada("cuenta-titular").value = cuenta.titular;
  obtenerEntrada("cuenta-pin").value = "";
  obtenerEntrada("cuenta-pin").placeholder = "Vacío = conservar el PIN actual";
  obtenerEntrada("cuenta-saldo").value = cuenta.saldo.toFixed(2);
  obtenerEntrada("cuenta-saldo").disabled = true;
  obtenerSelect("cuenta-estado").value = cuenta.estado;
  obtenerSelect("cuenta-estado").disabled = true;
  el("titulo-formulario").textContent = `Modificar cuenta ${cuenta.id}`;
  mostrarSeccion("sec-admin-formulario");
}

// ---------- Eventos ----------

// Botón "Activar / Desactivar" de una fila: cambia al estado contrario.
function alPulsarCambiarEstado(cuenta: Cuenta): void {
  let nuevoEstado: EstadoCuenta = "activa";
  if (cuenta.estado === "activa") {
    nuevoEstado = "inactiva";
  }

  const resultado = cambiarEstadoCuenta(cuenta.id, nuevoEstado);
  mostrarAviso(resultado.mensaje, resultado.exito);
  dibujarPanelAdmin();
}

// Botón "Guardar" del formulario: registra una cuenta nueva o modifica una existente.
function alEnviarFormularioCuenta(evento: Event): void {
  evento.preventDefault(); // evita que el formulario recargue la página

  const idEnEdicion = obtenerEntrada("cuenta-editando").value;
  const titular = obtenerEntrada("cuenta-titular").value;
  const pin = obtenerEntrada("cuenta-pin").value;

  let resultado: ResultadoOperacion;
  if (idEnEdicion === "") {
    // Campo oculto vacío: es una cuenta nueva
    const saldoInicial = textoANumero(obtenerEntrada("cuenta-saldo").value);
    let estado: EstadoCuenta = "activa";
    if (obtenerSelect("cuenta-estado").value === "inactiva") {
      estado = "inactiva";
    }
    resultado = registrarCuenta(titular, pin, saldoInicial, estado);
  } else {
    // El campo oculto tiene un ID: se está modificando esa cuenta
    resultado = modificarCuenta(Number(idEnEdicion), titular, pin);
  }

  mostrarAviso(resultado.mensaje, resultado.exito);
  if (resultado.exito) {
    salirModoEdicion();
    dibujarPanelAdmin();
    mostrarSeccion("sec-admin-cuentas");
  }
}

// Botón "Cancelar" del formulario.
function alPulsarCancelar(): void {
  salirModoEdicion();
  mostrarSeccion("sec-admin-cuentas");
}

// Evita que la tecla Enter recargue la página en el formulario de búsqueda.
function evitarEnvio(evento: Event): void {
  evento.preventDefault();
}

// Botones Todos / Depósitos / Retiros del historial general.
// Cada botón del HTML trae su valor en el atributo data-tipo.
function alPulsarFiltro(boton: HTMLElement): void {
  const filtro = leerFiltroTipo(boton.dataset.tipo);
  if (filtro === null) {
    return;
  }
  filtroTipoActual = filtro;
  dibujarHistorial();
}

// Conecta cada elemento con su evento. Se llama una sola vez al iniciar la aplicación.
export function configurarPanelAdmin(): void {
  // Búsqueda y filtro de la tabla de cuentas
  el("form-buscar").addEventListener("submit", evitarEnvio);
  el("buscar-cuenta").addEventListener("input", dibujarCuentas);   // cada letra escrita
  el("filtro-estado").addEventListener("change", dibujarCuentas);  // al cambiar la opción

  // Formulario de registro / modificación
  el("form-cuenta").addEventListener("submit", alEnviarFormularioCuenta);
  el("boton-cancelar").addEventListener("click", alPulsarCancelar);

  // Botones de filtro del historial (uno por uno)
  const botonesFiltro = el("filtros-admin").querySelectorAll<HTMLElement>("button");
  for (const boton of botonesFiltro) {
    boton.addEventListener("click", function () {
      alPulsarFiltro(boton);
    });
  }

  // Los botones "Editar" y "Activar/Desactivar" de cada fila se conectan
  // en crearFilaCuenta, justo cuando se crean.
}

// ---------- Limpiar ----------

// Borra de la pantalla la información administrativa (se usa al cerrar sesión).
export function limpiarPanelAdmin(): void {
  filtroTipoActual = "todos";

  cuerpoDeTabla("tabla-cuentas").innerHTML = "";
  cuerpoDeTabla("tabla-historial").innerHTML = "";

  const idsDeTotales = [
    "total-cuentas", "total-activas", "total-inactivas",
    "total-depositado", "total-retirado", "total-movimientos",
  ];
  for (const id of idsDeTotales) {
    el(id).textContent = "";
  }

  obtenerEntrada("buscar-cuenta").value = "";
  obtenerSelect("filtro-estado").value = "todas";
  salirModoEdicion();
  marcarFiltroActivo("filtros-admin", "todos");
}
