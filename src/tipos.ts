// ===== Interfaces y tipos del sistema =====

export type EstadoCuenta = "activa" | "inactiva";
export type TipoMovimiento = "deposito" | "retiro";

// Valores posibles de los filtros (incluyen la opción "todas / todos")
export type FiltroEstado = "todas" | EstadoCuenta;
export type FiltroTipo = "todos" | TipoMovimiento;

export interface Cuenta {
  id: number;
  titular: string;
  estado: EstadoCuenta;
  saldo: number;
}

export interface Movimiento {
  id: number;
  cuentaId: number;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
}

// Interfaces agregadas (justificación): todas las operaciones devuelven
// si fueron exitosas y un mensaje para mostrar al usuario.
export interface ResultadoOperacion {
  exito: boolean;
  mensaje: string;
}

// Resultado de validar una operación: además incluye la cuenta encontrada.
export interface ValidacionOperacion extends ResultadoOperacion {
  cuenta: Cuenta | null;
}

// Totales calculados a partir del historial.
export interface ResumenMovimientos {
  totalDepositado: number;
  totalRetirado: number;
}
