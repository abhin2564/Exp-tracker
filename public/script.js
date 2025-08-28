const form = document.getElementById("expense-form");
const totalEl = document.getElementById("total");
const tbody = document.querySelector("#expense-table tbody");

const tableMonth = document.getElementById("table-month");
const tableType = document.getElementById("table-type");
const tableApply = document.getElementById("table-apply");
const tableReset = document.getElementById("table-reset");

const chartMonth = document.getElementById("chart-month");
const ctx = document.getElementById("expense-chart").getContext("2d");

const API_URL = "http://localhost:5000/api/expenses";
let allExpenses = [];
let expenseChart;

// Fetch all expenses
async function fetchExpenses() {
  const res = await fetch(API_URL);
  allExpenses = await res.json();
  renderExpenses(allExpenses);
  updateChart(allExpenses);
}

// Render expenses in table
function renderExpenses(expenses) {
  tbody.innerHTML = "";
  let total = 0;

  expenses.forEach(exp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exp.name}</td>
      <td>${exp.type}</td>
      <td>₹${exp.amount}</td>
      <td>${exp.bank}</td>
      <td>${exp.date}</td>
      <td><button class="delete-btn" onclick="deleteExpense('${exp.id}')">❌</button></td>
    `;
    tbody.appendChild(tr);
    total += Number(exp.amount);
  });

  totalEl.textContent = total.toFixed(2);
}

// Add expense
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newExpense = {
    name: document.getElementById("name").value,
    type: document.getElementById("type").value,
    amount: document.getElementById("amount").value,
    bank: document.getElementById("bank").value,
    date: document.getElementById("date").value
  };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newExpense)
  });

  form.reset();
  fetchExpenses();
});

// Delete expense
async function deleteExpense(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchExpenses();
}

// Table Filters
tableApply.addEventListener("click", () => {
  let filtered = [...allExpenses];
  if (tableMonth.value) filtered = filtered.filter(e => e.date.startsWith(tableMonth.value));
  if (tableType.value) filtered = filtered.filter(e => e.type === tableType.value);
  renderExpenses(filtered);
});

tableReset.addEventListener("click", () => {
  tableMonth.value = "";
  tableType.value = "";
  renderExpenses(allExpenses);
});

// Pie Chart
function updateChart(expenses) {
  const types = {};
  expenses.forEach(e => {
    types[e.type] = (types[e.type] || 0) + Number(e.amount);
  });

  const labels = Object.keys(types);
  const data = Object.values(types);

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        label: "Expenses",
        data,
        backgroundColor: ["#27ae60","#2980b9","#f39c12","#8e44ad","#c0392b","#16a085"]
      }]
    }
  });
}

// Pie Chart Month Filter
chartMonth.addEventListener("change", () => {
  let filtered = [...allExpenses];
  if (chartMonth.value) filtered = filtered.filter(e => e.date.startsWith(chartMonth.value));
  updateChart(filtered);
});

// Set today's date as default
const dateInput = document.getElementById("date");
const today = new Date().toISOString().split("T")[0];
dateInput.value = today;

// Initial load
fetchExpenses();
