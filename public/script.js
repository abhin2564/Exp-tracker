const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalEl = document.getElementById("total");

const monthInput = document.getElementById("month");
const typeFilter = document.getElementById("typeFilter");
const bankFilter = document.getElementById("bankFilter");
const applyBtn = document.getElementById("apply-filter");
const resetBtn = document.getElementById("reset-filter");

const chartMonthInput = document.getElementById("chart-month");
const ctx = document.getElementById('expense-chart').getContext('2d');
let pieChart;

const API_URL = "http://localhost:5000/api/expenses";
let allExpenses = [];

// Fetch all expenses
async function fetchExpenses() {
  const res = await fetch(API_URL);
  allExpenses = await res.json();
  renderExpenses(allExpenses);
  renderChart(allExpenses, chartMonthInput.value);
}

// Render expense list and total
function renderExpenses(expenses) {
  list.innerHTML = "";
  let total = 0;
  expenses.forEach(exp => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${exp.name}</strong> (${exp.type}) - ₹${exp.amount} [${exp.bank}] - ${exp.date}</span>
      <button onclick="deleteExpense('${exp.id}')">❌</button>
    `;
    list.appendChild(li);
    total += Number(exp.amount);
  });
  totalEl.textContent = total.toFixed(2);
}

// Render pie chart
function renderChart(expenses, month) {
  let filtered = month ? expenses.filter(e => e.date.startsWith(month)) : expenses;

  const typeSums = {};
  filtered.forEach(exp => {
    typeSums[exp.type] = (typeSums[exp.type] || 0) + Number(exp.amount);
  });

  const labels = Object.keys(typeSums);
  const data = Object.values(typeSums);

  if (pieChart) pieChart.destroy(); // Destroy previous chart

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#27ae60', '#3498db', '#f1c40f', '#e74c3c', '#9b59b6'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
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
  document.getElementById("date").value = new Date().toISOString().split("T")[0];
  fetchExpenses();
});

// Delete expense
async function deleteExpense(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchExpenses();
}

// Apply filters
applyBtn.addEventListener("click", () => {
  const month = monthInput.value;
  const type = typeFilter.value;
  const bank = bankFilter.value;

  let filtered = [...allExpenses];
  if (month) filtered = filtered.filter(e => e.date.startsWith(month));
  if (type) filtered = filtered.filter(e => e.type === type);
  if (bank) filtered = filtered.filter(e => e.bank === bank);

  renderExpenses(filtered);
});

// Reset filters
resetBtn.addEventListener("click", () => {
  monthInput.value = "";
  typeFilter.value = "";
  bankFilter.value = "";
  renderExpenses(allExpenses);
});

// Chart month filter
chartMonthInput.addEventListener("change", () => {
  renderChart(allExpenses, chartMonthInput.value);
});

// Set today's date as default
const dateInput = document.getElementById("date");
if (!dateInput.value) {
  dateInput.value = new Date().toISOString().split("T")[0];
}

// Initial load
fetchExpenses();
