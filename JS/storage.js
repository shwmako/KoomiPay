// OBTENER DATA
function getData() {
    return JSON.parse(
        localStorage.getItem("koomipay")
    ) || {
        balance: 0,
        movements: []
    };
}

// GUARDAR DATA
function saveData(data) {
    localStorage.setItem(
        "koomipay",
        JSON.stringify(data)
    );
}