

"use strict";


const state = {
  subjects: [
    { id: 1, name: "DSA",         hours: 2.5, priority: 3, difficulty: 3, deadline: "" },
    { id: 2, name: "Mathematics", hours: 2.0, priority: 3, difficulty: 3, deadline: "" },
    { id: 3, name: "EEE",         hours: 1.5, priority: 2, difficulty: 2, deadline: "" },
    { id: 4, name: "Operating Systems", hours: 1.0, priority: 2, difficulty: 2, deadline: "" },
    { id: 5, name: "English",     hours: 0.5, priority: 1, difficulty: 1, deadline: "" },
  ],
  totalHours: 6.0,
  nextId: 6,
  lastResult: null,
};


function computeBenefit(subject) {
  return subject.priority * 30 + subject.difficulty * 15;
}


function knapsackDP(subjects, totalHours) {
  const n = subjects.length;
  // Convert hours to half-unit integers to avoid floating-point issues
  const W = Math.round(totalHours * 2);

  const weights  = subjects.map(s => Math.round(s.hours * 2));
  const benefits = subjects.map(s => computeBenefit(s));

  const dp = [];
  for (let i = 0; i <= n; i++) {
    dp[i] = new Array(W + 1).fill(0);
  }

  
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
    
      dp[i][w] = dp[i - 1][w];

    
      if (weights[i - 1] <= w) {
        const takeValue = dp[i - 1][w - weights[i - 1]] + benefits[i - 1];
        if (takeValue > dp[i][w]) {
          dp[i][w] = takeValue;
        }
      }
    }
  }


  const selected = new Array(n).fill(false);
  let w = W;
  for (let i = n; i >= 1; i--) {
 
    if (dp[i][w] !== dp[i - 1][w]) {
      selected[i - 1] = true;
      w -= weights[i - 1];
    }
  }

  const maxBenefit = dp[n][W];

  const chosen  = subjects.filter((_, i) => selected[i]);
  const skipped = subjects.filter((_, i) => !selected[i]);
  const usedHours = chosen.reduce((sum, s) => sum + s.hours, 0);

 
  chosen.sort((a, b) => computeBenefit(b) - computeBenefit(a));

  return { chosen, skipped, maxBenefit, usedHours };
}


const PRIORITY_LABELS = { 1: "Low", 2: "Medium", 3: "High" };
const DIFF_LABELS     = { 1: "Easy", 2: "Medium", 3: "Hard" };
const PRIORITY_CLASS  = { 1: "badge-low", 2: "badge-medium", 3: "badge-high" };
const DIFF_CLASS      = { 1: "badge-easy", 2: "badge-medium", 3: "badge-hard" };

function formatHours(h) {
  return parseFloat(h).toFixed(1) + "h";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / 86400000);
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}


function renderSubjects() {
  const grid = document.getElementById("subjectsGrid");
  const { subjects } = state;

  if (subjects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">◎</div>
        <p>No subjects yet. Click <strong>+ Add Subject</strong> to begin.</p>
      </div>`;
    updateStats();
    return;
  }

  const result = knapsackDP(subjects, state.totalHours);
  state.lastResult = result;
  const chosenIds = new Set(result.chosen.map(s => s.id));
  const maxBenefit = Math.max(...subjects.map(computeBenefit));

  grid.innerHTML = subjects.map(s => {
    const benefit = computeBenefit(s);
    const barPct  = Math.round((benefit / maxBenefit) * 100);
    const dl      = daysUntil(s.deadline);
    const dlText  = s.deadline
      ? (dl < 0 ? `⚠ Overdue` : dl === 0 ? `Due today!` : `Due in ${dl}d`)
      : "";
    const dlColor = dl !== null && dl <= 2 ? "color:var(--accent-red)" : "color:var(--text-dim)";

    return `
      <div class="subject-card ${chosenIds.has(s.id) ? "selected" : ""}" id="card-${s.id}">
        <div class="card-top">
          <div class="card-name">${s.name}</div>
          <button class="card-delete" onclick="deleteSubject(${s.id})" title="Remove">✕</button>
        </div>
        <div class="card-badges">
          <span class="badge badge-hours">${formatHours(s.hours)}</span>
          <span class="badge ${PRIORITY_CLASS[s.priority]}">${PRIORITY_LABELS[s.priority]} priority</span>
          <span class="badge ${DIFF_CLASS[s.difficulty]}">${DIFF_LABELS[s.difficulty]}</span>
        </div>
        <div class="benefit-bar">
          <div class="benefit-fill" style="width:${barPct}%"></div>
        </div>
        <div class="card-footer">
          <div class="card-benefit">Benefit score: <strong>${benefit}</strong></div>
          ${dlText ? `<div class="card-deadline" style="${dlColor}">${dlText}</div>` : ""}
        </div>
      </div>`;
  }).join("");

  updateStats(result);
}


function updateStats(result) {
  const totalNeeded = state.subjects.reduce((a, s) => a + s.hours, 0);
  document.getElementById("statTotal").textContent        = state.subjects.length;
  document.getElementById("statHoursNeeded").textContent  = totalNeeded.toFixed(1);
  document.getElementById("statAvail").textContent        = state.totalHours.toFixed(1);

  if (result) {
    const el = document.getElementById("statFit");
    el.textContent = result.chosen.length + " subjects fit";
    el.style.color = result.skipped.length > 0 ? "var(--accent-warm)" : "var(--accent-green)";
  }
}


function renderSchedule(result) {
  const container = document.getElementById("scheduleContent");
  const { chosen, skipped, maxBenefit, usedHours } = result;

  if (chosen.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◉</div>
        <p>No subjects fit within <strong>${state.totalHours}h</strong>.<br>Try adding more hours or smaller subjects.</p>
      </div>`;
    return;
  }

  const efficiency = Math.round((usedHours / state.totalHours) * 100);
  const topBenefit = computeBenefit(chosen[0]);

  const summaryHTML = `
    <div class="result-summary">
      <div class="result-card highlight">
        <div class="result-label">Total benefit score</div>
        <div class="result-value">${maxBenefit}</div>
        <div class="result-sub">DP optimal maximum</div>
      </div>
      <div class="result-card">
        <div class="result-label">Time utilized</div>
        <div class="result-value">${usedHours.toFixed(1)}h</div>
        <div class="result-sub">of ${state.totalHours}h (${efficiency}% efficiency)</div>
      </div>
      <div class="result-card">
        <div class="result-label">Subjects selected</div>
        <div class="result-value">${chosen.length} / ${state.subjects.length}</div>
        <div class="result-sub">${skipped.length} skipped due to time</div>
      </div>
    </div>`;

  const scheduleHTML = chosen.map((s, i) => {
    const b   = computeBenefit(s);
    const pct = Math.round((b / topBenefit) * 100);
    const dl  = daysUntil(s.deadline);
    const dlText = s.deadline
      ? (dl <= 0 ? `⚠ Overdue` : `Exam in ${dl}d`)
      : "No deadline";

    return `
      <div class="sched-row" style="animation-delay:${i * 0.06}s">
        <div class="sched-num">${String(i + 1).padStart(2, "0")}</div>
        <div class="sched-info">
          <div class="sched-name">${s.name}</div>
          <div class="sched-meta">
            <span class="meta-item">⏱ ${formatHours(s.hours)}</span>
            <span class="meta-item badge ${PRIORITY_CLASS[s.priority]}" style="font-size:11px;padding:2px 8px">${PRIORITY_LABELS[s.priority]}</span>
            <span class="meta-item badge ${DIFF_CLASS[s.difficulty]}" style="font-size:11px;padding:2px 8px">${DIFF_LABELS[s.difficulty]}</span>
            <span class="meta-item" style="color:var(--text-dim);font-size:12px">${dlText}</span>
          </div>
        </div>
        <div class="sched-bar-col">
          <div class="sched-bar-bg">
            <div class="sched-bar-fg" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="sched-score">+${b} pts</div>
      </div>`;
  }).join("");

  const skippedHTML = skipped.length > 0 ? `
    <div class="skipped-section">
      <div class="skipped-title">✕ Skipped — insufficient time</div>
      <div class="skipped-chips">
        ${skipped.map(s => `
          <span class="skipped-chip">${s.name} (${formatHours(s.hours)})</span>
        `).join("")}
      </div>
    </div>` : "";

  container.innerHTML = `
    ${summaryHTML}
    <div class="schedule-section-title">Study Order (highest benefit first)</div>
    <div class="schedule-list">${scheduleHTML}</div>
    ${skippedHTML}`;
}


function onHoursChange(val) {
  state.totalHours = parseFloat(val);
  document.getElementById("sidebarHours").textContent = state.totalHours.toFixed(1);
  renderSubjects();
}


function switchTab(tab) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");
  document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
}


function generateSchedule() {
  if (state.subjects.length === 0) {
    showToast("Add at least one subject first.");
    return;
  }
  const result = knapsackDP(state.subjects, state.totalHours);
  state.lastResult = result;
  renderSchedule(result);
  switchTab("schedule");
}

/** Delete a subject by id */
function deleteSubject(id) {
  state.subjects = state.subjects.filter(s => s.id !== id);
  renderSubjects();
  showToast("Subject removed.");
}

 
function openAddModal() {
  document.getElementById("inputName").value     = "";
  document.getElementById("inputHours").value    = 2;
  document.getElementById("hoursDisplay").textContent = "2.0";
  document.getElementById("inputDeadline").value = "";
  selectSeg("segPriority", 2);
  selectSeg("segDifficulty", 2);
  document.getElementById("modalOverlay").classList.add("open");
  setTimeout(() => document.getElementById("inputName").focus(), 100);
}

function closeAddModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

function closeModal(event) {
  if (event.target === document.getElementById("modalOverlay")) closeAddModal();
}


function selectSeg(segId, val) {
  document.querySelectorAll(`#${segId} .seg-btn`).forEach(btn => {
    btn.classList.toggle("active", parseInt(btn.dataset.val) === val);
  });
}

function getSegValue(segId) {
  const active = document.querySelector(`#${segId} .seg-btn.active`);
  return active ? parseInt(active.dataset.val) : 2;
}

function confirmAddSubject() {
  const name = document.getElementById("inputName").value.trim();
  if (!name) {
    document.getElementById("inputName").focus();
    document.getElementById("inputName").style.borderColor = "var(--accent-red)";
    return;
  }
  document.getElementById("inputName").style.borderColor = "";

  const subject = {
    id:         state.nextId++,
    name:       name,
    hours:      parseFloat(document.getElementById("inputHours").value),
    priority:   getSegValue("segPriority"),
    difficulty: getSegValue("segDifficulty"),
    deadline:   document.getElementById("inputDeadline").value,
  };

  state.subjects.push(subject);
  closeAddModal();
  renderSubjects();
  showToast(`"${name}" added!`);
}


document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeAddModal();
  if (e.key === "Enter" && document.getElementById("modalOverlay").classList.contains("open")) {
    confirmAddSubject();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  renderSubjects();
});