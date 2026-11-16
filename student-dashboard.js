
const API_URL = "http://localhost:5000/api";

const FINE_PER_DAY = 5;
const LOSS_FINE = 500;
const DAMAGE_FINE = 200;

const $ = (id) => document.getElementById(id);

const token = localStorage.getItem("libraryToken");

let student = null;
let issues = [];
let reservations = [];
let fineRecords = [];

// ======================================
// HTML SAFETY
// ======================================

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// ======================================
// STUDENT DETAILS
// ======================================

function decodeToken(t) {
  try {
    const payload = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(
      decodeURIComponent(
        atob(payload)
          .split("")
          .map((c) =>
            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );
  } catch (error) {
    return {};
  }
}

function storedUser() {
  for (const key of ["libraryUser", "user"]) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (error) {}
  }

  return {};
}

function loadStudent() {
  const payload = decodeToken(token);
  const saved = storedUser();

  const id =
    payload.user_id ??
    payload.id ??
    payload.userId ??
    saved.user_id ??
    saved.id ??
    null;

  student = {
    id: id === null ? null : Number(id),
    name: payload.name ?? saved.name ?? "-",
    email: payload.email ?? saved.email ?? "-",
    created_at: payload.created_at ?? saved.created_at ?? null
  };
}

// ======================================
// DATE FUNCTIONS
// ======================================

function startOfDay(value) {
  const d = new Date(value);

  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  );
}

function formatDate(value) {
  return value ? startOfDay(value).toLocaleDateString() : "-";
}

function daysBetween(from, to) {
  return Math.round(
    (startOfDay(to) - startOfDay(from)) / 86400000
  );
}

// ======================================
// TABLE AND BADGES
// ======================================

const badge = (text, cls) =>
  `<span class="badge ${escapeHtml(cls || text)}">${escapeHtml(text)}</span>`;

function table(headers, rows) {
  if (rows.length === 0) {
    return `<p class="empty">Nothing to show.</p>`;
  }

  const head = headers
    .map((h) => `<th>${escapeHtml(h)}</th>`)
    .join("");

  const body = rows
    .map((r) =>
      `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`
    )
    .join("");

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${head}</tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

// ======================================
// FINE CALCULATIONS
// ======================================

function daysLate(issue) {
  if (!issue.dueDate) return 0;

  const end = issue.returnDate || new Date();
  const late = daysBetween(issue.dueDate, end);

  return late > 0 ? late : 0;
}

// Find actual fine record using issue ID
function getFineRecord(issue) {
  return fineRecords.find(
    (f) => Number(f.issue_id) === Number(issue.id)
  );
}

// Calculate fine using database record when available
function fineOf(issue) {
  const record = getFineRecord(issue);

  if (record) {
    return Number(record.amount) || 0;
  }

  const status = String(issue.status).toLowerCase();

  if (status === "lost") return LOSS_FINE;
  if (status === "damaged") return DAMAGE_FINE;

  if (status !== "issued" && status !== "returned") {
    return 0;
  }

  return daysLate(issue) * FINE_PER_DAY;
}

function isFinePaid(issue) {
  const record = getFineRecord(issue);

  return record &&
    String(record.status).toLowerCase() === "paid";
}

function pendingFine(issue) {
  if (isFinePaid(issue)) return 0;

  return fineOf(issue);
}

const isOverdue = (issue) =>
  String(issue.status).toLowerCase() === "issued" &&
  daysLate(issue) > 0;

// ======================================
// BACKEND API FUNCTION
// ======================================

async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// ======================================
// LOAD ISSUED AND RETURNED BOOKS
// ======================================

async function loadIssues() {
  const data = await apiGet("/borrow/my");

  issues = (data.issues || []).map((i) => ({
    id: i.issue_id,
    bookId: i.book_id,
    studentId: Number(i.user_id),
    bookName: i.book_title,
    issueDate: i.issue_date,
    dueDate: i.due_date,
    returnDate: i.return_date,
    status: i.status
  }));
}

// ======================================
// LOAD STUDENT RESERVATIONS
// ======================================

async function loadReservations() {
  const data = await apiGet("/reservations/my");

  reservations = (data.reservations || []).map((r) => ({
    id: r.reservation_id,
    bookName: r.title || r.book_title || "Unknown Book",
    date: r.reservation_date,
    status: r.status
  }));
}

// ======================================
// LOAD STUDENT FINES
// ======================================

async function loadFines() {
  const data = await apiGet("/fines/my");

  fineRecords = data.fines || [];
}

// ======================================
// DASHBOARD CARDS
// ======================================

function renderCards() {
  const current = issues.filter(
    (i) => String(i.status).toLowerCase() === "issued"
  );

  const totalFine = issues.reduce(
    (sum, i) => sum + pendingFine(i),
    0
  );

  const data = [
    ["Books With Me", current.length],
    ["Reservation Requests", reservations.length],
    ["Overdue Books", issues.filter(isOverdue).length, true],
    ["Fine To Pay", "Rs. " + totalFine, true]
  ];

  $("cards").innerHTML = data.map(([label, num, warn]) =>
    `<div class="card ${warn ? "warn" : ""}">
      <div class="num">${num}</div>
      <div class="label">${label}</div>
    </div>`
  ).join("");
}

// ======================================
// NEEDS ATTENTION
// ======================================

function renderNotes() {
  const notes = [];

  issues
    .filter((i) => String(i.status).toLowerCase() === "issued")
    .forEach((i) => {
      const left = daysBetween(new Date(), i.dueDate);

      if (left < 0) {
        notes.push(
          `"${escapeHtml(i.bookName)}" is overdue by ${-left} day(s). Fine so far: Rs. ${fineOf(i)}`
        );
      } else if (left <= 3) {
        notes.push(
          `"${escapeHtml(i.bookName)}" is due ${
            left === 0 ? "today" : "in " + left + " day(s)"
          }`
        );
      }
    });

  const totalFine = issues.reduce(
    (sum, i) => sum + pendingFine(i),
    0
  );

  if (totalFine > 0) {
    notes.push(`Total fine to pay: Rs. ${totalFine}`);
  }

  $("dash-notes").innerHTML =
    notes.map((n) => `<li>${n}</li>`).join("") ||
    "<li>All caught up.</li>";
}

// ======================================
// STUDENT PROFILE
// ======================================

function renderDetails() {
  const items = [
    ["Name", student.name],
    ["Email", student.email],
    ["Student ID", student.id ?? "-"]
  ];

  $("student-details").innerHTML = items.map(([label, value]) =>
    `<div class="profile-item">
      <div class="label">${escapeHtml(label)}</div>
      <div class="value">${escapeHtml(value)}</div>
    </div>`
  ).join("");
}

// ======================================
// CURRENTLY ISSUED BOOKS
// ======================================

function renderCurrent() {
  const current = issues.filter(
    (i) => String(i.status).toLowerCase() === "issued"
  );

  $("current-table").innerHTML = table(
    ["Book", "Issued On", "Return By", "Days Left", "Fine", "Status"],

    current.map((i) => {
      const left = daysBetween(new Date(), i.dueDate);
      const fine = pendingFine(i);

      return [
        escapeHtml(i.bookName),
        formatDate(i.issueDate),
        formatDate(i.dueDate),
        left >= 0 ? left : `${-left} overdue`,
        "Rs. " + fine,
        left < 0 ? badge("overdue") : badge("issued")
      ];
    })
  );
}

// ======================================
// RESERVATIONS
// ======================================

function renderReservations() {
  $("reservations-table").innerHTML = table(
    ["Book", "Reserved On", "Status"],

    reservations.map((r) => [
      escapeHtml(r.bookName),
      formatDate(r.date),
      badge(String(r.status).toLowerCase())
    ])
  );
}

// ======================================
// FINES
// ======================================

function renderFines() {
  const rows = [];

  // Actual fine records from the database
  fineRecords.forEach((f) => {
    rows.push([
      escapeHtml(f.book_title || "Unknown Book"),
      formatDate(f.due_date),
      f.return_date ? formatDate(f.return_date) : "Not returned",
      "-",
      "Rs. " + (Number(f.amount) || 0),
      badge(String(f.status).toLowerCase())
    ]);
  });

  // Show estimated fines for overdue books
  // that do not yet have a saved fine record
  issues.forEach((i) => {
    if (
      !getFineRecord(i) &&
      fineOf(i) > 0 &&
      String(i.status).toLowerCase() === "issued"
    ) {
      rows.push([
        escapeHtml(i.bookName),
        formatDate(i.dueDate),
        "Not returned",
        daysLate(i),
        "Rs. " + fineOf(i),
        badge("estimated", "unpaid")
      ]);
    }
  });

  $("fines-table").innerHTML = table(
    ["Book", "Return By", "Returned On", "Days Late", "Fine", "Status"],
    rows
  );

  const total = issues.reduce(
    (sum, i) => sum + pendingFine(i),
    0
  );

  const el = $("total-fine");

  if (total > 0) {
    el.textContent = `Total fine to pay: Rs. ${total}`;
    el.className = "total-fine";
  } else {
    el.textContent = "No fine to pay.";
    el.className = "total-fine clear";
  }
}

// ======================================
// RETURNED BOOKS
// ======================================

function renderReturned() {
  const returned = issues.filter(
    (i) => String(i.status).toLowerCase() === "returned"
  );

  $("returned-table").innerHTML = table(
    ["Book", "Issued On", "Return By", "Returned On", "Fine"],

    returned.map((i) => [
      escapeHtml(i.bookName),
      formatDate(i.issueDate),
      formatDate(i.dueDate),
      formatDate(i.returnDate),
      "Rs. " + fineOf(i)
    ])
  );
}

// ======================================
// RENDER COMPLETE DASHBOARD
// ======================================

function renderAll() {
  renderCards();
  renderNotes();
  renderDetails();
  renderCurrent();
  renderReservations();
  renderFines();
  renderReturned();
}

// ======================================
// INITIALIZE DASHBOARD
// ======================================

async function init() {
  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  loadStudent();

  try {
    await Promise.all([
      loadIssues(),
      loadReservations(),
      loadFines()
    ]);

    renderAll();

  } catch (error) {
    console.error("Dashboard loading error:", error);
    alert(error.message);
  }
}

init();
