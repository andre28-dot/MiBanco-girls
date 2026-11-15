// ===== Interfaces y tipos del sistema =====

export type EstadoCuenta = "activa" | "inactiva";
export type TipoMovimiento = "deposito" | "retiro";

// Valores posibles de los filtros (incluyen la opción "todas / todos")
export type FiltroEstado = "todas" | EstadoCuenta;
export type FiltroTipo = "todos" | TipoMovimiento;

// Quién está usando el sistema
export type Rol = "cliente" | "administrador";

export interface Cuenta {
  id: number;
  titular: string;
  pin: string; // PIN ficticio de 4 dígitos (texto, para no perder ceros a la izquierda)
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

// Sesión actual. Si nadie ha ingresado, rol y cuentaId valen null.
export interface Sesion {
  rol: Rol | null;
  cuentaId: number | null; // solo se usa cuando el rol es "cliente"
}

// Toda operación devuelve si funcionó y un mensaje para el usuario.
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
