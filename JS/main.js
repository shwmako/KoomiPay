

/*LOAD DATA FROM LOCAL STORAGE*/
let data = getData();
let balance = data.balance;
let movements = data.movements;

/* ELEMENTS */

const balanceElement =
    document.getElementById("total-balance");
const movementsList =
    document.getElementById("movements-list");

/* UPDATE BALANCE */

function updateBalance() {

    if (!balanceElement) return;
    balanceElement.textContent =
        balance.toFixed(2);
}

/* RENDER MOVEMENTS */

function renderMovements() {

    // evita errores en páginas que no tienen lista
    if (!movementsList) return;
    movementsList.innerHTML = "";

    // NO MOVEMENTS
    if(movements.length === 0){
        movementsList.innerHTML = `
            <p class="empty-text">
                No movements yet
            </p>
        `;
        return;
    }

    // últimos 3 movimientos
    const lastMovements =
        movements.slice(-3).reverse();
    lastMovements.forEach(movement => {

        const movementDiv =
            document.createElement("div");
        movementDiv.classList.add("movement-item");

        movementDiv.innerHTML = `
            <div class="movement-left">
                <img
                    src="${movement.type === "income"
                ? "img/income.jpeg"
                : "img/expense.jpeg"
            }"
                    class="movement-icon"
                >

                <div>
                    <p class="movement-title">
                        ${movement.category || movement.type}
                    </p>
                    <p class="movement-details">
                        ${movement.description || ""}
                    </p>
                </div>
            </div>

            <p class="${movement.type === "income"
                ? "positive"
                : "negative"
            }">

                ${movement.type === "income"
                ? "+"
                : "-"
            }
                ${movement.amount.toFixed(2)}
            </p>
        `;
        movementsList.appendChild(movementDiv);
    });

}

/* SAVE INCOME */

function saveIncome() {
    const amount = Number(
        document.getElementById("income-amount").value
    );

    const category =
        document.getElementById("income-category").value;
    const details =
        document.getElementById("income-details").value;

     // validaciones
    if (isNaN(amount) || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }
    // evita números absurdos
    if(amount > 1000000){
        alert("Amount too large");
        return;
    }

    // actualiza data
    data.balance += amount;
    data.movements.push({
        type: "income",
        amount: amount,
        category: category || "Income",
        description: details || "income details",
        date: new Date().toLocaleDateString()
    });

    // guarda en localStorage
    saveData(data);

    // refresca variables locales
    balance = data.balance;
    movements = data.movements;

    // redirecciona
    navigateTo("confirm.html");
}

/* SAVE EXPENSE */

function saveExpense() {
    const amount = Number(
        document.getElementById("expense-amount").value
    );

    const category =
        document.getElementById("expense-category").value;
    const details =
        document.getElementById("expense-details").value;

    if (!amount || amount <= 0) {
        alert("Enter a valid amount");
        return;
    }

    if(amount > data.balance){
        alert("Not enough balance");
        return;
    }

    // actualiza data
    data.balance -= amount;
    data.movements.push({
        type: "expense",
        amount: amount,
        category: category || "Expense",
        description: details || "expense details",
        date: new Date().toLocaleDateString()
    });

    // guarda
    saveData(data);

    // refresca variables
    balance = data.balance;
    movements = data.movements;

    // redirecciona
    navigateTo("confirm.html");
}

/* RENDER ALL MOVEMENTS */

const allBalanceElement =
    document.getElementById("all-total-balance");
const allMovementsList =
    document.getElementById("all-movements-list");

function renderAllMovements() {
    // evita errores
    if (!allMovementsList) return;
    // balance
    if (allBalanceElement) {
        allBalanceElement.textContent =
            balance.toFixed(2);
    }

    // limpiar lista
    allMovementsList.innerHTML = "";

    // mostrar todos invertidos
    const reversedMovements =
        [...movements].reverse();
    reversedMovements.forEach(movement => {
        const movementDiv =
            document.createElement("div");

        movementDiv.classList.add("movement-item");
        movementDiv.innerHTML = `

            <div class="movement-left">
                <img
                    src="${movement.type === "income"
                ? "img/income.jpeg"
                : "img/expense.jpeg"
            }"
                    class="movement-icon"
                >

                <div>
                    <p class="movement-title">
                        ${movement.category}
                    </p>
                    <p class="movement-details">
                        ${movement.description}
                    </p>
                    <p class="movement-date">
                        ${movement.date || ""}
                    </p>
                </div>
            </div>

            <p class="${movement.type === "income"
                ? "positive"
                : "negative"
            }">
                ${movement.type === "income"
                ? "+"
                : "-"
            }
                ${movement.amount.toFixed(2)}
            </p>
        `;
        allMovementsList.appendChild(movementDiv);
    });

}

/* PAGE TRANSITIONS */
function navigateTo(page) {
    document.body.classList.add("fade-out");
    setTimeout(() => {
        window.location.href = page;
    }, 300);
}

/* CLEAR ALL DATA */

function clearAllData() {
     const confirmDelete = confirm(
        "Are you sure you want to delete all movements?"
    );
    if(confirmDelete){
        localStorage.removeItem("koomipay");
        navigateTo("home.html");
    }
}

/* INITIALIZE ALL MOVEMENTS */
renderAllMovements();

/* INITIALIZE */
updateBalance();
renderMovements();