// ===== Validaciones compartidas =====
// Importa los tipos de retorno estándar para validaciones y operaciones
import { ResultadoOperacion, ValidacionOperacion } from "../types/tipos.js";
// Importa la función para consultar una cuenta existente por su ID
import { buscarCuentaPorId } from "./consultaCuentas.js";
// Importa las funciones de control de sesión y acceso a cuentas
import { esCliente, puedeAccederACuenta } from "./permisos.js";

// Evita errores de decimales de JavaScript (por ejemplo 0.1 + 0.2).
export function redondearADosDecimales(numero: number): number {
  // Multiplica por 100, redondea al entero más cercano y divide entre 100
  return Math.round(numero * 100) / 100;
}

// Convierte a centavos (enteros) para comparar montos sin errores de decimales.
export function aCentavos(numero: number): number {
  // Redondea el equivalente en centavos a un número entero
  return Math.round(numero * 100);
}

// Devuelve true si el número tiene más de dos decimales.
function tieneMasDeDosDecimales(monto: number): boolean {
  // Calcula el valor en centavos sin redondear
  const centavos = monto * 100;
  // Compara la diferencia con el redondeo usando un margen de tolerancia para punto flotante
  return Math.abs(centavos - Math.round(centavos)) > 0.000001;
}

// Valida un monto de depósito o retiro: vacío/no numérico, cero, negativo o más de 2 decimales.
export function validarMonto(monto: number): ResultadoOperacion {
  // Rechaza valores NaN o infinitos
  if (Number.isNaN(monto) || !Number.isFinite(monto)) {
    return { exito: false, mensaje: "El monto está vacío o no es un número válido." };
  }
  // Rechaza montos iguales a cero
  if (monto === 0) {
    return { exito: false, mensaje: "El monto no puede ser cero." };
  }
  // Rechaza montos negativos
  if (monto < 0) {
    return { exito: false, mensaje: "El monto no puede ser negativo." };
  }
  // Rechaza montos con más de dos decimales
  if (tieneMasDeDosDecimales(monto)) {
    return { exito: false, mensaje: "El monto no puede tener más de dos decimales." };
  }
  // Indica que el monto pasó todas las comprobaciones
  return { exito: true, mensaje: "Monto válido." };
}

// Valida el saldo con el que se abre una cuenta nueva (aquí el cero SÍ se permite).
export function validarSaldoInicial(saldo: number): ResultadoOperacion {
  // Rechaza valores NaN o infinitos
  if (Number.isNaN(saldo) || !Number.isFinite(saldo)) {
    return { exito: false, mensaje: "El saldo inicial está vacío o no es un número válido." };
  }
  // Rechaza saldos iniciales negativos (el 0 sí es válido)
  if (saldo < 0) {
    return { exito: false, mensaje: "El saldo inicial no puede ser negativo." };
  }
  // Rechaza saldos iniciales con más de dos decimales
  if (tieneMasDeDosDecimales(saldo)) {
    return { exito: false, mensaje: "El saldo inicial no puede tener más de dos decimales." };
  }
  // Indica que el saldo inicial es válido
  return { exito: true, mensaje: "Saldo inicial válido." };
}

// El PIN debe tener exactamente 4 dígitos.
export function validarPin(pin: string): ResultadoOperacion {
  // Limpia espacios externos y comprueba que sean exactamente 4 dígitos numéricos
  if (!/^\d{4}$/.test(pin.trim())) {
    return { exito: false, mensaje: "El PIN debe tener exactamente 4 dígitos." };
  }
  // Indica que el PIN cumple con el formato requerido
  return { exito: true, mensaje: "PIN válido." };
}

// Valida que el nombre del titular tenga al menos 3 caracteres útiles
export function validarTitular(titular: string): ResultadoOperacion {
  // Elimina espacios al inicio y al final antes de medir la longitud
  if (titular.trim().length < 3) {
    return { exito: false, mensaje: "El nombre del titular debe tener al menos 3 letras." };
  }
  // Indica que el nombre del titular es válido
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

  // Devuelve la operación como válida junto con la cuenta encontrada
  return { exito: true, mensaje: "Operación válida.", cuenta: cuenta };
}