// ===== Consulta de cuentas =====
import { Cuenta } from "../types/tipos.js";
import { cuentas, sesion } from "../services/estado.js";
import { esAdministrador, puedeAccederACuenta } from "./permisos.js";

// Búsqueda interna por ID (no revisa permisos: la usan el acceso y las operaciones).
export function buscarCuentaPorId(id: number): Cuenta | undefined {
  return cuentas.find((cuenta) => cuenta.id === id);
}

// Lista completa de cuentas: SOLO el administrador la recibe; un cliente recibe una lista vacía.
export function obtenerCuentas(): Cuenta[] {
  return esAdministrador() ? cuentas : [];
}

// Consulta una cuenta respetando permisos.
export function consultarCuenta(id: number): Cuenta | undefined {
  if (!puedeAccederACuenta(id)) {
    return undefined;
  }
  return buscarCuentaPorId(id);
}

// Cuenta del cliente que tiene la sesión abierta.
export function consultarMiCuenta(): Cuenta | undefined {
  if (sesion.cuentaId === null) {
    return undefined;
  }
  return consultarCuenta(sesion.cuentaId);
}
