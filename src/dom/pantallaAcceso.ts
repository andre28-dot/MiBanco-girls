// ===== Pantalla de acceso (cliente y administrador) =====

// Importa las funciones que permiten iniciar sesión como cliente o administrador.
import { iniciarSesionCliente, iniciarSesionAdministrador } from "../functions/acceso.js";

// Importa las funciones que ayudan a buscar elementos, mostrar avisos y obtener datos de los formularios.
import { el, mostrarAviso, obtenerEntrada, obtenerFormulario, textoANumero } from "./utilidades.js";

// Esta función limpia los formularios de acceso para dejar los campos vacíos.
export function limpiarFormulariosAcceso(): void {
  // Restablece el formulario de acceso del cliente.
  obtenerFormulario("form-acceso-cliente").reset();

  // Restablece el formulario de acceso del administrador.
  obtenerFormulario("form-acceso-admin").reset();
}

// alIniciarSesion es la función que se ejecuta cuando el acceso fue correcto.
// Recibe una función que se ejecutará cuando el usuario haya iniciado sesión correctamente.
export function configurarAcceso(alIniciarSesion: () => void): void {

  // Busca el formulario del cliente y configura el evento que se ejecuta al enviarlo.
  el("form-acceso-cliente").addEventListener("submit", (evento) => {

    // Evita que el formulario recargue la página al enviarse.
    evento.preventDefault();

    // Obtiene el ID escrito por el cliente y lo convierte a número.
    const id = textoANumero(obtenerEntrada("acceso-id").value);

    // Intenta iniciar sesión utilizando el ID y el PIN que escribió el cliente.
    const resultado = iniciarSesionCliente(id, obtenerEntrada("acceso-pin").value);

    // Muestra el mensaje del resultado e indica si el acceso fue correcto.
    mostrarAviso(resultado.mensaje, resultado.exito);

    // Comprueba si el cliente logró iniciar sesión correctamente.
    if (resultado.exito) {

      // Limpia los campos del formulario después de iniciar sesión.
      limpiarFormulariosAcceso();

      // Ejecuta la función que actualiza la aplicación después del acceso.
      alIniciarSesion();

    } else {
      // Si el acceso falla, borra el PIN que escribió el cliente.
      obtenerEntrada("acceso-pin").value = ""; // el PIN nunca queda escrito tras un error
    }
  });

  // Busca el formulario del administrador y configura el evento para enviarlo.
  el("form-acceso-admin").addEventListener("submit", (evento) => {

    // Evita que el formulario recargue la página.
    evento.preventDefault();

    // Intenta iniciar sesión como administrador utilizando el usuario y la clave ingresados.
    const resultado = iniciarSesionAdministrador(

      // Obtiene el nombre de usuario escrito en el formulario.
      obtenerEntrada("acceso-usuario").value,

      // Obtiene la contraseña o clave escrita por el administrador.
      obtenerEntrada("acceso-clave").value
    );

    // Muestra un aviso con el resultado del intento de inicio de sesión.
    mostrarAviso(resultado.mensaje, resultado.exito);

    // Comprueba si el administrador pudo ingresar correctamente.
    if (resultado.exito) {

      // Limpia los campos de los formularios de acceso.
      limpiarFormulariosAcceso();

      // Ejecuta la función que actualiza la aplicación después del acceso.
      alIniciarSesion();

    } else {
      // Si el acceso falla, limpia el campo de la clave por seguridad.
      obtenerEntrada("acceso-clave").value = "";
    }
  });
}