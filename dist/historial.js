import { movimientos } from "./estado.js";
// El id nuevo es el mayor id existente + 1 (o 1 si todavía no hay movimientos).
function generarIdMovimiento() {
    let mayor = 0;
    for (const movimiento of movimientos) {
        if (movimiento.id > mayor) {
            mayor = movimiento.id;
        }
    }
    return mayor + 1;
}
// Fecha y hora actual con formato AAAA-MM-DD HH:MM
function obtenerFechaActual() {
    const ahora = new Date();
    const dosDigitos = (n) => String(n).padStart(2, "0");
    return (`${ahora.getFullYear()}-${dosDigitos(ahora.getMonth() + 1)}-${dosDigitos(ahora.getDate())} ` +
        `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}`);
}
// Agrega exactamente un movimiento al historial.
export function registrarMovimiento(cuentaId, tipo, monto) {
    const nuevo = {
        id: generarIdMovimiento(),
        cuentaId: cuentaId,
        tipo: tipo,
        monto: monto,
        fecha: obtenerFechaActual(),
    };
    movimientos.push(nuevo);
}
// Movimientos de una cuenta (sin tocar el arreglo original).
export function obtenerMovimientosDeCuenta(cuentaId) {
    return movimientos.filter((movimiento) => movimiento.cuentaId === cuentaId);
}
// Filtra una lista de movimientos por tipo. "todos" devuelve la lista completa.
export function filtrarMovimientosPorTipo(lista, filtro) {
    if (filtro === "todos") {
        return lista;
    }
    return lista.filter((movimiento) => movimiento.tipo === filtro);
}
