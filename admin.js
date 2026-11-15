
const API_URL = "http://localhost:5000/api";

const FINE_PER_DAY = 5;
const LOAN_DAYS = 14;

const $ = (id) => document.getElementById(id);

// ======================================
// BOOK DATA FROM MYSQL DATABASE
// ======================================

let books = [];

async function loadBooks() {
  try {
    const response = await fetch(`${API_URL}/books`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not fetch books");
    }

    books = data.books.map((b) => ({
      id: b.book_id,
      title: b.title,
      author: b.author,
      copies: Number(b.total_copies),
      available: Number(b.available_copies),
      isbn: b.isbn,
      category_id: b.category_id
    }));

  } catch (error) {
    console.error("Error loading books:", error);
    alert("Could not load books. Check whether the backend and MySQL are running.");
  }
}

// ======================================
// TEMPORARY SAMPLE DATA
// These sections will be connected to
// their respective APIs in later steps.
// ======================================

function dayOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

let students = [
  { id: 101, name: "Aarav Sharma", email: "aarav@college.edu", status: "active" },
  { id: 102, name: "Diya Patel", email: "diya@college.edu", status: "active" },
  { id: 103, name: "Rohan Verma", email: "rohan@college.edu", status: "active" },
  { id: 104, name: "Sneha Gupta", email: "sneha@college.edu", status: "blocked" }
];

let issues = [
  { id: 1, bookId: 1, studentId: 101, issueDate: dayOffset(-20), dueDate: dayOffset(-6), returnDate: null, status: "issued", viaRequest: true, finePaid: false },
  { id: 2, bookId: 2, studentId: 102, issueDate: dayOffset(-5), dueDate: dayOffset(9), returnDate: null, status: "issued", viaRequest: true, finePaid: false },
  { id: 3, bookId: 5, studentId: 103, issueDate: dayOffset(-30), dueDate: dayOffset(-16), returnDate: dayOffset(-10), status: "returned", viaRequest: false, finePaid: false },
  { id: 4, bookId: 4, studentId: 103, issueDate: dayOffset(-25), dueDate: dayOffset(-11), returnDate: dayOffset(-12), status: "returned", viaRequest: true, finePaid: false },
  { id: 5, bookId: 3, studentId: 102, issueDate: null, dueDate: null, returnDate: null, status: "requested", viaRequest: true, finePaid: false },
  { id: 6, bookId: 1, studentId: 103, issueDate: null, dueDate: null, returnDate: null, status: "requested", viaRequest: true, finePaid: false },
  { id: 7, bookId: 2, studentId: 101, issueDate: dayOffset(-3), dueDate: dayOffset(11), returnDate: null, status: "issued", viaRequest: false, finePaid: false }
];

let payments = [];

let reservations = [
  { id: 1, bookId: 5, studentId: 101, date: dayOffset(-2), status: "pending" },
  { id: 2, bookId: 2, studentId: 103, date: dayOffset(-1), status: "pending" },
  { id: 3, bookId: 5, studentId: 102, date: dayOffset(-4), status: "approved" }
];

let nextId = 1000;
let viewedStudent = null;

// ======================================
// HELPER FUNCTIONS
// ======================================

const bookTitle = (id) =>
  books.find((b) => b.id === id)?.title || "Book not found";

const studentName = (id) =>
  students.find((s) => s.id === id)?.name || "Student not found";

const badge = (text, cls) =>
  `<span class="badge ${cls || text}">${text}</span>`;

function fineOf(issue) {
  if (issue.status !== "issued" && issue.status !== "returned") return 0;

  const end = issue.returnDate || dayOffset(0);
  const daysLate = Math.floor(
    (new Date(end) - new Date(issue.dueDate)) / 86400000
  );

  return daysLate > 0 ? daysLate * FINE_PER_DAY : 0;
}

const pendingFine = (issue) =>
  issue.finePaid ? 0 : fineOf(issue);

const isOverdue = (i) =>
  i.status === "issued" && i.dueDate < dayOffset(0);

function table(headers, rows) {
  if (rows.length === 0) {
    return `<p class="empty">Nothing to show.</p>`;
  }

  const head = headers.map((h) => `<th>${h}</th>`).join("");

  const body = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
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
// DASHBOARD
// ======================================

function getNotes() {
  const notes = [];

  const pendingReq = issues.filter(
    (i) => i.status === "requested"
  ).length;

  const pendingRes = reservations.filter(
    (r) => r.status === "pending"
  ).length;

  const overdue = issues.filter(isOverdue).length;

  const unpaid = issues.reduce(
    (sum, i) => sum + pendingFine(i), 0
  );

  if (pendingReq) notes.push(`${pendingReq} issue request(s) waiting for approval`);
  if (pendingRes) notes.push(`${pendingRes} reservation(s) waiting for a decision`);
  if (overdue) notes.push(`${overdue} book(s) are overdue`);
  if (unpaid) notes.push(`Rs. ${unpaid} in fines unpaid`);

  return notes;
}

function renderDashboard() {
  const totalBooks = books.reduce(
    (sum, b) => sum + b.copies, 0
  );

  const pendingReq = issues.filter(
    (i) => i.status === "requested"
  ).length;

  const unpaid = issues.reduce(
    (sum, i) => sum + pendingFine(i), 0
  );

  const data = [
    ["Total Books", totalBooks],
    ["Total Students", students.length],
    ["Books Issued", issues.filter((i) => i.status === "issued").length],
    ["Books Returned", issues.filter((i) => i.status === "returned").length],
    ["Issue Requests", issues.filter((i) => i.viaRequest).length],
    ["Pending Requests", pendingReq, true],
    ["Pending Fines", "Rs. " + unpaid, true]
  ];

  $("cards").innerHTML = data.map(([label, num, warn]) =>
    `<div class="card ${warn ? "warn" : ""}">
      <div class="num">${num}</div>
      <div class="label">${label}</div>
    </div>`
  ).join("");

  const notes = getNotes();

  $("dash-notes").innerHTML =
    notes.map((n) => `<li>${n}</li>`).join("") ||
    "<li>All caught up.</li>";
}

// ======================================
// BOOK MANAGEMENT
// Currently GET is connected to MySQL.
// Add, Edit and Delete will be connected next.
// ======================================

// ======================================
// BOOK MANAGEMENT - CONNECTED TO MYSQL
// ======================================

async function renderBooks() {
  const q = $("book-search").value.toLowerCase();

  const list = books.filter((b) =>
    (b.title + b.author).toLowerCase().includes(q)
  );

  $("books-table").innerHTML = table(
    ["ID", "Title", "Author", "Copies", "Available", "Status", "Actions"],

    list.map((b) => [
      b.id,
      b.title,
      b.author,
      b.copies,
      b.available,

      b.available > 0
        ? badge("available")
        : badge("out of stock", "out"),

      `<button class="btn small" onclick="editBook(${b.id})">Edit</button>
       <button class="btn small red" onclick="deleteBook(${b.id})">Delete</button>`
    ])
  );
}

// ADD BOOK
$("book-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = $("book-title").value.trim();
  const author = $("book-author").value.trim();
  const copies = Number($("book-copies").value);

  if (!title || !author || copies < 1) {
    alert("Please enter valid book details.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        author,
        total_copies: copies,
        available_copies: copies,
        isbn: null,
        category_id: null
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not add book");
    }

    alert("Book added successfully!");

    e.target.reset();

    await loadBooks();
    renderAll();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// SEARCH BOOKS
$("book-search").addEventListener("input", renderBooks);

// EDIT BOOK
async function editBook(id) {
  const b = books.find((x) => x.id === id);
  if (!b) return;

  const title = prompt("Title:", b.title);
  if (title === null) return;

  const author = prompt("Author:", b.author);
  if (author === null) return;

  const copiesInput = prompt("Total copies:", b.copies);
  if (copiesInput === null) return;

  const copies = Number(copiesInput);

  const currentlyIssued = b.copies - b.available;

  if (!title.trim() || !author.trim() ||
      !Number.isInteger(copies) || copies < 1 ||
      copies < currentlyIssued) {
    alert("Enter valid details. Total copies cannot be less than copies currently issued.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title.trim(),
        author: author.trim(),
        isbn: b.isbn || null,
        category_id: b.category_id || null,
        total_copies: copies,
        available_copies: copies - currentlyIssued
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not update book");
    }

    alert("Book updated successfully!");

    await loadBooks();
    renderAll();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// DELETE BOOK
async function deleteBook(id) {
  const b = books.find((x) => x.id === id);
  if (!b) return;

  if (b.copies !== b.available) {
    alert("This book has copies issued. Wait for returns first.");
    return;
  }

  if (!confirm(`Are you sure you want to delete "${b.title}"?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/books/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not delete book");
    }

    alert("Book deleted successfully!");

    await loadBooks();
    renderAll();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}


// ======================================
// STUDENT MANAGEMENT
// ======================================


// ======================================
// STUDENT MANAGEMENT
// ======================================

async function loadStudents() {
  const token = localStorage.getItem("libraryToken");

  if (!token) {
    alert("Please login as admin first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/students`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch students");
    }

    students = data.students.map((s) => ({
      id: s.user_id,
      name: s.name,
      email: s.email,
      role: s.role,
      created_at: s.created_at
    }));

    renderStudents();

  } catch (error) {
    console.error("Student loading error:", error);
    alert(error.message);
  }
}

function renderStudents() {
  const q = $("student-search").value.toLowerCase();

  const list = students.filter((s) =>
    (s.name + s.email + s.id).toLowerCase().includes(q)
  );

  $("students-table").innerHTML = table(
    ["ID", "Name", "Email", "Actions"],

    list.map((s) => [
      s.id,
      s.name,
      s.email,

      `<button class="btn small" onclick="viewStudent(${s.id})">
         Profile
       </button>

       <button class="btn small grey" onclick="editStudent(${s.id})">
         Edit
       </button>

       <button class="btn small grey" onclick="deleteStudent(${s.id})">
         Delete
       </button>`
    ])
  );

  const s = students.find((x) => x.id === viewedStudent);

  if (!s) {
    $("student-profile").innerHTML = "";
    return;
  }

  $("student-profile").innerHTML = `
    <div class="profile">
      <h3>${s.name}</h3>
      <p>${s.email} | ID ${s.id}</p>
      <p>Role: ${s.role}</p>
      <p>Registered: ${s.created_at
        ? new Date(s.created_at).toLocaleDateString()
        : "-"}</p>
    </div>`;
}

$("student-search").addEventListener("input", renderStudents);

function viewStudent(id) {
  viewedStudent = id;
  renderStudents();
}

async function editStudent(id) {
  const s = students.find((x) => x.id === id);
  if (!s) return;

  const name = prompt("Enter updated student name:", s.name);
  if (name === null) return;

  const email = prompt("Enter updated student email:", s.email);
  if (email === null) return;

  if (!name.trim() || !email.trim()) {
    alert("Name and email cannot be empty.");
    return;
  }

  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Student update failed");
    }

    alert("Student updated successfully!");
    await loadStudents();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

async function deleteStudent(id) {
  const s = students.find((x) => x.id === id);
  if (!s) return;

  if (!confirm(`Are you sure you want to delete ${s.name}?`)) {
    return;
  }

  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Student deletion failed");
    }

    viewedStudent = null;

    alert("Student deleted successfully!");
    await loadStudents();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// ======================================
// ISSUE AND RETURN MANAGEMENT
// ======================================


 // ======================================
// ISSUE AND RETURN MANAGEMENT
// ======================================

async function loadIssues() {
  const token = localStorage.getItem("libraryToken");

  if (!token) {
    alert("Please login as admin first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/borrow`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch issue records");
    }

    issues = data.issues.map((i) => ({
      id: i.issue_id,
      bookId: i.book_id,
      studentId: i.user_id,
      bookName: i.book_title,
      studentName: i.student_name,
      issueDate: i.issue_date,
      dueDate: i.due_date,
      returnDate: i.return_date,
      status: i.status,
      finePaid: false
    }));

    renderIssues();

  } catch (error) {
    console.error("Issue loading error:", error);
    alert(error.message);
  }
}

function renderIssues() {
  $("issue-student").innerHTML = students
    .map((s) =>
      `<option value="${s.id}">${s.name}</option>`
    )
    .join("");

  $("issue-book").innerHTML = books
    .filter((b) => b.available > 0)
    .map((b) =>
      `<option value="${b.id}">${b.title}</option>`
    )
    .join("");

  $("issues-table").innerHTML = table(
    ["ID", "Book", "Student", "Issued", "Due", "Status", "Actions"],

    issues.map((i) => {
      let actions = "";

      if (i.status === "issued") {
        actions = `
          <button class="btn small"
            onclick="returnBook(${i.id})">
            Mark returned
          </button>`;
      }

      return [
        i.id,
        i.bookName,
        i.studentName,
        i.issueDate ? new Date(i.issueDate).toLocaleDateString() : "-",
        i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "-",
        badge(i.status),
        actions
      ];
    })
  );
}

// ISSUE BOOK
$("issue-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const bookId = Number($("issue-book").value);
  const studentId = Number($("issue-student").value);

  if (!bookId || !studentId) {
    alert("Choose a student and an available book.");
    return;
  }

  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(`${API_URL}/borrow/issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: studentId,
        book_id: bookId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Book issue failed");
    }

    alert("Book issued successfully!");

    await Promise.all([
      loadBooks(),
      loadIssues()
    ]);

    renderAll();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// RETURN BOOK
async function returnBook(id) {
  if (!confirm("Are you sure you want to mark this book as returned?")) {
    return;
  }

  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(`${API_URL}/borrow/return/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Book return failed");
    }

    alert(
      `Book returned successfully!\n` +
      `Overdue days: ${data.overdue_days}\n` +
      `Fine: Rs. ${data.fine_amount}\n` +
      `Fine status: ${data.fine_status}`
    );

    await Promise.all([
      loadBooks(),
      loadIssues()
    ]);

    renderAll();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}


 // ======================================
// FINE MANAGEMENT
// ======================================

let fineRecords = [];

// FETCH ACTUAL FINES FROM DATABASE
async function loadFines() {
  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(`${API_URL}/fines`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch fines");
    }

    fineRecords = data.fines;

    renderFines();

  } catch (error) {
    console.error("Fine loading error:", error);
    alert(error.message);
  }
}

// DISPLAY FINES AND PAYMENT HISTORY
function renderFines() {

  $("fines-table").innerHTML = table(
    ["Student", "Book", "Due", "Returned", "Fine", "Status", "Action"],

    fineRecords.map((f) => {

      const action = f.status === "unpaid"
        ? `<button class="btn small" onclick="payFine(${f.fine_id})">Record payment</button>`
        : "";

      return [
        f.student_name,
        f.book_title,
        f.due_date ? String(f.due_date).slice(0, 10) : "-",
        f.return_date ? String(f.return_date).slice(0, 10) : "-",
        "Rs. " + f.amount,
        badge(f.status),
        action
      ];
    })
  );

  // Show actual paid fines as payment history
  const paidFines = fineRecords.filter(
    (f) => f.status === "paid"
  );

  $("payments-table").innerHTML = table(
    ["Fine ID", "Student", "Amount", "Status"],

    paidFines.map((f) => [
      f.fine_id,
      f.student_name,
      "Rs. " + f.amount,
      badge("paid")
    ])
  );
}

// RECORD PAYMENT IN DATABASE
async function payFine(id) {

  const fine = fineRecords.find(
    (f) => f.fine_id === id
  );

  if (!fine) return;

  if (!confirm(`Record payment of Rs. ${fine.amount}?`)) {
    return;
  }

  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(`${API_URL}/fines/${id}/pay`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment update failed");
    }

    alert("Payment recorded successfully!");

    await loadFines();

    renderAll();

  } catch (error) {
    console.error("Payment error:", error);
    alert(error.message);
  }
}


// ======================================
// RESERVATION MANAGEMENT
// ======================================


 // ======================================
// RESERVATION MANAGEMENT
// ======================================

// FETCH ACTUAL RESERVATIONS FROM DATABASE
async function loadReservations() {
  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(`${API_URL}/reservations`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to fetch reservations");
    }

    reservations = data.reservations.map((r) => ({
      id: r.reservation_id,
      bookId: r.book_id,
      studentId: r.user_id,
      bookName: r.book_title,
      studentName: r.student_name,
      date: r.reservation_date,
      status: r.status
    }));

    renderReservations();

  } catch (error) {
    console.error("Reservation loading error:", error);
    alert(error.message);
  }
}

// DISPLAY RESERVATIONS
function renderReservations() {
  $("reservations-table").innerHTML = table(
    ["ID", "Book", "Student", "Date", "Status", "Actions"],

    reservations.map((r) => {
     const actions = String(r.status).toLowerCase() === "pending"
        ? `<button class="btn small"
             onclick="setReservation(${r.id}, 'approved')">Approve</button>
           <button class="btn small red"
             onclick="setReservation(${r.id}, 'rejected')">Reject</button>`
        : "";

      return [
        r.id,
        r.bookName,
        r.studentName,
        r.date ? String(r.date).slice(0, 10) : "-",
        badge(r.status),
        actions
      ];
    })
  );
}

// APPROVE OR REJECT RESERVATION
async function setReservation(id, status) {
  const action = status === "approved" ? "approve" : "reject";

  if (!confirm(`Are you sure you want to ${action} this reservation?`)) {
    return;
  }

  const token = localStorage.getItem("libraryToken");

  try {
    const response = await fetch(
      `${API_URL}/reservations/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Reservation update failed");
    }

    alert(data.message);

    await loadReservations();

    renderAll();

  } catch (error) {
    console.error("Reservation update error:", error);
    alert(error.message);
  }
}

// ======================================
// RENDER ALL SECTIONS
// ======================================

function renderAll() {
  renderDashboard();
  renderBooks();
  renderStudents();
  renderIssues();
  renderFines();
  renderReservations();
}

// ======================================
// INITIAL LOAD
// ======================================
Promise.all([
  loadBooks(),
  loadStudents(),
  loadIssues(),
  loadFines(),
  loadReservations()
]).then(() => {
  renderAll();
});
