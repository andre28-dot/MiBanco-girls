// ===== Carga de cuentas desde el archivo JSON =====

// Importamos el tipo Cuenta para manejar los datos de las cuentas.
import { Cuenta } from "./tipos.js";

// Importamos la lista donde vamos a guardar las cuentas.
import { cuentas } from "./estado.js";

// Esta función carga las cuentas que tenemos guardadas en el archivo JSON.
// Usamos async y await para esperar a que los datos estén listos.
export async function cargarCuentas(): Promise<void> {

  // Buscamos el archivo JSON para obtener la información de las cuentas.
  const respuesta = await fetch("data/cuentas.json");

  // Revisamos si el archivo se pudo cargar correctamente.
  // Si ocurre algún problema, mostramos un mensaje de error.
  if (!respuesta.ok) {
    throw new Error("No se pudo leer data/cuentas.json");
  }

  // Obtenemos los datos del archivo y los guardamos en una variable.
  const datos: Cuenta[] = await respuesta.json();

  // Limpiamos la lista anterior para evitar que se repitan las cuentas.
  cuentas.length = 0;

  // Agregamos a la lista todas las cuentas que vienen del archivo JSON.
  cuentas.push(...datos);
}