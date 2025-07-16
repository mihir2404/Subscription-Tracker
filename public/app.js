// --- Selectors ---
const preloadedList = document.getElementById('preloadedList');
const userList = document.getElementById('userList');
const subscriptionForm = document.getElementById('subscriptionForm');
const serviceNameInput = document.getElementById('serviceName');
const costInput = document.getElementById('cost');
const renewalDateInput = document.getElementById('renewalDate');
const billingTypeInput = document.getElementById('billingType');
const iconUploadInput = document.getElementById('iconUpload');
const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
const totalMonthly = document.getElementById('totalMonthly');
const totalYearly = document.getElementById('totalYearly');
const darkModeToggle = document.getElementById('darkModeToggle');
const pieChartCanvas = document.getElementById('pieChart');

// --- Preloaded Subscriptions ---
const PRELOADED = [
  { name: 'Netflix', cost: 649, renewal: getToday(), billing: 'monthly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/netflix.svg' },
  { name: 'Amazon Prime', cost: 299, renewal: getToday(), billing: 'monthly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/amazonprime.svg' },
  { name: 'Disney+ Hotstar', cost: 299, renewal: getToday(), billing: 'monthly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/disneyplus.svg' },
  { name: 'Spotify', cost: 119, renewal: getToday(), billing: 'monthly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg' },
  { name: 'Apple TV', cost: 99, renewal: getToday(), billing: 'monthly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/appletv.svg' },
  { name: 'JioCinema', cost: 999, renewal: getToday(), billing: 'yearly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/jio.svg' },
  { name: 'Zee5', cost: 599, renewal: getToday(), billing: 'yearly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zee5.svg' },
  { name: 'ALTBalaji', cost: 300, renewal: getToday(), billing: 'yearly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/altbalaji.svg' },
  { name: 'SonyLIV', cost: 299, renewal: getToday(), billing: 'monthly', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/sonyliv.svg' }
];

// --- State ---
let preloadedSubs = [];
let userSubs = [];
let editing = null; // {type: 'preloaded'|'user', idx: number}
let chart = null;

// --- LocalStorage Keys ---
const PRE_KEY = 'subscription_tracker_preloaded';
const USER_KEY = 'subscription_tracker_user';
const DARK_KEY = 'subscription_tracker_dark';

// --- Utility Functions ---
function getToday() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}
function saveData() {
  localStorage.setItem(PRE_KEY, JSON.stringify(preloadedSubs));
  localStorage.setItem(USER_KEY, JSON.stringify(userSubs));
}
function loadData() {
  const pre = localStorage.getItem(PRE_KEY);
  const user = localStorage.getItem(USER_KEY);
  preloadedSubs = pre ? JSON.parse(pre) : PRELOADED;
  userSubs = user ? JSON.parse(user) : [];
}
function saveDarkMode(isDark) {
  localStorage.setItem(DARK_KEY, isDark ? '1' : '0');
}
function loadDarkMode() {
  return localStorage.getItem(DARK_KEY) !== '0';
}
function formatCurrency(val) {
  return '₹' + (+val).toLocaleString('en-IN', { minimumFractionDigits: 0 });
}
function getIconImg(icon) {
  if (!icon) return '';
  if (icon.startsWith('data:') || icon.startsWith('http')) return icon;
  return '';
}

// --- Render Functions ---
function renderAll() {
  renderPreloaded();
  renderUser();
  renderTotals();
  renderChart();
}
function renderPreloaded() {
  preloadedList.innerHTML = '';
  preloadedSubs.forEach((sub, idx) => {
    preloadedList.appendChild(createCard(sub, 'preloaded', idx));
  });
}
function renderUser() {
  userList.innerHTML = '';
  userSubs.forEach((sub, idx) => {
    userList.appendChild(createCard(sub, 'user', idx));
  });
}
function createCard(sub, type, idx) {
  const li = document.createElement('li');
  li.className = 'subscription-card';
  // Title with icon
  const content = document.createElement('div');
  content.className = 'subscription-content';
  const title = document.createElement('span');
  title.className = 'subscription-title';
  if (sub.icon) {
    const img = document.createElement('img');
    img.src = sub.icon;
    img.alt = sub.name;
    img.style.display = 'inline-block';
    img.style.verticalAlign = 'middle';
    title.appendChild(img);
  }
  title.appendChild(document.createTextNode(sub.name));
  content.appendChild(title);
  // Meta (aligned in a row)
  const meta = document.createElement('div');
  meta.className = 'subscription-meta';
  meta.innerHTML = `
    <span><i class="fa-solid fa-calendar"></i> ${sub.renewal}</span>
    <span><i class="fa-solid fa-coins"></i> ${formatCurrency(sub.cost)}</span>
    <span><i class="fa-solid fa-rotate"></i> ${capitalize(sub.billing)}</span>
  `;
  content.appendChild(meta);
  // Actions
  const actions = document.createElement('div');
  actions.className = 'subscription-actions';
  // Edit
  const editBtn = document.createElement('button');
  editBtn.title = 'Edit';
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  editBtn.onclick = () => startEdit(type, idx);
  actions.appendChild(editBtn);
  // Delete
  const delBtn = document.createElement('button');
  delBtn.title = 'Delete';
  delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
  delBtn.onclick = () => deleteSub(type, idx, li);
  actions.appendChild(delBtn);
  li.appendChild(content);
  li.appendChild(actions);
  return li;
}
function renderTotals() {
  let monthly = 0, yearly = 0;
  [...preloadedSubs, ...userSubs].forEach(sub => {
    if (sub.billing === 'monthly') {
      monthly += +sub.cost;
      yearly += +sub.cost * 12;
    } else {
      yearly += +sub.cost;
      monthly += +sub.cost / 12;
    }
  });
  totalMonthly.textContent = formatCurrency(Math.round(monthly)) + '/mo';
  totalYearly.textContent = formatCurrency(Math.round(yearly)) + '/yr';
}
function renderChart() {
  const all = [...preloadedSubs, ...userSubs];
  if (!chart) {
    chart = new Chart(pieChartCanvas, {
      type: 'pie',
      data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
      options: {
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: getComputedStyle(document.body).getPropertyValue('--text-main') } }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
  chart.data.labels = all.map(sub => sub.name);
  chart.data.datasets[0].data = all.map(sub => sub.billing === 'monthly' ? +sub.cost : +sub.cost / 12);
  chart.data.datasets[0].backgroundColor = all.map((_, i) => getColor(i));
  chart.options.plugins.legend.labels.color = getComputedStyle(document.body).getPropertyValue('--text-main');
  chart.update();
}
function getColor(idx) {
  const colors = [
    '#ffb347', '#4fd18b', '#ff5e62', '#7f7fd5', '#43cea2', '#f7971e', '#f857a6', '#30cfd0', '#a1c4fd', '#c2e9fb', '#e573c7', '#f9d423', '#e1eec3', '#fcb69f', '#a8edea'
  ];
  return colors[idx % colors.length];
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Edit/Delete Logic ---
function startEdit(type, idx) {
  editing = { type, idx };
  const sub = type === 'preloaded' ? preloadedSubs[idx] : userSubs[idx];
  serviceNameInput.value = sub.name;
  costInput.value = sub.cost;
  renewalDateInput.value = sub.renewal;
  billingTypeInput.value = sub.billing;
  addSubscriptionBtn.innerHTML = '<span>Save</span> <i class="fa-solid fa-check"></i>';
  if (type === 'preloaded') iconUploadInput.disabled = true;
  else iconUploadInput.disabled = false;
  serviceNameInput.focus();
}
function resetForm() {
  editing = null;
  subscriptionForm.reset();
  addSubscriptionBtn.innerHTML = '<span>Add</span> <i class="fa-solid fa-plus"></i>';
  iconUploadInput.disabled = false;
}
function deleteSub(type, idx, li) {
  li.classList.add('fade-out');
  setTimeout(() => {
    if (type === 'preloaded') preloadedSubs.splice(idx, 1);
    else userSubs.splice(idx, 1);
    saveData();
    renderAll();
  }, 400);
}

// --- Form Submission ---
subscriptionForm.onsubmit = (e) => {
  e.preventDefault();
  const name = serviceNameInput.value.trim();
  const cost = parseFloat(costInput.value);
  const renewal = renewalDateInput.value;
  const billing = billingTypeInput.value;
  let icon = '';
  if (iconUploadInput.files && iconUploadInput.files[0]) {
    const file = iconUploadInput.files[0];
    const reader = new FileReader();
    reader.onload = function(evt) {
      icon = evt.target.result;
      saveOrUpdate(name, cost, renewal, billing, icon);
    };
    reader.readAsDataURL(file);
    return;
  } else if (editing && editing.type === 'user') {
    icon = userSubs[editing.idx].icon;
  } else if (editing && editing.type === 'preloaded') {
    icon = preloadedSubs[editing.idx].icon;
  }
  saveOrUpdate(name, cost, renewal, billing, icon);
};
function saveOrUpdate(name, cost, renewal, billing, icon) {
  if (!name || isNaN(cost) || !renewal || !billing) return;
  if (editing) {
    if (editing.type === 'preloaded') {
      preloadedSubs[editing.idx] = { ...preloadedSubs[editing.idx], name, cost, renewal, billing };
    } else {
      userSubs[editing.idx] = { ...userSubs[editing.idx], name, cost, renewal, billing, icon };
    }
  } else {
    userSubs.unshift({ name, cost, renewal, billing, icon });
  }
  saveData();
  renderAll();
  resetForm();
}
document.addEventListener('click', (e) => {
  if (editing && !subscriptionForm.contains(e.target)) {
    resetForm();
  }
});

// --- Dark Mode ---
function setDarkMode(isDark) {
  document.body.classList.toggle('light', !isDark);
  saveDarkMode(isDark);
  if (darkModeToggle) {
    darkModeToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }
  if (chart) {
    chart.options.plugins.legend.labels.color = getComputedStyle(document.body).getPropertyValue('--text-main');
    chart.update();
  }
}
// Set theme before rendering
setDarkMode(loadDarkMode());
if (darkModeToggle) {
  darkModeToggle.onclick = () => {
    const isDark = document.body.classList.contains('light') ? true : false;
    setDarkMode(isDark);
  };
}

// --- Init ---
function init() {
  loadData();
  renderAll();
}
init(); 