
// Importamos los tipos que vamos a utilizar en este archivo.
import { Cuenta, FiltroEstado } from "./tipos.js";

// Esta función sirve para buscar una cuenta por el nombre de su titular.
// También permite buscar solo una parte del nombre.
// Usamos toLowerCase() para que no importe si escribimos mayúsculas o minúsculas.
export function buscarCuentasPorTitular(lista: Cuenta[], texto: string): Cuenta[] {

  // Quitamos los espacios que sobren y convertimos el texto a minúsculas.
  const textoBuscado = texto.trim().toLowerCase();

  // Recorremos la lista y devolvemos las cuentas que coincidan con el nombre buscado.
  // El método filter() crea una nueva lista sin modificar la original.
  return lista.filter((cuenta) =>
    cuenta.titular.toLowerCase().includes(textoBuscado)
  );
}

// Esta función nos permite mostrar las cuentas según el estado que seleccionemos.
export function filtrarCuentasPorEstado(lista: Cuenta[], filtro: FiltroEstado): Cuenta[] {

  // Si seleccionamos "todas", mostramos la lista completa de cuentas.
  if (filtro === "todas") {
    return lista;
  }

  // Si seleccionamos otro estado, mostramos solamente las cuentas que coincidan.
  return lista.filter((cuenta) => cuenta.estado === filtro);
}