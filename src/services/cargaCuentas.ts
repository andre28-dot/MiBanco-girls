// ===== Carga de cuentas desde el archivo JSON =====
import { Cuenta } from "../types/tipos.js";
import { reiniciarEstado } from "./estado.js";

// fetch() devuelve una promesa, por eso la función es async y usa await.
// En Vite, lo que está en la carpeta "public" se sirve desde la raíz del sitio.
export async function cargarCuentas(): Promise<void> {
  const respuesta = await fetch("datos/cuentas.json");

  if (!respuesta.ok) {
    throw new Error("No se pudo leer datos/cuentas.json");
  }

  const datos: Cuenta[] = await respuesta.json();
  reiniciarEstado(datos);
}
