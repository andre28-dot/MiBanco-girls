// ===== Acceso: iniciar y cerrar sesión =====


// Importa los tipos de datos y funciones necesarias para el manejo de sesiones y cuentas.
import { ResultadoOperacion } from "../types/tipos.js";
// Importa el estado compartido de la aplicación, que incluye la sesión actual.
import { sesion } from "../services/estado.js";
// Importa la función que busca una cuenta por su ID, utilizada para validar el acceso del cliente.
import { buscarCuentaPorId } from "./consultaCuentas.js";

// Constantes que definen el usuario y la clave del administrador para iniciar sesión.
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
// 4. Si todo está bien, se guarda la sesión como cliente con la cuenta asociada
  sesion.rol = "cliente";
  sesion.cuentaId = cuenta.id;
  return { exito: true, mensaje: `Bienvenido(a), ${cuenta.titular}.` };
}

// Inicia la sesión de administrador si el usuario y la clave coinciden.
export function iniciarSesionAdministrador(usuario: string, clave: string): ResultadoOperacion {
  // Valida que los campos no estén vacíos.
  if (usuario.trim() === "" || clave === "") {
    return { exito: false, mensaje: "Escriba el usuario y la clave del administrador." };
  }
  // Valida el usuario y la clave del administrador. Si no coinciden, devuelve un mensaje de error
  if (usuario.trim() !== USUARIO_ADMIN || clave !== CLAVE_ADMIN) {
    return { exito: false, mensaje: "Usuario o clave incorrectos." };
  }
// Si todo está bien, se guarda la sesión como administrador sin cuenta asociada
  sesion.rol = "administrador";
  sesion.cuentaId = null;
  return { exito: true, mensaje: "Sesión de administrador iniciada." };
}

// Cierra la sesión actual eliminando el rol y la cuenta seleccionados.
export function cerrarSesion(): void {
  sesion.rol = null;
  sesion.cuentaId = null;
}
