// =========================
// Habit Tracker Data
// =========================
let goals = JSON.parse(localStorage.getItem("goals")) || [];
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// DOM elements
const goalsList = document.getElementById("goalsList");
const addGoalBtn = document.getElementById("addGoalBtn");
const newGoalInput = document.getElementById("newGoal");
const calendarEl = document.getElementById("calendar");
const monthYearEl = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
const celebrationSound = document.getElementById("celebrationSound");

// =========================
// Save & Render
// =========================
function saveData() { localStorage.setItem("goals", JSON.stringify(goals)); }

function renderGoals() {
    goalsList.innerHTML = "";
    goals.forEach((goal, idx) => {
        const li = document.createElement("li");

        const tick = document.createElement("span");
        tick.className = goal.doneToday ? "done" : "";
        tick.textContent = goal.doneToday ? "✅" : "";

        const span = document.createElement("span");
        span.className = "text";
        span.textContent = goal.name;

        const btns = document.createElement("div");
        const doneBtn = document.createElement("button");
        doneBtn.textContent = goal.doneToday ? "↩️" : "✔️";
        doneBtn.onclick = () => toggleGoal(idx);

        const editBtn = document.createElement("button");
        editBtn.textContent = "✏️";
        editBtn.onclick = () => editGoal(idx);

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => deleteGoal(idx);

        btns.appendChild(doneBtn);
        btns.appendChild(editBtn);
        btns.appendChild(delBtn);

        li.appendChild(tick);
        li.appendChild(span);
        li.appendChild(btns);

        goalsList.appendChild(li);
    });
}

function addGoal() {
    const name = newGoalInput.value.trim();
    if (!name) return;
    goals.push({ name, records: {}, doneToday: false });
    newGoalInput.value = "";
    saveData();
    renderGoals();
    renderCalendar(currentMonth, currentYear);
}
function toggleGoal(idx) {
    const today = new Date().toISOString().split("T")[0];
    const g = goals[idx];
    g.records[today] = !g.records[today];
    g.doneToday = g.records[today];
    saveData();
    renderGoals();
    renderCalendar(currentMonth, currentYear);
    if(g.doneToday) { launchConfetti(); celebrationSound.play(); }
}
function editGoal(idx) {
    const newName = prompt("Edit goal:", goals[idx].name);
    if(newName) { goals[idx].name = newName; saveData(); renderGoals(); }
}
function deleteGoal(idx) {
    if(confirm("Delete this goal?")) { goals.splice(idx,1); saveData(); renderGoals(); renderCalendar(currentMonth, currentYear);}
}

// =========================
// Calendar
// =========================
function renderCalendar(month, year) {
    calendarEl.innerHTML = "";
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    monthYearEl.textContent = new Date(year, month).toLocaleString("default",{month:"long", year:"numeric"});

    for(let i=0;i<firstDay;i++) { calendarEl.appendChild(document.createElement("div")); }
    for(let d=1;d<=daysInMonth;d++){
        const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
        const div = document.createElement("div");
        div.textContent = d;
        if(goals.length>0 && goals.every(g=>g.records[dateStr])) { div.classList.add("done"); }
        calendarEl.appendChild(div);
    }
}

// =========================
// Confetti
// =========================
function launchConfetti() {
    const particles = [];
    for(let i=0;i<25;i++){
        particles.push({x: confettiCanvas.width/2, y: confettiCanvas.height, dx:(Math.random()-0.5)*6, dy:-Math.random()*6-2, color:`hsl(${Math.random()*360},100%,50%)`, size:Math.random()*5+2});
    }
    function animate(){
        confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
        particles.forEach(p=>{
            p.x+=p.dx; p.y+=p.dy; p.dy+=0.2;
            confettiCtx.fillStyle=p.color;
            confettiCtx.beginPath(); confettiCtx.arc(p.x,p.y,p.size,0,Math.PI*2); confettiCtx.fill();
        });
        if(particles.some(p=>p.y<confettiCanvas.height)) requestAnimationFrame(animate);
    }
    animate();
}
function resizeCanvas() { confettiCanvas.width=window.innerWidth; confettiCanvas.height=window.innerHeight; }
resizeCanvas(); window.addEventListener("resize", resizeCanvas);

// =========================
// Export / Import
// =========================
function exportData(){
    const blob=new Blob([JSON.stringify(goals)],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a"); a.href=url; a.download="habit_backup.json"; a.click();
}
document.getElementById("importFile")?.addEventListener("change",(e)=>{const reader=new FileReader(); reader.onload=(ev)=>{try{goals=JSON.parse(ev.target.result); saveData(); renderGoals(); renderCalendar(currentMonth,currentYear); alert("✅ Import success!");}catch(err){alert("❌ Invalid file!");}}; reader.readAsText(e.target.files[0]);});

// =========================
// Weekly Summary Chart
// =========================
function renderSummary(){
    const ctx=document.getElementById("summaryChart").getContext("2d");
    const labels=[]; const data=[];
    const today=new Date();
    for(let i=6;i>=0;i--){
        const d=new Date(today); d.setDate(today.getDate()-i);
        const dateStr=d.toISOString().split("T")[0]; labels.push(d.toLocaleDateString());
        let count=0; goals.forEach(g=>{if(g.records[dateStr]) count++;}); data.push(count);
    }
    new Chart(ctx,{type:"bar", data:{labels,datasets:[{label:"Goals Completed",data,backgroundColor:"#4caf50"}]}});
}

// =========================
// Firebase Cloud Messaging
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyCTArFuPpxo608354Ql9RLOZRB9lGHFndI",
  authDomain: "habit-tracker-3eb0d.firebaseapp.com",
  projectId: "habit-tracker-3eb0d",
  storageBucket: "habit-tracker-3eb0d.firebasestorage.app",
  messagingSenderId: "724949907964",
  appId: "1:724949907964:web:f5b76c04de753903d55a79"
};
firebase.initializeApp(firebaseConfig);
const messaging=firebase.messaging();
async function enableNotifications(){
    try{
        const permission=await Notification.requestPermission();
        if(permission==="granted"){
            const token=await messaging.getToken({vapidKey:"YOUR_PUBLIC_VAPID_KEY_HERE"});
            console.log("✅ FCM Token:",token);
        }
    }catch(err){console.error(err);}
}
document.getElementById("notifyBtn")?.addEventListener("click", enableNotifications);

// =========================
// Navigation / Events
// =========================
addGoalBtn.addEventListener("click", addGoal);
prevMonthBtn.addEventListener("click",()=>{
    currentMonth--; if(currentMonth<0){currentMonth=11; currentYear--;}
    renderCalendar(currentMonth,currentYear);
});
nextMonthBtn.addEventListener("click",()=>{
    currentMonth++; if(currentMonth>11){currentMonth=0; currentYear++;}
    renderCalendar(currentMonth,currentYear);
});

// =========================
// Initial Render
// =========================
renderGoals(); renderCalendar(currentMonth,currentYear); renderSummary();
