// Importamos los tipos que necesitamos para trabajar con las cuentas.
import { Cuenta, FiltroEstado } from "./tipos.js";

// Esta función permite buscar cuentas escribiendo el nombre completo
// o solamente una parte del nombre del titular.
export function buscarCuentasPorTitular(lista: Cuenta[], texto: string): Cuenta[] {

  // Quitamos los espacios innecesarios y convertimos el texto a minúsculas.
  const textoBuscado = texto.trim().toLowerCase();

  // Buscamos las cuentas que coincidan con el nombre que escribimos.
  return lista.filter((cuenta) =>
    cuenta.titular.toLowerCase().includes(textoBuscado)
  );
}

// Esta función permite mostrar las cuentas según el estado que seleccionemos.
export function filtrarCuentasPorEstado(lista: Cuenta[], filtro: FiltroEstado): Cuenta[] {

  // Si seleccionamos "todas", mostramos todas las cuentas registradas.
  if (filtro === "todas") {
    return lista;
  }

  // Si elegimos un estado, mostramos solamente las cuentas que coincidan.
  return lista.filter((cuenta) => cuenta.estado === filtro);
}