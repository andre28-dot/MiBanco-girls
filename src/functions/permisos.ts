// ===== Permisos según la sesión =====
// Estas funciones responden preguntas de sí/no. Las demás las usan para proteger los datos.
import { sesion } from "../services/estado.js";

export function esCliente(): boolean {
  return sesion.rol === "cliente" && sesion.cuentaId !== null;
}

export function esAdministrador(): boolean {
  return sesion.rol === "administrador";
}

// El administrador puede ver cualquier cuenta; el cliente solo la suya.
export function puedeAccederACuenta(cuentaId: number): boolean {
  if (esAdministrador()) {
    return true;
  }
  return esCliente() && sesion.cuentaId === cuentaId;
}
