// ===== Búsquedas y filtros de cuentas (uso del administrador) =====

// Importa los tipos de datos necesarios para las funciones de búsqueda y filtrado.
import { Cuenta, FiltroEstado } from "../types/tipos.js";

// Busca por nombre completo/parcial (sin distinguir mayúsculas) o por ID exacto.
// filter() crea un arreglo nuevo: la lista original no se modifica.
export function buscarCuentas(lista: Cuenta[], texto: string): Cuenta[] {
  // Convierte el texto buscado a minúsculas y elimina espacios al inicio y al final.
  const textoBuscado = texto.trim().toLowerCase();
  return lista.filter(
    (cuenta) =>
      cuenta.titular.toLowerCase().includes(textoBuscado) || String(cuenta.id) === textoBuscado
  );
}

// Filtra por estado. "todas" devuelve la lista completa.
export function filtrarCuentasPorEstado(lista: Cuenta[], filtro: FiltroEstado): Cuenta[] {
  if (filtro === "todas") {
    return lista;
  }
  // Devuelve solo las cuentas cuyo estado coincide con el filtro.
  return lista.filter((cuenta) => cuenta.estado === filtro);
}
