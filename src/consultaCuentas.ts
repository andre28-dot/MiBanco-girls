// ===== Consulta de cuentas =====

// Importamos el tipo Cuenta para trabajar con la información de las cuentas.
import { Cuenta } from "./tipos.js";

// Importamos la lista donde tenemos guardadas las cuentas.
import { cuentas } from "./estado.js";

// Esta función nos permite consultar todas las cuentas registradas.
export function obtenerCuentas(): Cuenta[] {

  // Devolvemos todas las cuentas que tenemos guardadas.
  return cuentas;
}

// Esta función busca una cuenta por medio de su número de ID.
export function buscarCuentaPorId(id: number): Cuenta | undefined {

  // Revisamos la lista hasta encontrar una cuenta con el ID indicado.
  // Si no la encontramos, devuelve undefined.
  return cuentas.find((cuenta) => cuenta.id === id);
}