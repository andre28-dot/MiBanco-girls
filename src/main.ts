// ===== Punto de entrada =====
import { cargarCuentas } from "./services/cargaCuentas.js";
import { configurarNavegacion } from "./dom/navegacion.js";
import { configurarAcceso } from "./dom/pantallaAcceso.js";
import { configurarPanelCliente } from "./dom/panelCliente.js";
import { configurarPanelAdmin } from "./dom/panelAdmin.js";
import { actualizarSegunSesion, cerrarSesionYLimpiar } from "./dom/aplicacion.js";
import { el, mostrarAviso } from "./dom/utilidades.js";

async function iniciar(): Promise<void> {
  try {
    await cargarCuentas();                                  // 1. Leer el JSON con fetch()
    configurarNavegacion();                                 // 2. Conectar eventos
    configurarAcceso(actualizarSegunSesion);
    configurarPanelCliente();
    configurarPanelAdmin();
    el("boton-cerrar-sesion").addEventListener("click", cerrarSesionYLimpiar);
    actualizarSegunSesion();                                // 3. Mostrar la pantalla de acceso
  } catch (error) {
    mostrarAviso("Error al cargar las cuentas. Revise que el servidor esté activo.", false);
    console.error(error);
  }
}

iniciar();
