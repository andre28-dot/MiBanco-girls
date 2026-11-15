// ===== Pantalla de acceso (cliente y administrador) =====
import { iniciarSesionCliente, iniciarSesionAdministrador } from "../functions/acceso.js";
import { el, mostrarAviso, obtenerEntrada, obtenerFormulario, textoANumero } from "./utilidades.js";

export function limpiarFormulariosAcceso(): void {
  obtenerFormulario("form-acceso-cliente").reset();
  obtenerFormulario("form-acceso-admin").reset();
}

// alIniciarSesion es la función que se ejecuta cuando el acceso fue correcto.
export function configurarAcceso(alIniciarSesion: () => void): void {
  el("form-acceso-cliente").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const id = textoANumero(obtenerEntrada("acceso-id").value);
    const resultado = iniciarSesionCliente(id, obtenerEntrada("acceso-pin").value);
    mostrarAviso(resultado.mensaje, resultado.exito);
    if (resultado.exito) {
      limpiarFormulariosAcceso();
      alIniciarSesion();
    } else {
      obtenerEntrada("acceso-pin").value = ""; // el PIN nunca queda escrito tras un error
    }
  });

  el("form-acceso-admin").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const resultado = iniciarSesionAdministrador(
      obtenerEntrada("acceso-usuario").value,
      obtenerEntrada("acceso-clave").value
    );
    mostrarAviso(resultado.mensaje, resultado.exito);
    if (resultado.exito) {
      limpiarFormulariosAcceso();
      alIniciarSesion();
    } else {
      obtenerEntrada("acceso-clave").value = "";
    }
  });
}
