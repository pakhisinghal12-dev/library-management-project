
/*
 * MY LIBRARY - Books Page
 * Connected to the Library Management System backend.
 */

document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:5000/api";

    const booksContainer = document.getElementById("books-container");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const availabilityFilter = document.getElementById("avaibility-filter");
    const categoryFilter = document.getElementById("category-filter");
    const sortFilter = document.getElementById("sort-filter");
    const noResults = document.getElementById("no-results");
    const categoryCards = document.querySelectorAll(".category[data-category]");

    if (!booksContainer) {
        console.error("Books container not found!");
        return;
    }

    let books = [];
    let activeSearch = "";

    const categoryNames = {
        1: "Fiction",
        2: "Mystery",
        3: "Educational"
    };

    function getCategoryName(book) {
        return book.category_name ||
            categoryNames[book.category_id] ||
            "Other";
    }

    function normalizeCategory(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    async function getBookCover(title) {
        try {
            const response = await fetch(
                `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=1`
            );

            const data = await response.json();

            if (data.docs?.length && data.docs[0].cover_i) {
                return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`;
            }
        } catch (error) {
            console.log("Could not fetch book cover:", error);
        }

        return "images/default-book.jpg";
    }

    async function loadBooks() {
        booksContainer.innerHTML = "<p>Loading books...</p>";

        try {
            const response = await fetch(`${API_URL}/books`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not load books");
            }

            books = data.books.map(book => ({
                ...book,
                id: book.book_id,
                category: normalizeCategory(getCategoryName(book)),
                available: Number(book.available_copies) > 0,
                description: ""
            }));

            updateBooks();

        } catch (error) {
            console.error("Books loading error:", error);
            booksContainer.innerHTML =
                "<p>Unable to load books. Please check whether the backend is running.</p>";
        }
    }

    async function reserveBook(book) {
        const token = localStorage.getItem("libraryToken");
        const savedUser = localStorage.getItem("libraryUser");

        if (!token || !savedUser) {
            alert("Please log in as a student to reserve a book.");
            window.location.href = "login.html";
            return;
        }

        let user;

        try {
            user = JSON.parse(savedUser);
        } catch {
            alert("Please log in again.");
            window.location.href = "login.html";
            return;
        }

        if (user.role !== "student") {
            alert("Only students can reserve books.");
            return;
        }

        if (!book.available) {
            alert("This book is currently unavailable.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/reservations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    book_id: book.book_id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    alert("Your session has expired. Please log in again.");
                    localStorage.removeItem("libraryToken");
                    localStorage.removeItem("libraryUser");
                    window.location.href = "login.html";
                    return;
                }

                throw new Error(data.message || "Reservation failed");
            }

            alert(data.message || "Book reserved successfully!");

        } catch (error) {
            console.error("Reservation error:", error);
            alert(error.message || "Could not reserve the book.");
        }
    }

    function renderBooks(bookList) {
        booksContainer.innerHTML = "";

        if (bookList.length === 0) {
            if (noResults) {
                noResults.hidden = false;
                noResults.textContent =
                    "No books found. Try changing your search or filters.";
            }
            return;
        }

        if (noResults) {
            noResults.hidden = true;
        }

        const fragment = document.createDocumentFragment();

        bookList.forEach(book => {
            const card = document.createElement("article");
            card.className = "book-card";

            const cover = document.createElement("div");
            cover.className = "book-cover";

            const image = document.createElement("img");
            image.alt = book.title;
            image.src = "images/default-book.jpg";

            getBookCover(book.title).then(imageUrl => {
                image.src = imageUrl;
            });

            cover.appendChild(image);

            const details = document.createElement("div");
            details.className = "book-details";

            const title = document.createElement("h3");
            title.className = "book-title";
            title.textContent = book.title;

            const author = document.createElement("p");
            author.className = "book-author";
            author.textContent = `By ${book.author}`;

            const category = document.createElement("p");
            category.className = "book-category";
            category.textContent = getCategoryName(book);

            const copies = document.createElement("p");
            copies.className = "book-description";
            copies.textContent =
                `Available copies: ${book.available_copies}`;

            const status = document.createElement("p");
            status.className = book.available
                ? "book-status available"
                : "book-status unavailable";

            status.textContent = book.available
                ? "Available"
                : "Currently unavailable";

            const reserveButton = document.createElement("button");
            reserveButton.type = "button";
            reserveButton.textContent = "Reserve Book";
            reserveButton.className = "reserve-book-btn";
            reserveButton.disabled = !book.available;

            reserveButton.addEventListener("click", event => {
                event.stopPropagation();
                reserveBook(book);
            });

            details.append(
                title,
                author,
                category,
                copies,
                status,
                reserveButton
            );

            card.append(cover, details);

            card.addEventListener("click", () => {
                window.location.href =
                    `book-details.html?id=${book.book_id}`;
            });

            card.style.cursor = "pointer";
            fragment.appendChild(card);
        });

        booksContainer.appendChild(fragment);
    }

    function updateBooks() {
        let filteredBooks = [...books];

        if (activeSearch) {
            const searchTerm = activeSearch.toLowerCase();

            filteredBooks = filteredBooks.filter(book => {
                const searchableText = [
                    book.title,
                    book.author,
                    getCategoryName(book)
                ].join(" ").toLowerCase();

                return searchableText.includes(searchTerm);
            });
        }

        const availability = availabilityFilter
            ? availabilityFilter.value
            : "all";

        if (availability === "available") {
            filteredBooks = filteredBooks.filter(book => book.available);
        } else if (availability === "unavailable") {
            filteredBooks = filteredBooks.filter(book => !book.available);
        }

        const selectedCategory = categoryFilter
            ? normalizeCategory(categoryFilter.value)
            : "all";

        if (selectedCategory && selectedCategory !== "all") {
            filteredBooks = filteredBooks.filter(
                book => book.category === selectedCategory
            );
        }

        const sortValue = sortFilter
            ? sortFilter.value
            : "default";

        switch (sortValue) {
            case "title-asc":
                filteredBooks.sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
                break;

            case "title-desc":
                filteredBooks.sort((a, b) =>
                    b.title.localeCompare(a.title)
                );
                break;

            case "author-asc":
                filteredBooks.sort((a, b) =>
                    a.author.localeCompare(b.author)
                );
                break;

            case "author-desc":
                filteredBooks.sort((a, b) =>
                    b.author.localeCompare(a.author)
                );
                break;
        }

        renderBooks(filteredBooks);
    }

    if (searchForm) {
        searchForm.addEventListener("submit", event => {
            event.preventDefault();
            activeSearch = searchInput ? searchInput.value.trim() : "";
            updateBooks();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            activeSearch = searchInput.value.trim();
            updateBooks();
        });
    }

    [availabilityFilter, categoryFilter, sortFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener("change", updateBooks);
        }
    });

    categoryCards.forEach(card => {
        card.addEventListener("click", () => {
            const selectedCategory = card.dataset.category;

            if (categoryFilter) {
                categoryFilter.value = selectedCategory;
            }

            activeSearch = "";

            if (searchInput) {
                searchInput.value = "";
            }

            updateBooks();

            document.querySelector(".filter-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        });
    });

    document.querySelectorAll(".category-link").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
        });
    });

    loadBooks();
});
