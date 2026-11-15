// ===== Pruebas de consola de Tu Cajero Virtual =====
// Se ejecutan en la terminal con:  npm run prueba
// Usan sus propias cuentas de prueba, así no dependen del archivo cuentas.json.
import { Cuenta, ResultadoOperacion } from "../src/types/tipos.js";
import { movimientos, sesion, cuentas, reiniciarEstado } from "../src/services/estado.js";
import { cerrarSesion, iniciarSesionAdministrador, iniciarSesionCliente } from "../src/functions/acceso.js";
import { buscarCuentaPorId, consultarCuenta, consultarMiCuenta, obtenerCuentas } from "../src/functions/consultaCuentas.js";
import { depositar } from "../src/functions/depositos.js";
import { retirar } from "../src/functions/retiros.js";
import { obtenerMovimientosDeCuenta, obtenerTodosLosMovimientos } from "../src/functions/historial.js";
import { calcularResumen, calcularResumenGeneral } from "../src/functions/resumen.js";
import { buscarCuentas } from "../src/functions/busquedasFiltros.js";
import { cambiarEstadoCuenta, modificarCuenta, registrarCuenta } from "../src/functions/administracion.js";

let aprobadas = 0;
let fallidas = 0;

// Muestra ✔ o ✘ y cuenta el resultado
function comprobar(descripcion: string, condicion: boolean): void {
  if (condicion) {
    aprobadas++;
    console.log(`   ✔ ${descripcion}`);
  } else {
    fallidas++;
    console.log(`   ✘ ${descripcion}`);
  }
}

function titulo(texto: string): void {
  console.log(`\n=== ${texto} ===`);
}

// Muestra el mensaje que el sistema le daría al usuario
function mostrar(resultado: ResultadoOperacion): void {
  console.log(`   Sistema: "${resultado.mensaje}"`);
}

// Cuentas ficticias propias de las pruebas
const cuentasPrueba: Cuenta[] = [
  { id: 1, titular: "Ana Prueba",   pin: "1234", estado: "activa",   saldo: 1000 },
  { id: 2, titular: "Luis Prueba",  pin: "4321", estado: "activa",   saldo: 50 },
  { id: 3, titular: "Marta Prueba", pin: "1111", estado: "inactiva", saldo: 500 },
];

// Cada grupo de pruebas empieza con datos limpios y sin sesión
function empezarDeCero(): void {
  reiniciarEstado(cuentasPrueba.map((c) => ({ ...c })));
}

function saldoDe(id: number): number {
  const cuenta = buscarCuentaPorId(id);
  return cuenta === undefined ? -1 : cuenta.saldo;
}

// ---------------------------------------------------------------
titulo("1. Acceso correcto con ID y PIN");
empezarDeCero();
let r = iniciarSesionCliente(1, "1234");
mostrar(r);
comprobar("el acceso es aceptado", r.exito);
comprobar("la sesión queda como cliente de la cuenta 1", sesion.rol === "cliente" && sesion.cuentaId === 1);

// ---------------------------------------------------------------
titulo("2. Acceso rechazado por datos incorrectos");
empezarDeCero();
r = iniciarSesionCliente(1, "9999"); mostrar(r);
comprobar("PIN incorrecto: rechazado", !r.exito);
r = iniciarSesionCliente(99, "1234"); mostrar(r);
comprobar("ID inexistente: rechazado", !r.exito);
r = iniciarSesionCliente(NaN, ""); mostrar(r);
comprobar("campos vacíos: rechazado", !r.exito);
r = iniciarSesionAdministrador("admin", "mala"); mostrar(r);
comprobar("clave de administrador incorrecta: rechazada", !r.exito);
comprobar("ninguna sesión quedó abierta", sesion.rol === null && sesion.cuentaId === null);

// ---------------------------------------------------------------
titulo("3. Acceso rechazado a una cuenta inactiva");
empezarDeCero();
r = iniciarSesionCliente(3, "1111"); mostrar(r);
comprobar("la cuenta inactiva no puede entrar (aunque el PIN sea correcto)", !r.exito);
comprobar("no se abrió sesión", sesion.rol === null);

// ---------------------------------------------------------------
titulo("4. Depósito válido");
empezarDeCero();
iniciarSesionCliente(1, "1234");
r = depositar(1, 250.5); mostrar(r);
comprobar("el depósito es aceptado", r.exito);
comprobar("el saldo pasa de 1000 a 1250.5", saldoDe(1) === 1250.5);
comprobar("se registró exactamente 1 movimiento", movimientos.length === 1);

// ---------------------------------------------------------------
titulo("5. Depósito con cantidad inválida (vacío, cero, negativo, 3 decimales)");
const saldoAntes5 = saldoDe(1);
const movsAntes5 = movimientos.length;
for (const [nombre, monto] of [["vacío", NaN], ["cero", 0], ["negativo", -5], ["3 decimales", 1.005]] as [string, number][]) {
  r = depositar(1, monto);
  console.log(`   Monto ${nombre}: "${r.mensaje}"`);
  comprobar(`monto ${nombre}: rechazado`, !r.exito);
}
comprobar("el saldo no cambió", saldoDe(1) === saldoAntes5);
comprobar("no se registraron movimientos nuevos", movimientos.length === movsAntes5);

// ---------------------------------------------------------------
titulo("6. Retiro válido");
r = retirar(1, 100); mostrar(r);
comprobar("el retiro es aceptado", r.exito);
comprobar("el saldo pasa de 1250.5 a 1150.5", saldoDe(1) === 1150.5);
comprobar("ahora hay 2 movimientos", movimientos.length === 2);

// ---------------------------------------------------------------
titulo("7. Retiro superior al saldo disponible");
const saldoAntes7 = saldoDe(1);
const movsAntes7 = movimientos.length;
r = retirar(1, 999999); mostrar(r);
comprobar("el retiro es rechazado por fondos insuficientes", !r.exito);
comprobar("el saldo no cambió", saldoDe(1) === saldoAntes7);
comprobar("no se registró movimiento", movimientos.length === movsAntes7);

// ---------------------------------------------------------------
titulo("8. Consulta de una cuenta");
const mia = consultarMiCuenta();
console.log(`   Mi cuenta: ${mia?.titular}, saldo ${mia?.saldo}`);
comprobar("el cliente consulta su propia cuenta", mia !== undefined && mia.id === 1 && mia.saldo === 1150.5);
comprobar("el cliente NO puede consultar la cuenta de otra persona", consultarCuenta(2) === undefined);
comprobar("el cliente NO recibe la lista de cuentas", obtenerCuentas().length === 0);

// ---------------------------------------------------------------
titulo("9. Registro de movimientos");
const susMovimientos = obtenerMovimientosDeCuenta(1);
for (const m of susMovimientos) {
  console.log(`   #${m.id} ${m.tipo} $${m.monto} (${m.fecha})`);
}
comprobar("la cuenta 1 tiene 2 movimientos", susMovimientos.length === 2);
comprobar("el 1.º es un depósito de 250.5 y el 2.º un retiro de 100",
  susMovimientos[0].tipo === "deposito" && susMovimientos[0].monto === 250.5 &&
  susMovimientos[1].tipo === "retiro" && susMovimientos[1].monto === 100);
comprobar("los identificadores son 1 y 2", susMovimientos[0].id === 1 && susMovimientos[1].id === 2);
const resumen = calcularResumen(1);
comprobar("el resumen suma 250.5 depositado y 100 retirado", resumen.totalDepositado === 250.5 && resumen.totalRetirado === 100);
comprobar("el cliente NO ve el historial de otra cuenta", obtenerMovimientosDeCuenta(2).length === 0);
comprobar("el cliente NO ve el historial general", obtenerTodosLosMovimientos().length === 0);

// ---------------------------------------------------------------
titulo("10. Una operación rechazada no modifica saldo ni historial");
empezarDeCero();
iniciarSesionCliente(1, "1234");
depositar(1, 100);
const saldoAntes10 = saldoDe(1);
const saldoOtra = saldoDe(2);
const movsAntes10 = movimientos.length;
const rechazadas: ResultadoOperacion[] = [
  depositar(1, 0),
  depositar(1, 2.555),
  retirar(1, -1),
  retirar(1, 5000),
  depositar(2, 10),   // cuenta ajena
  retirar(2, 10),     // cuenta ajena
  depositar(99, 10),  // cuenta inexistente
];
comprobar("las 7 operaciones fueron rechazadas", rechazadas.every((x) => !x.exito));
comprobar("el saldo de la cuenta 1 sigue igual", saldoDe(1) === saldoAntes10);
comprobar("el saldo de la cuenta 2 sigue igual", saldoDe(2) === saldoOtra);
comprobar("el historial sigue con la misma cantidad de movimientos", movimientos.length === movsAntes10);

// ---------------------------------------------------------------
titulo("EXTRA A. Retiro del saldo exacto y cuenta inactiva");
empezarDeCero();
iniciarSesionCliente(2, "4321");
r = retirar(2, 50); mostrar(r);
comprobar("retirar exactamente el saldo es válido y deja la cuenta en 0", r.exito && saldoDe(2) === 0);
r = retirar(2, 0.01);
comprobar("con saldo 0 ya no se puede retirar", !r.exito && saldoDe(2) === 0);
cuentas[1].estado = "inactiva";
r = depositar(2, 10); mostrar(r);
comprobar("una cuenta que pasa a inactiva rechaza depósitos", !r.exito);

// ---------------------------------------------------------------
titulo("EXTRA B. Cerrar sesión");
empezarDeCero();
iniciarSesionCliente(1, "1234");
cerrarSesion();
comprobar("la sesión queda vacía", sesion.rol === null && sesion.cuentaId === null);
comprobar("sin sesión no se puede consultar la cuenta", consultarMiCuenta() === undefined);
r = depositar(1, 10); mostrar(r);
comprobar("sin sesión no se puede depositar", !r.exito && saldoDe(1) === 1000);

// ---------------------------------------------------------------
titulo("EXTRA C. Un cliente no puede usar funciones de administrador");
empezarDeCero();
iniciarSesionCliente(1, "1234");
r = registrarCuenta("Intrusa Prueba", "0000", 10, "activa"); mostrar(r);
comprobar("no puede registrar cuentas", !r.exito && cuentas.length === 3);
r = cambiarEstadoCuenta(2, "inactiva"); mostrar(r);
comprobar("no puede cambiar el estado de otra cuenta", !r.exito && buscarCuentaPorId(2)?.estado === "activa");
r = modificarCuenta(2, "Nombre Cambiado", ""); mostrar(r);
comprobar("no puede modificar datos de otra cuenta", !r.exito && buscarCuentaPorId(2)?.titular === "Luis Prueba");

// ---------------------------------------------------------------
titulo("EXTRA D. Funciones del administrador");
empezarDeCero();
r = iniciarSesionAdministrador("admin", "admin123"); mostrar(r);
comprobar("el administrador ingresa", r.exito && sesion.rol === "administrador");
comprobar("ve las 3 cuentas", obtenerCuentas().length === 3);
r = registrarCuenta("Nora Nueva", "5555", 75.25, "activa"); mostrar(r);
comprobar("registra una cuenta con ID 4", r.exito && buscarCuentaPorId(4)?.titular === "Nora Nueva" && saldoDe(4) === 75.25);
r = registrarCuenta("Pin Malo", "12", 10, "activa"); mostrar(r);
comprobar("rechaza un PIN de menos de 4 dígitos", !r.exito && cuentas.length === 4);
r = registrarCuenta("Saldo Malo", "1212", -3, "activa"); mostrar(r);
comprobar("rechaza un saldo inicial negativo", !r.exito && cuentas.length === 4);
r = modificarCuenta(4, "Nora Modificada", "7777"); mostrar(r);
comprobar("modifica titular y PIN", r.exito && buscarCuentaPorId(4)?.pin === "7777" && buscarCuentaPorId(4)?.titular === "Nora Modificada");
r = cambiarEstadoCuenta(1, "inactiva"); mostrar(r);
comprobar("cambia el estado de la cuenta 1 a inactiva", r.exito && buscarCuentaPorId(1)?.estado === "inactiva");
comprobar("buscar 'prueba' encuentra 3 cuentas (sin importar mayúsculas)", buscarCuentas(obtenerCuentas(), "PRUEBA").length === 3);
comprobar("buscar por ID '2' encuentra a Luis", buscarCuentas(obtenerCuentas(), "2")[0]?.titular === "Luis Prueba");
r = depositar(2, 10); mostrar(r);
comprobar("el administrador NO deposita ni retira (eso es de los clientes)", !r.exito);
cerrarSesion();
r = iniciarSesionCliente(1, "1234"); mostrar(r);
comprobar("la cuenta 1, ya inactiva, no puede ingresar", !r.exito);
iniciarSesionCliente(2, "4321");
depositar(2, 20);
cerrarSesion();
iniciarSesionAdministrador("admin", "admin123");
comprobar("el administrador ve el historial general (1 movimiento)", obtenerTodosLosMovimientos().length === 1);
comprobar("totales generales: depositado 20, retirado 0", calcularResumenGeneral().totalDepositado === 20 && calcularResumenGeneral().totalRetirado === 0);

// ---------------------------------------------------------------
console.log("\n==============================================");
console.log(`RESULTADO: ${aprobadas} comprobaciones correctas, ${fallidas} fallidas`);
console.log("==============================================");
if (fallidas > 0) {
  throw new Error(`${fallidas} prueba(s) fallaron`);
}
