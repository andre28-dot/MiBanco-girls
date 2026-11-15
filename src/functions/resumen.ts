// ===== Resumen de movimientos =====
import { Movimiento, ResumenMovimientos } from "../types/tipos.js";
import { obtenerMovimientosDeCuenta, obtenerTodosLosMovimientos } from "./historial.js";
import { redondearADosDecimales } from "./validaciones.js";

// Suma depósitos y retiros de la lista recibida (ya no se repite el ciclo dos veces).
function sumarMovimientos(lista: Movimiento[]): ResumenMovimientos {
  let totalDepositado = 0;
  let totalRetirado = 0;

  for (const movimiento of lista) {
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

// Totales de una cuenta (respeta permisos porque usa obtenerMovimientosDeCuenta).
export function calcularResumen(cuentaId: number): ResumenMovimientos {
  return sumarMovimientos(obtenerMovimientosDeCuenta(cuentaId));
}

// Totales de todas las cuentas (solo el administrador obtiene datos).
export function calcularResumenGeneral(): ResumenMovimientos {
  return sumarMovimientos(obtenerTodosLosMovimientos());
}
