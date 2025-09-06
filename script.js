// ===================
// Local Storage Utils
// ===================
function saveData(data) {
  localStorage.setItem("habits", JSON.stringify(data));
}
function loadData() {
  return JSON.parse(localStorage.getItem("habits")) || { habits: [], history: {} };
}

// ===================
// DOM Elements
// ===================
const habitForm = document.getElementById("habit-form");
const habitInput = document.getElementById("habit-input");
const habitList = document.getElementById("habit-list");
const todayTitle = document.getElementById("today-title");
const datePicker = document.getElementById("date-picker");
const historyList = document.getElementById("history-list");
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiSound = document.getElementById("confetti-sound");

// ===================
// State
// ===================
let data = loadData();
let today = new Date().toISOString().split("T")[0];

// ===================
// Render Functions
// ===================
function renderHabits() {
  todayTitle.textContent = `📅 Habits for ${today}`;
  habitList.innerHTML = "";
  data.habits.forEach((habit, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${habit}</span>
      <div class="habit-actions">
        <button onclick="toggleHabit(${index})">${isDone(index) ? "✅" : "⬜"}</button>
        <button onclick="deleteHabit(${index})">🗑️</button>
      </div>
    `;
    habitList.appendChild(li);
  });
  updateCharts();
}

function renderHistory(date) {
  historyList.innerHTML = "";
  if (data.history[date]) {
    data.history[date].forEach((done, i) => {
      const li = document.createElement("li");
      li.textContent = `${data.habits[i]}: ${done ? "✅" : "❌"}`;
      historyList.appendChild(li);
    });
  }
}

// ===================
// Habit Functions
// ===================
habitForm.addEventListener("submit", e => {
  e.preventDefault();
  const habit = habitInput.value.trim();
  if (habit) {
    data.habits.push(habit);
    data.habits = [...new Set(data.habits)]; // remove duplicates
    saveData(data);
    habitInput.value = "";
    renderHabits();
  }
});

function toggleHabit(index) {
  if (!data.history[today]) data.history[today] = Array(data.habits.length).fill(false);
  data.history[today][index] = !data.history[today][index];
  saveData(data);
  renderHabits();

  if (data.history[today].every(Boolean)) {
    launchConfetti();
    confettiSound.play();
  }
}

function isDone(index) {
  return data.history[today] && data.history[today][index];
}

function deleteHabit(index) {
  data.habits.splice(index, 1);
  Object.keys(data.history).forEach(date => {
    if (data.history[date][index] !== undefined) {
      data.history[date].splice(index, 1);
    }
  });
  saveData(data);
  renderHabits();
}

// ===================
// History
// ===================
datePicker.addEventListener("change", e => renderHistory(e.target.value));

// ===================
// Confetti Popper Effect
// ===================
function launchConfetti() {
  const ctx = confettiCanvas.getContext("2d");
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  let confetti = [];
  const colors = ["#ff5252", "#ff9800", "#4caf50", "#2196f3", "#9c27b0"];

  for (let i = 0; i < 40; i++) {
    confetti.push({
      x: window.innerWidth / 2,
      y: window.innerHeight,
      r: Math.random() * 6 + 4,
      d: Math.random() * 40 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    });
  }

  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confetti.forEach(c => {
      ctx.beginPath();
      ctx.fillStyle = c.color;
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
      ctx.fill();
    });
    update();
  }

  function update() {
    confetti.forEach(c => {
      c.y -= (Math.cos(c.d) + 2 + c.r / 2) / 2;
      c.x += Math.sin(c.d);
      c.tiltAngle += c.tiltAngleIncrement;
      c.tilt = Math.sin(c.tiltAngle) * 15;
    });
  }

  let interval = setInterval(draw, 20);
  setTimeout(() => clearInterval(interval), 2500);
}

// ===================
// Charts
// ===================
const weeklyChart = new Chart(document.getElementById("weeklyChart"), {
  type: "bar",
  data: { labels: [], datasets: [{ label: "Weekly Progress", data: [] }] }
});
const monthlyChart = new Chart(document.getElementById("monthlyChart"), {
  type: "line",
  data: { labels: [], datasets: [{ label: "Monthly Progress", data: [] }] }
});

function updateCharts() {
  let last7 = Object.keys(data.history).slice(-7);
  let weekly = last7.map(d => data.history[d].filter(Boolean).length);
  weeklyChart.data.labels = last7;
  weeklyChart.data.datasets[0].data = weekly;
  weeklyChart.update();

  let last30 = Object.keys(data.history).slice(-30);
  let monthly = last30.map(d => data.history[d].filter(Boolean).length);
  monthlyChart.data.labels = last30;
  monthlyChart.data.datasets[0].data = monthly;
  monthlyChart.update();
}

// ===================
// Init
// ===================
renderHabits();

// ----------------------
// 🔔 Firebase Notifications Setup
// ----------------------
// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCTArFuPpxo608354Ql9RLOZRB9lGHFndI",
  authDomain: "habit-tracker-3eb0d.firebaseapp.com",
  projectId: "habit-tracker-3eb0d",
  storageBucket: "habit-tracker-3eb0d.firebasestorage.app",
  messagingSenderId: "724949907964",
  appId: "1:724949907964:web:f5b76c04de753903d55a79"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Ask permission from user
async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await messaging.getToken();
      console.log("✅ FCM Token:", token);
      alert("Notifications enabled!");
    } else {
      alert("❌ Notifications blocked.");
    }
  } catch (err) {
    console.error("Error getting notification permission:", err);
  }
}

// Attach to button
document.getElementById("notify-btn").addEventListener("click", requestPermission);


