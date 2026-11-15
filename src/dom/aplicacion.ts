// ===== Controla qué pantalla se ve según la sesión =====
import { sesion } from "../services/estado.js";
import { cerrarSesion } from "../functions/acceso.js";
import { consultarMiCuenta } from "../functions/consultaCuentas.js";
import { el, mostrarAviso } from "./utilidades.js";
import { mostrarSeccion } from "./navegacion.js";
import { limpiarFormulariosAcceso } from "./pantallaAcceso.js";
import { dibujarPanelCliente, limpiarPanelCliente } from "./panelCliente.js";
import { dibujarPanelAdmin, limpiarPanelAdmin } from "./panelAdmin.js";

// Muestra el menú y la sección que corresponden al rol de la sesión.
export function actualizarSegunSesion(): void {
  const rol = sesion.rol;

  el("menu-principal").hidden = rol === null;
  el("menu-cliente").hidden = rol !== "cliente";
  el("menu-admin").hidden = rol !== "administrador";
  el("cabecera-sesion").hidden = rol === null;
  el("boton-menu").hidden = rol === null;

  if (rol === "cliente") {
    const cuenta = consultarMiCuenta();
    el("texto-sesion").textContent = cuenta === undefined ? "Cliente" : `Cliente: ${cuenta.titular}`;
    dibujarPanelCliente();
    mostrarSeccion("sec-cliente-inicio");
  } else if (rol === "administrador") {
    el("texto-sesion").textContent = "Administrador";
    dibujarPanelAdmin();
    mostrarSeccion("sec-admin-cuentas");
  } else {
    el("texto-sesion").textContent = "";
    mostrarSeccion("sec-acceso");
  }
}

// Cierra la sesión y borra de la pantalla todo lo que se estaba mostrando.
export function cerrarSesionYLimpiar(): void {
  cerrarSesion();
  limpiarPanelCliente();
  limpiarPanelAdmin();
  limpiarFormulariosAcceso();
  actualizarSegunSesion();
  mostrarAviso("Sesión cerrada correctamente.", true);
}
