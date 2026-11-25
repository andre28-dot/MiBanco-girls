// ===== Historial de movimientos =====

//importa los tipos y servicios necesarios para trabajar con movimientos y permisos.
import { Movimiento, TipoMovimiento, FiltroTipo } from "../types/tipos.js";
//importa los servicios que contienen el estado compartido de la aplicación.
import { movimientos } from "../services/estado.js";
//importa las funciones que verifican los permisos del usuario actual.
import { esAdministrador, puedeAccederACuenta } from "./permisos.js";

// El id nuevo es el mayor id existente + 1 (o 1 si todavía no hay movimientos).
function generarIdMovimiento(): number {
  let mayor = 0;
  // Recorre los movimientos para encontrar el ID más alto usado.
  for (const movimiento of movimientos) {
    if (movimiento.id > mayor) {
      mayor = movimiento.id;
    }
  }
  // El siguiente movimiento tendrá un ID mayor al máximo encontrado.
  return mayor + 1;
}

// Fecha y hora actual con formato AAAA-MM-DD HH:MM
function obtenerFechaActual(): string {
  // Obtiene el momento actual y define un helper para mantener dos dígitos en los valores.
  const ahora = new Date();
  const dosDigitos = (n: number): string => String(n).padStart(2, "0");
  // Une el año, mes, día, hora y minuto en el formato indicado.
  return (
    `${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())} ` +
    `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}`
  );
}

// Agrega exactamente un movimiento al historial (solo se llama tras validar la operación).
export function registrarMovimiento(cuentaId: number, tipo: TipoMovimiento, monto: number): void {
  // Prepara el movimiento con un ID nuevo y la fecha actual.
  const nuevo: Movimiento = {
    id: generarIdMovimiento(),
    cuentaId: cuentaId,
    tipo: tipo,
    monto: monto,
    fecha: obtenerFechaActual(),
  };
  // Guarda el movimiento en la lista compartida del historial.
  movimientos.push(nuevo);
}

// Movimientos de UNA cuenta. Si la sesión no tiene permiso sobre esa cuenta, devuelve lista vacía.
export function obtenerMovimientosDeCuenta(cuentaId: number): Movimiento[] {
  // No entrega información si el usuario no puede acceder a la cuenta.
  if (!puedeAccederACuenta(cuentaId)) {
    return [];
  }
  // Devuelve solo movimientos cuyo ID de cuenta coincide con el solicitado.
  return movimientos.filter((movimiento) => movimiento.cuentaId === cuentaId);
}

// Historial de TODAS las cuentas: solo para el administrador.
export function obtenerTodosLosMovimientos(): Movimiento[] {
  // El administrador recibe el historial completo; los demás, una lista vacía.
  return esAdministrador() ? movimientos : [];
}

// Filtra una lista de movimientos por tipo. "todos" devuelve la lista completa.
export function filtrarMovimientosPorTipo(lista: Movimiento[], filtro: FiltroTipo): Movimiento[] {
  if (filtro === "todos") {
    return lista;
  }
  // Si se eligió un tipo concreto, devuelve únicamente los movimientos de ese tipo.
  return lista.filter((movimiento) => movimiento.tipo === filtro);
}
