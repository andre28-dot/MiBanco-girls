// ===== Controla qué pantalla se ve según la sesión =====

//en aplicacion.ts se controla la pantalla que se muestra según el estado de la sesión del usuario.
//  Se importan funciones y tipos necesarios para manejar la sesión, acceder a cuentas y mostrar u ocultar elementos en 
// la interfaz de usuario. La función principal, actualizarSegunSesion, ajusta la visibilidad de menús y secciones según el
//  rol del usuario (cliente, administrador o ninguno). Además, se proporciona una función para cerrar la sesión y limpiar la 
// interfaz, asegurando que los datos de la sesión se borren correctamente y que se muestre un mensaje de confirmación al usuario.

// Importa la información de la sesión actual, como el rol y el ID de la cuenta.
import { sesion } from "../services/estado.js";

// Importa la función que permite cerrar la sesión.
import { cerrarSesion } from "../functions/acceso.js";

// Importa la función que obtiene los datos de la cuenta del cliente que inició sesión.
import { consultarMiCuenta } from "../functions/consultaCuentas.js";

// Importa las funciones para buscar elementos del HTML y mostrar mensajes en pantalla.
import { el, mostrarAviso } from "./utilidades.js";

// Importa la función que permite cambiar entre las diferentes secciones de la aplicación.
import { mostrarSeccion } from "./navegacion.js";

// Importa la función que limpia los formularios de acceso.
import { limpiarFormulariosAcceso } from "./pantallaAcceso.js";

// Importa las funciones para mostrar y limpiar el panel del cliente.
import { dibujarPanelCliente, limpiarPanelCliente } from "./panelCliente.js";

// Importa las funciones para mostrar y limpiar el panel del administrador.
import { dibujarPanelAdmin, limpiarPanelAdmin } from "./panelAdmin.js";

// Muestra el menú y la sección que corresponden al rol de la sesión.
export function actualizarSegunSesion(): void {
  const rol = sesion.rol; // Obtiene el tipo de usuario que tiene la sesión iniciada.

  el("menu-principal").hidden = rol === null; // Oculta el menú principal cuando no hay una sesión abierta.
  el("menu-cliente").hidden = rol !== "cliente"; // Muestra el menú del cliente solamente cuando ingresa un cliente.
  el("menu-admin").hidden = rol !== "administrador"; // Muestra el menú del administrador solamente cuando ingresa el administrador.
  el("cabecera-sesion").hidden = rol === null; // Oculta la información de la sesión cuando nadie ha ingresado.
  el("boton-menu").hidden = rol === null; // Oculta el botón del menú cuando no hay una sesión iniciada.

  if (rol === "cliente") { // Comprueba si el usuario que inició sesión es un cliente.
    const cuenta = consultarMiCuenta(); // Obtiene la información de la cuenta del cliente.
    el("texto-sesion").textContent = cuenta === undefined ? "Cliente" : `Cliente: ${cuenta.titular}`; // Muestra el nombre del titular o la palabra Cliente si no encuentra la cuenta.
    dibujarPanelCliente(); // Muestra los datos y las opciones disponibles para el cliente.
    mostrarSeccion("sec-cliente-inicio"); // Abre la sección inicial del panel del cliente.
  } else if (rol === "administrador") { // Comprueba si el usuario que inició sesión es el administrador.
    el("texto-sesion").textContent = "Administrador"; // Muestra el nombre del tipo de usuario que inició sesión.
    dibujarPanelAdmin(); // Muestra el panel con las funciones administrativas.
    mostrarSeccion("sec-admin-cuentas"); // Abre la sección de administración de cuentas.
  } else { // Se ejecuta cuando no hay ningún usuario con sesión iniciada.
    el("texto-sesion").textContent = ""; // Limpia el texto donde se muestra quién inició sesión.
    mostrarSeccion("sec-acceso"); // Muestra la pantalla de acceso para ingresar al sistema.
  }
}

// Cierra la sesión y borra de la pantalla todo lo que se estaba mostrando.
export function cerrarSesionYLimpiar(): void {
  cerrarSesion(); // Cierra la sesión actual y elimina sus datos.
  limpiarPanelCliente(); // Limpia la información que se mostraba en el panel del cliente.
  limpiarPanelAdmin(); // Limpia la información que se mostraba en el panel del administrador.
  limpiarFormulariosAcceso(); // Borra los datos escritos en los formularios de inicio de sesión.
  actualizarSegunSesion(); // Actualiza la pantalla para mostrar nuevamente la sección de acceso.
  mostrarAviso("Sesión cerrada correctamente.", true); // Muestra un mensaje para confirmar que la sesión se cerró correctamente.
}