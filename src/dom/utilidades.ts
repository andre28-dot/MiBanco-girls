// ===== Funciones pequeñas que usan todas las pantallas =

//en utilidades.ts se encuentran funciones auxiliares que son utilizadas en todas las pantallas de la aplicación.
//  Estas funciones incluyen la búsqueda de elementos HTML por su id, la obtención de campos de entrada, listas desplegables 
// y formularios, así como la creación de celdas de tabla y la visualización de avisos emergentes. Además, se proporcionan funciones 
// para formatear dinero, escapar texto para evitar la ejecución de HTML, convertir texto a número y manejar filtros de estado y tipo 
// para cuentas y movimientos. Estas utilidades facilitan la interacción con el DOM y mejoran la experiencia del usuario al proporcionar
//  mensajes claros y formatos consistentes en toda la aplicación.

// Importamos los tipos que se utilizan para manejar los filtros.
import { FiltroEstado, FiltroTipo } from "../types/tipos.js";

// Busca un elemento del HTML usando su id y lo devuelve.
export function el(id: string): HTMLElement {
  // Buscamos el elemento en el documento.
  const elemento = document.getElementById(id);
  // Revisamos si el elemento no existe.
  if (elemento === null) {
    // Mostramos un error indicando qué elemento no se encontró.
    throw new Error(`No existe el elemento con id "${id}" en el HTML`);
  }
  // Si existe, devolvemos el elemento encontrado.
  return elemento;
}

// Busca un elemento y comprueba que sea un campo de entrada.
export function obtenerEntrada(id: string): HTMLInputElement {
  // Obtenemos el elemento usando su id.
  const elemento = el(id);
  // Verificamos que realmente sea un input.
  if (!(elemento instanceof HTMLInputElement)) {
    // Si no es un input, mostramos un error.
    throw new Error(`El elemento "${id}" no es un input`);
  }
  // Devolvemos el campo de entrada.
  return elemento;
}

// Busca un elemento y comprueba que sea una lista desplegable.
export function obtenerSelect(id: string): HTMLSelectElement {
  // Obtenemos el elemento usando su id.
  const elemento = el(id);
  // Verificamos que sea un select.
  if (!(elemento instanceof HTMLSelectElement)) {
    // Si no es un select, mostramos un error.
    throw new Error(`El elemento "${id}" no es un select`);
  }
  // Devolvemos la lista desplegable.
  return elemento;
}

// Busca un elemento y comprueba que sea un formulario.
export function obtenerFormulario(id: string): HTMLFormElement {
  // Obtenemos el elemento usando su id.
  const elemento = el(id);
  // Revisamos que el elemento sea un formulario.
  if (!(elemento instanceof HTMLFormElement)) {
    // Si no es un formulario, mostramos un error.
    throw new Error(`El elemento "${id}" no es un formulario`);
  }
  // Devolvemos el formulario encontrado.
  return elemento;
}

// Devuelve el <tbody> de una tabla.
// Busca la parte de la tabla donde se colocan las filas de información.
export function cuerpoDeTabla(idTabla: string): HTMLElement {
  // Buscamos el cuerpo de la tabla usando su id.
  const cuerpo = el(idTabla).querySelector("tbody");
  // Comprobamos que la tabla tenga un tbody.
  if (cuerpo === null) {
    // Si no lo encuentra, mostramos un error.
    throw new Error(`La tabla "${idTabla}" no tiene tbody`);
  }
  // Devolvemos el cuerpo de la tabla.
  return cuerpo;
}

// Formato monetario: 1500.5 -> $1,500.50
// Recibe una cantidad y la convierte a un formato de dinero.
export function dinero(numero: number): string {
  // Agrega el símbolo de dólar, separa los miles y deja dos decimales.
  return "$" + numero.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Convierte caracteres especiales a código HTML para que un texto nunca se ejecute como HTML.
// Recibe un texto y reemplaza los caracteres que podrían interpretarse como código.
export function esc(texto: string): string {
  // Busca los caracteres especiales y los convierte a su código correspondiente.
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Un campo vacío produce NaN, y las validaciones lo rechazan.
// Convierte el texto recibido en un número.
export function textoANumero(texto: string): number {
  // Si el texto está vacío devuelve NaN; si tiene contenido, lo convierte a número.
  return texto.trim() === "" ? NaN : Number(texto);
}

// Convierte el estado de una cuenta en una etiqueta que se muestra en pantalla.
export function etiquetaEstado(estado: string): string {
  // Según el estado recibido, selecciona el texto que se mostrará.
  const texto = estado === "activa" ? "Activa" : "Inactiva";
  // Devuelve el código HTML de la etiqueta con su clase correspondiente.
  return `<span class="etiqueta etiqueta-${estado}">${texto}</span>`;
}

// Convierte el tipo de movimiento en una etiqueta para mostrarlo en pantalla.
export function etiquetaTipo(tipo: string): string {
  // Comprueba si el movimiento es un depósito o un retiro.
  const texto = tipo === "deposito" ? "Depósito" : "Retiro";
  // Devuelve la etiqueta con el texto y la clase correspondiente.
  return `<span class="etiqueta etiqueta-${tipo}">${texto}</span>`;
}

// Convierte el texto de un botón/select en un valor válido de filtro (o null si no lo es).
// Recibe el texto seleccionado y comprueba si corresponde a un tipo permitido.
export function leerFiltroTipo(texto: string | undefined): FiltroTipo | null {
  // Verifica si el texto es uno de los tres filtros disponibles.
  if (texto === "todos" || texto === "deposito" || texto === "retiro") {
    // Si es válido, devuelve el mismo texto.
    return texto;
  }
  // Si no coincide con ninguna opción, devuelve null.
  return null;
}

// Comprueba el texto recibido y devuelve un estado de cuenta válido para filtrar.
export function leerFiltroEstado(texto: string): FiltroEstado {
  // Revisa si el texto indica que la cuenta está activa o inactiva.
  if (texto === "activa" || texto === "inactiva") {
    // Si coincide, devuelve el estado recibido.
    return texto;
  }
  // Si no coincide, devuelve el filtro para mostrar todas las cuentas.
  return "todas";
}

// Marca como "activo" el botón del grupo cuyo data-tipo coincide con el filtro actual.
// Recibe el id del grupo de botones y el filtro que está seleccionado.
export function marcarFiltroActivo(idGrupo: string, filtro: FiltroTipo): void {
  // Busca todos los botones que se encuentran dentro del grupo.
  el(idGrupo).querySelectorAll<HTMLElement>("button").forEach((boton) => {
    // Activa el botón que coincide con el filtro y desactiva los demás.
    boton.classList.toggle("activo", boton.dataset.tipo === filtro);
  });
}

// Aviso emergente (toast) que desaparece solo a los 4.5 segundos o al hacer clic.
// Recibe el mensaje que se mostrará y un valor que indica si fue exitoso.
export function mostrarAviso(mensaje: string, exito: boolean): void {
  // Crea un nuevo elemento de párrafo para mostrar el aviso.
  const aviso = document.createElement("p");
  // Coloca una clase diferente dependiendo de si la operación salió bien o mal.
  aviso.className = exito ? "aviso aviso-exito" : "aviso aviso-error";
  // Escribe el mensaje dentro del aviso.
  aviso.textContent = mensaje;
  // Permite cerrar el aviso cuando la persona hace clic sobre él.
  aviso.addEventListener("click", () => aviso.remove());
  // Agrega el aviso al espacio destinado para las notificaciones.
  el("avisos").appendChild(aviso);
  // Elimina automáticamente el aviso después de 4.5 segundos.
  window.setTimeout(() => aviso.remove(), 4500);
}

// Crea una celda <td> con un texto. Si se indica una clase CSS, también se la pone.
// Se usa con textContent, así que el texto nunca se interpreta como HTML.
// Recibe el texto y una clase opcional para personalizar la celda.
export function crearCelda(texto: string, clase: string = ""): HTMLTableCellElement {
  // Crea una nueva celda para una tabla.
  const celda = document.createElement("td");
  // Coloca el texto recibido dentro de la celda.
  celda.textContent = texto;
  // Comprueba si se recibió una clase CSS.
  if (clase !== "") {
    // Si hay una clase, se la asigna a la celda.
    celda.className = clase;
  }
  // Devuelve la celda lista para agregarla a la tabla.
  return celda;
}