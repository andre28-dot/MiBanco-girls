// =========================================================
// ===== Interfaces y tipos principales del sistema ========
// =========================================================

// Define los estados operativos permitidos para una cuenta bancaria
export type EstadoCuenta = "activa" | "inactiva";

// Define las únicas transacciones financieras soportadas en el sistema
export type TipoMovimiento = "deposito" | "retiro";

// Valores posibles de los filtros (incluyen la opción "todas / todos" para vistas sin filtrar)
export type FiltroEstado = "todas" | EstadoCuenta;
export type FiltroTipo = "todos" | TipoMovimiento;

// Identifica el perfil de permisos de quien está usando el sistema
export type Rol = "cliente" | "administrador";

/**
 * Representa la estructura de datos de una cuenta bancaria individual.
 */
export interface Cuenta {
  id: number;            // Identificador numérico único de la cuenta
  titular: string;       // Nombre completo del propietario de la cuenta
  pin: string;           // PIN ficticio de 4 dígitos (texto, para no perder ceros a la izquierda)
  estado: EstadoCuenta;  // Indica si la cuenta puede operar ("activa") o está bloqueada ("inactiva")
  saldo: number;         // Dinero disponible actualmente en la cuenta
}

/**
 * Representa un registro histórico de cada transacción realizada.
 */
export interface Movimiento {
  id: number;            // Identificador único del movimiento
  cuentaId: number;      // ID de la cuenta a la que pertenece esta transacción
  tipo: TipoMovimiento;  // Naturaleza de la operación ("deposito" o "retiro")
  monto: number;         // Cantidad de dinero involucrada en la operación
  fecha: string;         // Fecha (y/u hora) en que se efectuó el movimiento
}

/**
 * Controla el estado de autenticación actual en la aplicación.
 * Si nadie ha iniciado sesión, 'rol' y 'cuentaId' valen null.
 */
export interface Sesion {
  rol: Rol | null;          // Rol activo en la sesión actual
  cuentaId: number | null;  // ID de la cuenta vinculada (solo se usa cuando el rol es "cliente")
}

/**
 * Respuesta estándar que devuelven las funciones del sistema tras ejecutarse.
 * Informa si la acción se completó con éxito y entrega un mensaje descriptivo para la interfaz.
 */
export interface ResultadoOperacion {
  exito: boolean;   // true si la operación se completó correctamente, false si ocurrió un error
  mensaje: string;  // Texto explicativo para mostrar al usuario
}

/**
 * Extiende ResultadoOperacion para las funciones de validación previa.
 * Además del estado y mensaje, adjunta el objeto Cuenta si fue localizado.
 */
export interface ValidacionOperacion extends ResultadoOperacion {
  cuenta: Cuenta | null;  // Objeto de la cuenta validada, o null si no existe / falló la validación
}

/**
 * Agrupa los montos acumulados calculados a partir del historial de movimientos.
 */
export interface ResumenMovimientos {
  totalDepositado: number;  // Suma total de todos los ingresos/depósitos
  totalRetirado: number;    // Suma total de todos los egresos/retiros
}