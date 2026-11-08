// ===== Depósitos =====

// Importamos el tipo que nos permite indicar el resultado de la operación.
import { ResultadoOperacion } from "./tipos.js";

// Importamos las funciones que utilizamos para validar y redondear los montos.
import { validarOperacion, redondearADosDecimales } from "./validaciones.js";

// Importamos la función que guarda los movimientos realizados en la cuenta.
import { registrarMovimiento } from "./historial.js";

// Esta función permite realizar un depósito en una cuenta.
export function depositar(cuentaId: number, monto: number): ResultadoOperacion {

  // Primero verificamos que la cuenta exista y que el monto sea válido.
  const validacion = validarOperacion(cuentaId, monto);

  // Si la validación falla o no encontramos la cuenta, mostramos el mensaje de error.
  if (!validacion.exito || validacion.cuenta === null) {
    return { exito: false, mensaje: validacion.mensaje };
  }

  // Obtenemos la cuenta que pasó correctamente la validación.
  const cuenta = validacion.cuenta;

  // Sumamos el monto depositado al saldo actual de la cuenta.
  // También redondeamos el resultado a dos decimales.
  cuenta.saldo = redondearADosDecimales(cuenta.saldo + monto);

  // Guardamos el depósito en el historial de movimientos de la cuenta.
  registrarMovimiento(cuenta.id, "deposito", monto);

  // Devolvemos un mensaje indicando que el depósito se realizó correctamente
  // y mostramos el nuevo saldo disponible.
  return {
    exito: true,
    mensaje: `Depósito de $${monto.toFixed(2)} realizado. Nuevo saldo: $${cuenta.saldo.toFixed(2)}.`,
  };
}