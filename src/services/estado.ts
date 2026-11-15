// ===== Datos que viven en memoria mientras la página está abierta =====
import { Cuenta, Movimiento, Sesion } from "../types/tipos.js";

export const cuentas: Cuenta[] = [];
export const movimientos: Movimiento[] = [];

// Sesión activa (nadie ha ingresado al empezar)
export const sesion: Sesion = { rol: null, cuentaId: null };

// Deja el sistema en su estado inicial con la lista de cuentas indicada:
// sin movimientos y sin sesión abierta. Se usa al cargar el JSON y en las pruebas.
export function reiniciarEstado(listaCuentas: Cuenta[]): void {
  cuentas.length = 0;
  cuentas.push(...listaCuentas);
  movimientos.length = 0;
  sesion.rol = null;
  sesion.cuentaId = null;
}
