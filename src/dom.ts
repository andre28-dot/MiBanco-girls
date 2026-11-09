// ==========================================================
// EVENTOS Y MANIPULACIÓN DEL DOM
// ==========================================================

// Este archivo es el encargado de conectar el código TypeScript
// con los elementos que tenemos en el archivo HTML.
//
// Aquí trabajamos con botones, formularios, tablas, mensajes y
// otras partes de la página que el usuario puede ver e utilizar.
//
// También nos encargamos de actualizar la información en pantalla
// cuando se realiza una operación o se selecciona una cuenta.


// Importamos los tipos que utilizaremos para trabajar con las cuentas,
// los filtros y los resultados que devuelven las operaciones.
import { Cuenta, FiltroEstado, FiltroTipo, ResultadoOperacion } from "./tipos.js";

// Importamos la lista de movimientos para poder mostrar los últimos
// depósitos y retiros realizados en la pantalla de inicio.
import { movimientos } from "./estado.js";

// Importamos las funciones que permiten obtener todas las cuentas
// y buscar una cuenta específica utilizando su ID.
import { obtenerCuentas, buscarCuentaPorId } from "./consultaCuentas.js";

// Importamos las funciones que permiten buscar cuentas por el nombre
// del titular y filtrar las cuentas según su estado.
import { buscarCuentasPorTitular, filtrarCuentasPorEstado } from "./busquedasFiltros.js";

// Estas funciones nos ayudan a obtener los movimientos de una cuenta
// y a mostrar solamente los depósitos o retiros que el usuario elija.
import { obtenerMovimientosDeCuenta, filtrarMovimientosPorTipo } from "./historial.js";

// Importamos las funciones que contienen la lógica para realizar
// depósitos y retiros. Aquí solamente las utilizamos.
import { depositar } from "./depositos.js";
import { retirar } from "./retiros.js";

// Importamos las funciones encargadas de calcular los totales
// y preparar la información que se muestra en los resúmenes.
import { calcularResumen, calcularResumenGeneral } from "./resumen.js";


// Declaramos Bootstrap porque lo utilizamos desde su CDN.
// Nos permite controlar las notificaciones y el menú lateral
// sin tener que programar esos elementos desde cero.
declare const bootstrap: any;


// Esta variable guarda el ID de la cuenta que el usuario tiene seleccionada.
// El tipo number indica que puede guardar un número y null significa
// que todavía no se ha seleccionado ninguna cuenta.
let cuentaSeleccionadaId: number | null = null;

// Guarda el filtro que se está utilizando en el historial.
// Al iniciar tiene el valor "todos", porque queremos mostrar
// tanto los depósitos como los retiros.
let filtroTipoActual: FiltroTipo = "todos";


// Creamos una lista de títulos para las diferentes secciones.
// Cada nombre funciona como una clave que nos permite encontrar
// el título que corresponde a la sección que el usuario abrió.
const titulos: { [seccion: string]: string } = {
  inicio: "Inicio", cuentas: "Cuentas bancarias", depositos: "Depósitos",
  retiros: "Retiros", movimientos: "Movimientos", resumen: "Resumen de operaciones",
};


// ==========================================================
// UTILIDADES
// ==========================================================

// Esta función nos ayuda a encontrar elementos del HTML utilizando su ID.
//
// Por ejemplo, si necesitamos acceder a un botón que tiene el ID "menu",
// llamamos a el("menu") en lugar de escribir document.getElementById()
// cada vez que necesitamos utilizarlo.
//
// Si el elemento existe, lo devuelve para poder trabajar con él.
// Si no existe, muestra un error para identificar qué elemento falta.
function el(id: string): HTMLElement {
  const e = document.getElementById(id);

  if (e === null) {
    throw new Error(`No existe el elemento "${id}"`);
  }

  return e;
}


// Esta función recibe una cantidad numérica y la convierte
// en una cantidad de dinero con el símbolo de dólar.
//
// toLocaleString permite darle formato al número.
// minimumFractionDigits y maximumFractionDigits hacen que
// siempre aparezcan dos decimales, por ejemplo: $150.00.
function dinero(n: number): string {
  return "$" + n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


// Esta función protege los textos antes de colocarlos dentro del HTML.
//
// Algunos caracteres, como <, > o &, pueden interpretarse como parte
// de una etiqueta HTML. Por eso los reemplazamos por sus códigos.
//
// De esta manera, si un titular tiene alguno de esos caracteres,
// se muestra como texto y no como código HTML.
function esc(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}


// Esta función convierte el contenido de un campo de texto en un número.
//
// Primero utiliza trim() para quitar los espacios que pueda tener
// el usuario al inicio o al final del texto.
//
// Si el campo está vacío, devuelve NaN, que representa un valor
// que no es un número. Esto permite que la validación lo rechace.
function textoANumero(texto: string): number {
  return texto.trim() === "" ? NaN : Number(texto);
}


// Esta función crea una etiqueta visual para identificar el estado
// de una cuenta.
//
// Recibe el estado y comprueba si es "activa".
// Si lo es, muestra la palabra "Activa"; de lo contrario,
// muestra "Inactiva".
//
// También utiliza clases de Bootstrap para darle apariencia de etiqueta.
function etiquetaEstado(estado: string): string {
  return `<span class="badge rounded-pill b-${estado}">${estado === "activa" ? "Activa" : "Inactiva"}</span>`;
}


// Esta función hace algo parecido a la anterior, pero para los movimientos.
//
// Recibe el tipo de movimiento y comprueba si es un depósito.
// Si es un depósito, muestra "Depósito"; si no, muestra "Retiro".
//
// Así podemos distinguir fácilmente los movimientos en las tablas.
function etiquetaTipo(tipo: string): string {
  return `<span class="badge rounded-pill b-${tipo}">${tipo === "deposito" ? "Depósito" : "Retiro"}</span>`;
}


// Esta función recibe el ID de una cuenta y busca quién es su titular.
//
// Utiliza buscarCuentaPorId para localizar la cuenta.
// Si encuentra una, devuelve el nombre del titular.
// Si no encuentra ninguna, devuelve una raya para indicar que
// no hay información disponible.
function titularDe(cuentaId: number): string {
  const c = buscarCuentaPorId(cuentaId);

  return c === undefined ? "—" : c.titular;
}


// Esta función permite mostrar u ocultar elementos del HTML.
//
// Recibe el ID del elemento y un valor booleano llamado mostrar.
// Si mostrar es true, se quita la clase d-none y el elemento aparece.
// Si es false, se agrega esa clase y el elemento queda oculto.
//
// La clase d-none pertenece a Bootstrap y sirve para ocultar elementos.
function vacio(id: string, mostrar: boolean): void {
  el(id).classList.toggle("d-none", !mostrar);
}


// ==========================================================
// TOASTS: NOTIFICACIONES
// ==========================================================

// Esta función muestra mensajes pequeños en pantalla para informar
// al usuario sobre el resultado de una operación.
//
// Recibe dos datos:
// mensaje: el texto que queremos mostrar.
// exito: indica si la operación salió bien o si ocurrió un error.
//
// Por ejemplo, después de un depósito podemos mostrar una notificación
// de éxito, y si el retiro es rechazado mostramos una de error.
export function mostrarToast(mensaje: string, exito: boolean): void {

  // Creamos un nuevo elemento div desde TypeScript.
  // Este elemento será la caja donde aparecerá la notificación.
  const caja = document.createElement("div");

  // Asignamos las clases de Bootstrap para darle apariencia a la notificación.
  // Si la operación fue exitosa, usamos el color verde.
  // Si ocurrió un error, usamos el color rojo.
  caja.className = `toast align-items-center text-bg-${exito ? "success" : "danger"} border-0`;

  // Indicamos que este elemento funciona como una notificación
  // para que pueda ser reconocido correctamente.
  caja.setAttribute("role", "alert");

  // Construimos el contenido que aparecerá dentro de la notificación.
  // El icono también cambia dependiendo del resultado:
  // un visto para el éxito y una advertencia para los errores.
  // Al final agregamos un botón que permite cerrar el mensaje.
  caja.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="bi bi-${exito ? "check-circle" : "exclamation-triangle"} me-2"></i>${esc(mensaje)}</div>` +
    `<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button></div>`;

  // Buscamos el contenedor de notificaciones en el HTML
  // y agregamos dentro de él la caja que acabamos de crear.
  el("toasts").appendChild(caja);

  // Escuchamos el evento que indica que la notificación ya desapareció.
  // Cuando esto ocurre, eliminamos el elemento para que no quede
  // ocupando espacio en el documento.
  caja.addEventListener("hidden.bs.toast", () => caja.remove());

  // Creamos y mostramos la notificación utilizando Bootstrap.
  // delay: 4500 significa que se ocultará después de 4.5 segundos.
  new bootstrap.Toast(caja, { delay: 4500 }).show();
}


// ==========================================================
// NAVEGACIÓN ENTRE SECCIONES
// ==========================================================

// Esta función permite cambiar de una sección a otra sin tener
// que recargar toda la página.
//
// Recibe el nombre de la sección que el usuario quiere abrir.
// Por ejemplo: inicio, cuentas, depositos o movimientos.
function irA(seccion: string): void {

  // Primero buscamos todos los elementos que tienen la clase "seccion".
  // Después recorremos cada uno y le agregamos d-none para ocultarlos.
  // Esto evita que aparezcan varias secciones al mismo tiempo.
  document.querySelectorAll<HTMLElement>(".seccion").forEach((s) =>
    s.classList.add("d-none")
  );

  // Una vez ocultadas todas, buscamos la sección que el usuario eligió
  // utilizando su ID y le quitamos d-none para mostrarla.
  // Por ejemplo, si se recibe "cuentas", buscamos el elemento "sec-cuentas".
  el("sec-" + seccion).classList.remove("d-none");

  // Recorremos los enlaces del menú para actualizar cuál está seleccionado.
  // La clase "activo" se agrega solamente al enlace que corresponde
  // a la sección que estamos mostrando.
  document.querySelectorAll<HTMLElement>(".menu .nav-link").forEach((b) =>
    b.classList.toggle("activo", b.dataset.seccion === seccion)
  );

  // Actualizamos el título de la parte superior de la página.
  // El texto se obtiene de la lista de títulos que declaramos al inicio.
  el("titulo-seccion").textContent = titulos[seccion];

  // Comprobamos si el menú lateral de Bootstrap está abierto.
  // Esto es especialmente útil cuando se utiliza la aplicación desde el celular.
  const menu = bootstrap.Offcanvas.getInstance(el("menu"));

  // Si el menú existe, lo cerramos después de seleccionar una sección.
  if (menu !== null) {
    menu.hide();
  }

  // Movemos la pantalla hasta arriba para que el usuario
  // comience a visualizar la sección desde su inicio.
  window.scrollTo(0, 0);
}


// ==========================================================
// RENDERIZADO DE LA INFORMACIÓN
// ==========================================================

// Esta función se encarga de actualizar los indicadores principales
// que aparecen en la pantalla de inicio.
//
// Obtiene los datos actuales y los coloca en los elementos del HTML.
// Así podemos ver cuántas cuentas existen y cuánto dinero se ha
// depositado y retirado en total.
function renderizarIndicadores(): void {

  // Obtenemos la lista actualizada de todas las cuentas.
  const cuentas = obtenerCuentas();

  // Calculamos los totales generales de depósitos y retiros.
  const general = calcularResumenGeneral();

  // Mostramos la cantidad total de cuentas registradas.
  // String convierte el número a texto porque textContent recibe texto.
  el("k-total").textContent = String(cuentas.length);

  // filter recorre las cuentas y conserva solamente las que
  // tienen el estado "activa". length nos da cuántas encontró.
  el("k-activas").textContent = String(cuentas.filter((c) => c.estado === "activa").length);

  // Hacemos lo mismo, pero contando las cuentas inactivas.
  el("k-inactivas").textContent = String(cuentas.filter((c) => c.estado === "inactiva").length);

  // Colocamos los totales de dinero utilizando nuestra función dinero()
  // para que aparezcan con el formato de dos decimales.
  el("k-dep").textContent = dinero(general.totalDepositado);
  el("k-ret").textContent = dinero(general.totalRetirado);
}


// Esta función construye el contenido de la pantalla de inicio.
// Muestra los datos de la cuenta seleccionada y los últimos movimientos.
function renderizarInicio(): void {

  // Primero comprobamos si existe una cuenta seleccionada.
  // Si cuentaSeleccionadaId tiene un número, buscamos esa cuenta.
  // Si su valor es null, significa que todavía no se ha elegido ninguna.
  const cuenta = cuentaSeleccionadaId === null
    ? undefined
    : buscarCuentaPorId(cuentaSeleccionadaId);

  // Si no encontramos una cuenta, mostramos un mensaje indicando
  // que todavía no se ha seleccionado ninguna.
  if (cuenta === undefined) {

    // Con innerHTML colocamos el mensaje y un botón que lleva
    // al usuario a la sección de cuentas para elegir una.
    el("inicio-cuenta").innerHTML = `<div class="vacio"><i class="bi bi-person-badge"></i>No hay ninguna cuenta seleccionada.<br>` +
      `<button class="btn btn-oro btn-sm mt-3" data-seccion="cuentas">Elegir una cuenta</button></div>`;

  } else {

    // Si existe una cuenta seleccionada, mostramos su información.
    // Se incluye el nombre del titular, el número de cuenta,
    // su estado y el saldo disponible.
    el("inicio-cuenta").innerHTML = `<div class="fw-bold fs-5">${esc(cuenta.titular)}</div>` +
      `<div class="text-secondary small mb-2">Cuenta N.º ${cuenta.id} · ${etiquetaEstado(cuenta.estado)}</div>` +
      `<div class="text-secondary small">Saldo disponible</div><div class="fs-2 fw-bold" style="color:var(--marino)">${dinero(cuenta.saldo)}</div>` +

      // También agregamos tres botones para facilitar el acceso
      // a las funciones más utilizadas desde la pantalla de inicio.
      // Cada botón tiene data-seccion para identificar a dónde debe llevar.
      `<div class="d-flex flex-wrap gap-2 mt-3"><button class="btn btn-success btn-sm" data-seccion="depositos"><i class="bi bi-plus-circle"></i> Depositar</button>` +
      `<button class="btn btn-danger btn-sm" data-seccion="retiros"><i class="bi bi-dash-circle"></i> Retirar</button>` +
      `<button class="btn btn-univo btn-sm" data-seccion="movimientos"><i class="bi bi-clock-history"></i> Movimientos</button></div>`;
  }

  // Obtenemos los últimos seis movimientos de la lista general.
  // slice(-6) toma los últimos seis elementos y reverse() cambia
  // el orden para que el movimiento más reciente aparezca primero.
  const ultimos = movimientos.slice(-6).reverse();

  // map recorre los movimientos y construye una fila HTML para cada uno.
  // En cada fila mostramos el tipo de movimiento, el titular,
  // el monto y la fecha en que se realizó.
  //
  // join("") une todas las filas en un solo texto HTML
  // para poder colocarlas dentro de la tabla.
  el("inicio-ultimos").innerHTML = ultimos.map((m) =>
    `<tr><td>${etiquetaTipo(m.tipo)}</td><td>${esc(titularDe(m.cuentaId))}</td>` +
    `<td class="text-end ${m.tipo === "deposito" ? "m-dep" : "m-ret"}">${m.tipo === "deposito" ? "+" : "−"}${dinero(m.monto)}</td><td class="small">${m.fecha}</td></tr>`
  ).join("");

  // Si la lista de movimientos está vacía, mostramos el mensaje
  // que indica que todavía no existen movimientos registrados.
  vacio("vacio-ultimos", ultimos.length === 0);
}


// Esta función muestra las cuentas bancarias en la tabla.
// También se encarga de aplicar la búsqueda por titular
// y el filtro para mostrar cuentas activas o inactivas.
function renderizarCuentas(): void {

  // Leemos el texto que el usuario escribió en el buscador.
  // HTMLInputElement nos permite trabajar con la propiedad value del campo.
  const texto = (el("busqueda") as HTMLInputElement).value;

  // Obtenemos la opción que el usuario seleccionó en el filtro de estado.
  // El resultado se guarda como FiltroEstado para respetar los tipos definidos.
  const filtro = (el("filtro-estado") as HTMLSelectElement).value as FiltroEstado;

  // Primero buscamos las cuentas cuyo titular coincide con el texto escrito.
  // Después aplicamos el filtro de estado sobre las cuentas encontradas.
  // El resultado final contiene solamente las cuentas que debemos mostrar.
  const visibles: Cuenta[] = filtrarCuentasPorEstado(
    buscarCuentasPorTitular(obtenerCuentas(), texto),
    filtro
  );

  // Buscamos el cuerpo de la tabla donde se colocarán los resultados.
  // querySelector("tbody") permite acceder a la parte de la tabla
  // que contiene las filas y no a sus encabezados.
  const cuerpo = el("tabla-cuentas").querySelector("tbody") as HTMLElement;

  // Recorremos las cuentas encontradas y construimos una fila para cada una.
  // Mostramos su ID, titular, estado, saldo y un botón para consultarla.
  // El atributo data-consultar guarda el ID de la cuenta que corresponde
  // al botón, para poder identificarla cuando el usuario haga clic.
  cuerpo.innerHTML = visibles.map((c) =>
    `<tr><td>${c.id}</td><td class="fw-medium">${esc(c.titular)}</td><td>${etiquetaEstado(c.estado)}</td>` +
    `<td class="text-end">${dinero(c.saldo)}</td><td class="text-end"><button class="btn btn-sm btn-outline-primary" data-consultar="${c.id}">Consultar</button></td></tr>`
  ).join("");

  // Si después de buscar y filtrar no quedan cuentas para mostrar,
  // activamos el mensaje que informa que no hay resultados.
  vacio("vacio-cuentas", visibles.length === 0);
}


// Esta función muestra información de la cuenta seleccionada
// dentro de los formularios de depósitos y retiros.
//
// Recibe el ID del contenedor donde debe colocar la información.
// Por eso podemos utilizar la misma función para los dos formularios.
function renderizarInfoOperacion(idInfo: string): void {

  // Comprobamos si hay una cuenta seleccionada y la buscamos.
  const cuenta = cuentaSeleccionadaId === null
    ? undefined
    : buscarCuentaPorId(cuentaSeleccionadaId);

  // Si no hay una cuenta, mostramos un aviso para que el usuario
  // sepa que necesita seleccionar una o escribir su ID.
  //
  // Si sí existe una cuenta, mostramos el nombre del titular,
  // el estado de la cuenta y su saldo actual.
  el(idInfo).innerHTML = cuenta === undefined
    ? `<div class="alert alert-light border mb-0 small">No hay cuenta seleccionada. Elija una en «Cuentas bancarias» o escriba su ID.</div>`
    : `<div class="p-3 rounded-3" style="background:var(--fondo)"><div class="fw-bold">${esc(cuenta.titular)} ${etiquetaEstado(cuenta.estado)}</div>` +
      `<div class="small text-secondary">Saldo actual: <strong>${dinero(cuenta.saldo)}</strong></div></div>`;
}


// Esta función muestra el historial de movimientos de una cuenta.
//
// Permite consultar los depósitos y retiros registrados
// y aplicar un filtro para ver solamente un tipo de movimiento.
function renderizarHistorial(): void {

  // Buscamos la cuenta que está seleccionada actualmente.
  const cuenta = cuentaSeleccionadaId === null
    ? undefined
    : buscarCuentaPorId(cuentaSeleccionadaId);

  // Obtenemos el cuerpo de la tabla del historial.
  const cuerpo = el("tabla-historial").querySelector("tbody") as HTMLElement;

  // Limpiamos el contenido anterior para evitar que se repitan
  // las filas cuando volvamos a cargar o filtrar el historial.
  cuerpo.innerHTML = "";

  // Recorremos los botones de filtro para actualizar su apariencia.
  // Comparamos el tipo de cada botón con el filtro actual.
  // Si coincide, le damos la clase que indica que está seleccionado.
  document.querySelectorAll<HTMLElement>("#filtros-tipo button").forEach((b) => {
    const activo = b.dataset.tipo === filtroTipoActual;

    b.className = `btn btn-sm ${activo ? "btn-univo" : "btn-outline-secondary"}`;
  });

  // Si no hay una cuenta seleccionada, no podemos mostrar su historial.
  // Por eso colocamos un mensaje, mostramos el aviso y detenemos la función
  // con return para evitar que se siga ejecutando el resto del código.
  if (cuenta === undefined) {
    el("mov-info").textContent = "";
    el("texto-vacio-historial").textContent = "Seleccione una cuenta para ver su historial.";
    vacio("vacio-historial", true);
    return;
  }

  // Mostramos el nombre del titular y el número de la cuenta
  // que estamos consultando en ese momento.
  el("mov-info").innerHTML = `Historial de <strong>${esc(cuenta.titular)}</strong> (cuenta ${cuenta.id})`;

  // Obtenemos todos los movimientos que pertenecen a esa cuenta.
  const delaCuenta = obtenerMovimientosDeCuenta(cuenta.id);

  // Aplicamos el filtro que el usuario seleccionó.
  // Por ejemplo, puede mostrar todos los movimientos,
  // solamente los depósitos o solamente los retiros.
  const visibles = filtrarMovimientosPorTipo(delaCuenta, filtroTipoActual);

  // Recorremos los movimientos que pasaron el filtro
  // y creamos una fila con sus datos para mostrarlos en la tabla.
  el("tabla-historial").querySelector("tbody")!.innerHTML = visibles.map((m) =>
    `<tr><td>${m.id}</td><td>${esc(titularDe(m.cuentaId))}</td><td>${m.cuentaId}</td><td>${etiquetaTipo(m.tipo)}</td>` +
    `<td class="text-end ${m.tipo === "deposito" ? "m-dep" : "m-ret"}">${m.tipo === "deposito" ? "+" : "−"}${dinero(m.monto)}</td><td class="small">${m.fecha}</td></tr>`
  ).join("");

  // Comprobamos por qué no hay resultados para mostrar.
  // Si la cuenta nunca ha tenido movimientos, mostramos un mensaje.
  // Si sí tiene movimientos, pero el filtro no encontró coincidencias,
  // indicamos que no hay resultados para el tipo seleccionado.
  el("texto-vacio-historial").textContent = delaCuenta.length === 0
    ? "Esta cuenta todavía no tiene movimientos."
    : "No hay resultados para el tipo de movimiento seleccionado.";

  // Mostramos u ocultamos el aviso según la cantidad de resultados.
  vacio("vacio-historial", visibles.length === 0);
}


// Esta función calcula y muestra el resumen de las operaciones
// que se han realizado en la cuenta seleccionada.
//
// Aquí se muestran los totales de depósitos, retiros, cantidad
// de movimientos y saldo actual.
function renderizarResumen(): void {

  // Buscamos la cuenta que se encuentra seleccionada.
  const cuenta = cuentaSeleccionadaId === null
    ? undefined
    : buscarCuentaPorId(cuentaSeleccionadaId);

  // Si no hay una cuenta seleccionada, mostramos el aviso de que
  // no existe información y ocultamos el contenido del resumen.
  // Si hay una cuenta, hacemos lo contrario.
  vacio("res-vacio", cuenta === undefined);
  vacio("res-contenido", cuenta !== undefined);

  // Si no encontramos una cuenta, detenemos la función.
  // No podemos calcular un resumen sin saber qué cuenta consultar.
  if (cuenta === undefined) {
    return;
  }

  // Obtenemos los totales de depósitos y retiros de esta cuenta.
  const r = calcularResumen(cuenta.id);

  // Sumamos los depósitos y retiros para conocer el total de operaciones.
  const total = r.totalDepositado + r.totalRetirado;

  // Calculamos qué porcentaje representan los depósitos.
  // Si el total es cero, dejamos el porcentaje en cero para evitar
  // dividir entre cero y provocar un resultado incorrecto.
  const pctDep = total === 0 ? 0 : (r.totalDepositado / total) * 100;

  // Colocamos el nombre del titular y el número de cuenta en el resumen.
  el("res-titular").innerHTML = `Resumen de <strong>${esc(cuenta.titular)}</strong> (cuenta ${cuenta.id})`;

  // Mostramos los totales de dinero, la cantidad de movimientos
  // y el saldo actual de la cuenta.
  el("res-dep").textContent = dinero(r.totalDepositado);
  el("res-ret").textContent = dinero(r.totalRetirado);
  el("res-cant").textContent = String(obtenerMovimientosDeCuenta(cuenta.id).length);
  el("res-saldo").textContent = dinero(cuenta.saldo);

  // Actualizamos el ancho de las barras de progreso.
  // La primera representa el porcentaje de depósitos.
  // La segunda representa el porcentaje restante, correspondiente a los retiros.
  el("res-barra-dep").style.width = pctDep + "%";
  el("res-barra-ret").style.width = (total === 0 ? 0 : 100 - pctDep) + "%";

  // Mostramos los porcentajes que corresponden a cada operación.
  // Si todavía no hay operaciones, indicamos que no existen registros.
  el("res-barra-txt").textContent = total === 0
    ? "Sin operaciones registradas."
    : `Depósitos ${pctDep.toFixed(0)}% · Retiros ${(100 - pctDep).toFixed(0)}%`;
}


// Esta función reúne todas las funciones de actualización de la página.
//
// Se utiliza cuando cambian los datos de las cuentas o se realiza
// una operación, para que la información que ve el usuario
// siempre esté actualizada.
//
// En lugar de llamar cada función por separado en diferentes partes
// del programa, podemos llamar solamente a actualizarPantalla().
function actualizarPantalla(): void {
  renderizarIndicadores();
  renderizarInicio();
  renderizarCuentas();
  renderizarInfoOperacion("dep-info");
  renderizarInfoOperacion("ret-info");
  renderizarHistorial();
  renderizarResumen();
}


// Esta función permite seleccionar una cuenta utilizando su ID.
//
// Guarda el ID en la variable cuentaSeleccionadaId y también
// coloca ese número en los campos de los formularios de depósito y retiro.
//
// Finalmente actualiza la página para que se muestre la información
// correspondiente a la cuenta que acabamos de seleccionar.
function seleccionarCuenta(id: number): void {
  cuentaSeleccionadaId = id;

  // Colocamos el ID en ambos formularios para que el usuario
  // no tenga que escribirlo nuevamente si desea hacer una operación.
  (el("dep-id") as HTMLInputElement).value = String(id);
  (el("ret-id") as HTMLInputElement).value = String(id);

  // Actualizamos todas las secciones con los datos de la cuenta seleccionada.
  actualizarPantalla();
}


// ==========================================================
// DEPÓSITOS Y RETIROS
// ==========================================================

// Esta función permite ejecutar tanto un depósito como un retiro.
//
// Recibe dos parámetros:
// operacion: es la función que se debe ejecutar, puede ser depositar o retirar.
// prefijo: indica qué formulario se está utilizando, "dep" o "ret".
//
// De esta manera no necesitamos crear una función diferente
// para leer los campos y procesar cada formulario.
function ejecutarOperacion(
  operacion: (id: number, monto: number) => ResultadoOperacion,
  prefijo: string
): void {

  // Buscamos los campos del formulario según el prefijo recibido.
  // Por ejemplo, si el prefijo es "dep", buscamos "dep-id" y "dep-monto".
  const campoId = el(prefijo + "-id") as HTMLInputElement;
  const campoMonto = el(prefijo + "-monto") as HTMLInputElement;

  // Leemos los valores escritos por el usuario y los convertimos a números.
  // El primer valor corresponde al ID de la cuenta y el segundo al monto.
  const cuentaId = textoANumero(campoId.value);

  // Ejecutamos la operación que recibimos como parámetro.
  // Su resultado nos indica si fue exitosa y qué mensaje debemos mostrar.
  const resultado = operacion(cuentaId, textoANumero(campoMonto.value));

  // Mostramos una notificación con el mensaje que devolvió la operación.
  // El segundo parámetro indica si debemos mostrar un mensaje de éxito o error.
  mostrarToast(resultado.mensaje, resultado.exito);

  // Si la operación fue exitosa, limpiamos el campo del monto
  // y seleccionamos nuevamente la cuenta para actualizar sus datos.
  if (resultado.exito) {
    campoMonto.value = "";
    seleccionarCuenta(cuentaId);

  } else {

    // Si la operación fue rechazada, no borramos lo que el usuario escribió.
    // Solamente actualizamos la información que aparece en pantalla.
    actualizarPantalla();
  }
}


// ==========================================================
// EVENTOS
// ==========================================================

// Esta función registra los eventos que permiten que la página
// responda a las acciones realizadas por el usuario.
//
// Aquí configuramos los clics, las búsquedas, los filtros
// y el envío de los formularios.
export function configurarEventos(): void {

  // Escuchamos los clics que ocurran en cualquier parte del documento.
  //
  // Utilizamos la delegación de eventos porque algunos botones se crean
  // después de cargar la página, por ejemplo, los botones de consultar
  // que aparecen dentro de la tabla de cuentas.
  //
  // Así podemos detectar sus clics sin tener que agregar un evento
  // individual a cada botón.
  document.addEventListener("click", (evento) => {

    // Obtenemos el elemento exacto sobre el que el usuario hizo clic.
    // Lo convertimos a HTMLElement para poder utilizar sus propiedades.
    const objetivo = evento.target as HTMLElement;

    // Revisamos si el elemento seleccionado o alguno de sus elementos
    // superiores tiene el atributo data-seccion.
    // Ese atributo se utiliza en los botones que permiten navegar.
    const navegar = objetivo.closest<HTMLElement>("[data-seccion]");

    // Si encontramos un elemento con data-seccion, obtenemos su valor
    // y llamamos a irA() para mostrar la sección correspondiente.
    // Después usamos return para terminar esta parte del evento.
    if (navegar !== null) {
      irA(navegar.dataset.seccion as string);
      return;
    }

    // Ahora revisamos si el clic corresponde a un botón para consultar
    // una cuenta. Este botón tiene el atributo data-consultar.
    const consultar = objetivo.closest<HTMLElement>("[data-consultar]");

    // Si encontramos ese botón, obtenemos el ID de la cuenta,
    // lo convertimos a número y seleccionamos esa cuenta.
    // Después llevamos al usuario a la pantalla de inicio.
    if (consultar !== null) {
      seleccionarCuenta(Number(consultar.dataset.consultar));
      irA("inicio");
      return;
    }

    // Finalmente revisamos si el usuario hizo clic en alguno
    // de los botones que sirven para filtrar el historial.
    const filtro = objetivo.closest<HTMLElement>("#filtros-tipo button");

    // Si encontró un botón de filtro, guardamos el tipo seleccionado.
    // Luego volvemos a mostrar el historial aplicando ese filtro.
    if (filtro !== null) {
      filtroTipoActual = filtro.dataset.tipo as FiltroTipo;
      renderizarHistorial();
    }
  });


  // Escuchamos cuando el usuario intenta enviar el formulario de depósito.
  el("form-dep").addEventListener("submit", (e) => {

    // Evitamos el comportamiento normal del formulario,
    // que sería enviar los datos y recargar la página.
    // Así podemos procesar el depósito desde TypeScript.
    e.preventDefault();

    // Llamamos a ejecutarOperacion y le pasamos la función depositar.
    // El prefijo "dep" indica que debe leer los campos del formulario de depósito.
    ejecutarOperacion(depositar, "dep");
  });


  // Registramos el evento para el formulario de retiro.
  el("form-ret").addEventListener("submit", (e) => {

    // También evitamos que la página se recargue al enviar el formulario.
    e.preventDefault();

    // Ejecutamos la operación utilizando la función retirar
    // y el prefijo "ret" para identificar sus campos.
    ejecutarOperacion(retirar, "ret");
  });


  // Escuchamos el evento input del buscador.
  // Se ejecuta cada vez que el usuario escribe o modifica el texto.
  // Por eso la tabla se actualiza mientras se escribe el nombre.
  el("busqueda").addEventListener("input", renderizarCuentas);


  // Escuchamos cuando el usuario cambia la opción del filtro de estado.
  // Al cambiar la selección, volvemos a generar la tabla
  // para mostrar solamente las cuentas que corresponden.
  el("filtro-estado").addEventListener("change", renderizarCuentas);


  // Obtenemos la fecha actual del dispositivo y la mostramos en la página.
  // toLocaleDateString utiliza "es-SV" para mostrarla en español
  // y con el formato correspondiente a El Salvador.
  el("fecha").textContent = new Date().toLocaleDateString("es-SV", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}


// ==========================================================
// PANTALLA INICIAL
// ==========================================================

// Esta función se utiliza cuando la aplicación termina de cargar.
//
// Primero oculta el mensaje o elemento de carga que se muestra
// mientras se prepara la página.
//
// Después llama a actualizarPantalla() para mostrar los indicadores,
// las cuentas, el historial y los demás datos iniciales.
export function mostrarPantallaInicial(): void {

  // Ocultamos el elemento de carga utilizando la clase d-none de Bootstrap.
  el("carga").classList.add("d-none");

  // Cargamos y mostramos la información inicial de todas las secciones.
  actualizarPantalla();
}
