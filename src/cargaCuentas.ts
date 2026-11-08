// ===== Carga de cuentas desde el archivo JSON =====

// Importamos el tipo Cuenta para trabajar con los datos de las cuentas.
import { Cuenta } from "./tipos.js";

// Importamos el arreglo donde se van a guardar las cuentas.
import { cuentas } from "./estado.js";

// Esta función se encarga de cargar las cuentas que están guardadas en el archivo JSON.
// Usamos async y await porque necesitamos esperar a que se carguen los datos.
export async function cargarCuentas(): Promise<void> {

  // Buscamos el archivo JSON y esperamos a recibir la respuesta.
  const respuesta = await fetch("data/cuentas.json");

  // Comprobamos si el archivo se pudo cargar correctamente.
  // Si ocurre algún problema, mostramos un error.
  if (!respuesta.ok) {
    throw new Error("No se pudo leer data/cuentas.json");
  }

  // Convertimos la información del archivo JSON en datos que podemos utilizar.
  const datos: Cuenta[] = await respuesta.json();

  // Vaciamos el arreglo para evitar que se repitan las cuentas.
  cuentas.length = 0;

  // Agregamos al arreglo todas las cuentas que obtuvimos del archivo JSON.
  cuentas.push(...datos);
}