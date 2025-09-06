const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitList = document.getElementById('habit-list');
const datePicker = document.getElementById('date-picker');
const historyList = document.getElementById('history-list');
const todayTitle = document.getElementById('today-title');
const calendarGrid = document.getElementById('calendar-grid');

let data = JSON.parse(localStorage.getItem('habitData')) || { habits: [] };
const today = new Date().toISOString().split('T')[0];
datePicker.value = today;
todayTitle.textContent = `Habits for ${today}`;

// Save data to localStorage
function save() {
  localStorage.setItem('habitData', JSON.stringify(data));
}

// Render habit list
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

// Render history list
function renderHistory(date) {
  historyList.innerHTML = '';
  data.habits.forEach((h) => {
    const done = h.records?.[date];
    const li = document.createElement('li');
    li.textContent = `${h.name}: ${done ? '✓' : '–'}`;
    historyList.appendChild(li);
  });
}

// Toggle habit done/undo
function toggleDone(idx, date) {
  const habit = data.habits[idx];
  habit.records = habit.records || {};
  habit.records[date] = !habit.records[date];
  save();
  renderList(date);
  renderHistory(date);
  updateCalendar();
}

// Add new habit
habitForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = habitInput.value.trim();
  if (!name) return;
  data.habits.push({ name, records: {} });
  habitInput.value = '';
  save();
  renderList(today);
  renderHistory(today);
  updateCalendar();
});

// Date picker change
datePicker.addEventListener('change', () => {
  const date = datePicker.value;
  todayTitle.textContent = `Habits for ${date}`;
  renderList(date);
  renderHistory(date);
});

// Generate month calendar
function generateCalendar(year, month) {
  calendarGrid.innerHTML = '';
  const lastDay = new Date(year, month + 1, 0);

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const div = document.createElement('div');
    div.className = 'calendar-day';

    // Highlight if all habits are done
    const allDone = data.habits.length > 0 && data.habits.every(h => h.records?.[dateStr]);
    if (allDone) div.classList.add('done');

    div.textContent = i;
    calendarGrid.appendChild(div);
  }
}

// Update calendar after any change
function updateCalendar() {
  const todayDate = new Date();
  generateCalendar(todayDate.getFullYear(), todayDate.getMonth());
}

// Initial render
renderList(today);
renderHistory(today);
updateCalendar();
