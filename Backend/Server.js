const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const dbPath = path.join(__dirname, "db.json");
const publicPath = path.join(__dirname, "..", "public");

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8") || "[]");
  } catch (e) {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(dbPath)) {
  writeDB([]);
}

app.use(cors());
app.use(express.json());
app.use(express.static(publicPath));

const API_PREFIX = "/api";

// Get all expenses
app.get(`${API_PREFIX}/expenses`, (req, res) => {
  res.json(readDB());
});

// Add expense
app.post(`${API_PREFIX}/expenses`, (req, res) => {
  const { name, type, amount, bank, date } = req.body || {};
  if (!name || !type || !amount || !bank || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const expenses = readDB();
  const newExpense = {
    id: Date.now().toString(),
    name,
    type,
    amount: Number(amount),
    bank,
    date
  };
  expenses.push(newExpense);
  writeDB(expenses);
  res.status(201).json(newExpense);
});

// Delete expense
app.delete(`${API_PREFIX}/expenses/:id`, (req, res) => {
  let expenses = readDB();
  const before = expenses.length;
  expenses = expenses.filter(e => e.id !== req.params.id);
  if (expenses.length === before) {
    return res.status(404).json({ error: "Expense not found" });
  }
  writeDB(expenses);
  res.json({ message: "Deleted", id: req.params.id });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
