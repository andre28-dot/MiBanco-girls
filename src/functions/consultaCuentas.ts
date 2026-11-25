// ===== Consulta de cuentas ==
import { Cuenta } from "../types/tipos.js";
import { cuentas, sesion } from "../services/estado.js";
import { esAdministrador, puedeAccederACuenta } from "./permisos.js";

// Búsqueda interna por ID (no revisa permisos: la usan el acceso y las operaciones).
// Devuelve la cuenta encontrada o undefined si no existe un ID igual.
export function buscarCuentaPorId(id: number): Cuenta | undefined {
  return cuentas.find((cuenta) => cuenta.id === id);
}

// Lista completa de cuentas: SOLO el administrador la recibe; un cliente recibe una lista vacía.
// La condición elige entre la lista de cuentas y una lista vacía.
export function obtenerCuentas(): Cuenta[] {
  return esAdministrador() ? cuentas : [];
}

// Consulta una cuenta respetando permisos.
export function consultarCuenta(id: number): Cuenta | undefined {
  // Si el usuario no tiene acceso a esta cuenta, no se la muestra.
  if (!puedeAccederACuenta(id)) {
    return undefined;
  }
  // Si tiene permiso, busca y devuelve la cuenta por su ID.
  return buscarCuentaPorId(id);
}

// Cuenta del cliente que tiene la sesión abierta.
export function consultarMiCuenta(): Cuenta | undefined {
  // Sin una cuenta asociada a la sesión, no hay una cuenta propia que consultar.
  if (sesion.cuentaId === null) {
    return undefined;
  }
  // Usa la consulta con permisos para devolver la cuenta de la sesión.
  return consultarCuenta(sesion.cuentaId);
}
