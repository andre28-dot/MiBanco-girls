// ===== Búsquedas y filtros de cuentas =====
import { Cuenta, FiltroEstado } from "./tipos.js";

// Busca por nombre completo o parcial, sin distinguir mayúsculas/minúsculas.
// filter() crea un arreglo nuevo: la lista original no se modifica.
export function buscarCuentasPorTitular(lista: Cuenta[], texto: string): Cuenta[] {
  const textoBuscado = texto.trim().toLowerCase();
  return lista.filter((cuenta) => cuenta.titular.toLowerCase().includes(textoBuscado));
}

// Filtra por estado. "todas" devuelve la lista completa.
export function filtrarCuentasPorEstado(lista: Cuenta[], filtro: FiltroEstado): Cuenta[] {
  if (filtro === "todas") {
    return lista;
  }
  return lista.filter((cuenta) => cuenta.estado === filtro);
}
