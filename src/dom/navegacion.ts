// ===== Navegación entre secciones (sin recargar la página) =====
import { el } from "./utilidades.js"; // Importa la función que permite buscar elementos del HTML por su id.

// Muestra solo la sección indicada y marca su botón en el menú.
export function mostrarSeccion(idSeccion: string): void {
  // Busca todas las secciones que tienen la clase "seccion".
  document.querySelectorAll<HTMLElement>(".seccion").forEach((seccion) => {
    // Oculta las secciones que no tengan el id que recibimos y muestra la que coincide.
    seccion.hidden = seccion.id !== idSeccion;
  });

  // Busca todos los botones que están dentro del menú.
  document.querySelectorAll<HTMLElement>(".menu button").forEach((boton) => {
    // Agrega la clase "activo" al botón de la sección seleccionada y la quita de los demás.
    boton.classList.toggle("activo", boton.dataset.seccion === idSeccion);
  });

  // En móvil se cierra el menú desplegable
  // Quita la clase que mantiene abierto el menú.
  document.body.classList.remove("menu-abierto");

  // Actualiza el atributo para indicar que el menú está cerrado.
  el("boton-menu").setAttribute("aria-expanded", "false");

  // Lleva la página hasta la parte superior al cambiar de sección.
  window.scrollTo(0, 0);
}

// Configura los eventos que permiten navegar entre las diferentes secciones.
export function configurarNavegacion(): void {
  // Un solo escuchador para todos los botones con atributo data-seccion
  // Detecta los clics que se hagan en cualquier parte del documento.
  document.addEventListener("click", (evento) => {

    // Comprueba que el elemento donde se hizo clic sea un elemento HTML.
    if (!(evento.target instanceof HTMLElement)) {
      // Si no es un elemento HTML, termina la función.
      return;
    }

    // Busca el botón más cercano que tenga el atributo data-seccion.
    const boton = evento.target.closest<HTMLElement>("[data-seccion]");

    // Comprueba que encontró un botón y que tiene una sección asignada.
    if (boton !== null && boton.dataset.seccion !== undefined) {
      // Llama a mostrarSeccion para enseñar la sección correspondiente.
      mostrarSeccion(boton.dataset.seccion);
    }
  });

  // Botón "Menú" (solo se ve en pantallas pequeñas)
  // Detecta cuando el usuario hace clic en el botón del menú.
  el("boton-menu").addEventListener("click", () => {

    // Cambia el estado del menú: si está cerrado lo abre y si está abierto lo cierra.
    const abierto = document.body.classList.toggle("menu-abierto");

    // Actualiza el atributo aria-expanded según el estado actual del menú.
    el("boton-menu").setAttribute("aria-expanded", String(abierto));
  });
}