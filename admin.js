const FINE_PER_DAY = 5;   
const LOAN_DAYS = 14;     
const $ = (id) => document.getElementById(id);

function dayOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

let books = [
  { id: 1, title: "The Jungle Book", author: "Rudyard Kipling", copies: 5, available: 3 },
  { id: 2, title: "Harry Potter and the Philosopher's Stone", author: "J. K. Rowling", copies: 4, available: 2 },
  { id: 3, title: "The Adventures of Tom Sawyer",  author: "Mark Twain",    copies: 3, available: 0 },
  { id: 4, title: "Pride and Prejudice",author: "Jane Austen", copies: 4, available: 3 },
  { id: 5, title: "The Great Gatsby",author: "F. Scott Fitzgerald",   copies: 2, available: 0 },
  { id: 6, title: "Wings of Fire", author: "A.P.J. Abdul Kalam",copies: 5, available: 3 },
  { id: 7, title: "Quantitative Aptitude", author: "R.S. Aggarwal", copies: 4, available: 2 },
  { id: 8, title: "Objective General English", author: "S. P. Bakshi",    copies: 3, available: 0 },
  { id: 9, title: "Indian Polity", author: "M. Laxmikanth", copies: 4, available: 3 },
  { id: 10, title: "Mathematics - Class 10",    author: "NCERT",   copies: 2, available: 1 },
  { id: 11, title: "Science - Class 9", author: "NCERT", copies: 5, available: 3 },
  { id: 12, title: "English - Class 8", author: "NCERT", copies: 4, available: 0 },
  { id: 13, title: "Engineering Mathematics", author: "B. S. Grewal",    copies: 3, available: 3 },
  { id: 14, title: "Introduction to Algorithms",author: "Thomas H. Cormen", copies: 4, available: 0 },
  { id: 15, title: "Atomic Habits",author: "James Clear",   copies: 2, available: 1 },
  { id: 16, title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey",     copies: 5, available: 3 },
  { id: 17, title: "Think and Grow Rich", author: "Napoleon Hill", copies: 4, available: 0 },
  { id: 18, title: "The Lean Startup",  author: "Eric Ries",    copies: 3, available: 3 }
];

let students = [
  { id: 101, name: "Aarav Sharma", email: "aarav@college.edu", status: "active" },
  { id: 102, name: "Diya Patel",   email: "diya@college.edu",  status: "active" },
  { id: 103, name: "Rohan Verma",  email: "rohan@college.edu", status: "active" },
  { id: 104, name: "Sneha Gupta",  email: "sneha@college.edu", status: "blocked" }
];

let issues = [
  { id: 1, bookId: 1, studentId: 101, issueDate: dayOffset(-20), dueDate: dayOffset(-6), returnDate: null, status: "issued", viaRequest: true, finePaid: false },
  { id: 2, bookId: 2, studentId: 102, issueDate: dayOffset(-5),  dueDate: dayOffset(9),  returnDate: null, status: "issued", viaRequest: true, finePaid: false },
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

const bookTitle   = (id) => books.find((b) => b.id === id).title;
const studentName = (id) => students.find((s) => s.id === id).name;
const badge = (text, cls) => `<span class="badge ${cls || text}">${text}</span>`;

function fineOf(issue) {
  if (issue.status !== "issued" && issue.status !== "returned") return 0;
  const end = issue.returnDate || dayOffset(0);
  const daysLate = Math.floor((new Date(end) - new Date(issue.dueDate)) / 86400000);
  return daysLate > 0 ? daysLate * FINE_PER_DAY : 0;
}

const pendingFine = (issue) => (issue.finePaid ? 0 : fineOf(issue));

const isOverdue = (i) => i.status === "issued" && i.dueDate < dayOffset(0);

function table(headers, rows) {
  if (rows.length === 0) return `<p class="empty">Nothing to show.</p>`;
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function getNotes() {
  const notes = [];
  const pendingReq = issues.filter((i) => i.status === "requested").length;
  const pendingRes = reservations.filter((r) => r.status === "pending").length;
  const overdue = issues.filter(isOverdue).length;
  const unpaid = issues.reduce((sum, i) => sum + pendingFine(i), 0);
  if (pendingReq) notes.push(`${pendingReq} issue request(s) waiting for approval`);
  if (pendingRes) notes.push(`${pendingRes} reservation(s) waiting for a decision`);
  if (overdue) notes.push(`${overdue} book(s) are overdue`);
  if (unpaid) notes.push(`Rs. ${unpaid} in fines unpaid`);
  return notes;
}

function renderDashboard() {
  const totalBooks = books.reduce((sum, b) => sum + b.copies, 0);
  const pendingReq = issues.filter((i) => i.status === "requested").length;
  const unpaid = issues.reduce((sum, i) => sum + pendingFine(i), 0);

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
    `<div class="card ${warn ? "warn" : ""}"><div class="num">${num}</div><div class="label">${label}</div></div>`
  ).join("");

  const notes = getNotes();
  $("dash-notes").innerHTML = notes.map((n) => `<li>${n}</li>`).join("") || "<li>All caught up.</li>";
}

function renderBooks() {
  const q = $("book-search").value.toLowerCase();
  const list = books.filter((b) => (b.title + b.author).toLowerCase().includes(q));
  $("books-table").innerHTML = table(
    ["ID", "Title", "Author", "Copies", "Available", "Status", "Actions"],
    list.map((b) => [
      b.id, b.title, b.author, b.copies, b.available,
      b.available > 0 ? badge("available") : badge("out of stock", "out"),
      `<button class="btn small" onclick="editBook(${b.id})">Edit</button>
       <button class="btn small red" onclick="deleteBook(${b.id})">Delete</button>`
    ])
  );
}
$("book-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const copies = Number($("book-copies").value);
  books.push({ id: nextId++, title: $("book-title").value.trim(), author: $("book-author").value.trim(), copies, available: copies });
  e.target.reset();
  renderAll();
});

$("book-search").addEventListener("input", renderBooks);

function editBook(id) {
  const b = books.find((x) => x.id === id);
  const title = prompt("Title:", b.title);
  if (title === null) return;
  const author = prompt("Author:", b.author);
  if (author === null) return;
  const copies = Number(prompt("Total copies:", b.copies));
  const out = b.copies - b.available;               // copies currently lent
  if (!copies || copies < out) { alert("Copies must be a number, and at least " + out + " (currently issued)."); return; }
  Object.assign(b, { title, author, copies, available: copies - out });
  renderAll();
}

function deleteBook(id) {
  const b = books.find((x) => x.id === id);
  if (b.copies !== b.available) { alert("This book has copies issued. Wait for returns first."); return; }
  if (confirm(`Delete "${b.title}"?`)) {
    books = books.filter((x) => x.id !== id);
    renderAll();
  }
}

function renderStudents() {
  const q = $("student-search").value.toLowerCase();
  const list = students.filter((s) => (s.name + s.email + s.id).toLowerCase().includes(q));
  $("students-table").innerHTML = table(
    ["ID", "Name", "Email", "Status", "Pending fine", "Actions"],
    list.map((s) => {
      const fine = issues.filter((i) => i.studentId === s.id).reduce((sum, i) => sum + pendingFine(i), 0);
      return [
        s.id, s.name, s.email, badge(s.status), "Rs. " + fine,
        `<button class="btn small" onclick="viewStudent(${s.id})">Profile</button>
         <button class="btn small grey" onclick="toggleStudent(${s.id})">${s.status === "active" ? "Block" : "Activate"}</button>`
      ];
    })
  );
   const s = students.find((x) => x.id === viewedStudent);
  if (!s) { $("student-profile").innerHTML = ""; return; }
  const history = issues.filter((i) => i.studentId === s.id && i.status !== "requested");
  $("student-profile").innerHTML = `
    <div class="profile">
      <h3>${s.name} (${s.status})</h3>
      <p>${s.email} | ID ${s.id}</p>
      <h3>Borrowing history</h3>
      ${table(["Book", "Issued", "Due", "Returned", "Fine"],
        history.map((i) => [bookTitle(i.bookId), i.issueDate, i.dueDate, i.returnDate || "-",
          "Rs. " + fineOf(i) + (i.finePaid ? " (paid)" : "")]))}
    </div>`;
}
$("student-search").addEventListener("input", renderStudents);
function viewStudent(id) { viewedStudent = id; renderStudents(); }
function toggleStudent(id) {
  const s = students.find((x) => x.id === id);
  s.status = s.status === "active" ? "blocked" : "active";
  renderAll();
}
function renderIssues() {
  // Fill the dropdowns (only active students and books in stock)
  $("issue-student").innerHTML = students.filter((s) => s.status === "active")
    .map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  $("issue-book").innerHTML = books.filter((b) => b.available > 0)
    .map((b) => `<option value="${b.id}">${b.title}</option>`).join("");

  $("issues-table").innerHTML = table(
    ["ID", "Book", "Student", "Issued", "Due", "Status", "Actions"],
    issues.map((i) => {
      let actions = "";
      if (i.status === "requested") {
        actions = `<button class="btn small" onclick="approveIssue(${i.id})">Approve</button>
                   <button class="btn small red" onclick="rejectIssue(${i.id})">Reject</button>`;
      } else if (i.status === "issued") {
        actions = `<button class="btn small" onclick="returnBook(${i.id})">Mark returned</button>`;
      }
      return [i.id, bookTitle(i.bookId), studentName(i.studentId), i.issueDate || "-", i.dueDate || "-",
        badge(i.status) + (isOverdue(i) ? " " + badge("overdue") : ""), actions];
    })
  );
}
$("issue-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const bookId = Number($("issue-book").value);
  const studentId = Number($("issue-student").value);
  if (!bookId || !studentId) { alert("Choose a student and an available book."); return; }
  books.find((b) => b.id === bookId).available--;
  issues.push({ id: nextId++, bookId, studentId, issueDate: dayOffset(0), dueDate: dayOffset(LOAN_DAYS),
    returnDate: null, status: "issued", viaRequest: false, finePaid: false });
  renderAll();
});
function approveIssue(id) {
  const i = issues.find((x) => x.id === id);
  const b = books.find((x) => x.id === i.bookId);
  if (students.find((s) => s.id === i.studentId).status === "blocked") { alert("This student is blocked."); return; }
  if (b.available < 1) { alert("No copies available right now."); return; }
  b.available--;
  Object.assign(i, { status: "issued", issueDate: dayOffset(0), dueDate: dayOffset(LOAN_DAYS) });
  renderAll();
}

function rejectIssue(id) {
  issues.find((x) => x.id === id).status = "rejected";
  renderAll();
}

function returnBook(id) {
  const i = issues.find((x) => x.id === id);
  i.status = "returned";
  i.returnDate = dayOffset(0);
  books.find((b) => b.id === i.bookId).available++;
  renderAll();
}
function renderFines() {
  const withFines = issues.filter((i) => fineOf(i) > 0);
  $("fines-table").innerHTML = table(
    ["Student", "Book", "Due", "Returned", "Fine", "Status", "Action"],
    withFines.map((i) => {
      let status = badge(i.finePaid ? "paid" : "pending");
      let action = "";
      if (!i.finePaid && i.status === "returned") {
        action = `<button class="btn small" onclick="payFine(${i.id})">Record payment</button>`;
      } else if (!i.finePaid) {
        status = badge("accruing");   // book not back yet, fine still growing
      }
      return [studentName(i.studentId), bookTitle(i.bookId), i.dueDate, i.returnDate || "-", "Rs. " + fineOf(i), status, action];
    })
  );
  $("payments-table").innerHTML = table(["Date", "Student", "Amount"],
    payments.map((p) => [p.date, p.student, "Rs. " + p.amount]));
}

function payFine(id) {
  const i = issues.find((x) => x.id === id);
  i.finePaid = true;
  payments.unshift({ issueId: id, student: studentName(i.studentId), amount: fineOf(i), date: dayOffset(0) });
  renderAll();
}
function renderReservations() {
  $("reservations-table").innerHTML = table(
    ["ID", "Book", "Student", "Date", "Status", "Actions"],
    reservations.map((r) => [
      r.id, bookTitle(r.bookId), studentName(r.studentId), r.date, badge(r.status),
      r.status === "pending"
        ? `<button class="btn small" onclick="setReservation(${r.id}, 'approved')">Approve</button>
           <button class="btn small red" onclick="setReservation(${r.id}, 'rejected')">Reject</button>`
        : ""
    ])
  );
}

function setReservation(id, status) {
  reservations.find((r) => r.id === id).status = status;
  renderAll();
}
function renderAll() {
  renderDashboard();
  renderBooks();
  renderStudents();
  renderIssues();
  renderFines();
  renderReservations();
}
renderAll();
