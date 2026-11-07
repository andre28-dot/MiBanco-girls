// ===== Depósitos =====
import { ResultadoOperacion } from "./tipos.js";
import { validarOperacion, redondearADosDecimales } from "./validaciones.js";
import { registrarMovimiento } from "./historial.js";

export function depositar(cuentaId: number, monto: number): ResultadoOperacion {
  // 1. Validar cuenta y monto. Si falla, se sale SIN cambiar nada.
  const validacion = validarOperacion(cuentaId, monto);
  if (!validacion.exito || validacion.cuenta === null) {
    return { exito: false, mensaje: validacion.mensaje };
  }

  // 2. Aumentar el saldo
  const cuenta = validacion.cuenta;
  cuenta.saldo = redondearADosDecimales(cuenta.saldo + monto);

  // 3. Registrar exactamente un movimiento
  registrarMovimiento(cuenta.id, "deposito", monto);

  return {
    exito: true,
    mensaje: `Depósito de $${monto.toFixed(2)} realizado. Nuevo saldo: $${cuenta.saldo.toFixed(2)}.`,
  };
}
