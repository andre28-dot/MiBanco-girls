// ===== Acceso: iniciar y cerrar sesión =====
// IMPORTANTE: es una SIMULACIÓN académica. Los PIN y la clave del administrador son
// ficticios y cualquier persona puede verlos en el código del navegador. Una aplicación
// solo-frontend no puede proteger credenciales como lo haría un servidor real.
import { ResultadoOperacion } from "../types/tipos.js";
import { sesion } from "../services/estado.js";
import { buscarCuentaPorId } from "./consultaCuentas.js";

const USUARIO_ADMIN = "admin";
const CLAVE_ADMIN = "admin123";

// Inicia la sesión de una cuenta después de validar su ID, PIN y estado.
export function iniciarSesionCliente(cuentaId: number, pin: string): ResultadoOperacion {
  // 1. Campos vacíos
  if (Number.isNaN(cuentaId) || pin.trim() === "") {
    return { exito: false, mensaje: "Escriba su ID de cuenta y su PIN." };
  }

  // 2. El ID y el PIN deben coincidir. Se usa un solo mensaje para ambos casos
  //    para no revelar si el ID existe.
  const cuenta = buscarCuentaPorId(cuentaId);
  if (cuenta === undefined || cuenta.pin !== pin.trim()) {
    return { exito: false, mensaje: "ID o PIN incorrectos." };
  }

  // 3. Una cuenta inactiva no puede entrar
  if (cuenta.estado !== "activa") {
    return { exito: false, mensaje: "La cuenta está inactiva. Acceso denegado." };
  }

  sesion.rol = "cliente";
  sesion.cuentaId = cuenta.id;
  return { exito: true, mensaje: `Bienvenido(a), ${cuenta.titular}.` };
}

// Inicia la sesión de administrador si el usuario y la clave coinciden.
export function iniciarSesionAdministrador(usuario: string, clave: string): ResultadoOperacion {
  if (usuario.trim() === "" || clave === "") {
    return { exito: false, mensaje: "Escriba el usuario y la clave del administrador." };
  }
  if (usuario.trim() !== USUARIO_ADMIN || clave !== CLAVE_ADMIN) {
    return { exito: false, mensaje: "Usuario o clave incorrectos." };
  }

  sesion.rol = "administrador";
  sesion.cuentaId = null;
  return { exito: true, mensaje: "Sesión de administrador iniciada." };
}

// Cierra la sesión actual eliminando el rol y la cuenta seleccionados.
export function cerrarSesion(): void {
  sesion.rol = null;
  sesion.cuentaId = null;
}
