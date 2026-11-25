
 // ===== Panel del administrador: cuentas, registro, historial general y totales ==

 //Creamos un panel de administración para que el administrador pueda gestionar las cuentas, ver el historial general y los totales del banco.
 //  Este panel permite registrar nuevas cuentas, modificar las existentes, cambiar su estado y eliminar cuentas. Además, muestra un historial completo
 //  de movimientos y calcula los totales generales del banco.

// Importa los tipos que se utilizan para trabajar con cuentas, estados, filtros y movimientos.
import { Cuenta, EstadoCuenta, FiltroTipo, Movimiento, ResultadoOperacion } from "../types/tipos.js";

// Importa las funciones para buscar una cuenta por su ID y obtener todas las cuentas.
import { buscarCuentaPorId, obtenerCuentas } from "../functions/consultaCuentas.js";

// Importa las funciones que permiten buscar y filtrar las cuentas.
import { buscarCuentas, filtrarCuentasPorEstado } from "../functions/busquedasFiltros.js";

// Importa las funciones para obtener y filtrar los movimientos del historial.
import { filtrarMovimientosPorTipo, obtenerTodosLosMovimientos } from "../functions/historial.js";

// Importa la función que calcula los totales generales del banco.
import { calcularResumenGeneral } from "../functions/resumen.js";

// Importa las funciones para cambiar el estado, modificar, registrar y eliminar cuentas.
import { cambiarEstadoCuenta, modificarCuenta, registrarCuenta, eliminarCuenta } from "../functions/administracion.js";

// Importa la función que permite cambiar de una sección a otra.
import { mostrarSeccion } from "./navegacion.js";

// Importa las utilidades que ayudan a trabajar con los elementos del HTML.
import {
  crearCelda, cuerpoDeTabla, dinero, el, etiquetaEstado, etiquetaTipo, leerFiltroEstado,
  leerFiltroTipo, marcarFiltroActivo, mostrarAviso, obtenerEntrada, obtenerFormulario,
  obtenerSelect, textoANumero,
} from "./utilidades.js";

// Filtro seleccionado en la tabla del historial general
// Guarda el tipo de movimiento que se está mostrando actualmente.
let filtroTipoActual: FiltroTipo = "todos";

// ---------- Tabla de cuentas ----------

// Crea una fila (<tr>) para una cuenta, con sus botones de acciones.
// Recibe los datos de una cuenta y devuelve una fila para la tabla.
function crearFilaCuenta(cuenta: Cuenta): HTMLTableRowElement {
  // Crea una nueva fila para colocar la información de la cuenta.
  const fila = document.createElement("tr");

  // Celdas con datos (textContent: el nombre se muestra como texto, nunca como HTML)
  // Crea una celda para mostrar el ID de la cuenta.
  const celdaId = crearCelda(String(cuenta.id));

  // Crea una celda con el nombre del titular.
  const celdaTitular = crearCelda(cuenta.titular);

  // Crea una celda donde se mostrará el estado de la cuenta.
  const celdaEstado = document.createElement("td");

  // Coloca en la celda la etiqueta visual que indica si la cuenta está activa o inactiva.
  celdaEstado.innerHTML = etiquetaEstado(cuenta.estado);

  // Crea una celda para mostrar el saldo con formato de dinero.
  const celdaSaldo = crearCelda(dinero(cuenta.saldo));

  // Botón "Editar"
  // Crea el botón que permitirá modificar los datos de la cuenta.
  const botonEditar = document.createElement("button");

  // Indica que el botón no enviará ningún formulario.
  botonEditar.type = "button";

  // Le asigna una clase para aplicarle estilos desde CSS.
  botonEditar.className = "btn-editar";

  // Coloca el texto que aparecerá dentro del botón.
  botonEditar.textContent = "Editar";

  // Configura la acción que se ejecutará cuando se haga clic en Editar.
  botonEditar.addEventListener("click", function () {
    // Abre el formulario de edición con los datos de esta cuenta.
    entrarModoEdicion(cuenta);
  });

  // Botón de estado: dice "Desactivar" si la cuenta está activa y "Activar" si no.
  // Crea el botón que permitirá cambiar el estado de la cuenta.
  const botonEstado = document.createElement("button");

  // Evita que este botón envíe un formulario.
  botonEstado.type = "button";

  // Le asigna una clase para darle estilos.
  botonEstado.className = "btn-estado";

  // Comprueba si la cuenta se encuentra activa.
  if (cuenta.estado === "activa") {
    // Si está activa, el botón mostrará la opción de desactivarla.
    botonEstado.textContent = "Desactivar";
  } else {
    // Si está inactiva, el botón mostrará la opción de activarla.
    botonEstado.textContent = "Activar";
  }

  // Configura lo que sucederá cuando se presione el botón de estado.
  botonEstado.addEventListener("click", function () {
    // Llama a la función que cambia el estado de la cuenta seleccionada.
    alPulsarCambiarEstado(cuenta);
  });

  // Botón para eliminar la cuenta.
  const botonEliminar = document.createElement("button");
  botonEliminar.type = "button";
  botonEliminar.className = "btn-eliminar";
  botonEliminar.textContent = "Eliminar";

  // Configura la acción que se ejecutará al presionar Eliminar.
  botonEliminar.addEventListener("click", function () {
    alPulsarEliminarCuenta(cuenta);
  });

  // Celda de acciones con los tres botones.
  // Crea una celda para colocar los botones de Editar, Activar/Desactivar y Eliminar.
  const celdaAcciones = document.createElement("td");

  // Asigna una clase para organizar los botones con CSS.
  celdaAcciones.className = "acciones";

  // Agrega los tres botones a la misma celda y deja un espacio entre ellos.
  celdaAcciones.append(
    botonEditar,
    " ",
    botonEstado,
    " ",
    botonEliminar
  );

  // Agrega todas las celdas a la fila de la cuenta.
  fila.append(celdaId, celdaTitular, celdaEstado, celdaSaldo, celdaAcciones);

  // Devuelve la fila ya preparada para colocarla en la tabla.
  return fila;
}

// Dibuja la tabla de cuentas aplicando la búsqueda y el filtro de estado.
// Esta función actualiza las cuentas que aparecen en pantalla.
function dibujarCuentas(): void {
  // Obtiene el texto que escribió el administrador en el campo de búsqueda.
  const textoBuscado = obtenerEntrada("buscar-cuenta").value;

  // Obtiene el estado que seleccionó en el filtro.
  const estadoElegido = obtenerSelect("filtro-estado").value;

  // Convierte la opción seleccionada en un filtro de estado válido.
  const filtroEstado = leerFiltroEstado(estadoElegido);

  // Busca las cuentas que coinciden con el texto escrito.
  const encontradas = buscarCuentas(obtenerCuentas(), textoBuscado);

  // De las cuentas encontradas, deja solamente las que cumplen el estado seleccionado.
  const visibles = filtrarCuentasPorEstado(encontradas, filtroEstado);

  // Obtiene el cuerpo de la tabla donde se mostrarán las cuentas.
  const cuerpo = cuerpoDeTabla("tabla-cuentas");

  // Borra las filas anteriores.
  cuerpo.innerHTML = "";

  // Recorre todas las cuentas que pasaron los filtros.
  for (const cuenta of visibles) {
    // Crea una fila para cada cuenta y la agrega a la tabla.
    cuerpo.appendChild(crearFilaCuenta(cuenta));
  }

  // Oculta el mensaje cuando hay cuentas y lo muestra cuando no hay resultados.
  el("vacio-cuentas").hidden = visibles.length > 0;
}

// ---------- Tabla del historial general ----------

// Crea una fila de la tabla para mostrar un movimiento del banco.
function crearFilaHistorial(movimiento: Movimiento): HTMLTableRowElement {
  // Crea una nueva fila para colocar los datos del movimiento.
  const fila = document.createElement("tr");

  // El titular se busca con el ID de cuenta del movimiento.
  let nombreTitular = "—";

  // Busca la cuenta a la que pertenece el movimiento.
  const cuenta = buscarCuentaPorId(movimiento.cuentaId);

  // Comprueba si encontró la cuenta.
  if (cuenta !== undefined) {
    // Si existe, obtiene el nombre de su titular.
    nombreTitular = cuenta.titular;
  }

  // Establece por defecto el signo y la clase de un retiro.
  let signo = "−";
  let claseMonto = "monto-retiro";

  // Comprueba si el movimiento corresponde a un depósito.
  if (movimiento.tipo === "deposito") {
    // Coloca el signo positivo para representar el dinero que ingresó.
    signo = "+";

    // Asigna la clase que identifica visualmente los depósitos.
    claseMonto = "monto-deposito";
  }

  // Crea una celda con el ID del movimiento.
  const celdaId = crearCelda(String(movimiento.id));

  // Crea una celda con el ID de la cuenta relacionada con el movimiento.
  const celdaCuenta = crearCelda(String(movimiento.cuentaId));

  // Crea una celda con el nombre del titular de la cuenta.
  const celdaTitular = crearCelda(nombreTitular);

  // Crea una celda para mostrar el tipo de movimiento.
  const celdaTipo = document.createElement("td");

  // Coloca la etiqueta que identifica si fue depósito o retiro.
  celdaTipo.innerHTML = etiquetaTipo(movimiento.tipo);

  // Crea una celda con el signo, el monto y la clase correspondiente.
  const celdaMonto = crearCelda(signo + dinero(movimiento.monto), claseMonto);

  // Crea una celda con la fecha en que se realizó el movimiento.
  const celdaFecha = crearCelda(movimiento.fecha);

  // Agrega todas las celdas a la fila del historial.
  fila.append(celdaId, celdaCuenta, celdaTitular, celdaTipo, celdaMonto, celdaFecha);

  // Devuelve la fila completa para agregarla a la tabla.
  return fila;
}

// Actualiza la tabla donde se muestran todos los movimientos del banco.
function dibujarHistorial(): void {
  // Obtiene todos los movimientos que se han registrado.
  const todos = obtenerTodosLosMovimientos();

  // Aplica el filtro seleccionado para mostrar solo los movimientos correspondientes.
  const visibles = filtrarMovimientosPorTipo(todos, filtroTipoActual);

  // Obtiene el cuerpo de la tabla del historial.
  const cuerpo = cuerpoDeTabla("tabla-historial");

  // Borra las filas anteriores para colocar la información actualizada.
  cuerpo.innerHTML = "";

  // Recorre los movimientos desde el último hasta el primero.
  for (let i = visibles.length - 1; i >= 0; i--) {
    // Crea una fila para el movimiento y la agrega a la tabla.
    cuerpo.appendChild(crearFilaHistorial(visibles[i]));
  }

  // Obtiene el elemento donde se muestra el mensaje cuando no hay movimientos.
  const mensajeVacio = el("vacio-historial");

  // Oculta el mensaje si hay movimientos para mostrar.
  mensajeVacio.hidden = visibles.length > 0;

  // Comprueba si todavía no existe ningún movimiento registrado.
  if (todos.length === 0) {
    // Muestra un mensaje indicando que el historial está vacío.
    mensajeVacio.textContent = "Todavía no hay movimientos registrados en esta sesión.";
  } else {
    // Muestra este mensaje cuando existen movimientos, pero ninguno coincide con el filtro.
    mensajeVacio.textContent = "No hay resultados para el tipo de movimiento seleccionado.";
  }

  // Marca visualmente el botón que corresponde al filtro seleccionado.
  marcarFiltroActivo("filtros-admin", filtroTipoActual);
}

// ---------- Totales ----------

// Cuenta cuántas cuentas de la lista tienen el estado indicado.
// Recibe una lista de cuentas y el estado que se quiere contar.
function contarCuentasPorEstado(lista: Cuenta[], estado: EstadoCuenta): number {
  // Inicia el contador en cero.
  let cantidad = 0;

  // Recorre cada cuenta de la lista recibida.
  for (const cuenta of lista) {
    // Comprueba si el estado de la cuenta coincide con el que se está buscando.
    if (cuenta.estado === estado) {
      // Aumenta el contador cuando encuentra una cuenta con ese estado.
      cantidad++;
    }
  }

  // Devuelve la cantidad de cuentas que cumplen con el estado.
  return cantidad;
}

// Calcula y muestra los totales generales del banco.
function dibujarTotales(): void {
  // Obtiene la lista completa de cuentas registradas.
  const cuentas = obtenerCuentas();

  // Calcula el resumen general de los depósitos y retiros.
  const resumen = calcularResumenGeneral();

  // Muestra la cantidad total de cuentas registradas.
  el("total-cuentas").textContent = String(cuentas.length);

  // Muestra cuántas cuentas se encuentran activas.
  el("total-activas").textContent = String(contarCuentasPorEstado(cuentas, "activa"));

  // Muestra cuántas cuentas se encuentran inactivas.
  el("total-inactivas").textContent = String(contarCuentasPorEstado(cuentas, "inactiva"));

  // Muestra el total de dinero que ha ingresado mediante depósitos.
  el("total-depositado").textContent = dinero(resumen.totalDepositado);

  // Muestra el total de dinero que se ha retirado.
  el("total-retirado").textContent = dinero(resumen.totalRetirado);

  // Muestra la cantidad total de movimientos registrados.
  el("total-movimientos").textContent = String(obtenerTodosLosMovimientos().length);
}

// Vuelve a dibujar todo el panel del administrador.
// Actualiza las cuentas, el historial y los totales.
export function dibujarPanelAdmin(): void {
  // Actualiza la tabla de cuentas.
  dibujarCuentas();

  // Actualiza la tabla del historial general.
  dibujarHistorial();

  // Actualiza los totales del banco.
  dibujarTotales();
}

// ---------- Formulario: registrar o modificar ----------

// Deja el formulario listo para REGISTRAR una cuenta nueva.
function salirModoEdicion(): void {
  // Limpia todos los campos del formulario.
  obtenerFormulario("form-cuenta").reset();

  // Deja vacío el campo que guarda el ID de la cuenta que se está editando.
  obtenerEntrada("cuenta-editando").value = "";

  // Permite escribir el saldo inicial de una cuenta nueva.
  obtenerEntrada("cuenta-saldo").disabled = false;

  // Permite seleccionar el estado de la cuenta nueva.
  obtenerSelect("cuenta-estado").disabled = false;

  // Cambia el título para indicar que se registrará una cuenta nueva.
  el("titulo-formulario").textContent = "Registrar nueva cuenta";
}

// Carga los datos de una cuenta en el formulario para MODIFICARLA.
// Solo se pueden cambiar titular y PIN; el saldo y el estado se muestran bloqueados.
function entrarModoEdicion(cuenta: Cuenta): void {
  // Guarda el ID de la cuenta que se va a modificar.
  obtenerEntrada("cuenta-editando").value = String(cuenta.id);

  // Coloca el nombre actual del titular en el formulario.
  obtenerEntrada("cuenta-titular").value = cuenta.titular;

  // Deja vacío el campo del PIN para que se pueda escribir uno nuevo si es necesario.
  obtenerEntrada("cuenta-pin").value = "";

  // Explica que si el campo queda vacío, se conservará el PIN actual.
  obtenerEntrada("cuenta-pin").placeholder = "Vacío = conservar el PIN actual";

  // Muestra el saldo actual de la cuenta con dos decimales.
  obtenerEntrada("cuenta-saldo").value = cuenta.saldo.toFixed(2);

  // Bloquea el campo del saldo para evitar que sea modificado.
  obtenerEntrada("cuenta-saldo").disabled = true;

  // Muestra el estado actual de la cuenta en el formulario.
  obtenerSelect("cuenta-estado").value = cuenta.estado;

  // Bloquea el estado porque no se modifica desde este formulario.
  obtenerSelect("cuenta-estado").disabled = true;

  // Cambia el título para indicar qué cuenta se está modificando.
  el("titulo-formulario").textContent = `Modificar cuenta ${cuenta.id}`;

  // Abre la sección donde se encuentra el formulario de modificación.
  mostrarSeccion("sec-admin-formulario");
}

// ---------- Eventos ----------

// Botón "Activar / Desactivar" de una fila: cambia al estado contrario.
// Recibe la cuenta cuyo estado se quiere cambiar.
function alPulsarCambiarEstado(cuenta: Cuenta): void {
  // Establece inicialmente el nuevo estado como activa.
  let nuevoEstado: EstadoCuenta = "activa";

  // Comprueba si actualmente la cuenta está activa.
  if (cuenta.estado === "activa") {
    // Si está activa, el nuevo estado será inactiva.
    nuevoEstado = "inactiva";
  }

  // Ejecuta el cambio de estado utilizando el ID de la cuenta.
  const resultado = cambiarEstadoCuenta(cuenta.id, nuevoEstado);

  // Muestra el mensaje que devuelve la operación e indica si fue exitosa.
  mostrarAviso(resultado.mensaje, resultado.exito);

  // Actualiza el panel para mostrar el nuevo estado de la cuenta.
  dibujarPanelAdmin();
}

// Botón "Eliminar" de una fila: elimina la cuenta seleccionada.
function alPulsarEliminarCuenta(cuenta: Cuenta): void {
  // Pregunta si el administrador realmente desea eliminar la cuenta.
  const confirmar = window.confirm(
    `¿Deseas eliminar la cuenta ${cuenta.id} de ${cuenta.titular}?`
  );

  // Si el administrador cancela, no se realiza ningún cambio.
  if (!confirmar) {
    return;
  }

  // Llama a la función que elimina la cuenta del arreglo.
  const resultado = eliminarCuenta(cuenta.id);

  // Muestra el mensaje que devuelve la operación.
  mostrarAviso(resultado.mensaje, resultado.exito);

  // Si se eliminó correctamente, actualiza las tablas y los totales.
  if (resultado.exito) {
    // Si esa cuenta estaba abierta en el formulario, limpia el formulario.
    if (obtenerEntrada("cuenta-editando").value === String(cuenta.id)) {
      salirModoEdicion();
    }

    // Actualiza la información que aparece en pantalla.
    dibujarPanelAdmin();
  }
}

// Botón "Guardar" del formulario: registra una cuenta nueva o modifica una existente.
// Se ejecuta cuando el administrador envía el formulario.
function alEnviarFormularioCuenta(evento: Event): void {
  // Evita que el navegador recargue la página al enviar el formulario.
  evento.preventDefault();

  // Obtiene el ID de la cuenta que se está editando, si existe.
  const idEnEdicion = obtenerEntrada("cuenta-editando").value;

  // Obtiene el nombre del titular escrito en el formulario.
  const titular = obtenerEntrada("cuenta-titular").value;

  // Obtiene el PIN escrito en el formulario.
  const pin = obtenerEntrada("cuenta-pin").value;

  // Declara una variable donde se guardará el resultado de la operación.
  let resultado: ResultadoOperacion;

  // Comprueba si el formulario se está utilizando para registrar una cuenta nueva.
  if (idEnEdicion === "") {
    // Convierte el saldo inicial escrito en el formulario a un número.
    const saldoInicial = textoANumero(obtenerEntrada("cuenta-saldo").value);

    // Establece el estado inicial de la cuenta como activa.
    let estado: EstadoCuenta = "activa";

    // Comprueba si el administrador seleccionó el estado inactivo.
    if (obtenerSelect("cuenta-estado").value === "inactiva") {
      // Cambia el estado inicial a inactiva si esa fue la opción seleccionada.
      estado = "inactiva";
    }

    // Registra la cuenta nueva con el titular, PIN, saldo y estado indicados.
    resultado = registrarCuenta(titular, pin, saldoInicial, estado);
  } else {
    // Modifica la cuenta existente utilizando su ID, titular y PIN.
    resultado = modificarCuenta(Number(idEnEdicion), titular, pin);
  }

  // Muestra el mensaje que devuelve el registro o la modificación.
  mostrarAviso(resultado.mensaje, resultado.exito);

  // Comprueba si la operación se realizó correctamente.
  if (resultado.exito) {
    // Limpia el formulario y lo deja listo para registrar otra cuenta.
    salirModoEdicion();

    // Actualiza las tablas y los totales del administrador.
    dibujarPanelAdmin();

    // Regresa a la sección donde se muestran todas las cuentas.
    mostrarSeccion("sec-admin-cuentas");
  }
}

// Botón "Cancelar" del formulario.
// Se ejecuta cuando el administrador decide cancelar el registro o la modificación.
function alPulsarCancelar(): void {
  // Limpia el formulario y restablece sus campos.
  salirModoEdicion();

  // Regresa a la sección principal de las cuentas.
  mostrarSeccion("sec-admin-cuentas");
}

// Evita que la tecla Enter recargue la página en el formulario de búsqueda.
// Recibe el evento que se produce al enviar el formulario.
function evitarEnvio(evento: Event): void {
  // Cancela el envío normal del formulario para evitar que la página se recargue.
  evento.preventDefault();
}

// Botones Todos / Depósitos / Retiros del historial general.
// Cada botón del HTML trae su valor en el atributo data-tipo.
// Recibe el botón que fue seleccionado por el administrador.
function alPulsarFiltro(boton: HTMLElement): void {
  // Obtiene el tipo de filtro que tiene guardado el botón.
  const filtro = leerFiltroTipo(boton.dataset.tipo);

  // Comprueba si el valor del botón no corresponde a un filtro válido.
  if (filtro === null) {
    // Termina la función si el filtro no es válido.
    return;
  }

  // Guarda el nuevo filtro seleccionado.
  filtroTipoActual = filtro;

  // Actualiza el historial para mostrar solamente los movimientos correspondientes.
  dibujarHistorial();
}

// Conecta cada elemento con su evento. Se llama una sola vez al iniciar la aplicación.
export function configurarPanelAdmin(): void {
  // Búsqueda y filtro de la tabla de cuentas.
  // Evita que el formulario de búsqueda se envíe y recargue la página.
  el("form-buscar").addEventListener("submit", evitarEnvio);

  // Actualiza la tabla cada vez que el administrador escribe algo en la búsqueda.
  el("buscar-cuenta").addEventListener("input", dibujarCuentas);

  // Actualiza la tabla cuando se selecciona otro estado en el filtro.
  el("filtro-estado").addEventListener("change", dibujarCuentas);

  // Formulario de registro / modificación.
  // Conecta el formulario con la función que registra o modifica las cuentas.
  el("form-cuenta").addEventListener("submit", alEnviarFormularioCuenta);

  // Conecta el botón Cancelar con la función que limpia el formulario.
  el("boton-cancelar").addEventListener("click", alPulsarCancelar);

  // Botones de filtro del historial.
  // Obtiene todos los botones que se encuentran dentro del grupo de filtros.
  const botonesFiltro = el("filtros-admin").querySelectorAll<HTMLElement>("button");

  // Recorre cada botón para configurar su evento.
  for (const boton of botonesFiltro) {
    // Agrega un evento para detectar cuando se presione el botón.
    boton.addEventListener("click", function () {
      // Envía el botón seleccionado a la función que aplica el filtro.
      alPulsarFiltro(boton);
    });
  }

  // Los botones "Editar", "Activar/Desactivar" y "Eliminar" de cada fila
  // se conectan en crearFilaCuenta, justo cuando se crean.
}

// ---------- Limpiar ----------

// Borra de la pantalla la información administrativa (se usa al cerrar sesión).
export function limpiarPanelAdmin(): void {
  // Restablece el filtro del historial para mostrar todos los movimientos.
  filtroTipoActual = "todos";

  // Limpia todas las filas de la tabla de cuentas.
  cuerpoDeTabla("tabla-cuentas").innerHTML = "";

  // Limpia todas las filas de la tabla del historial.
  cuerpoDeTabla("tabla-historial").innerHTML = "";

  // Guarda los identificadores de los elementos donde se muestran los totales.
  const idsDeTotales = [
    "total-cuentas", "total-activas", "total-inactivas",
    "total-depositado", "total-retirado", "total-movimientos",
  ];

  // Recorre cada identificador de los elementos que muestran los totales.
  for (const id of idsDeTotales) {
    // Borra el texto que se estaba mostrando en cada elemento.
    el(id).textContent = "";
  }

  // Limpia el texto que se había escrito en el campo de búsqueda.
  obtenerEntrada("buscar-cuenta").value = "";

  // Restablece el filtro de estado para mostrar todas las cuentas.
  obtenerSelect("filtro-estado").value = "todas";

  // Limpia el formulario y lo deja preparado para registrar una cuenta nueva.
  salirModoEdicion();

  // Marca el filtro "Todos" como la opción seleccionada.
  marcarFiltroActivo("filtros-admin", "todos");
}
