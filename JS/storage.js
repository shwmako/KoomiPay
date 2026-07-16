// OBTENER DATA
function getData() {
    try {
        const raw = localStorage.getItem("koomipay");
        if (!raw) {
            return { balance: 0, pending: 0, movements: [] };
        }
        const parsed = JSON.parse(raw);
        return {
            balance: parsed.balance || 0,
            pending: parsed.pending || 0,
            movements: parsed.movements || []
        };
    } catch (e) {
        console.error("No se pudo leer los datos guardados:", e);
        return { balance: 0, pending: 0, movements: [] };
    }
}

// GUARDAR DATA
function saveData(data) {
    try {
        localStorage.setItem("koomipay", JSON.stringify(data));
        return true;
    } catch (e) {
        console.error("No se pudo guardar los datos:", e);
        alert("No se pudo guardar. Revisa el almacenamiento del navegador.");
        return false;
    }
}

// GENERAR ID UNICO
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
