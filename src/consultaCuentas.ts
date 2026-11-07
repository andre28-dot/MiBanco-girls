// ===== Consulta de cuentas =====
import { Cuenta } from "./tipos.js";
import { cuentas } from "./estado.js";

// Devuelve todas las cuentas cargadas.
export function obtenerCuentas(): Cuenta[] {
  return cuentas;
}

// Busca una cuenta por su identificador. Si no existe devuelve undefined.
export function buscarCuentaPorId(id: number): Cuenta | undefined {
  return cuentas.find((cuenta) => cuenta.id === id);
}
