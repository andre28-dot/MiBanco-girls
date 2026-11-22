// ===== Resumen de movimientos =====
// Importa los tipos de datos para movimientos y resúmenes
import { Movimiento, ResumenMovimientos } from "../types/tipos.js";
// Importa las funciones que consultan los movimientos según la cuenta o permisos del usuario
import { obtenerMovimientosDeCuenta, obtenerTodosLosMovimientos } from "./historial.js";
// Importa la función auxiliar para redondear montos a dos decimales
import { redondearADosDecimales } from "./validaciones.js";

// Suma depósitos y retiros de la lista recibida (ya no se repite el ciclo dos veces).
function sumarMovimientos(lista: Movimiento[]): ResumenMovimientos {
  // Inicializa los acumuladores en cero
  let totalDepositado = 0;
  let totalRetirado = 0;

  // Recorre cada movimiento de la lista una sola vez
  for (const movimiento of lista) {
    // Acumula el monto según el tipo de movimiento
    if (movimiento.tipo === "deposito") {
      totalDepositado += movimiento.monto;
    } else {
      totalRetirado += movimiento.monto;
    }
  }

  // Devuelve ambos totales redondeados a dos decimales
  return {
    totalDepositado: redondearADosDecimales(totalDepositado),
    totalRetirado: redondearADosDecimales(totalRetirado),
  };
}

// Totales de una cuenta (respeta permisos porque usa obtenerMovimientosDeCuenta).
export function calcularResumen(cuentaId: number): ResumenMovimientos {
  // Obtiene los movimientos de la cuenta y calcula su resumen
  return sumarMovimientos(obtenerMovimientosDeCuenta(cuentaId));
}

// Totales de todas las cuentas (solo el administrador obtiene datos).
export function calcularResumenGeneral(): ResumenMovimientos {
  // Obtiene todos los movimientos disponibles y calcula el resumen general
  return sumarMovimientos(obtenerTodosLosMovimientos());
}