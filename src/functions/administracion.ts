// ===== Administración de cuentas (solo administrador) =====
import { Cuenta, EstadoCuenta, ResultadoOperacion } from "../types/tipos.js";
import { cuentas } from "../services/estado.js";
import { esAdministrador } from "./permisos.js";
import { buscarCuentaPorId } from "./consultaCuentas.js";
import { redondearADosDecimales, validarPin, validarSaldoInicial, validarTitular } from "./validaciones.js";

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
  const cuenta = buscarCuentaPorId(cuentaId);
  if (cuenta === undefined) {
    return { exito: false, mensaje: "La cuenta no existe." };
  }
  const revisionTitular = validarTitular(titular);
  if (!revisionTitular.exito) {
    return revisionTitular;
  }
  if (pin.trim() !== "") {
    const revisionPin = validarPin(pin);
    if (!revisionPin.exito) {
      return revisionPin;
    }
    cuenta.pin = pin.trim();
  }
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

  if (indice === -1) {
    return { exito: false, mensaje: "La cuenta no existe." };
  }

  // Eliminamos la cuenta de esa posición.
  cuentas.splice(indice, 1);

  return {
    exito: true,
    mensaje: `La cuenta ${cuentaId} fue eliminada correctamente.`,
  };
}

