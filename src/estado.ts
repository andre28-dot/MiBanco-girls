// ===== Datos que viven en memoria mientras la página está abierta =====
import { Cuenta, Movimiento } from "./tipos.js";

// Se llena con cargarCuentas() usando los datos del archivo JSON.
export const cuentas: Cuenta[] = [];

// Historial de todas las cuentas. Empieza vacío y crece con cada operación válida.
export const movimientos: Movimiento[] = [];
