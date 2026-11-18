// ===== Pruebas de consola de Tu Cajero Virtual =====
// Se ejecutan en la terminal con:  npm run prueba
// Usan sus propias cuentas de prueba, así no dependen del archivo cuentas.json.

// Importa el tipo de las cuentas y el tipo que devuelve el resultado de una operación.
import { Cuenta, ResultadoOperacion } from "../src/types/tipos.js";

// Importa las listas de movimientos, sesiones y cuentas, además de la función para reiniciar los datos.
import { movimientos, sesion, cuentas, reiniciarEstado } from "../src/services/estado.js";

// Importa las funciones para iniciar y cerrar sesión de clientes y administradores.
import { cerrarSesion, iniciarSesionAdministrador, iniciarSesionCliente } from "../src/functions/acceso.js";

// Importa las funciones para buscar y consultar cuentas.
import { buscarCuentaPorId, consultarCuenta, consultarMiCuenta, obtenerCuentas } from "../src/functions/consultaCuentas.js";

// Importa la función que permite realizar depósitos.
import { depositar } from "../src/functions/depositos.js";

// Importa la función que permite realizar retiros.
import { retirar } from "../src/functions/retiros.js";

// Importa las funciones para consultar los movimientos de una cuenta o el historial completo.
import { obtenerMovimientosDeCuenta, obtenerTodosLosMovimientos } from "../src/functions/historial.js";

// Importa las funciones que calculan los resúmenes de una cuenta y de todo el sistema.
import { calcularResumen, calcularResumenGeneral } from "../src/functions/resumen.js";

// Importa la función que permite buscar cuentas aplicando un texto como filtro.
import { buscarCuentas } from "../src/functions/busquedasFiltros.js";

// Importa las funciones administrativas para registrar, modificar y cambiar el estado de las cuentas.
import { cambiarEstadoCuenta, modificarCuenta, registrarCuenta } from "../src/functions/administracion.js";

// Guarda la cantidad de pruebas que han salido correctamente.
let aprobadas = 0;

// Guarda la cantidad de pruebas que han fallado.
let fallidas = 0;

// Muestra ✔ o ✘ y cuenta el resultado
function comprobar(descripcion: string, condicion: boolean): void { // Recibe el nombre de la prueba y una condición que indica si se cumplió.
  if (condicion) { // Comprueba si el resultado de la prueba fue verdadero.
    aprobadas++; // Aumenta en uno la cantidad de pruebas correctas.
    console.log(`   ✔ ${descripcion}`); // Muestra un símbolo de correcto junto con la descripción.
  } else { // Se ejecuta cuando la condición no se cumple.
    fallidas++; // Aumenta en uno la cantidad de pruebas fallidas.
    console.log(`   ✘ ${descripcion}`); // Muestra una X junto con la descripción de la prueba que falló.
  }
}

// Imprime un título para separar los diferentes grupos de pruebas.
function titulo(texto: string): void { // Recibe el nombre que tendrá cada grupo de pruebas.
  console.log(`\n=== ${texto} ===`); // Muestra el título en la terminal y deja una línea de separación.
}

// Muestra el mensaje que el sistema le daría al usuario
function mostrar(resultado: ResultadoOperacion): void { // Recibe el resultado de una operación realizada en el sistema.
  console.log(`   Sistema: "${resultado.mensaje}"`); // Imprime el mensaje que devuelve el sistema.
}

// Cuentas ficticias propias de las pruebas
const cuentasPrueba: Cuenta[] = [ // Crea una lista de cuentas que se utilizarán solamente para realizar las pruebas.
  { id: 1, titular: "Ana Prueba",   pin: "1234", estado: "activa",   saldo: 1000 }, // Primera cuenta de prueba, activa y con saldo de 1000.
  { id: 2, titular: "Luis Prueba",  pin: "4321", estado: "activa",   saldo: 50 }, // Segunda cuenta de prueba, activa y con saldo de 50.
  { id: 3, titular: "Marta Prueba", pin: "1111", estado: "inactiva", saldo: 500 }, // Tercera cuenta de prueba, inactiva y con saldo de 500.
];

// Cada grupo de pruebas empieza con datos limpios y sin sesión
function empezarDeCero(): void { // Prepara nuevamente las cuentas para comenzar un grupo de pruebas.
  reiniciarEstado(cuentasPrueba.map((c) => ({ ...c }))); // Copia las cuentas de prueba y reinicia el sistema con esos datos.
}

// Busca una cuenta por su ID y devuelve su saldo.
function saldoDe(id: number): number { // Recibe el ID de la cuenta cuyo saldo se quiere consultar.
  const cuenta = buscarCuentaPorId(id); // Busca la cuenta correspondiente a ese ID.
  return cuenta === undefined ? -1 : cuenta.saldo; // Devuelve -1 si no existe la cuenta o devuelve su saldo si fue encontrada.
}

// ---------------------------------------------------------------
// PRUEBA 1: comprueba que un cliente pueda ingresar con sus datos correctos.
titulo("1. Acceso correcto con ID y PIN"); // Muestra el título de la primera prueba.
empezarDeCero(); // Reinicia las cuentas y deja el sistema sin sesiones abiertas.
let r = iniciarSesionCliente(1, "1234"); // Intenta iniciar sesión con el ID 1 y su PIN correcto.
mostrar(r); // Muestra el mensaje que devuelve el sistema.
comprobar("el acceso es aceptado", r.exito); // Comprueba que el inicio de sesión haya sido exitoso.
comprobar("la sesión queda como cliente de la cuenta 1", sesion.rol === "cliente" && sesion.cuentaId === 1); // Verifica que la sesión corresponda a un cliente de la cuenta 1.

// ---------------------------------------------------------------
// PRUEBA 2: comprueba que el sistema rechace datos de acceso incorrectos.
titulo("2. Acceso rechazado por datos incorrectos"); // Muestra el título de la segunda prueba.
empezarDeCero(); // Reinicia los datos antes de comenzar.
r = iniciarSesionCliente(1, "9999"); mostrar(r); // Intenta ingresar con un PIN incorrecto y muestra el resultado.
comprobar("PIN incorrecto: rechazado", !r.exito); // Comprueba que el sistema rechace el PIN incorrecto.
r = iniciarSesionCliente(99, "1234"); mostrar(r); // Intenta ingresar con un ID que no existe.
comprobar("ID inexistente: rechazado", !r.exito); // Verifica que no se permita ingresar con una cuenta inexistente.
r = iniciarSesionCliente(NaN, ""); mostrar(r); // Intenta ingresar dejando los campos sin datos válidos.
comprobar("campos vacíos: rechazado", !r.exito); // Comprueba que los campos vacíos sean rechazados.
r = iniciarSesionAdministrador("admin", "mala"); mostrar(r); // Intenta ingresar como administrador con una contraseña incorrecta.
comprobar("clave de administrador incorrecta: rechazada", !r.exito); // Verifica que el administrador no pueda ingresar con una clave incorrecta.
comprobar("ninguna sesión quedó abierta", sesion.rol === null && sesion.cuentaId === null); // Comprueba que no haya quedado ninguna sesión iniciada.

// ---------------------------------------------------------------
// PRUEBA 3: verifica que una cuenta inactiva no pueda iniciar sesión.
titulo("3. Acceso rechazado a una cuenta inactiva"); // Muestra el título de la tercera prueba.
empezarDeCero(); // Restablece las cuentas de prueba.
r = iniciarSesionCliente(3, "1111"); mostrar(r); // Intenta ingresar a la cuenta 3 utilizando su PIN correcto.
comprobar("la cuenta inactiva no puede entrar (aunque el PIN sea correcto)", !r.exito); // Comprueba que el sistema rechace el acceso porque la cuenta está inactiva.
comprobar("no se abrió sesión", sesion.rol === null); // Verifica que no se haya iniciado ninguna sesión.

// ---------------------------------------------------------------
// PRUEBA 4: comprueba que un depósito válido aumente el saldo.
titulo("4. Depósito válido"); // Muestra el título de la cuarta prueba.
empezarDeCero(); // Reinicia las cuentas para comenzar con los saldos originales.
iniciarSesionCliente(1, "1234"); // Inicia sesión con el cliente de la cuenta 1.
r = depositar(1, 250.5); mostrar(r); // Realiza un depósito de 250.5 en la cuenta 1 y muestra el resultado.
comprobar("el depósito es aceptado", r.exito); // Comprueba que el depósito haya sido aceptado.
comprobar("el saldo pasa de 1000 a 1250.5", saldoDe(1) === 1250.5); // Verifica que el saldo aumente correctamente.
comprobar("se registró exactamente 1 movimiento", movimientos.length === 1); // Comprueba que el depósito haya generado un movimiento en el historial.

// ---------------------------------------------------------------
// PRUEBA 5: verifica que no se acepten cantidades inválidas para un depósito.
titulo("5. Depósito con cantidad inválida (vacío, cero, negativo, 3 decimales)"); // Muestra el título de la quinta prueba.
const saldoAntes5 = saldoDe(1); // Guarda el saldo antes de realizar los depósitos inválidos.
const movsAntes5 = movimientos.length; // Guarda cuántos movimientos existen antes de las pruebas.
for (const [nombre, monto] of [["vacío", NaN], ["cero", 0], ["negativo", -5], ["3 decimales", 1.005]] as [string, number][]) { // Recorre diferentes cantidades para comprobar cuáles deben ser rechazadas.
  r = depositar(1, monto); // Intenta realizar un depósito con la cantidad actual.
  console.log(`   Monto ${nombre}: "${r.mensaje}"`); // Muestra el tipo de cantidad probada y el mensaje del sistema.
  comprobar(`monto ${nombre}: rechazado`, !r.exito); // Comprueba que el depósito con esa cantidad no haya sido aceptado.
}
comprobar("el saldo no cambió", saldoDe(1) === saldoAntes5); // Verifica que los intentos rechazados no hayan cambiado el saldo.
comprobar("no se registraron movimientos nuevos", movimientos.length === movsAntes5); // Comprueba que los intentos rechazados no hayan agregado movimientos al historial.

// ---------------------------------------------------------------
// PRUEBA 6: comprueba que un retiro válido disminuya el saldo.
titulo("6. Retiro válido"); // Muestra el título de la sexta prueba.
r = retirar(1, 100); mostrar(r); // Retira 100 de la cuenta 1 y muestra el resultado.
comprobar("el retiro es aceptado", r.exito); // Comprueba que el retiro haya sido aceptado.
comprobar("el saldo pasa de 1250.5 a 1150.5", saldoDe(1) === 1150.5); // Verifica que se haya descontado correctamente la cantidad retirada.
comprobar("ahora hay 2 movimientos", movimientos.length === 2); // Comprueba que el historial tenga dos movimientos: el depósito y el retiro.

// ---------------------------------------------------------------
// PRUEBA 7: verifica que no se pueda retirar más dinero del disponible.
titulo("7. Retiro superior al saldo disponible"); // Muestra el título de la séptima prueba.
const saldoAntes7 = saldoDe(1); // Guarda el saldo antes de intentar el retiro.
const movsAntes7 = movimientos.length; // Guarda la cantidad de movimientos antes del intento.
r = retirar(1, 999999); mostrar(r); // Intenta retirar una cantidad mucho mayor al saldo disponible.
comprobar("el retiro es rechazado por fondos insuficientes", !r.exito); // Comprueba que el sistema rechace el retiro por falta de fondos.
comprobar("el saldo no cambió", saldoDe(1) === saldoAntes7); // Verifica que el saldo siga siendo el mismo después del rechazo.
comprobar("no se registró movimiento", movimientos.length === movsAntes7); // Comprueba que no se haya agregado un movimiento al historial.

// ---------------------------------------------------------------
// PRUEBA 8: comprueba qué información puede consultar un cliente.
titulo("8. Consulta de una cuenta"); // Muestra el título de la octava prueba.
const mia = consultarMiCuenta(); // Obtiene los datos de la cuenta del cliente que inició sesión.
console.log(`   Mi cuenta: ${mia?.titular}, saldo ${mia?.saldo}`); // Muestra el nombre del titular y su saldo, si la cuenta existe.
comprobar("el cliente consulta su propia cuenta", mia !== undefined && mia.id === 1 && mia.saldo === 1150.5); // Comprueba que el cliente pueda consultar los datos de su propia cuenta.
comprobar("el cliente NO puede consultar la cuenta de otra persona", consultarCuenta(2) === undefined); // Verifica que el cliente no pueda consultar directamente otra cuenta.
comprobar("el cliente NO recibe la lista de cuentas", obtenerCuentas().length === 0); // Comprueba que el cliente no pueda obtener la lista completa de cuentas.

// ---------------------------------------------------------------
// PRUEBA 9: comprueba que los depósitos y retiros queden registrados.
titulo("9. Registro de movimientos"); // Muestra el título de la novena prueba.
const susMovimientos = obtenerMovimientosDeCuenta(1); // Obtiene el historial de movimientos de la cuenta 1.
for (const m of susMovimientos) { // Recorre todos los movimientos encontrados.
  console.log(`   #${m.id} ${m.tipo} $${m.monto} (${m.fecha})`); // Muestra el ID, tipo, cantidad y fecha de cada movimiento.
}
comprobar("la cuenta 1 tiene 2 movimientos", susMovimientos.length === 2); // Comprueba que existan dos movimientos registrados para esa cuenta.
comprobar("el 1.º es un depósito de 250.5 y el 2.º un retiro de 100", // Comprueba que los movimientos estén registrados con el tipo y la cantidad esperados.
  susMovimientos[0].tipo === "deposito" && susMovimientos[0].monto === 250.5 && // Verifica que el primer movimiento sea un depósito de 250.5.
  susMovimientos[1].tipo === "retiro" && susMovimientos[1].monto === 100); // Verifica que el segundo movimiento sea un retiro de 100.
comprobar("los identificadores son 1 y 2", susMovimientos[0].id === 1 && susMovimientos[1].id === 2); // Comprueba que los movimientos tengan los identificadores esperados.
const resumen = calcularResumen(1); // Calcula el resumen de los movimientos de la cuenta 1.
comprobar("el resumen suma 250.5 depositado y 100 retirado", resumen.totalDepositado === 250.5 && resumen.totalRetirado === 100); // Verifica que los totales de depósitos y retiros sean correctos.
comprobar("el cliente NO ve el historial de otra cuenta", obtenerMovimientosDeCuenta(2).length === 0); // Comprueba que el cliente no pueda consultar los movimientos de otra cuenta.
comprobar("el cliente NO ve el historial general", obtenerTodosLosMovimientos().length === 0); // Verifica que el cliente no pueda acceder al historial completo del sistema.

// ---------------------------------------------------------------
// PRUEBA 10: comprueba que las operaciones rechazadas no afecten los datos.
titulo("10. Una operación rechazada no modifica saldo ni historial"); // Muestra el título de la décima prueba.
empezarDeCero(); // Reinicia las cuentas y los movimientos antes de comenzar.
iniciarSesionCliente(1, "1234"); // Inicia sesión con el cliente de la cuenta 1.
depositar(1, 100); // Realiza un depósito válido para preparar la prueba.
const saldoAntes10 = saldoDe(1); // Guarda el saldo de la cuenta 1 antes de los intentos rechazados.
const saldoOtra = saldoDe(2); // Guarda el saldo de la cuenta 2 para comprobar que tampoco cambie.
const movsAntes10 = movimientos.length; // Guarda la cantidad de movimientos antes de realizar los intentos.
const rechazadas: ResultadoOperacion[] = [ // Crea una lista con varias operaciones que deben ser rechazadas.
  depositar(1, 0), // Intenta depositar cero, una cantidad que no es válida.
  depositar(1, 2.555), // Intenta depositar una cantidad que tiene tres decimales.
  retirar(1, -1), // Intenta retirar una cantidad negativa.
  retirar(1, 5000), // Intenta retirar más dinero del que tiene la cuenta.
  depositar(2, 10),   // cuenta ajena // Intenta depositar en una cuenta que pertenece a otra persona.
  retirar(2, 10),     // cuenta ajena // Intenta retirar dinero de una cuenta que no pertenece al cliente.
  depositar(99, 10),  // cuenta inexistente // Intenta depositar en una cuenta que no existe.
];
comprobar("las 7 operaciones fueron rechazadas", rechazadas.every((x) => !x.exito)); // Comprueba que ninguna de las siete operaciones haya sido aceptada.
comprobar("el saldo de la cuenta 1 sigue igual", saldoDe(1) === saldoAntes10); // Verifica que el saldo de la cuenta 1 no haya cambiado.
comprobar("el saldo de la cuenta 2 sigue igual", saldoDe(2) === saldoOtra); // Verifica que el saldo de la cuenta 2 tampoco haya cambiado.
comprobar("el historial sigue con la misma cantidad de movimientos", movimientos.length === movsAntes10); // Comprueba que los intentos rechazados no hayan agregado movimientos.

// ---------------------------------------------------------------
// PRUEBA EXTRA A: comprueba el retiro del saldo exacto y el comportamiento de una cuenta inactiva.
titulo("EXTRA A. Retiro del saldo exacto y cuenta inactiva"); // Muestra el título de la primera prueba adicional.
empezarDeCero(); // Reinicia los datos de las cuentas.
iniciarSesionCliente(2, "4321"); // Inicia sesión con el cliente de la cuenta 2.
r = retirar(2, 50); mostrar(r); // Retira los 50 que tiene disponibles la cuenta y muestra el resultado.
comprobar("retirar exactamente el saldo es válido y deja la cuenta en 0", r.exito && saldoDe(2) === 0); // Comprueba que se pueda retirar todo el saldo y que la cuenta quede en cero.
r = retirar(2, 0.01); // Intenta retirar una cantidad cuando la cuenta ya no tiene saldo.
comprobar("con saldo 0 ya no se puede retirar", !r.exito && saldoDe(2) === 0); // Verifica que el sistema rechace el retiro y mantenga el saldo en cero.
cuentas[1].estado = "inactiva"; // Cambia el estado de la segunda cuenta a inactiva.
r = depositar(2, 10); mostrar(r); // Intenta realizar un depósito en la cuenta que ahora está inactiva.
comprobar("una cuenta que pasa a inactiva rechaza depósitos", !r.exito); // Comprueba que no se permitan depósitos en una cuenta inactiva.

// ---------------------------------------------------------------
// PRUEBA EXTRA B: comprueba que se pueda cerrar una sesión correctamente.
titulo("EXTRA B. Cerrar sesión"); // Muestra el título de la segunda prueba adicional.
empezarDeCero(); // Reinicia las cuentas y los datos de la sesión.
iniciarSesionCliente(1, "1234"); // Inicia sesión con el cliente de la cuenta 1.
cerrarSesion(); // Ejecuta la función para cerrar la sesión del cliente.
comprobar("la sesión queda vacía", sesion.rol === null && sesion.cuentaId === null); // Comprueba que los datos de la sesión hayan quedado vacíos.
comprobar("sin sesión no se puede consultar la cuenta", consultarMiCuenta() === undefined); // Verifica que no se pueda consultar la cuenta cuando no hay una sesión abierta.
r = depositar(1, 10); mostrar(r); // Intenta realizar un depósito después de cerrar la sesión y muestra el resultado.
comprobar("sin sesión no se puede depositar", !r.exito && saldoDe(1) === 1000); // Comprueba que el depósito sea rechazado y que el saldo original se mantenga.

// ---------------------------------------------------------------
// PRUEBA EXTRA C: verifica que un cliente no pueda realizar acciones administrativas.
titulo("EXTRA C. Un cliente no puede usar funciones de administrador"); // Muestra el título de la tercera prueba adicional.
empezarDeCero(); // Reinicia los datos antes de comenzar.
iniciarSesionCliente(1, "1234"); // Inicia sesión como cliente de la cuenta 1.
r = registrarCuenta("Intrusa Prueba", "0000", 10, "activa"); mostrar(r); // Intenta registrar una cuenta nueva desde una sesión de cliente.
comprobar("no puede registrar cuentas", !r.exito && cuentas.length === 3); // Comprueba que el registro sea rechazado y que sigan existiendo solamente tres cuentas.
r = cambiarEstadoCuenta(2, "inactiva"); mostrar(r); // Intenta cambiar el estado de la cuenta 2 desde una sesión de cliente.
comprobar("no puede cambiar el estado de otra cuenta", !r.exito && buscarCuentaPorId(2)?.estado === "activa"); // Verifica que el cliente no pueda modificar el estado de otra cuenta.
r = modificarCuenta(2, "Nombre Cambiado", ""); mostrar(r); // Intenta cambiar los datos de la cuenta 2 desde una sesión de cliente.
comprobar("no puede modificar datos de otra cuenta", !r.exito && buscarCuentaPorId(2)?.titular === "Luis Prueba"); // Comprueba que los datos originales del titular no hayan cambiado.

// ---------------------------------------------------------------
// PRUEBA EXTRA D: comprueba las funciones disponibles para el administrador.
titulo("EXTRA D. Funciones del administrador"); // Muestra el título de la cuarta prueba adicional.
empezarDeCero(); // Reinicia las cuentas y los movimientos.
r = iniciarSesionAdministrador("admin", "admin123"); mostrar(r); // Inicia sesión con los datos del administrador y muestra el resultado.
comprobar("el administrador ingresa", r.exito && sesion.rol === "administrador"); // Comprueba que el administrador haya ingresado correctamente.
comprobar("ve las 3 cuentas", obtenerCuentas().length === 3); // Verifica que el administrador pueda consultar las tres cuentas existentes.
r = registrarCuenta("Nora Nueva", "5555", 75.25, "activa"); mostrar(r); // Registra una nueva cuenta con sus datos y saldo inicial.
comprobar("registra una cuenta con ID 4", r.exito && buscarCuentaPorId(4)?.titular === "Nora Nueva" && saldoDe(4) === 75.25); // Comprueba que la nueva cuenta tenga el ID, titular y saldo esperados.
r = registrarCuenta("Pin Malo", "12", 10, "activa"); mostrar(r); // Intenta registrar una cuenta utilizando un PIN de menos de cuatro dígitos.
comprobar("rechaza un PIN de menos de 4 dígitos", !r.exito && cuentas.length === 4); // Verifica que el sistema rechace ese PIN y no agregue otra cuenta.
r = registrarCuenta("Saldo Malo", "1212", -3, "activa"); mostrar(r); // Intenta registrar una cuenta con un saldo inicial negativo.
comprobar("rechaza un saldo inicial negativo", !r.exito && cuentas.length === 4); // Comprueba que el saldo negativo sea rechazado y que la cantidad de cuentas no cambie.
r = modificarCuenta(4, "Nora Modificada", "7777"); mostrar(r); // Modifica el nombre y el PIN de la cuenta 4.
comprobar("modifica titular y PIN", r.exito && buscarCuentaPorId(4)?.pin === "7777" && buscarCuentaPorId(4)?.titular === "Nora Modificada"); // Verifica que el titular y el PIN hayan sido actualizados correctamente.
r = cambiarEstadoCuenta(1, "inactiva"); mostrar(r); // Cambia el estado de la cuenta 1 a inactiva.
comprobar("cambia el estado de la cuenta 1 a inactiva", r.exito && buscarCuentaPorId(1)?.estado === "inactiva"); // Comprueba que el nuevo estado de la cuenta sea inactiva.
comprobar("buscar 'prueba' encuentra 3 cuentas (sin importar mayúsculas)", buscarCuentas(obtenerCuentas(), "PRUEBA").length === 3); // Verifica que la búsqueda encuentre tres cuentas aunque el texto esté en mayúsculas.
comprobar("buscar por ID '2' encuentra a Luis", buscarCuentas(obtenerCuentas(), "2")[0]?.titular === "Luis Prueba"); // Comprueba que se pueda encontrar a Luis buscando por el ID 2.
r = depositar(2, 10); mostrar(r); // Intenta realizar un depósito mientras la sesión está iniciada como administrador.
comprobar("el administrador NO deposita ni retira (eso es de los clientes)", !r.exito); // Verifica que el administrador no pueda realizar operaciones propias de los clientes.
cerrarSesion(); // Cierra la sesión del administrador.
r = iniciarSesionCliente(1, "1234"); mostrar(r); // Intenta iniciar sesión como cliente en la cuenta 1, que ahora está inactiva.
comprobar("la cuenta 1, ya inactiva, no puede ingresar", !r.exito); // Comprueba que la cuenta inactiva no pueda iniciar sesión.
iniciarSesionCliente(2, "4321"); // Inicia sesión como cliente de la cuenta 2.
depositar(2, 20); // Realiza un depósito válido de 20 en la cuenta 2.
cerrarSesion(); // Cierra la sesión del cliente.
iniciarSesionAdministrador("admin", "admin123"); // Vuelve a iniciar sesión como administrador.
comprobar("el administrador ve el historial general (1 movimiento)", obtenerTodosLosMovimientos().length === 1); // Comprueba que el administrador pueda consultar el historial general.
comprobar("totales generales: depositado 20, retirado 0", calcularResumenGeneral().totalDepositado === 20 && calcularResumenGeneral().totalRetirado === 0); // Verifica que el resumen general muestre 20 depositados y cero retirados.

// ---------------------------------------------------------------
// RESULTADO FINAL: muestra cuántas pruebas pasaron y cuántas fallaron.
console.log("\n=============================================="); // Imprime una línea para separar el resultado final.
console.log(`RESULTADO: ${aprobadas} comprobaciones correctas, ${fallidas} fallidas`); // Muestra el total de comprobaciones correctas y fallidas.
console.log("=============================================="); // Imprime otra línea para cerrar el resumen.
if (fallidas > 0) { // Comprueba si hubo al menos una prueba fallida.
  throw new Error(`${fallidas} prueba(s) fallaron`); // Lanza un error para indicar que las pruebas no terminaron todas correctamente.
}