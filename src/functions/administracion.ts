// ===== Administración de cuentas (solo administrador) =====

// Importa los tipos que se utilizan para trabajar con cuentas, estados y resultados de operaciones.
import { Cuenta, EstadoCuenta, ResultadoOperacion } from "../types/tipos.js";
// Importa los servicios que contienen el estado compartido de la aplicación.
import { cuentas } from "../services/estado.js";
// Importa las funciones que verifican los permisos del usuario actual y las funciones de consulta de cuentas.
import { esAdministrador } from "./permisos.js";
// Importa las funciones de validación de datos de cuentas.
import { buscarCuentaPorId } from "./consultaCuentas.js";
// Importa las funciones de validación de datos de cuentas.
import { redondearADosDecimales, validarPin, validarSaldoInicial, validarTitular } from "./validaciones.js";

// Mensaje de error común para operaciones que requieren permisos de administrador.
const SIN_PERMISO: ResultadoOperacion = {
  exito: false,
  mensaje: "Esta acción es solo para el administrador.",
};

// El ID nuevo es el mayor existente + 1, así nunca se repite.
function generarIdCuenta(): number {
  let mayor = 0;
  for (const cuenta of cuentas) {
    if (cuenta.id > mayor) {
      mayor = cuenta.id;
    }
  }
  return mayor + 1;
}

// Registra una cuenta nueva después de validar sus datos.
export function registrarCuenta(
  titular: string,
  pin: string,
  saldoInicial: number,
  estado: EstadoCuenta
): ResultadoOperacion {
  if (!esAdministrador()) {
    return SIN_PERMISO;
  }

  // Se revisan los datos uno por uno; el primer error se devuelve
  const revisiones = [validarTitular(titular), validarPin(pin), validarSaldoInicial(saldoInicial)];
  for (const revision of revisiones) {
    if (!revision.exito) {
      return revision;
    }
  }

  // Si todo está bien, se crea la cuenta y se agrega al arreglo compartido.
  const nueva: Cuenta = {
    id: generarIdCuenta(),
    titular: titular.trim(),
    pin: pin.trim(),
    estado: estado,
    saldo: redondearADosDecimales(saldoInicial),
  };
  cuentas.push(nueva);
  return { exito: true, mensaje: `Cuenta ${nueva.id} registrada para ${nueva.titular}.` };
}

// Modifica solo datos permitidos: titular y PIN. El saldo cambia únicamente con depósitos y retiros.
// Si el PIN llega vacío, se conserva el que ya tiene.
export function modificarCuenta(cuentaId: number, titular: string, pin: string): ResultadoOperacion {
  if (!esAdministrador()) {
    return SIN_PERMISO;
  }
  // Busca la cuenta que se quiere modificar.
  const cuenta = buscarCuentaPorId(cuentaId);
  if (cuenta === undefined) {
    return { exito: false, mensaje: "La cuenta no existe." };
  }
  // Valida el titular y, si se proporciona, el PIN. Si hay errores, devuelve el primero.
  const revisionTitular = validarTitular(titular);
  if (!revisionTitular.exito) {
    return revisionTitular;
  }
  // Si el PIN no está vacío, se valida y se actualiza; si está vacío, se conserva el anterior.
  if (pin.trim() !== "") {
    const revisionPin = validarPin(pin);
    if (!revisionPin.exito) {
      return revisionPin;
    }
    cuenta.pin = pin.trim();
  }
  // Actualiza el titular y devuelve un mensaje de éxito.
  cuenta.titular = titular.trim();
  return { exito: true, mensaje: `Cuenta ${cuenta.id} actualizada.` };
}

// Cambia el estado de una cuenta entre activa e inactiva.
export function cambiarEstadoCuenta(cuentaId: number, nuevoEstado: EstadoCuenta): ResultadoOperacion {
  // Comprueba que solo el administrador pueda realizar esta acción.
  if (!esAdministrador()) {
    return SIN_PERMISO;
  }

  // Busca la cuenta que debe cambiar de estado.
  const cuenta = buscarCuentaPorId(cuentaId);
  if (cuenta === undefined) {
    return { exito: false, mensaje: "La cuenta no existe." };
  }

  // Evita realizar el cambio si ya tiene el estado solicitado.
  if (cuenta.estado === nuevoEstado) {
    return { exito: false, mensaje: `La cuenta ya está ${nuevoEstado}.` };
  }

  // Guarda el nuevo estado y muestra un mensaje de confirmación.
  cuenta.estado = nuevoEstado;
  return { exito: true, mensaje: `La cuenta ${cuenta.id} ahora está ${nuevoEstado}.` };
}

// Elimina una cuenta del arreglo (solo administrador).
export function eliminarCuenta(cuentaId: number): ResultadoOperacion {
  if (!esAdministrador()) {
    return SIN_PERMISO;
  }

  // Buscamos la posición de la cuenta que se quiere eliminar.
  const indice = cuentas.findIndex(function (cuenta) {
    return cuenta.id === cuentaId;
  });
// Si no se encuentra, devuelve un mensaje de error.
  if (indice === -1) {
    return { exito: false, mensaje: "La cuenta no existe." };
  }

  // Eliminamos la cuenta de esa posición.
  cuentas.splice(indice, 1);
// Devolvemos un mensaje de éxito.
  return {
    exito: true,
    mensaje: `La cuenta ${cuentaId} fue eliminada correctamente.`,
  };
}

