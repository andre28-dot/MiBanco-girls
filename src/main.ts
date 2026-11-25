// ===== Punto de entrada =====

//el main.ts es el punto de entrada de la aplicación, donde se inicializa todo el 
// flujo de la aplicación y se configuran los eventos y vistas principales

// Importa la función que carga las cuentas iniciales desde el archivo JSON
import { cargarCuentas } from "./services/cargaCuentas.js";
// Importa la función que configura la navegación entre vistas o secciones
import { configurarNavegacion } from "./dom/navegacion.js";
// Importa la función que configura la pantalla de inicio de sesión o acceso
import { configurarAcceso } from "./dom/pantallaAcceso.js";
// Importa la función que inicializa los controles y eventos del panel de cliente
import { configurarPanelCliente } from "./dom/panelCliente.js";
// Importa la función que inicializa los controles y eventos del panel de administrador
import { configurarPanelAdmin } from "./dom/panelAdmin.js";
// Importa las funciones para sincronizar la interfaz según la sesión y cerrar sesión
import { actualizarSegunSesion, cerrarSesionYLimpiar } from "./dom/aplicacion.js";
// Importa las utilidades del DOM para seleccionar elementos y mostrar mensajes de aviso
import { el, mostrarAviso } from "./dom/utilidades.js";

// Función asíncrona principal que inicializa la aplicación
async function iniciar(): Promise<void> {
  try {
    await cargarCuentas();                                  // 1. Leer el JSON con fetch()
    configurarNavegacion();                                 // 2. Conectar eventos
    // Registra la pantalla de acceso y le pasa la función para actualizar la vista al cambiar de sesión
    configurarAcceso(actualizarSegunSesion);
    // Activa las interacciones disponibles para el rol de cliente
    configurarPanelCliente();
    // Activa las interacciones disponibles para el rol de administrador
    configurarPanelAdmin();
    // Asocia el evento de clic al botón de cerrar sesión para limpiar datos y salir
    el("boton-cerrar-sesion").addEventListener("click", cerrarSesionYLimpiar);
    actualizarSegunSesion();                                // 3. Mostrar la pantalla de acceso
  } catch (error) {
    // Muestra un mensaje de error en pantalla si falla la carga inicial
    mostrarAviso("Error al cargar las cuentas. Revise que el servidor esté activo.", false);
    // Registra el detalle técnico del error en la consola del navegador
    console.error(error);
  }
}

// Ejecuta la función de arranque de la aplicación
iniciar();