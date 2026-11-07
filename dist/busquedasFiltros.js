// Busca por nombre completo o parcial, sin distinguir mayúsculas/minúsculas.
// filter() crea un arreglo nuevo: la lista original no se modifica.
export function buscarCuentasPorTitular(lista, texto) {
    const textoBuscado = texto.trim().toLowerCase();
    return lista.filter((cuenta) => cuenta.titular.toLowerCase().includes(textoBuscado));
}
// Filtra por estado. "todas" devuelve la lista completa.
export function filtrarCuentasPorEstado(lista, filtro) {
    if (filtro === "todas") {
        return lista;
    }
    return lista.filter((cuenta) => cuenta.estado === filtro);
}
