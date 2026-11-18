// ===== Panel del cliente: su cuenta, depósitos, retiros, movimientos y resumen =====

// Importa los tipos que se utilizan para los filtros, movimientos y resultados de las operaciones.
import { FiltroTipo, Movimiento, ResultadoOperacion } from "../types/tipos.js";

// Importa la información de la sesión actual del usuario.
import { sesion } from "../services/estado.js";

// Importa la función que permite consultar los datos de la cuenta del cliente que inició sesión.
import { consultarMiCuenta } from "../functions/consultaCuentas.js";

// Importa las funciones para obtener los movimientos de una cuenta y filtrarlos por tipo.
import { filtrarMovimientosPorTipo, obtenerMovimientosDeCuenta } from "../functions/historial.js";

// Importa la función que calcula el resumen de depósitos y retiros de una cuenta.
import { calcularResumen } from "../functions/resumen.js";

// Importa la función que permite realizar depósitos.
import { depositar } from "../functions/depositos.js";

// Importa la función que permite realizar retiros.
import { retirar } from "../functions/retiros.js";

// Importa diferentes funciones que ayudan a manejar los elementos del HTML.
import {
  crearCelda, cuerpoDeTabla, dinero, el, etiquetaEstado, etiquetaTipo, leerFiltroTipo,
  marcarFiltroActivo, mostrarAviso, obtenerEntrada, obtenerFormulario, textoANumero,
} from "./utilidades.js";

// Filtro que está seleccionado en la tabla de movimientos
// Guarda el filtro que el cliente tiene seleccionado actualmente.
let filtroTipoActual: FiltroTipo = "todos";

// ---------- Tablas ----------

// Crea UNA fila (<tr>) para un movimiento: ID, tipo, monto y fecha.
// Recibe un movimiento y devuelve una fila con su información.
function crearFilaMovimiento(movimiento: Movimiento): HTMLTableRowElement {
  // Crea una nueva fila para colocar los datos del movimiento.
  const fila = document.createElement("tr");

  // El monto lleva "+" y color verde si es depósito; "−" y color rojo si es retiro
  // Establece el signo negativo como valor inicial.
  let signo = "−";

  // Asigna inicialmente la clase que identifica los retiros.
  let claseMonto = "monto-retiro";

  // Comprueba si el movimiento que se está mostrando es un depósito.
  if (movimiento.tipo === "deposito") {
    // Cambia el signo a positivo porque el dinero ingresó a la cuenta.
    signo = "+";

    // Asigna la clase que identifica visualmente los depósitos.
    claseMonto = "monto-deposito";
  }

  // Crea una celda con el identificador del movimiento.
  const celdaId = crearCelda(String(movimiento.id));

  // Crea una celda donde se mostrará si fue depósito o retiro.
  const celdaTipo = document.createElement("td");

  // Coloca la etiqueta correspondiente al tipo de movimiento.
  celdaTipo.innerHTML = etiquetaTipo(movimiento.tipo); // etiquetaTipo devuelve el <span> de color

  // Crea una celda con el signo, el monto y la clase que corresponde.
  const celdaMonto = crearCelda(signo + dinero(movimiento.monto), claseMonto);

  // Crea una celda para mostrar la fecha del movimiento.
  const celdaFecha = crearCelda(movimiento.fecha);

  // Agrega todas las celdas a la fila de la tabla.
  fila.append(celdaId, celdaTipo, celdaMonto, celdaFecha);

  // Devuelve la fila completa para agregarla a la tabla.
  return fila;
}

// Llena el <tbody> de una tabla con los movimientos de la lista.
// La lista está ordenada del más antiguo al más reciente; se recorre de atrás hacia
// adelante para que el movimiento más reciente aparezca primero en la tabla.
// Recibe el identificador de la tabla y la lista de movimientos que se mostrarán.
function llenarTablaMovimientos(idTabla: string, lista: Movimiento[]): void {
  // Obtiene el cuerpo de la tabla donde se colocarán los movimientos.
  const cuerpo = cuerpoDeTabla(idTabla);

  // borra las filas anteriores antes de volver a dibujar
  // Limpia la tabla para evitar que se repitan los datos anteriores.
  cuerpo.innerHTML = "";

  // Recorre la lista desde el último movimiento hasta el primero.
  for (let i = lista.length - 1; i >= 0; i--) {
    // Crea una fila con los datos del movimiento y la agrega a la tabla.
    cuerpo.appendChild(crearFilaMovimiento(lista[i]));
  }
}

// ---------- Dibujar el panel ----------

// Vuelve a dibujar todo lo del cliente con los datos actuales.
// Esta función actualiza la información que aparece en el panel del cliente.
export function dibujarPanelCliente(): void {
  // Consulta los datos de la cuenta del cliente que tiene la sesión abierta.
  const cuenta = consultarMiCuenta();

  // Comprueba si no se encontró una cuenta para la sesión actual.
  if (cuenta === undefined) {
    // Termina la función porque no hay información de una cuenta que mostrar.
    return; // no hay cliente con sesión abierta
  }

  // Datos de la cuenta y saldos
  // Muestra el nombre del titular de la cuenta.
  el("dd-titular").textContent = cuenta.titular;

  // Muestra el ID de la cuenta convertido a texto.
  el("dd-id").textContent = String(cuenta.id);

  // Muestra si la cuenta está activa o inactiva.
  el("dd-estado").innerHTML = etiquetaEstado(cuenta.estado);

  // Muestra el saldo actual con formato de dinero.
  el("dd-saldo").textContent = dinero(cuenta.saldo);

  // Actualiza el saldo que aparece en el formulario de depósitos.
  el("saldo-deposito").textContent = dinero(cuenta.saldo);

  // Actualiza el saldo que aparece en el formulario de retiros.
  el("saldo-retiro").textContent = dinero(cuenta.saldo);

  // Tabla "Últimos movimientos": solo los 5 más recientes
  // Obtiene todos los movimientos relacionados con la cuenta del cliente.
  const todos = obtenerMovimientosDeCuenta(cuenta.id);

  // Selecciona solamente los últimos cinco movimientos de la lista.
  const ultimosCinco = todos.slice(-5);

  // Coloca esos cinco movimientos en la tabla de últimos movimientos.
  llenarTablaMovimientos("tabla-ultimos", ultimosCinco);

  // Oculta el mensaje de tabla vacía cuando existen movimientos.
  el("vacio-ultimos").hidden = todos.length > 0;

  // Tabla "Movimientos": aplica el filtro elegido (Todos / Depósitos / Retiros)
  // Filtra los movimientos según la opción que seleccionó el cliente.
  const visibles = filtrarMovimientosPorTipo(todos, filtroTipoActual);

  // Muestra los movimientos filtrados en la tabla correspondiente.
  llenarTablaMovimientos("tabla-movimientos", visibles);

  // Mensaje cuando la tabla queda vacía (hay dos casos distintos)
  // Obtiene el elemento donde se muestra el mensaje cuando no hay resultados.
  const mensajeVacio = el("vacio-movimientos");

  // Oculta el mensaje si hay movimientos que mostrar.
  mensajeVacio.hidden = visibles.length > 0;

  // Comprueba si la cuenta todavía no tiene ningún movimiento registrado.
  if (todos.length === 0) {
    // Muestra un mensaje indicando que todavía no existen movimientos.
    mensajeVacio.textContent = "Todavía no tiene movimientos en esta sesión.";
  } else {
    // Muestra este mensaje cuando hay movimientos, pero ninguno coincide con el filtro.
    mensajeVacio.textContent = "No hay resultados para el tipo de movimiento seleccionado.";
  }

  // Marca visualmente el botón que corresponde al filtro seleccionado.
  marcarFiltroActivo("filtros-cliente", filtroTipoActual);

  // Resumen: los totales se calculan con el historial real
  // Calcula los totales de depósitos y retiros utilizando el ID de la cuenta.
  const resumen = calcularResumen(cuenta.id);

  // Muestra cuánto dinero ha recibido el cliente mediante depósitos.
  el("res-depositado").textContent = dinero(resumen.totalDepositado);

  // Muestra cuánto dinero ha retirado el cliente.
  el("res-retirado").textContent = dinero(resumen.totalRetirado);

  // Muestra la cantidad de movimientos que tiene registrados la cuenta.
  el("res-cantidad").textContent = String(todos.length);

  // Muestra el saldo actual de la cuenta en el resumen.
  el("res-saldo").textContent = dinero(cuenta.saldo);
}

// ---------- Eventos ----------

// Se ejecuta cuando el cliente envía el formulario de DEPÓSITO.
// Recibe el evento que se produce al enviar el formulario.
function alEnviarDeposito(evento: Event): void {
  // evita que el formulario recargue la página
  // Evita que el navegador recargue la página al enviar el formulario.
  evento.preventDefault();

  // El cliente no escribe su ID: se usa el de la sesión abierta
  // Comprueba si existe una cuenta asociada a la sesión actual.
  if (sesion.cuentaId === null) {
    // Muestra un aviso indicando que primero debe iniciar sesión.
    mostrarAviso("Inicie sesión para operar.", false);

    // Termina la función porque no hay una cuenta con la cual realizar el depósito.
    return;
  }

  // Obtiene el campo donde el cliente escribe el monto que desea depositar.
  const campoMonto = obtenerEntrada("monto-deposito");

  // Convierte el valor escrito en el campo a un número.
  const monto = textoANumero(campoMonto.value);

  // Realiza el depósito utilizando el ID de la sesión y el monto indicado.
  const resultado = depositar(sesion.cuentaId, monto);

  // Muestra el resultado, limpia el campo si fue exitoso y actualiza el panel.
  terminarOperacion(resultado, campoMonto);
}

// Se ejecuta cuando el cliente envía el formulario de RETIRO.
// Recibe el evento que se produce al enviar el formulario.
function alEnviarRetiro(evento: Event): void {
  // Evita que el formulario recargue la página.
  evento.preventDefault();

  // Comprueba si existe una cuenta asociada a la sesión actual.
  if (sesion.cuentaId === null) {
    // Muestra un aviso indicando que primero debe iniciar sesión.
    mostrarAviso("Inicie sesión para operar.", false);

    // Termina la función porque no hay una cuenta para realizar el retiro.
    return;
  }

  // Obtiene el campo donde el cliente escribe el monto que desea retirar.
  const campoMonto = obtenerEntrada("monto-retiro");

  // Convierte el valor escrito en el campo a un número.
  const monto = textoANumero(campoMonto.value);

  // Realiza el retiro utilizando el ID de la sesión y el monto indicado.
  const resultado = retirar(sesion.cuentaId, monto);

  // Muestra el resultado, limpia el campo si fue exitoso y actualiza el panel.
  terminarOperacion(resultado, campoMonto);
}

// Parte final igual para depósitos y retiros: avisar, limpiar el campo y redibujar.
// Recibe el resultado de la operación y el campo donde se escribió el monto.
function terminarOperacion(resultado: ResultadoOperacion, campoMonto: HTMLInputElement): void {
  // Muestra el mensaje de la operación e indica si fue exitosa.
  mostrarAviso(resultado.mensaje, resultado.exito);

  // Comprueba si el depósito o retiro se realizó correctamente.
  if (resultado.exito) {
    // Limpia el campo del monto después de completar la operación.
    campoMonto.value = "";
  }

  // Actualiza la información del panel con los datos más recientes.
  dibujarPanelCliente();
}

// Se ejecuta cuando se pulsa uno de los botones Todos / Depósitos / Retiros.
// Cada botón del HTML trae su valor en el atributo data-tipo (todos, deposito o retiro).
// Recibe el botón que el cliente seleccionó.
function alPulsarFiltro(boton: HTMLElement): void {
  // Lee el tipo de filtro que está guardado en el botón.
  const filtro = leerFiltroTipo(boton.dataset.tipo);

  // Comprueba si el botón tiene un filtro válido.
  if (filtro === null) {
    // Termina la función si el valor del botón no es válido.
    return; // el botón no tiene un valor válido
  }

  // Guarda el filtro que acaba de seleccionar el cliente.
  filtroTipoActual = filtro;

  // Actualiza la tabla para mostrar los movimientos según el filtro seleccionado.
  dibujarPanelCliente();
}

// Conecta cada elemento con su evento. Se llama una sola vez al iniciar la aplicación.
export function configurarPanelCliente(): void {
  // Formularios: evento "submit" (al pulsar el botón o la tecla Enter)
  // Conecta el formulario de depósitos con la función que procesa los depósitos.
  el("form-depositar").addEventListener("submit", alEnviarDeposito);

  // Conecta el formulario de retiros con la función que procesa los retiros.
  el("form-retirar").addEventListener("submit", alEnviarRetiro);

  // Botones de filtro: evento "click". Se recorre cada botón del grupo
  // y cada uno llama a alPulsarFiltro enviándose a sí mismo.
  // Obtiene todos los botones que pertenecen al grupo de filtros del cliente.
  const botonesFiltro = el("filtros-cliente").querySelectorAll<HTMLElement>("button");

  // Recorre cada botón del grupo para configurar su evento.
  for (const boton of botonesFiltro) {

    // Detecta cuando el cliente hace clic en uno de los botones.
    boton.addEventListener("click", function () {

      // Envía el botón seleccionado a la función que aplica el filtro.
      alPulsarFiltro(boton);
    });
  }
}

// ---------- Limpiar ----------

// Borra de la pantalla toda la información del cliente (se usa al cerrar sesión).
export function limpiarPanelCliente(): void {
  // Restablece el filtro para que la próxima vez aparezcan todos los movimientos.
  filtroTipoActual = "todos";

  // Guarda los identificadores de los elementos que muestran los datos del cliente.
  const idsDeTextos = [
    "dd-titular", "dd-id", "dd-estado", "dd-saldo", "saldo-deposito", "saldo-retiro",
    "res-depositado", "res-retirado", "res-cantidad", "res-saldo",
  ];

  // Recorre todos los identificadores de los elementos que se deben limpiar.
  for (const id of idsDeTextos) {
    // Borra el texto que aparece en cada elemento del panel.
    el(id).textContent = "";
  }

  // Elimina todas las filas de la tabla de últimos movimientos.
  cuerpoDeTabla("tabla-ultimos").innerHTML = "";

  // Elimina todas las filas de la tabla general de movimientos del cliente.
  cuerpoDeTabla("tabla-movimientos").innerHTML = "";

  // Restablece los campos del formulario de depósitos.
  obtenerFormulario("form-depositar").reset();

  // Restablece los campos del formulario de retiros.
  obtenerFormulario("form-retirar").reset();

  // Deja seleccionado visualmente el filtro "Todos".
  marcarFiltroActivo("filtros-cliente", "todos");
}