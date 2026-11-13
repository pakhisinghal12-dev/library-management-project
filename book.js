/*
 * MY LIBRARY - Books Page
 * Features:
 * 1. Display books dynamically
 * 2. Search books by title and author
 * 3. Filter books by availability
 * 4. Filter books by category
 * 5. Sort books by title and author
 * 6. Browse books using category icons
 */

document.addEventListener("DOMContentLoaded", () => {

    // -------------------- BOOK DATA --------------------

    const books = [
        {
            id: 1,
            title: "The Jungle Book",
            author: "Rudyard Kipling",
            category: "children's-adult",
            available: true,
            year: 1894,
            description: "A classic collection of stories set in the Indian jungle."
        },
        {
            id: 2,
            title: "Harry Potter and the Philosopher's Stone",
            author: "J. K. Rowling",
            category: "children's-adult",
            available: true,
            year: 1997,
            description: "A young boy discovers that he is a wizard."
        },
        {
            id: 3,
            title: "The Adventures of Tom Sawyer",
            author: "Mark Twain",
            category: "children's-adult",
            available: false,
            year: 1876,
            description: "The adventures of a lively boy growing up beside the Mississippi River."
        },
        {
            id: 4,
            title: "Pride and Prejudice",
            author: "Jane Austen",
            category: "fiction",
            available: true,
            year: 1813,
            description: "A novel about family, relationships, and first impressions."
        },
        {
            id: 5,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            category: "fiction",
            available: false,
            year: 1925,
            description: "A story of ambition, wealth, and the American dream."
        },
        {
            id: 6,
            title: "Wings of Fire",
            author: "A. P. J. Abdul Kalam",
            category: "fiction",
            available: true,
            year: 1999,
            description: "The autobiography of India's former President and scientist."
        },
        {
            id: 7,
            title: "Quantitative Aptitude",
            author: "R. S. Aggarwal",
            category: "exams",
            available: true,
            year: 2017,
            description: "Practice material for quantitative aptitude and competitive examinations."
        },
        {
            id: 8,
            title: "Objective General English",
            author: "S. P. Bakshi",
            category: "exams",
            available: false,
            year: 2014,
            description: "English language practice for competitive examinations."
        },
        {
            id: 9,
            title: "Indian Polity",
            author: "M. Laxmikanth",
            category: "exams",
            available: true,
            year: 2020,
            description: "A guide to the Indian Constitution and political system."
        },
        {
            id: 10,
            title: "Mathematics - Class 10",
            author: "NCERT",
            category: "school",
            available: true,
            year: 2024,
            description: "School mathematics textbook for Class 10."
        },
        {
            id: 11,
            title: "Science - Class 9",
            author: "NCERT",
            category: "school",
            available: true,
            year: 2024,
            description: "School science textbook for Class 9."
        },
        {
            id: 12,
            title: "English - Class 8",
            author: "NCERT",
            category: "school",
            available: false,
            year: 2024,
            description: "English textbook for middle-school students."
        },
        {
            id: 13,
            title: "Engineering Mathematics",
            author: "B. S. Grewal",
            category: "higher-edu",
            available: true,
            year: 2012,
            description: "A reference book covering mathematics topics for engineering students."
        },
        {
            id: 14,
            title: "Introduction to Algorithms",
            author: "Thomas H. Cormen",
            category: "higher-edu",
            available: false,
            year: 2009,
            description: "A detailed textbook on computer algorithms."
        },
        {
            id: 15,
            title: "Atomic Habits",
            author: "James Clear",
            category: "self-help",
            available: true,
            year: 2018,
            description: "Practical ideas for building good habits and improving gradually."
        },
        {
            id: 16,
            title: "The 7 Habits of Highly Effective People",
            author: "Stephen R. Covey",
            category: "self-help",
            available: true,
            year: 1989,
            description: "Principles for personal and professional effectiveness."
        },
        {
            id: 17,
            title: "Think and Grow Rich",
            author: "Napoleon Hill",
            category: "business",
            available: false,
            year: 1937,
            description: "A classic book about goals, achievement, and success."
        },
        {
            id: 18,
            title: "The Lean Startup",
            author: "Eric Ries",
            category: "business",
            available: true,
            year: 2011,
            description: "Methods for developing and managing new businesses."
        }
    ];


    // -------------------- HTML ELEMENTS --------------------

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


    let activeSearch = "";


    // -------------------- CATEGORY NAMES --------------------

    const categoryNames = {
        "children's-adult": "Children's & Young Adult",
        fiction: "Literature & Fiction",
        exams: "Competitive Exams",
        school: "School Textbooks",
        "higher-edu": "Higher Education",
        "self-help": "Self-help & Personal Growth",
        business: "Business & Management"
    };


    // -------------------- DISPLAY BOOKS --------------------

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

        bookList.forEach((book) => {

            const card = document.createElement("article");
            card.className = "book-card";


            // Book Cover

            const cover = document.createElement("div");

            cover.className = "book-cover";

            cover.setAttribute("aria-hidden", "true");

            cover.textContent = "📚";


            // Book Details

            const details = document.createElement("div");

            details.className = "book-details";


            // Book Title

            const title = document.createElement("h3");

            title.className = "book-title";

            title.textContent = book.title;


            // Author

            const author = document.createElement("p");

            author.className = "book-author";

            author.textContent = `By ${book.author}`;


            // Category

            const category = document.createElement("p");

            category.className = "book-category";

            category.textContent =
                categoryNames[book.category] || "Other";


            // Description

            const description = document.createElement("p");

            description.className = "book-description";

            description.textContent = book.description || "";


            // Availability Status

            const status = document.createElement("p");

            status.className = book.available
                ? "book-status available"
                : "book-status unavailable";

            status.textContent = book.available
                ? "Available"
                : "Currently unavailable";


            // Add elements to card

            details.append(
                title,
                author,
                category,
                description,
                status
            );

            card.append(cover, details);

// Open the details page of the selected book
card.addEventListener("click", () => {
    window.location.href = `book-details.html?id=${book.id}`;
});

card.style.cursor = "pointer";

fragment.appendChild(card);

        });

        booksContainer.appendChild(fragment);

    }


    // -------------------- FILTER AND SORT BOOKS --------------------

    function updateBooks() {

        let filteredBooks = [...books];


        // SEARCH FILTER

        if (activeSearch) {

            const searchTerm = activeSearch.toLowerCase();

            filteredBooks = filteredBooks.filter((book) => {

                const searchableText = [

                    book.title,

                    book.author,

                    categoryNames[book.category] || "",

                    book.description || ""

                ].join(" ").toLowerCase();

                return searchableText.includes(searchTerm);

            });

        }


        // AVAILABILITY FILTER

        const availability = availabilityFilter
            ? availabilityFilter.value
            : "all";

        if (availability === "available") {

            filteredBooks = filteredBooks.filter(
                book => book.available
            );

        }

        else if (availability === "unavailable") {

            filteredBooks = filteredBooks.filter(
                book => !book.available
            );

        }


        // CATEGORY FILTER

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "all";

        if (selectedCategory !== "all") {

            filteredBooks = filteredBooks.filter(
                book => book.category === selectedCategory
            );

        }


        // SORT FILTER

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


            default:

                break;

        }


        // DISPLAY FINAL RESULTS

        renderBooks(filteredBooks);

    }


    // -------------------- SEARCH FUNCTION --------------------

    if (searchForm) {

        searchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            activeSearch = searchInput
                ? searchInput.value.trim()
                : "";

            updateBooks();

        });

    }


    // Search while typing

    if (searchInput) {

        searchInput.addEventListener("input", () => {

            activeSearch = searchInput.value.trim();

            updateBooks();

        });

    }


    // -------------------- AVAILABILITY FILTER --------------------

    if (availabilityFilter) {

        availabilityFilter.addEventListener(
            "change",
            updateBooks
        );

    }


    // -------------------- CATEGORY FILTER --------------------

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            updateBooks
        );

    }


    // -------------------- SORT FILTER --------------------

    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            updateBooks
        );

    }


    // -------------------- CATEGORY CARD CLICK --------------------

    categoryCards.forEach((card) => {

        card.addEventListener("click", () => {

            const selectedCategory = card.dataset.category;

            if (categoryFilter) {

                categoryFilter.value = selectedCategory;

            }


            // Clear search

            activeSearch = "";

            if (searchInput) {

                searchInput.value = "";

            }


            // Update displayed books

            updateBooks();


            // Scroll to collection

            const collectionSection =
                document.querySelector(".filter-section");

            if (collectionSection) {

                collectionSection.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

            }

        });

    });


    // -------------------- PREVENT DEFAULT CATEGORY LINK --------------------

    document.querySelectorAll(".category-link").forEach((link) => {

        link.addEventListener("click", (event) => {

            event.preventDefault();

        });

    });


    // -------------------- INITIAL PAGE LOAD --------------------

    updateBooks();

});