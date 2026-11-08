// ===== Depósitos =====

// Importamos el tipo para indicar si el depósito se realizó correctamente.
import { ResultadoOperacion } from "./tipos.js";

// Importamos las funciones que revisan los datos y ajustan los decimales.
import { validarOperacion, redondearADosDecimales } from "./validaciones.js";

// Importamos la función que guarda los depósitos en el historial.
import { registrarMovimiento } from "./historial.js";

// Esta función se encarga de ingresar dinero a una cuenta.
export function depositar(cuentaId: number, monto: number): ResultadoOperacion {

  // Verificamos que la cuenta exista y que el monto sea correcto.
  const validacion = validarOperacion(cuentaId, monto);

  // Si hay algún error, detenemos el depósito y devolvemos el mensaje.
  if (!validacion.exito || validacion.cuenta === null) {
    return { exito: false, mensaje: validacion.mensaje };
  }

  // Guardamos la cuenta que vamos a utilizar.
  const cuenta = validacion.cuenta;

  // Sumamos el dinero depositado al saldo que ya tenía la cuenta.
  // Dejamos el resultado con dos decimales.
  cuenta.saldo = redondearADosDecimales(cuenta.saldo + monto);

  // Registramos el depósito para que quede guardado en el historial.
  registrarMovimiento(cuenta.id, "deposito", monto);

  // Mostramos un mensaje confirmando el depósito y el nuevo saldo.
  return {
    exito: true,
    mensaje: `Depósito de $${monto.toFixed(2)} realizado. Nuevo saldo: $${cuenta.saldo.toFixed(2)}.`,
  };
}