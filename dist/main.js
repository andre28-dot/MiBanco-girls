// ===== Punto de entrada =====
import { cargarCuentas } from "./cargaCuentas.js";
import { configurarEventos, mostrarPantallaInicial, mostrarToast } from "./dom.js";
async function iniciar() {
    try {
        await cargarCuentas(); // 1. Leer el JSON con fetch()
        configurarEventos(); // 2. Conectar botones, formularios y filtros
        mostrarPantallaInicial(); // 3. Dibujar la interfaz
    }
    catch (error) {
        mostrarToast("Error al cargar las cuentas. Use un servidor local (Live Server).", false);
        console.error(error);
    }
}
iniciar();
