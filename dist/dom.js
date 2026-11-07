import { movimientos } from "./estado.js";
import { obtenerCuentas, buscarCuentaPorId } from "./consultaCuentas.js";
import { buscarCuentasPorTitular, filtrarCuentasPorEstado } from "./busquedasFiltros.js";
import { obtenerMovimientosDeCuenta, filtrarMovimientosPorTipo } from "./historial.js";
import { depositar } from "./depositos.js";
import { retirar } from "./retiros.js";
import { calcularResumen, calcularResumenGeneral } from "./resumen.js";
let cuentaSeleccionadaId = null;
let filtroTipoActual = "todos";
const titulos = {
    inicio: "Inicio", cuentas: "Cuentas bancarias", depositos: "Depósitos",
    retiros: "Retiros", movimientos: "Movimientos", resumen: "Resumen de operaciones",
};
// ---------- Utilidades ----------
function el(id) {
    const e = document.getElementById(id);
    if (e === null) {
        throw new Error(`No existe el elemento "${id}"`);
    }
    return e;
}
function dinero(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function esc(texto) {
    return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
function textoANumero(texto) {
    return texto.trim() === "" ? NaN : Number(texto); // vacío -> NaN -> lo rechaza validarMonto
}
function etiquetaEstado(estado) {
    return `<span class="badge rounded-pill b-${estado}">${estado === "activa" ? "Activa" : "Inactiva"}</span>`;
}
function etiquetaTipo(tipo) {
    return `<span class="badge rounded-pill b-${tipo}">${tipo === "deposito" ? "Depósito" : "Retiro"}</span>`;
}
function titularDe(cuentaId) {
    const c = buscarCuentaPorId(cuentaId);
    return c === undefined ? "—" : c.titular;
}
function vacio(id, mostrar) {
    el(id).classList.toggle("d-none", !mostrar);
}
// ---------- Toasts (notificaciones) ----------
export function mostrarToast(mensaje, exito) {
    const caja = document.createElement("div");
    caja.className = `toast align-items-center text-bg-${exito ? "success" : "danger"} border-0`;
    caja.setAttribute("role", "alert");
    caja.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="bi bi-${exito ? "check-circle" : "exclamation-triangle"} me-2"></i>${esc(mensaje)}</div>` +
        `<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button></div>`;
    el("toasts").appendChild(caja);
    caja.addEventListener("hidden.bs.toast", () => caja.remove());
    new bootstrap.Toast(caja, { delay: 4500 }).show();
}
// ---------- Navegación entre secciones (sin recargar) ----------
function irA(seccion) {
    document.querySelectorAll(".seccion").forEach((s) => s.classList.add("d-none"));
    el("sec-" + seccion).classList.remove("d-none");
    document.querySelectorAll(".menu .nav-link").forEach((b) => b.classList.toggle("activo", b.dataset.seccion === seccion));
    el("titulo-seccion").textContent = titulos[seccion];
    const menu = bootstrap.Offcanvas.getInstance(el("menu"));
    if (menu !== null) {
        menu.hide();
    } // cierra el menú en móviles
    window.scrollTo(0, 0);
}
// ---------- Renderizado ----------
function renderizarIndicadores() {
    const cuentas = obtenerCuentas();
    const general = calcularResumenGeneral();
    el("k-total").textContent = String(cuentas.length);
    el("k-activas").textContent = String(cuentas.filter((c) => c.estado === "activa").length);
    el("k-inactivas").textContent = String(cuentas.filter((c) => c.estado === "inactiva").length);
    el("k-dep").textContent = dinero(general.totalDepositado);
    el("k-ret").textContent = dinero(general.totalRetirado);
}
function renderizarInicio() {
    const cuenta = cuentaSeleccionadaId === null ? undefined : buscarCuentaPorId(cuentaSeleccionadaId);
    if (cuenta === undefined) {
        el("inicio-cuenta").innerHTML = `<div class="vacio"><i class="bi bi-person-badge"></i>No hay ninguna cuenta seleccionada.<br>` +
            `<button class="btn btn-oro btn-sm mt-3" data-seccion="cuentas">Elegir una cuenta</button></div>`;
    }
    else {
        el("inicio-cuenta").innerHTML = `<div class="fw-bold fs-5">${esc(cuenta.titular)}</div>` +
            `<div class="text-secondary small mb-2">Cuenta N.º ${cuenta.id} · ${etiquetaEstado(cuenta.estado)}</div>` +
            `<div class="text-secondary small">Saldo disponible</div><div class="fs-2 fw-bold" style="color:var(--marino)">${dinero(cuenta.saldo)}</div>` +
            `<div class="d-flex flex-wrap gap-2 mt-3"><button class="btn btn-success btn-sm" data-seccion="depositos"><i class="bi bi-plus-circle"></i> Depositar</button>` +
            `<button class="btn btn-danger btn-sm" data-seccion="retiros"><i class="bi bi-dash-circle"></i> Retirar</button>` +
            `<button class="btn btn-univo btn-sm" data-seccion="movimientos"><i class="bi bi-clock-history"></i> Movimientos</button></div>`;
    }
    // Últimos 6 movimientos de todas las cuentas (el más reciente primero)
    const ultimos = movimientos.slice(-6).reverse();
    el("inicio-ultimos").innerHTML = ultimos.map((m) => `<tr><td>${etiquetaTipo(m.tipo)}</td><td>${esc(titularDe(m.cuentaId))}</td>` +
        `<td class="text-end ${m.tipo === "deposito" ? "m-dep" : "m-ret"}">${m.tipo === "deposito" ? "+" : "−"}${dinero(m.monto)}</td><td class="small">${m.fecha}</td></tr>`).join("");
    vacio("vacio-ultimos", ultimos.length === 0);
}
function renderizarCuentas() {
    const texto = el("busqueda").value;
    const filtro = el("filtro-estado").value;
    const visibles = filtrarCuentasPorEstado(buscarCuentasPorTitular(obtenerCuentas(), texto), filtro);
    const cuerpo = el("tabla-cuentas").querySelector("tbody");
    cuerpo.innerHTML = visibles.map((c) => `<tr><td>${c.id}</td><td class="fw-medium">${esc(c.titular)}</td><td>${etiquetaEstado(c.estado)}</td>` +
        `<td class="text-end">${dinero(c.saldo)}</td><td class="text-end"><button class="btn btn-sm btn-outline-primary" data-consultar="${c.id}">Consultar</button></td></tr>`).join("");
    vacio("vacio-cuentas", visibles.length === 0);
}
function renderizarInfoOperacion(idInfo) {
    const cuenta = cuentaSeleccionadaId === null ? undefined : buscarCuentaPorId(cuentaSeleccionadaId);
    el(idInfo).innerHTML = cuenta === undefined
        ? `<div class="alert alert-light border mb-0 small">No hay cuenta seleccionada. Elija una en «Cuentas bancarias» o escriba su ID.</div>`
        : `<div class="p-3 rounded-3" style="background:var(--fondo)"><div class="fw-bold">${esc(cuenta.titular)} ${etiquetaEstado(cuenta.estado)}</div>` +
            `<div class="small text-secondary">Saldo actual: <strong>${dinero(cuenta.saldo)}</strong></div></div>`;
}
function renderizarHistorial() {
    const cuenta = cuentaSeleccionadaId === null ? undefined : buscarCuentaPorId(cuentaSeleccionadaId);
    const cuerpo = el("tabla-historial").querySelector("tbody");
    cuerpo.innerHTML = "";
    document.querySelectorAll("#filtros-tipo button").forEach((b) => {
        const activo = b.dataset.tipo === filtroTipoActual;
        b.className = `btn btn-sm ${activo ? "btn-univo" : "btn-outline-secondary"}`;
    });
    if (cuenta === undefined) {
        el("mov-info").textContent = "";
        el("texto-vacio-historial").textContent = "Seleccione una cuenta para ver su historial.";
        vacio("vacio-historial", true);
        return;
    }
    el("mov-info").innerHTML = `Historial de <strong>${esc(cuenta.titular)}</strong> (cuenta ${cuenta.id})`;
    const delaCuenta = obtenerMovimientosDeCuenta(cuenta.id);
    const visibles = filtrarMovimientosPorTipo(delaCuenta, filtroTipoActual);
    cuerpo.innerHTML = visibles.map((m) => `<tr><td>${m.id}</td><td>${esc(titularDe(m.cuentaId))}</td><td>${m.cuentaId}</td><td>${etiquetaTipo(m.tipo)}</td>` +
        `<td class="text-end ${m.tipo === "deposito" ? "m-dep" : "m-ret"}">${m.tipo === "deposito" ? "+" : "−"}${dinero(m.monto)}</td><td class="small">${m.fecha}</td></tr>`).join("");
    el("texto-vacio-historial").textContent = delaCuenta.length === 0
        ? "Esta cuenta todavía no tiene movimientos."
        : "No hay resultados para el tipo de movimiento seleccionado.";
    vacio("vacio-historial", visibles.length === 0);
}
function renderizarResumen() {
    const cuenta = cuentaSeleccionadaId === null ? undefined : buscarCuentaPorId(cuentaSeleccionadaId);
    vacio("res-vacio", cuenta === undefined);
    vacio("res-contenido", cuenta !== undefined);
    if (cuenta === undefined) {
        return;
    }
    const r = calcularResumen(cuenta.id);
    const total = r.totalDepositado + r.totalRetirado;
    const pctDep = total === 0 ? 0 : (r.totalDepositado / total) * 100;
    el("res-titular").innerHTML = `Resumen de <strong>${esc(cuenta.titular)}</strong> (cuenta ${cuenta.id})`;
    el("res-dep").textContent = dinero(r.totalDepositado);
    el("res-ret").textContent = dinero(r.totalRetirado);
    el("res-cant").textContent = String(obtenerMovimientosDeCuenta(cuenta.id).length);
    el("res-saldo").textContent = dinero(cuenta.saldo);
    el("res-barra-dep").style.width = pctDep + "%";
    el("res-barra-ret").style.width = (total === 0 ? 0 : 100 - pctDep) + "%";
    el("res-barra-txt").textContent = total === 0 ? "Sin operaciones registradas."
        : `Depósitos ${pctDep.toFixed(0)}% · Retiros ${(100 - pctDep).toFixed(0)}%`;
}
function actualizarPantalla() {
    renderizarIndicadores();
    renderizarInicio();
    renderizarCuentas();
    renderizarInfoOperacion("dep-info");
    renderizarInfoOperacion("ret-info");
    renderizarHistorial();
    renderizarResumen();
}
function seleccionarCuenta(id) {
    cuentaSeleccionadaId = id;
    el("dep-id").value = String(id);
    el("ret-id").value = String(id);
    actualizarPantalla();
}
// ---------- Depósitos y retiros (usa las funciones originales sin cambios) ----------
function ejecutarOperacion(operacion, prefijo) {
    const campoId = el(prefijo + "-id");
    const campoMonto = el(prefijo + "-monto");
    const cuentaId = textoANumero(campoId.value);
    const resultado = operacion(cuentaId, textoANumero(campoMonto.value));
    mostrarToast(resultado.mensaje, resultado.exito);
    if (resultado.exito) {
        campoMonto.value = "";
        seleccionarCuenta(cuentaId);
    }
    else {
        actualizarPantalla();
    }
}
// ---------- Eventos ----------
export function configurarEventos() {
    // Delegación: cualquier elemento con data-seccion / data-consultar (incluso los creados después)
    document.addEventListener("click", (evento) => {
        const objetivo = evento.target;
        const navegar = objetivo.closest("[data-seccion]");
        if (navegar !== null) {
            irA(navegar.dataset.seccion);
            return;
        }
        const consultar = objetivo.closest("[data-consultar]");
        if (consultar !== null) {
            seleccionarCuenta(Number(consultar.dataset.consultar));
            irA("inicio");
            return;
        }
        const filtro = objetivo.closest("#filtros-tipo button");
        if (filtro !== null) {
            filtroTipoActual = filtro.dataset.tipo;
            renderizarHistorial();
        }
    });
    el("form-dep").addEventListener("submit", (e) => { e.preventDefault(); ejecutarOperacion(depositar, "dep"); });
    el("form-ret").addEventListener("submit", (e) => { e.preventDefault(); ejecutarOperacion(retirar, "ret"); });
    el("busqueda").addEventListener("input", renderizarCuentas);
    el("filtro-estado").addEventListener("change", renderizarCuentas);
    el("fecha").textContent = new Date().toLocaleDateString("es-SV", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
export function mostrarPantallaInicial() {
    el("carga").classList.add("d-none");
    actualizarPantalla();
}
