// ===== Validaciones compartidas =====
import { ResultadoOperacion, ValidacionOperacion } from "../types/tipos.js";
import { buscarCuentaPorId } from "./consultaCuentas.js";
import { esCliente, puedeAccederACuenta } from "./permisos.js";

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

// Valida un monto de depósito o retiro: vacío/no numérico, cero, negativo o más de 2 decimales.
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

// Valida el saldo con el que se abre una cuenta nueva (aquí el cero SÍ se permite).
export function validarSaldoInicial(saldo: number): ResultadoOperacion {
  if (Number.isNaN(saldo) || !Number.isFinite(saldo)) {
    return { exito: false, mensaje: "El saldo inicial está vacío o no es un número válido." };
  }
  if (saldo < 0) {
    return { exito: false, mensaje: "El saldo inicial no puede ser negativo." };
  }
  if (tieneMasDeDosDecimales(saldo)) {
    return { exito: false, mensaje: "El saldo inicial no puede tener más de dos decimales." };
  }
  return { exito: true, mensaje: "Saldo inicial válido." };
}

// El PIN debe tener exactamente 4 dígitos.
export function validarPin(pin: string): ResultadoOperacion {
  if (!/^\d{4}$/.test(pin.trim())) {
    return { exito: false, mensaje: "El PIN debe tener exactamente 4 dígitos." };
  }
  return { exito: true, mensaje: "PIN válido." };
}

export function validarTitular(titular: string): ResultadoOperacion {
  if (titular.trim().length < 3) {
    return { exito: false, mensaje: "El nombre del titular debe tener al menos 3 letras." };
  }
  return { exito: true, mensaje: "Titular válido." };
}

// Valida permisos, cuenta y monto de un depósito/retiro. NO modifica nada.
// Si todo está bien devuelve la cuenta encontrada.
export function validarOperacion(cuentaId: number, monto: number): ValidacionOperacion {
  // 1. Solo un cliente con sesión puede operar, y únicamente en su propia cuenta
  if (!esCliente() || !puedeAccederACuenta(cuentaId)) {
    return { exito: false, mensaje: "No tiene permiso para operar en esta cuenta. Inicie sesión con su ID y PIN.", cuenta: null };
  }

  // 2. La cuenta debe existir y estar activa
  const cuenta = buscarCuentaPorId(cuentaId);
  if (cuenta === undefined) {
    return { exito: false, mensaje: "La cuenta no existe.", cuenta: null };
  }
  if (cuenta.estado !== "activa") {
    return { exito: false, mensaje: "La cuenta está inactiva: no se pueden hacer operaciones.", cuenta: null };
  }

  // 3. El monto debe ser válido
  const resultadoMonto = validarMonto(monto);
  if (!resultadoMonto.exito) {
    return { exito: false, mensaje: resultadoMonto.mensaje, cuenta: null };
  }

  return { exito: true, mensaje: "Operación válida.", cuenta: cuenta };
}
