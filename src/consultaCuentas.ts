// ===== Consulta de cuentas =====

// Importamos el tipo Cuenta para trabajar con los datos de las cuentas.
import { Cuenta } from "./tipos.js";

// Importamos el arreglo donde están guardadas las cuentas.
import { cuentas } from "./estado.js";

// Esta función nos permite obtener todas las cuentas que están registradas.
export function obtenerCuentas(): Cuenta[] {

  // Devolvemos la lista completa de cuentas.
  return cuentas;
}

// Esta función sirve para buscar una cuenta utilizando su número de identificación.
export function buscarCuentaPorId(id: number): Cuenta | undefined {

  // Recorremos las cuentas hasta encontrar una que tenga el mismo ID.
  // Si la encontramos, devolvemos esa cuenta; si no, devuelve undefined.
  return cuentas.find((cuenta) => cuenta.id === id);
}
