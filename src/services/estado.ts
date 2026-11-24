// =========================================================
// ===== Datos que viven en memoria mientras la página está abierta =====
// =========================================================

// Importa las estructuras principales para tipar las cuentas, transacciones y la sesión actual
import { Cuenta, Movimiento, Sesion } from "../types/tipos.js";

// Arreglo en memoria que almacena todas las cuentas cargadas en la sesión actual
export const cuentas: Cuenta[] = [];

// Arreglo en memoria que guarda el historial de depósitos y retiros realizados
export const movimientos: Movimiento[] = [];

// Objeto que representa la sesión activa (nadie ha ingresado al empezar)
export const sesion: Sesion = { rol: null, cuentaId: null };

/**
 * Deja el sistema en su estado inicial con la lista de cuentas indicada:
 * limpia los movimientos y cierra cualquier sesión activa.
 * Se utiliza al cargar el JSON inicial y al preparar escenarios en las pruebas.
 *
 * @param listaCuentas - Colección de cuentas con la que se inicializará el estado
 */
export function reiniciarEstado(listaCuentas: Cuenta[]): void {
  // Vacía el arreglo existente manteniendo la misma referencia exportada
  cuentas.length = 0;
  // Inserta las nuevas cuentas recibidas como elementos individuales
  cuentas.push(...listaCuentas);
  // Borra todo el historial de movimientos previos
  movimientos.length = 0;
  // Restablece el rol y el ID de cuenta a null para indicar que no hay sesión activa
  sesion.rol = null;
  sesion.cuentaId = null;
}