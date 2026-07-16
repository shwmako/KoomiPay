
/* LOAD DATA FROM LOCAL STORAGE */
let data = getData();
let balance = data.balance;
let pending = data.pending;
let movements = data.movements;

/* ICONOS POR CATEGORIA */
const CATEGORY_ICONS = {
    // income sources
    "Mama": "🌸",
    "Papa": "🌳",
    "Hermano/a": "🐨",
    "Amigo/a": "🌿",
    "Trabajo": "💼",
    "Propina": "🍃",
    "Regalo": "🎁",
    "Otro": "✨",
    // expense categories
    "Food": "🍎",
    "Games": "🎮",
    "Shopping": "🛍️",
    "Bills": "🧾",
    "Robux": "🟩",
    // pending
    "Pending": "⏳"
};

function getIcon(category, type) {
    if (CATEGORY_ICONS[category]) return CATEGORY_ICONS[category];
    if (type === "income") return "🌸";
    if (type === "expense") return "🍂";
    return "⏳";
}

/* ELEMENTS */

const balanceElement = document.getElementById("total-balance");
const pendingElement = document.getElementById("pending-amount");
const pendingCard = document.getElementById("pending-card");
const movementsList = document.getElementById("movements-list");
const summaryInEl = document.getElementById("summary-in");
const summaryOutEl = document.getElementById("summary-out");

/* UPDATE BALANCE */

function updateBalance() {
    if (balanceElement) {
        balanceElement.textContent = balance.toFixed(2);
    }
    if (pendingElement) {
        pendingElement.textContent = pending.toFixed(2);
    }
    if (pendingCard) {
        pendingCard.style.display = pending > 0 ? "flex" : "none";
    }
    if (summaryInEl || summaryOutEl) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        let monthIn = 0;
        let monthOut = 0;

        movements.forEach(m => {
            const d = m.timestamp ? new Date(m.timestamp) : null;
            const isThisMonth = d && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            if (!isThisMonth) return;
            if (m.type === "income") monthIn += m.amount;
            if (m.type === "expense") monthOut += m.amount;
        });

        if (summaryInEl) summaryInEl.textContent = "+" + monthIn.toFixed(2) + " este mes";
        if (summaryOutEl) summaryOutEl.textContent = "-" + monthOut.toFixed(2) + " este mes";
    }
}

/* RENDER MOVEMENTS (home, ultimos 3) */

function renderMovements() {
    if (!movementsList) return;
    movementsList.innerHTML = "";

    if (movements.length === 0) {
        movementsList.innerHTML = `
            <p class="empty-text">
                No movements yet
            </p>
        `;
        return;
    }

    const lastMovements = movements.slice(-3).reverse();
    lastMovements.forEach(movement => {
        movementsList.appendChild(buildMovementItem(movement));
    });
}

/* BUILD A SINGLE MOVEMENT ROW */

function buildMovementItem(movement) {
    const movementDiv = document.createElement("div");
    movementDiv.classList.add("movement-item");

    const icon = getIcon(movement.category, movement.type);
    const iconClass = movement.type === "income" ? "income" : (movement.type === "pending" ? "pending" : "expense");
    const amountClass = movement.type === "income" ? "positive" : (movement.type === "pending" ? "pending-amt" : "negative");
    const sign = movement.type === "income" ? "+" : (movement.type === "pending" ? "" : "-");

    movementDiv.innerHTML = `
        <div class="movement-left">
            <div class="movement-icon ${iconClass}">${icon}</div>
            <div>
                <p class="movement-title">${movement.category || movement.type}</p>
                <p class="movement-details">${movement.description || ""}</p>
            </div>
        </div>
        <p class="${amountClass}">${sign}${movement.amount.toFixed(2)}</p>
    `;
    return movementDiv;
}

/* SAVE INCOME */

function saveIncome() {
    const amount = Number(document.getElementById("income-amount").value);
    const source = document.getElementById("income-source").value;
    const details = document.getElementById("income-details").value;

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }
    if (amount > 1000000) {
        alert("Amount too large");
        return;
    }

    data.balance += amount;
    data.movements.push({
        id: generateId(),
        type: "income",
        amount: amount,
        category: source || "Otro",
        description: details || "income details",
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    });

    if (!saveData(data)) return;

    balance = data.balance;
    movements = data.movements;

    navigateTo("confirm.html");
}

/* SAVE EXPENSE */

function saveExpense() {
    const amount = Number(document.getElementById("expense-amount").value);
    const category = document.getElementById("expense-category").value;
    const details = document.getElementById("expense-details").value;

    if (!amount || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }
    if (amount > data.balance) {
        alert("Not enough balance");
        return;
    }

    data.balance -= amount;
    data.movements.push({
        id: generateId(),
        type: "expense",
        amount: amount,
        category: category || "Other",
        description: details || "expense details",
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    });

    if (!saveData(data)) return;

    balance = data.balance;
    movements = data.movements;

    navigateTo("confirm.html");
}

/* SAVE PENDING (dinero que me deben) */

function savePending() {
    const amount = Number(document.getElementById("pending-amount-input").value);
    const person = document.getElementById("pending-person").value;
    const details = document.getElementById("pending-details").value;

    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }
    if (amount > 1000000) {
        alert("Amount too large");
        return;
    }

    data.pending += amount;
    data.movements.push({
        id: generateId(),
        type: "pending",
        amount: amount,
        category: person || "Otro",
        description: details || "pending details",
        date: new Date().toLocaleDateString(),
        timestamp: Date.now(),
        resolved: false
    });

    if (!saveData(data)) return;

    pending = data.pending;
    movements = data.movements;

    navigateTo("confirm.html");
}

/* RESOLVE PENDING (ya me pagaron) */

function resolvePending(id) {
    const movement = data.movements.find(m => m.id === id);
    if (!movement || movement.type !== "pending" || movement.resolved) return;

    const confirmResolve = confirm(`Mark "${movement.description}" (${movement.amount.toFixed(2)}) as paid? This will add it to your balance.`);
    if (!confirmResolve) return;

    movement.resolved = true;
    data.pending -= movement.amount;
    data.balance += movement.amount;

    data.movements.push({
        id: generateId(),
        type: "income",
        amount: movement.amount,
        category: movement.category,
        description: "paid: " + movement.description,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    });

    if (!saveData(data)) return;

    balance = data.balance;
    pending = data.pending;
    movements = data.movements;

    updateBalance();
    renderMovements();
    renderAllMovements();
}

/* RENDER ALL MOVEMENTS (movements.html) */

const allMovementsList = document.getElementById("all-movements-list");
let currentFilter = "all";

function setFilter(filter) {
    currentFilter = filter;
    document.querySelectorAll(".filter-chip").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.filter === filter);
    });
    renderAllMovements();
}

function renderAllMovements() {
    if (!allMovementsList) return;

    allMovementsList.innerHTML = "";

    let filtered = [...movements].reverse();
    if (currentFilter !== "all") {
        filtered = filtered.filter(m => m.type === currentFilter);
    }

    if (filtered.length === 0) {
        allMovementsList.innerHTML = `<p class="empty-text">No movements yet</p>`;
        return;
    }

    filtered.forEach(movement => {
        const movementDiv = document.createElement("div");
        movementDiv.classList.add("movement-item");

        const icon = getIcon(movement.category, movement.type);
        const iconClass = movement.type === "income" ? "income" : (movement.type === "pending" ? "pending" : "expense");
        const amountClass = movement.type === "income" ? "positive" : (movement.type === "pending" ? "pending-amt" : "negative");
        const sign = movement.type === "income" ? "+" : (movement.type === "pending" ? "" : "-");

        const resolveButton = (movement.type === "pending" && !movement.resolved)
            ? `<button class="resolve-btn" onclick="resolvePending('${movement.id}')">mark paid</button>`
            : "";

        movementDiv.innerHTML = `
            <div class="movement-left">
                <div class="movement-icon ${iconClass}">${icon}</div>
                <div>
                    <p class="movement-title">${movement.category}${movement.resolved ? " (paid)" : ""}</p>
                    <p class="movement-details">${movement.description}</p>
                    <p class="movement-date">${movement.date || ""}</p>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                ${resolveButton}
                <p class="${amountClass}">${sign}${movement.amount.toFixed(2)}</p>
            </div>
        `;
        allMovementsList.appendChild(movementDiv);
    });
}

/* PAGE TRANSITIONS */

// fade-in al entrar (se ejecuta apenas carga el JS de la nueva pagina)
requestAnimationFrame(() => {
    document.body.classList.add("fade-in");
});

function navigateTo(page) {
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = page;
    }, 280);
}

/* CLEAR ALL DATA */

function clearAllData() {
    const confirmDelete = confirm("Are you sure you want to delete all movements?");
    if (confirmDelete) {
        localStorage.removeItem("koomipay");
        navigateTo("home.html");
    }
}

/* CONFIRM SCREEN MESSAGE */

function renderConfirmSummary() {
    const el = document.getElementById("confirm-balance");
    if (!el) return;
    el.innerHTML = `New balance: <strong>S/ ${balance.toFixed(2)}</strong>`;
}

/* INITIALIZE */
updateBalance();
renderMovements();
renderAllMovements();
renderConfirmSummary();
