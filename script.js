"use strict";

/* ========== Elementlar ========== */
const form = document.getElementById("taskForm");
const input = document.getElementById("taskInput");
const list = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const doneCount = document.getElementById("doneCount");
const totalCount = document.getElementById("totalCount");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const clearDoneBtn = document.getElementById("clearDone");
const filterButtons = document.querySelectorAll(".filters__btn");
const dateEl = document.getElementById("date");

/* ========== Holat (state) ========== */
const STORAGE_KEY = "mini-task-manager";
let tasks = loadTasks();
let currentFilter = "all";

/* ========== Saqlash ========== */
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ========== Amallar ========== */
function addTask(text) {
  tasks.unshift({ id: Date.now(), text: text, done: false });
  update();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  update();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  update();
}

function clearDone() {
  tasks = tasks.filter((task) => !task.done);
  update();
}

/* ========== Ko'rsatish (render) ========== */
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task" + (task.done ? " is-done" : "");

  const check = document.createElement("button");
  check.className = "task__check";
  check.setAttribute("aria-label", "Bajarilgan deb belgilash");
  check.setAttribute("aria-pressed", task.done);
  check.addEventListener("click", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task__text";
  text.textContent = task.text; // textContent — xavfsiz (XSS yo'q)

  const del = document.createElement("button");
  del.className = "task__delete";
  del.setAttribute("aria-label", "Vazifani o‘chirish");
  del.innerHTML = "&times;";
  del.addEventListener("click", () => deleteTask(task.id));

  li.append(check, text, del);
  return li;
}

function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.done);
  if (currentFilter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

function renderProgress() {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  doneCount.textContent = done;
  totalCount.textContent = total;
  progressFill.style.width = percent + "%";
  progressBar.setAttribute("aria-valuenow", percent);
}

function render() {
  const visible = getVisibleTasks();
  list.replaceChildren(...visible.map(createTaskElement));
  emptyState.hidden = visible.length > 0;
  emptyState.textContent =
    tasks.length === 0
      ? "Hozircha vazifa yo‘q. Yuqoridagi maydonga birinchi vazifangizni yozing."
      : "Bu bo‘limda vazifa yo‘q.";
  renderProgress();
}

function update() {
  saveTasks();
  render();
}

/* ========== Hodisalar ========== */
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("is-active", b === btn));
    render();
  });
});

clearDoneBtn.addEventListener("click", clearDone);

/* ========== Boshlash ========== */
dateEl.textContent = new Date().toLocaleDateString("uz-UZ", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

render();
