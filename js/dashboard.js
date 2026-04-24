// PowerMind AI — Dashboard JS

// ── STATE ─────────────────────────────────────
const state = {
  devices: [
    { id: 1, name: 'Air Conditioner', emoji: '❄️', watts: 1800, on: true,  room: 'Bedroom' },
    { id: 2, name: 'Refrigerator',    emoji: '🧊', watts: 180,  on: true,  room: 'Kitchen' },
    { id: 3, name: 'Washing Machine', emoji: '🫧', watts: 950,  on: false, room: 'Utility' },
    { id: 4, name: 'Water Heater',    emoji: '🚿', watts: 2000, on: false, room: 'Bathroom' },
    { id: 5, name: 'TV / Display',    emoji: '📺', watts: 120,  on: true,  room: 'Living' },
    { id: 6, name: 'Laptop',          emoji: '💻', watts: 65,   on: true,  room: 'Study' },
    { id: 7, name: 'Microwave',       emoji: '📡', watts: 1200, on: false, room: 'Kitchen' },
    { id: 8, name: 'Room Lights',     emoji: '💡', watts: 40,   on: true,  room: 'All' },
  ],
  alerts: [
    { type: 'danger', icon: '🚨', title: 'Anomaly Detected', desc: 'Water Heater drawing 2.4× normal power', time: '2 min ago' },
    { type: 'warn',   icon: '⚠️', title: 'Bill Threshold',  desc: 'On track to exceed ₹4,000 this month', time: '18 min ago' },
    { type: 'info',   icon: '💡', title: 'AI Suggestion',   desc: 'Run Washing Machine at 11PM to save ₹38', time: '1 hr ago' },
  ],
  notifications: [
    { icon: '🚨', title: 'Anomaly Detected', desc: 'Water Heater abnormal draw', time: '2m ago' },
    { icon: '⚠️', title: 'Bill Alert',       desc: 'Projected ₹4,200 this month', time: '18m ago' },
    { icon: '✅', title: 'Goal Progress',    desc: '68% of energy saving goal met', time: '1h ago' },
    { icon: '🤖', title: 'AI Optimized',     desc: 'AC schedule shifted to 11PM', time: '2h ago' },
  ],
  wasteDevices: [
    {
      id: 'wh', emoji: '🚿', name: 'Water Heater',
      actual: 2000, optimal: 1500, fixed: false,
      reason: 'Faulty heating element detected — drawing 500W extra',
      severity: 'critical',
      fix: [
        'Turn off Water Heater immediately from the Device Panel tab.',
        'Descale the heating element — limescale buildup causes 25–30% extra draw.',
        'Check thermostat setting — reduce from 75°C to 55°C (safe & efficient).',
        'If issue persists after descaling, replace the heating element (costs ~₹800).',
        'After fix, schedule it only for 5:30–6:00 AM using the Scheduler tab.'
      ]
    },
    {
      id: 'ac', emoji: '❄️', name: 'Air Conditioner',
      actual: 1800, optimal: 1400, fixed: false,
      reason: 'Dirty filter causing compressor to overwork — 400W excess draw',
      severity: 'high',
      fix: [
        'Turn off AC and clean or replace the air filter (clogged filters add 15–20% load).',
        'Set temperature to 24°C instead of 18°C — each degree saves ~6% electricity.',
        'Enable "Eco Mode" or "Sleep Mode" on your AC remote.',
        'Clean the outdoor condenser unit fins — blocked fins reduce efficiency.',
        'Use the Smart Scheduler to pre-cool at 5PM and reduce load during 6–9PM peak.'
      ]
    },
    {
      id: 'tv', emoji: '📺', name: 'TV / Display',
      actual: 120, optimal: 80, fixed: false,
      reason: 'Standby vampire load — consuming 40W even when screen is idle',
      severity: 'medium',
      fix: [
        'Enable "Auto Power Off" in TV settings — set to turn off after 30 min of inactivity.',
        'Turn off "Quick Start" mode in TV settings — it keeps TV partially powered always.',
        'Use a smart power strip to cut standby power when not in use.',
        'Reduce screen brightness by 30% — has no visible quality loss but saves power.',
        'Set PowerMind AI auto-cutoff rule: OFF after 11PM if no input detected.'
      ]
    },
    {
      id: 'lt', emoji: '💡', name: 'Room Lights',
      actual: 40, optimal: 10, fixed: false,
      reason: 'Old incandescent/CFL bulbs detected — consuming 4× more than LED equivalent',
      severity: 'medium',
      fix: [
        'Replace all CFL/incandescent bulbs with LED bulbs (9W LED = 40W CFL brightness).',
        'Install motion sensors in bathrooms, hallways, and rarely-used rooms.',
        'Use smart dimmer switches — dim lights to 70% when full brightness not needed.',
        'Turn off lights in unoccupied rooms — set auto-off rule in PowerMind scheduler.',
        'LED replacements cost ~₹150/bulb and pay back in under 2 months.'
      ]
    },
  ],
  liveBaseData: [1.2,0.9,0.8,0.7,0.8,1.1,1.8,2.4,2.2,2.0,1.8,2.1,2.3,2.2,2.0,2.3,2.8,3.1,3.2,3.0,2.8,2.5,2.1,1.8],
  wasteActualBase: [1.4,1.1,1.0,0.9,1.0,1.3,2.1,2.9,2.8,2.6,2.4,2.7,3.1,2.9,2.7,3.0,3.5,3.8,4.2,3.9,3.6,3.2,2.7,2.2],
  wasteOptimalBase:[1.0,0.8,0.7,0.7,0.8,1.0,1.6,2.2,2.1,2.0,1.8,2.0,2.3,2.2,2.0,2.2,2.6,2.8,3.0,2.8,2.6,2.3,2.0,1.6],
};

const TARIFF = 8.5; // ₹ per kWh

// ── HELPERS ───────────────────────────────────
function getActiveWatts() {
  return state.devices.filter(d => d.on).reduce((s, d) => s + d.watts, 0);
}

function getActivekW() {
  return +(getActiveWatts() / 1000).toFixed(2);
}

function getTodayCost() {
  return +(getActivekW() * TARIFF).toFixed(0);
}

function getActiveCount() {
  return state.devices.filter(d => d.on).length;
}

// Total waste from unfixed waste devices
function getTotalWastedW() {
  return state.wasteDevices
    .filter(d => !d.fixed)
    .reduce((s, d) => s + (d.actual - d.optimal), 0);
}

function getTotalWastedCostDay() {
  return +((getTotalWastedW() / 1000) * TARIFF * 24).toFixed(0);
}

function getTotalWastedCostMonth() {
  return getTotalWastedCostDay() * 30;
}

// ── UPDATE ALL KPIs & CHARTS ──────────────────
function updateAllDisplays() {
  const kw        = getActivekW();
  const cost      = getTodayCost();
  const count     = getActiveCount();
  const wasted    = getTotalWastedW();
  const wastedDay = getTotalWastedCostDay();
  const wastedMon = getTotalWastedCostMonth();

  // Overview KPIs
  const nowEl  = document.getElementById('kpi-now');
  const costEl = document.getElementById('kpi-cost');
  if (nowEl)  { nowEl.textContent  = kw + ' kW';  flashUpdate(nowEl); }
  if (costEl) { costEl.textContent = '₹' + cost;  flashUpdate(costEl); }

  // Monitor KPIs
  const activeEl = document.getElementById('kpi-active-devices');
  if (activeEl) { activeEl.textContent = count; flashUpdate(activeEl); }

  // Waste KPIs
  const wEl  = document.getElementById('waste-kpi-w');
  const wdEl = document.getElementById('waste-kpi-day');
  const wmEl = document.getElementById('waste-kpi-month');
  const wsEl = document.getElementById('waste-kpi-save');
  if (wEl)  { wEl.textContent  = wasted.toLocaleString() + ' W'; flashUpdate(wEl); }
  if (wdEl) { wdEl.textContent = '₹' + wastedDay;                flashUpdate(wdEl); }
  if (wmEl) { wmEl.textContent = '₹' + wastedMon.toLocaleString(); flashUpdate(wmEl); }
  if (wsEl) { wsEl.textContent = '₹' + wastedMon.toLocaleString(); flashUpdate(wsEl); }

  // Update live chart with device-aware offset
  updateLiveChart(kw);

  // Update waste chart if built
  updateWasteChart();
}

function flashUpdate(el) {
  el.classList.remove('kpi-flash');
  void el.offsetWidth;
  el.classList.add('kpi-flash');
}

// ── TABS ──────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.sidebar-nav a[data-tab]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
      document.getElementById('tab-' + tab)?.classList.add('active');
      link.parentElement.classList.add('active');
      document.getElementById('topbar-title').textContent =
        link.querySelector('.nav-icon').nextSibling.textContent.trim();
      if (tab === 'waste') initWasteTab();
    });
  });
}

// ── DEVICE PANEL ─────────────────────────────
function renderDevices() {
  const grid = document.getElementById('device-grid');
  if (!grid) return;
  grid.innerHTML = state.devices.map(d => `
    <div class="device-tile ${d.on ? 'on' : ''}" id="device-${d.id}" onclick="toggleDevice(${d.id})">
      <div class="device-emoji">${d.emoji}</div>
      <div class="device-name">${d.name}</div>
      <div class="device-watt">${d.on ? d.watts + ' W' : '— Off'}</div>
      <button class="device-toggle">${d.on ? '🟢 ON' : '⭕ OFF'}</button>
    </div>
  `).join('');
}

function toggleDevice(id) {
  const d = state.devices.find(x => x.id === id);
  if (!d) return;
  d.on = !d.on;

  // Update tile
  const tile = document.getElementById('device-' + id);
  if (tile) {
    tile.classList.toggle('on', d.on);
    tile.querySelector('.device-watt').textContent = d.on ? d.watts + ' W' : '— Off';
    tile.querySelector('.device-toggle').textContent = d.on ? '🟢 ON' : '⭕ OFF';
  }

  // Reflect everywhere
  updateAllDisplays();
  showDeviceToast(d);
}

function showDeviceToast(d) {
  const existing = document.getElementById('device-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'device-toast';
  toast.className = 'device-toast';
  toast.innerHTML = `
    <span>${d.emoji}</span>
    <div>
      <strong>${d.name}</strong> turned ${d.on ? 'ON' : 'OFF'}
      <div class="toast-sub">${d.on ? '+' : '-'}${d.watts}W · ₹${+(d.watts/1000*TARIFF).toFixed(2)}/hr ${d.on ? 'added' : 'saved'}</div>
    </div>
    <span class="toast-icon">${d.on ? '🟢' : '⭕'}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// ── ALERTS ────────────────────────────────────
function renderAlerts() {
  const list = document.getElementById('alerts-list');
  if (!list) return;
  list.innerHTML = state.alerts.map((a, i) => `
    <div class="alert-item ${a.type}" id="alert-${i}">
      <span class="alert-icon">${a.icon}</span>
      <div class="alert-body">
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.desc}</div>
        <div class="alert-time">${a.time}</div>
      </div>
      <button class="alert-dismiss" onclick="dismissAlert(${i})">✕</button>
    </div>
  `).join('');
}

function dismissAlert(i) {
  const el = document.getElementById('alert-' + i);
  if (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = '0.3s';
    setTimeout(() => el.remove(), 300);
  }
}

// ── NOTIFICATIONS ─────────────────────────────
function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item">
      <span class="notif-icon">${n.icon}</span>
      <div>
        <div class="notif-text"><strong>${n.title}</strong>${n.desc}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    </div>
  `).join('');
}

function toggleNotifPanel() {
  document.getElementById('notif-panel')?.classList.toggle('open');
}

// ── CHARTS ────────────────────────────────────
let liveChart, weekChart, predChart, wasteChart;
let liveData = [...state.liveBaseData];

function buildLiveChart() {
  const ctx = document.getElementById('live-chart');
  if (!ctx) return;
  const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
  liveChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'kW',
        data: [...liveData],
        borderColor: '#00e5a0',
        backgroundColor: 'rgba(0,229,160,0.07)',
        fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} kW  ·  ₹${+(ctx.parsed.y * TARIFF).toFixed(1)}/hr` } }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5568', maxTicksLimit: 8 } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5568', callback: v => v + ' kW' } }
      },
      animation: { duration: 500 }
    }
  });
}

// Called whenever devices toggle — shifts the last portion of graph
function updateLiveChart(currentKW) {
  if (!liveChart) return;
  // Scale the last 6 hours of graph proportionally to device change
  const base = state.liveBaseData;
  const baseKW = base[base.length - 1]; // last known base value
  const ratio = baseKW > 0 ? currentKW / baseKW : 1;
  const updated = base.map((v, i) => {
    if (i >= 18) return +((v * ratio + (Math.random() - 0.5) * 0.05)).toFixed(2);
    return v;
  });
  liveData = updated;
  liveChart.data.datasets[0].data = [...updated];
  liveChart.update();
}

function buildWeekChart() {
  const ctx = document.getElementById('week-chart');
  if (!ctx) return;
  weekChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        { label: 'This Week', data: [18,22,19,25,21,28,24], backgroundColor: 'rgba(0,229,160,0.7)', borderRadius: 6 },
        { label: 'Last Week', data: [22,25,21,29,24,31,27], backgroundColor: 'rgba(0,184,255,0.3)', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8a9bb0', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5568' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5568', callback: v => v + ' kWh' } }
      }
    }
  });
}

function buildPredChart() {
  const ctx = document.getElementById('pred-chart');
  if (!ctx) return;
  predChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['6AM','9AM','12PM','3PM','6PM','9PM','12AM'],
      datasets: [
        { label: 'AI Forecast', data: [0.8,1.6,2.1,1.9,2.8,3.1,1.2], borderColor: '#00b8ff', backgroundColor: 'rgba(0,184,255,0.07)', fill: true, tension: 0.45, borderDash: [5,4], pointRadius: 4, borderWidth: 2 },
        { label: 'Actual',      data: [0.7,1.5,2.0,null,null,null,null], borderColor: '#00e5a0', fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2.5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8a9bb0', font: { size: 11 } } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5568' } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5568', callback: v => v + ' kW' } }
      }
    }
  });
}

// ── WASTE CHART ───────────────────────────────
function buildWasteChart() {
  const ctx = document.getElementById('waste-chart');
  if (!ctx || wasteChart) return;

  wasteChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      datasets: [
        {
          label: 'Actual Power (kW)',
          data: [...state.wasteActualBase],
          borderColor: '#ff4757',
          backgroundColor: 'rgba(255,71,87,0.15)',
          fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5, order: 2
        },
        {
          label: 'Optimal Power (kW)',
          data: [...state.wasteOptimalBase],
          borderColor: '#00e5a0',
          backgroundColor: 'rgba(0,229,160,0.08)',
          fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2.5, borderDash: [6,3], order: 1
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            afterBody: (items) => {
              const a = items[0]?.raw || 0;
              const o = items[1]?.raw || 0;
              const waste = Math.max(0, a - o).toFixed(2);
              const cost  = (waste * TARIFF).toFixed(1);
              return [`⚡ Wasted: ${waste} kW`, `💸 Cost this hour: ₹${cost}`];
            }
          }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5568', maxTicksLimit: 8 } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#4a5568', callback: v => v + ' kW' },
          title: { display: true, text: 'Power (kW)', color: '#4a5568', font: { size: 11 } }
        }
      },
      animation: { duration: 700 }
    }
  });
}

// Recalculate waste chart based on fixed issues
function updateWasteChart() {
  if (!wasteChart) return;

  // Calculate total reduction ratio from fixed devices
  const totalPossibleWaste = state.wasteDevices.reduce((s, d) => s + (d.actual - d.optimal), 0);
  const fixedWaste = state.wasteDevices
    .filter(d => d.fixed)
    .reduce((s, d) => s + (d.actual - d.optimal), 0);
  const reductionRatio = totalPossibleWaste > 0 ? fixedWaste / totalPossibleWaste : 0;

  // Reduce actual line proportionally toward optimal as issues get fixed
  const newActual = state.wasteActualBase.map((v, i) => {
    const opt = state.wasteOptimalBase[i];
    const gap = v - opt;
    return +((v - gap * reductionRatio) + (Math.random() - 0.5) * 0.02).toFixed(2);
  });

  wasteChart.data.datasets[0].data = newActual;
  wasteChart.update();
}

// ── WASTE ANALYZER ────────────────────────────
const severityConfig = {
  critical: { label: 'Critical', color: '#ff4757', bg: 'rgba(255,71,87,0.12)' },
  high:     { label: 'High',     color: '#ffb700', bg: 'rgba(255,183,0,0.12)' },
  medium:   { label: 'Medium',   color: '#00b8ff', bg: 'rgba(0,184,255,0.12)' },
};

function renderWasteDevices() {
  const list = document.getElementById('waste-device-list');
  if (!list) return;
  list.innerHTML = state.wasteDevices.map((d, i) => {
    const wasted    = d.actual - d.optimal;
    const costDay   = +((wasted / 1000) * TARIFF * 24).toFixed(0);
    const costMonth = costDay * 30;
    const sev       = severityConfig[d.severity];
    const pct       = Math.round((wasted / d.actual) * 100);
    return `
      <div class="waste-device-row ${d.fixed ? 'fixed' : ''}" id="wdr-${i}">
        <div class="wdr-device">
          <span class="wdr-emoji">${d.emoji}</span>
          <div>
            <div class="wdr-name">${d.name} ${d.fixed ? '<span class="fixed-tag">✅ Fixed</span>' : ''}</div>
            <div class="wdr-reason">${d.reason}</div>
          </div>
        </div>
        <div class="wdr-stat">
          <span class="wdr-val ${d.fixed ? 'green' : 'red'}">${d.fixed ? d.optimal : d.actual} W</span>
          <div class="wdr-bar-bg"><div class="wdr-bar ${d.fixed ? 'green' : 'red'}" style="width:100%"></div></div>
        </div>
        <div class="wdr-stat">
          <span class="wdr-val green">${d.optimal} W</span>
          <div class="wdr-bar-bg"><div class="wdr-bar green" style="width:${Math.round((d.optimal/d.actual)*100)}%"></div></div>
        </div>
        <div class="wdr-stat center">
          <span class="wdr-val ${d.fixed ? 'green' : 'red'}">${d.fixed ? '✅ 0' : '+' + wasted} W</span>
          <span class="wdr-pct">${d.fixed ? 'Resolved' : pct + '% excess'}</span>
        </div>
        <div class="wdr-stat center"><span class="wdr-val ${d.fixed ? 'green' : 'warn'}">₹${d.fixed ? 0 : costDay}</span></div>
        <div class="wdr-stat center"><span class="wdr-val ${d.fixed ? 'green' : 'red'}">₹${d.fixed ? 0 : costMonth}</span></div>
        <div class="wdr-stat center">
          <span class="severity-badge" style="color:${sev.color};background:${sev.bg}">${d.fixed ? 'Resolved' : sev.label}</span>
        </div>
      </div>
    `;
  }).join('');

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.wdr-bar').forEach(bar => {
      const w = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => { bar.style.width = w; bar.style.transition = 'width 0.9s ease'; }, 80);
    });
  }, 100);
}

function renderFixGuide() {
  const list = document.getElementById('fix-list');
  if (!list) return;
  const sorted = [...state.wasteDevices].sort((a, b) => (b.actual - b.optional) - (a.actual - a.optimal));
  list.innerHTML = state.wasteDevices.map((d, i) => {
    const wasted    = d.actual - d.optimal;
    const costMonth = Math.round((wasted / 1000) * TARIFF * 24 * 30);
    const sev       = severityConfig[d.severity];
    return `
      <div class="fix-item ${d.fixed ? 'fix-done' : ''}" id="fix-item-${i}">
        <div class="fix-header" onclick="toggleFix(${i})">
          <div class="fix-left">
            <span class="fix-num">${i + 1}</span>
            <span class="fix-emoji">${d.emoji}</span>
            <div>
              <div class="fix-name">${d.name}
                <span class="severity-badge" style="color:${sev.color};background:${sev.bg};margin-left:8px">
                  ${d.fixed ? '✅ Fixed' : sev.label}
                </span>
              </div>
              <div class="fix-save">
                ${d.fixed
                  ? `<span style="color:var(--accent)">✅ Saving ₹${costMonth}/month — issue resolved!</span>`
                  : `Fix this → Save <strong style="color:#00e5a0">₹${costMonth}/month</strong> · Reduce by ${wasted}W`
                }
              </div>
            </div>
          </div>
          <span class="fix-toggle-icon" id="fix-icon-${i}">▼</span>
        </div>
        <div class="fix-steps" id="fix-steps-${i}">
          ${d.fix.map((step, j) => `
            <div class="fix-step">
              <span class="fix-step-num">${j + 1}</span>
              <span class="fix-step-text">${step}</span>
            </div>
          `).join('')}
          <div class="fix-applied">
            ${d.fixed
              ? `<div class="fix-saved-badge">✅ Fixed — You are saving ₹${costMonth}/month · ${wasted}W recovered</div>`
              : `<button class="btn-fix-done" onclick="markFixed(${i})">✅ Mark as Fixed</button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleFix(i) {
  const steps = document.getElementById('fix-steps-' + i);
  const icon  = document.getElementById('fix-icon-' + i);
  const open  = steps.classList.toggle('open');
  if (icon) icon.textContent = open ? '▲' : '▼';
}

function markFixed(i) {
  const d = state.wasteDevices[i];
  if (!d || d.fixed) return;
  d.fixed = true;

  const wasted    = d.actual - d.optimal;
  const costMonth = Math.round((wasted / 1000) * TARIFF * 24 * 30);

  // Animate fix item
  const item = document.getElementById('fix-item-' + i);
  if (item) {
    item.classList.add('fix-done');
    item.style.transition = 'opacity 0.5s, transform 0.5s';
  }

  // Show savings toast
  showSavingsToast(d.emoji, d.name, wasted, costMonth);

  // Re-render both sections + update charts + KPIs
  renderWasteDevices();
  renderFixGuide();
  updateAllDisplays();

  // Re-open the fix step that was open
  const steps = document.getElementById('fix-steps-' + i);
  if (steps) steps.classList.add('open');
  const icon = document.getElementById('fix-icon-' + i);
  if (icon) icon.textContent = '▲';
}

function showSavingsToast(emoji, name, wattsFixed, costMonth) {
  const existing = document.getElementById('savings-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'savings-toast';
  toast.className = 'device-toast savings-toast';
  toast.innerHTML = `
    <span style="font-size:1.4rem">${emoji}</span>
    <div>
      <strong style="color:var(--accent)">${name} Fixed! 🎉</strong>
      <div class="toast-sub">You're now saving <strong style="color:var(--accent)">₹${costMonth}/month</strong> · ${wattsFixed}W recovered</div>
    </div>
    <span style="font-size:1.2rem">✅</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
}

function initWasteTab() {
  renderWasteDevices();
  renderFixGuide();
  buildWasteChart();
  updateAllDisplays();
}

// ── LIVE SIMULATION ───────────────────────────
function startLiveSimulation() {
  setInterval(() => {
    if (!liveChart) return;
    const base  = getActivekW();
    const jitter = (Math.random() - 0.5) * 0.15;
    const newVal = +(Math.max(0.1, base + jitter)).toFixed(2);
    liveData.push(newVal);
    liveData.shift();
    liveChart.data.datasets[0].data = [...liveData];
    liveChart.update('none');
    const el = document.getElementById('kpi-now');
    if (el) el.textContent = newVal + ' kW';
  }, 3000);
}

// ── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderDevices();
  renderAlerts();
  renderNotifications();
  buildLiveChart();
  buildWeekChart();
  buildPredChart();
  startLiveSimulation();

  document.getElementById('bell-btn')?.addEventListener('click', toggleNotifPanel);
  document.getElementById('notif-clear')?.addEventListener('click', () => {
    document.getElementById('notif-list').innerHTML =
      '<div style="padding:20px;text-align:center;color:var(--text3);font-size:0.8rem">No new notifications</div>';
    document.querySelector('.alert-badge').textContent = '0';
  });

  document.addEventListener('click', e => {
    const panel = document.getElementById('notif-panel');
    if (panel && !panel.contains(e.target) && !document.getElementById('bell-btn')?.contains(e.target)) {
      panel.classList.remove('open');
    }
  });

  setTimeout(() => {
    document.querySelectorAll('.progress-bar').forEach(bar => {
      const w = bar.dataset.width;
      if (w) bar.style.width = w;
    });
  }, 400);
});