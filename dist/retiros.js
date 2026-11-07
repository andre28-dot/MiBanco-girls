import { validarOperacion, redondearADosDecimales, aCentavos } from "./validaciones.js";
import { registrarMovimiento } from "./historial.js";
export function retirar(cuentaId, monto) {
    // 1. Validar cuenta y monto
    const validacion = validarOperacion(cuentaId, monto);
    if (!validacion.exito || validacion.cuenta === null) {
        return { exito: false, mensaje: validacion.mensaje };
    }
    const cuenta = validacion.cuenta;
    // 2. Verificar fondos. Retirar el saldo exacto SÍ está permitido (solo se rechaza si es mayor).
    if (aCentavos(monto) > aCentavos(cuenta.saldo)) {
        return {
            exito: false,
            mensaje: `Fondos insuficientes. Saldo disponible: $${cuenta.saldo.toFixed(2)}.`,
        };
    }
    // 3. Disminuir el saldo (nunca queda negativo por la validación anterior)
    cuenta.saldo = redondearADosDecimales(cuenta.saldo - monto);
    // 4. Registrar exactamente un movimiento
    registrarMovimiento(cuenta.id, "retiro", monto);
    return {
        exito: true,
        mensaje: `Retiro de $${monto.toFixed(2)} realizado. Nuevo saldo: $${cuenta.saldo.toFixed(2)}.`,
    };
}
