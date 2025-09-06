const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitList = document.getElementById('habit-list');
const datePicker = document.getElementById('date-picker');
const historyList = document.getElementById('history-list');
const todayTitle = document.getElementById('today-title');
const calendarGrid = document.getElementById('calendar-grid');
const pointsDisplay = document.getElementById('points-display');
const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');

let data = JSON.parse(localStorage.getItem('habitData')) || { habits: [] };
let todayDate = new Date();
let currentYear = todayDate.getFullYear();
let currentMonth = todayDate.getMonth();
const today = todayDate.toISOString().split('T')[0];
datePicker.value = today;
todayTitle.textContent = `Habits for ${today}`;

// --- Storage ---
function save() {
  localStorage.setItem('habitData', JSON.stringify(data));
}

// --- Points ---
function calculatePoints(date) {
  const doneCount = data.habits.filter(h => h.records?.[date]).length;
  pointsDisplay.textContent = `Points today: ${doneCount} / ${data.habits.length}`;
}

// --- Render list & history ---
function renderList(date) {
  habitList.innerHTML = '';
  data.habits.forEach((h, i) => {
    const done = h.records?.[date];
    const streak = calculateStreak(h, date);
    const li = document.createElement('li');
    li.className = done ? 'done' : '';
    li.innerHTML = `
      <span>${h.name} ${streak>1 ? `(Streak: ${streak})` : ''}</span>
      <div>
        <button onclick="toggleDone(${i}, '${date}')">${done ? 'Undo' : 'Done'}</button>
        <button onclick="editHabit(${i})">Edit</button>
        <button onclick="deleteHabit(${i})">Delete</button>
      </div>
    `;
    habitList.appendChild(li);
  });
  calculatePoints(date);
}

function renderHistory(date) {
  historyList.innerHTML = '';
  data.habits.forEach(h => {
    const done = h.records?.[date];
    const li = document.createElement('li');
    li.textContent = `${h.name}: ${done ? '✓' : '–'}`;
    historyList.appendChild(li);
  });
}

// --- Toggle / Edit / Delete ---
function toggleDone(idx, date) {
  const habit = data.habits[idx];
  habit.records = habit.records || {};
  habit.records[date] = !habit.records[date];
  save();
  renderList(date);
  renderHistory(date);
  updateCalendar();
  if(allHabitsDone(date)) triggerConfetti();
}

function editHabit(idx) {
  const newName = prompt("Edit habit:", data.habits[idx].name);
  if(newName) {
    data.habits[idx].name = newName.trim();
    save();
    renderList(datePicker.value);
    renderHistory(datePicker.value);
    updateCalendar();
  }
}

function deleteHabit(idx) {
  if(confirm("Delete this habit?")) {
    data.habits.splice(idx,1);
    save();
    renderList(datePicker.value);
    renderHistory(datePicker.value);
    updateCalendar();
  }
}

// --- Streak calculation ---
function calculateStreak(habit, dateStr) {
  let count = 0;
  let date = new Date(dateStr);
  while(habit.records?.[date.toISOString().split('T')[0]]) {
    count++;
    date.setDate(date.getDate() -1);
  }
  return count;
}

// --- Check if all done ---
function allHabitsDone(date) {
  return data.habits.length>0 && data.habits.every(h => h.records?.[date]);
}

// --- Date picker ---
datePicker.addEventListener('change', ()=>{
  const date = datePicker.value;
  todayTitle.textContent = `Habits for ${date}`;
  renderList(date);
  renderHistory(date);
});

// --- Form submit ---
habitForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = habitInput.value.trim();
  if(!name) return;
  data.habits.push({name, records:{}});
  habitInput.value='';
  save();
  renderList(today);
  renderHistory(today);
  updateCalendar();
});

// --- Calendar ---
function generateCalendar(year, month) {
  calendarGrid.innerHTML = '';
  const lastDay = new Date(year, month+1,0);
  for(let i=1;i<=lastDay.getDate();i++){
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
    const div = document.createElement('div');
    div.className='calendar-day';

    if(data.habits.length>0){
      const doneCount = data.habits.filter(h => h.records?.[dateStr]).length;
      const total = data.habits.length;
      div.setAttribute('data-tooltip', `${doneCount}/${total} habits done`);
      if(doneCount===total) div.classList.add('done');
      else if(doneCount>0){
        const intensity = 0.3 + 0.7*(doneCount/total);
        div.style.background = `rgba(144,238,144,${intensity})`;
        div.classList.add('partial');
      }
    }
    div.textContent=i;
    calendarGrid.appendChild(div);
  }
}

function updateCalendar(){
  generateCalendar(currentYear,currentMonth);
}

// --- Month navigation ---
prevBtn.addEventListener('click', ()=>{
  currentMonth--;
  if(currentMonth<0){currentMonth=11; currentYear--;}
  updateCalendar();
});
nextBtn.addEventListener('click', ()=>{
  currentMonth++;
  if(currentMonth>11){currentMonth=0; currentYear++;}
  updateCalendar();
});

// --- Export/Import ---
exportBtn.addEventListener('click',()=>{
  const blob = new Blob([JSON.stringify(data)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download='habitData.json'; a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click',()=> importInput.click());
importInput.addEventListener('change',e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = evt=>{
    try{
      const imported = JSON.parse(evt.target.result);
      data=imported;
      save();
      renderList(datePicker.value);
      renderHistory(datePicker.value);
      updateCalendar();
    }catch(err){
      alert("Invalid file!");
    }
  }
  reader.readAsText(file);
});

// --- Confetti ---
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');
confettiCanvas.width=window.innerWidth;
confettiCanvas.height=window.innerHeight;
let confettiParticles=[];

function triggerConfetti(){
  confettiParticles=[];
  for(let i=0;i<150;i++){
    confettiParticles.push({
      x: Math.random()*confettiCanvas.width,
      y: Math.random()*confettiCanvas.height- confettiCanvas.height,
      r: Math.random()*6+2,
      d: Math.random()*15+5,
      color:`hsl(${Math.random()*360},100%,50%)`,
      tilt:Math.random()*10-10,
      tiltAngleIncrement:Math.random()*0.07+0.05
    });
  }
  animateConfetti();
}

function animateConfetti(){
  ctx.clearRect(0,0,confettiCanvas.width,confettiCanvas.height);
  confettiParticles.forEach(p=>{
    ctx.beginPath();
    ctx.lineWidth=p.r/2;
    ctx.strokeStyle=p.color;
    ctx.moveTo(p.x+p.tilt+ p.r/4, p.y);
    ctx.lineTo(p.x+p.tilt, p.y+p.tilt+p.r/2);
    ctx.stroke();
    p.tiltAngle+=p.tiltAngleIncrement;
    p.y+= (Math.cos(p.d)+1+p.r/2)/2;
    if(p.y>confettiCanvas.height) p.y=-10;
  });
  requestAnimationFrame(animateConfetti);
}

// --- Initial render ---
renderList(today);
renderHistory(today);
updateCalendar();
