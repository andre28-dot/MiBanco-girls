// ===== Validaciones compartidas por depósitos y retiros =====
import { ResultadoOperacion, ValidacionOperacion } from "./tipos.js";
import { buscarCuentaPorId } from "./consultaCuentas.js";

// Evita errores de decimales de JavaScript (por ejemplo 0.1 + 0.2).
export function redondearADosDecimales(numero: number): number {
  return Math.round(numero * 100) / 100;
}

// Convierte a centavos (enteros) para comparar montos sin errores de decimales.
export function aCentavos(numero: number): number {
  return Math.round(numero * 100);
}

// Devuelve true si el número tiene más de dos decimales.
function tieneMasDeDosDecimales(monto: number): boolean {
  const centavos = monto * 100;
  return Math.abs(centavos - Math.round(centavos)) > 0.000001;
}

// Valida solo el monto: vacío/no numérico, cero, negativo o más de 2 decimales.
export function validarMonto(monto: number): ResultadoOperacion {
  if (Number.isNaN(monto) || !Number.isFinite(monto)) {
    return { exito: false, mensaje: "El monto está vacío o no es un número válido." };
  }
  if (monto === 0) {
    return { exito: false, mensaje: "El monto no puede ser cero." };
  }
  if (monto < 0) {
    return { exito: false, mensaje: "El monto no puede ser negativo." };
  }
  if (tieneMasDeDosDecimales(monto)) {
    return { exito: false, mensaje: "El monto no puede tener más de dos decimales." };
  }
  return { exito: true, mensaje: "Monto válido." };
}

// Valida cuenta (existe y está activa) y monto. Si todo está bien devuelve la cuenta.
export function validarOperacion(cuentaId: number, monto: number): ValidacionOperacion {
  const cuenta = buscarCuentaPorId(cuentaId);

  if (cuenta === undefined) {
    return { exito: false, mensaje: "La cuenta no existe o el identificador está vacío.", cuenta: null };
  }
  if (cuenta.estado !== "activa") {
    return { exito: false, mensaje: "La cuenta está inactiva: no se pueden hacer operaciones.", cuenta: null };
  }

  const resultadoMonto = validarMonto(monto);
  if (!resultadoMonto.exito) {
    return { exito: false, mensaje: resultadoMonto.mensaje, cuenta: null };
  }

  return { exito: true, mensaje: "Operación válida.", cuenta: cuenta };
}
