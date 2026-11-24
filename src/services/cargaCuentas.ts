
// =========================================================
// ===== Carga de cuentas desde el archivo JSON ============
// =========================================================

// Importa la interfaz Cuenta para tipar los registros cargados desde el JSON
import { Cuenta } from "../types/tipos.js";
// Importa la función que restablece/inicializa el estado global con las cuentas cargadas
import { reiniciarEstado } from "./estado.js";

/**
 * Obtiene las cuentas iniciales desde el archivo JSON público y reinicia el estado del sistema.
 * fetch() devuelve una promesa, por eso la función es async y usa await.
 * En Vite, lo que está en la carpeta "public" se sirve desde la raíz del sitio.
 */
export async function cargarCuentas(): Promise<void> {
  // Solicita el archivo JSON ubicado en public/datos/cuentas.json
  const respuesta = await fetch("datos/cuentas.json");

  // Verifica que la respuesta HTTP sea exitosa (status 200-299) antes de parsear el contenido
  if (!respuesta.ok) {
    throw new Error("No se pudo leer datos/cuentas.json");
  }

  // Convierte el cuerpo de la respuesta JSON en un arreglo tipado de cuentas
  const datos: Cuenta[] = await respuesta.json();

  // Actualiza el estado de la aplicación con el listado de cuentas obtenido
  reiniciarEstado(datos);
}