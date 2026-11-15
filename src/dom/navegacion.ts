// ===== Navegación entre secciones (sin recargar la página) =====
import { el } from "./utilidades.js";

// Muestra solo la sección indicada y marca su botón en el menú.
export function mostrarSeccion(idSeccion: string): void {
  document.querySelectorAll<HTMLElement>(".seccion").forEach((seccion) => {
    seccion.hidden = seccion.id !== idSeccion;
  });
  document.querySelectorAll<HTMLElement>(".menu button").forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.seccion === idSeccion);
  });
  // En móvil se cierra el menú desplegable
  document.body.classList.remove("menu-abierto");
  el("boton-menu").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
}

export function configurarNavegacion(): void {
  // Un solo escuchador para todos los botones con atributo data-seccion
  document.addEventListener("click", (evento) => {
    if (!(evento.target instanceof HTMLElement)) {
      return;
    }
    const boton = evento.target.closest<HTMLElement>("[data-seccion]");
    if (boton !== null && boton.dataset.seccion !== undefined) {
      mostrarSeccion(boton.dataset.seccion);
    }
  });

  // Botón "Menú" (solo se ve en pantallas pequeñas)
  el("boton-menu").addEventListener("click", () => {
    const abierto = document.body.classList.toggle("menu-abierto");
    el("boton-menu").setAttribute("aria-expanded", String(abierto));
  });
}
