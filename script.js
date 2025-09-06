const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitList = document.getElementById('habit-list');
const datePicker = document.getElementById('date-picker');
const historyList = document.getElementById('history-list');
const todayTitle = document.getElementById('today-title');

let data = JSON.parse(localStorage.getItem('habitData')) || { habits: [] };
const today = new Date().toISOString().split('T')[0];
datePicker.value = today;
todayTitle.textContent = `Habits for ${today}`;

function save() {
  localStorage.setItem('habitData', JSON.stringify(data));
}

function renderList(date) {
  habitList.innerHTML = '';
  data.habits.forEach((h, i) => {
    const done = h.records?.[date];
    const li = document.createElement('li');
    li.className = done ? 'done' : '';
    li.innerHTML = `
      <span>${h.name}</span>
      <button onclick="toggleDone(${i}, '${date}')">${done ? 'Undo' : 'Done'}</button>
    `;
    habitList.appendChild(li);
  });
}

function renderHistory(date) {
  historyList.innerHTML = '';
  data.habits.forEach((h) => {
    const done = h.records?.[date];
    const li = document.createElement('li');
    li.textContent = `${h.name}: ${done ? '✓' : '–'}`;
    historyList.appendChild(li);
  });
}

function toggleDone(idx, date) {
  const habit = data.habits[idx];
  habit.records = habit.records || {};
  habit.records[date] = !habit.records[date];
  save();
  renderList(date);
  renderHistory(date);
}

habitForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = habitInput.value.trim();
  if (!name) return;
  data.habits.push({ name, records: {} });
  habitInput.value = '';
  save();
  renderList(today);
  renderHistory(today);
});

datePicker.addEventListener('change', () => {
  const date = datePicker.value;
  todayTitle.textContent = `Habits for ${date}`;
  renderList(date);
  renderHistory(date);
});

// Initial render
renderList(today);
renderHistory(today);
