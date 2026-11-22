// ===== Depósitos =====
// Importa el tipo de retorno estándar para las operaciones bancarias
import { ResultadoOperacion } from "../types/tipos.js";
// Importa las funciones de validación y redondeo a dos decimales
import { validarOperacion, redondearADosDecimales } from "./validaciones.js";
// Importa la función para guardar el movimiento en el historial
import { registrarMovimiento } from "./historial.js";

// Función principal para procesar un depósito de dinero en una cuenta específica
export function depositar(cuentaId: number, monto: number): ResultadoOperacion {
  // 1. Validar cuenta, permisos y monto
  const validacion = validarOperacion(cuentaId, monto);
  if (!validacion.exito || validacion.cuenta === null) {
    return { exito: false, mensaje: validacion.mensaje };
  }

  // Obtiene la referencia a la cuenta ya validada
  const cuenta = validacion.cuenta;

  // 2. Aumentar el saldo redondeando a dos decimales para evitar errores de punto flotante
  cuenta.saldo = redondearADosDecimales(cuenta.saldo + monto);

  // 3. Registrar exactamente un movimiento de tipo "deposito" en el historial
  registrarMovimiento(cuenta.id, "deposito", monto);

  // Retorna confirmación exitosa con el monto depositado y el saldo actualizado
  return {
    exito: true,
    mensaje: `Depósito de $${monto.toFixed(2)} realizado. Nuevo saldo: $${cuenta.saldo.toFixed(2)}.`,
  };
}