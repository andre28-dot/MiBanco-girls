// ===== Búsquedas y filtros de cuentas (uso del administrador) =====
import { Cuenta, FiltroEstado } from "../types/tipos.js";

// Busca por nombre completo/parcial (sin distinguir mayúsculas) o por ID exacto.
// filter() crea un arreglo nuevo: la lista original no se modifica.
export function buscarCuentas(lista: Cuenta[], texto: string): Cuenta[] {
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
  return lista.filter((cuenta) => cuenta.estado === filtro);
}
