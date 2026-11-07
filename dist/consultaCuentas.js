import { cuentas } from "./estado.js";
// Devuelve todas las cuentas cargadas.
export function obtenerCuentas() {
    return cuentas;
}
// Busca una cuenta por su identificador. Si no existe devuelve undefined.
export function buscarCuentaPorId(id) {
    return cuentas.find((cuenta) => cuenta.id === id);
}
