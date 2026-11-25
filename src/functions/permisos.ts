// ===== Permisos según la sesión =====
// Estas funciones responden preguntas de sí/no. Las demás las usan para proteger los datos.
import { sesion } from "../services/estado.js";

// Indica si hay un cliente con una cuenta asociada en la sesión.
export function esCliente(): boolean {
  return sesion.rol === "cliente" && sesion.cuentaId !== null;
}

// Indica si la sesión pertenece al administrador.
export function esAdministrador(): boolean {
  return sesion.rol === "administrador";
}

// El administrador puede ver cualquier cuenta; el cliente solo la suya.
export function puedeAccederACuenta(cuentaId: number): boolean {
  // El administrador tiene permiso para acceder a todas las cuentas.
  if (esAdministrador()) {
    return true;
  }
  // El cliente puede acceder solo si el ID coincide con el de su sesión.
  return esCliente() && sesion.cuentaId === cuentaId;
}
