// ===== Carga de cuentas desde el archivo JSON =====
import { Cuenta } from "./tipos.js";
import { cuentas } from "./estado.js";

// fetch() devuelve una promesa, por eso la función es async y usa await
// (await espera a que termine la lectura del archivo).
export async function cargarCuentas(): Promise<void> {
  const respuesta = await fetch("data/cuentas.json");

  if (!respuesta.ok) {
    throw new Error("No se pudo leer data/cuentas.json");
  }

  const datos: Cuenta[] = await respuesta.json();

  // Se guardan en el arreglo compartido (primero se vacía por seguridad)
  cuentas.length = 0;
  cuentas.push(...datos);
}
