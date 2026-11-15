// ===== Funciones pequeñas que usan todas las pantallas =====
import { FiltroEstado, FiltroTipo } from "../types/tipos.js";

// Busca un elemento por id. Si no existe avisa con un error claro.
export function el(id: string): HTMLElement {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    throw new Error(`No existe el elemento con id "${id}" en el HTML`);
  }
  return elemento;
}

export function obtenerEntrada(id: string): HTMLInputElement {
  const elemento = el(id);
  if (!(elemento instanceof HTMLInputElement)) {
    throw new Error(`El elemento "${id}" no es un input`);
  }
  return elemento;
}

export function obtenerSelect(id: string): HTMLSelectElement {
  const elemento = el(id);
  if (!(elemento instanceof HTMLSelectElement)) {
    throw new Error(`El elemento "${id}" no es un select`);
  }
  return elemento;
}

export function obtenerFormulario(id: string): HTMLFormElement {
  const elemento = el(id);
  if (!(elemento instanceof HTMLFormElement)) {
    throw new Error(`El elemento "${id}" no es un formulario`);
  }
  return elemento;
}

// Devuelve el <tbody> de una tabla.
export function cuerpoDeTabla(idTabla: string): HTMLElement {
  const cuerpo = el(idTabla).querySelector("tbody");
  if (cuerpo === null) {
    throw new Error(`La tabla "${idTabla}" no tiene tbody`);
  }
  return cuerpo;
}

// Formato monetario: 1500.5 -> $1,500.50
export function dinero(numero: number): string {
  return "$" + numero.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Convierte caracteres especiales a código HTML para que un texto nunca se ejecute como HTML.
export function esc(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Un campo vacío produce NaN, y las validaciones lo rechazan.
export function textoANumero(texto: string): number {
  return texto.trim() === "" ? NaN : Number(texto);
}

export function etiquetaEstado(estado: string): string {
  const texto = estado === "activa" ? "Activa" : "Inactiva";
  return `<span class="etiqueta etiqueta-${estado}">${texto}</span>`;
}

export function etiquetaTipo(tipo: string): string {
  const texto = tipo === "deposito" ? "Depósito" : "Retiro";
  return `<span class="etiqueta etiqueta-${tipo}">${texto}</span>`;
}

// Convierte el texto de un botón/select en un valor válido de filtro (o null si no lo es).
export function leerFiltroTipo(texto: string | undefined): FiltroTipo | null {
  if (texto === "todos" || texto === "deposito" || texto === "retiro") {
    return texto;
  }
  return null;
}

export function leerFiltroEstado(texto: string): FiltroEstado {
  if (texto === "activa" || texto === "inactiva") {
    return texto;
  }
  return "todas";
}

// Marca como "activo" el botón del grupo cuyo data-tipo coincide con el filtro actual.
export function marcarFiltroActivo(idGrupo: string, filtro: FiltroTipo): void {
  el(idGrupo).querySelectorAll<HTMLElement>("button").forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.tipo === filtro);
  });
}

// Aviso emergente (toast) que desaparece solo a los 4.5 segundos o al hacer clic.
export function mostrarAviso(mensaje: string, exito: boolean): void {
  const aviso = document.createElement("p");
  aviso.className = exito ? "aviso aviso-exito" : "aviso aviso-error";
  aviso.textContent = mensaje;
  aviso.addEventListener("click", () => aviso.remove());
  el("avisos").appendChild(aviso);
  window.setTimeout(() => aviso.remove(), 4500);
}

// Crea una celda <td> con un texto. Si se indica una clase CSS, también se la pone.
// Se usa con textContent, así que el texto nunca se interpreta como HTML.
export function crearCelda(texto: string, clase: string = ""): HTMLTableCellElement {
  const celda = document.createElement("td");
  celda.textContent = texto;
  if (clase !== "") {
    celda.className = clase;
  }
  return celda;
}
