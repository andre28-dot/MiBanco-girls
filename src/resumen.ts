// ===== Resumen de movimientos =====
import { ResumenMovimientos } from "./tipos.js";
import { obtenerMovimientosDeCuenta } from "./historial.js";
import { redondearADosDecimales } from "./validaciones.js";

// Los totales se calculan recorriendo el historial (no son valores escritos a mano).
export function calcularResumen(cuentaId: number): ResumenMovimientos {
  const movimientosCuenta = obtenerMovimientosDeCuenta(cuentaId);
  let totalDepositado = 0;
  let totalRetirado = 0;

  for (const movimiento of movimientosCuenta) {
    if (movimiento.tipo === "deposito") {
      totalDepositado += movimiento.monto;
    } else {
      totalRetirado += movimiento.monto;
    }
  }

  return {
    totalDepositado: redondearADosDecimales(totalDepositado),
    totalRetirado: redondearADosDecimales(totalRetirado),
  };
}

// Totales de TODAS las cuentas (para las tarjetas del dashboard).
// También se calculan recorriendo el historial real.
import { movimientos } from "./estado.js";

export function calcularResumenGeneral(): ResumenMovimientos {
  let totalDepositado = 0;
  let totalRetirado = 0;
  for (const movimiento of movimientos) {
    if (movimiento.tipo === "deposito") {
      totalDepositado += movimiento.monto;
    } else {
      totalRetirado += movimiento.monto;
    }
  }
  return {
    totalDepositado: redondearADosDecimales(totalDepositado),
    totalRetirado: redondearADosDecimales(totalRetirado),
  };
}
