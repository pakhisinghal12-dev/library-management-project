

document.addEventListener("DOMContentLoaded", () => {
    const books = [
    {
        "id": 1,
        "title": "The Jungle Book",
        "author": "Rudyard Kipling",
        "category": "children's-adult",
        "available": true,
        "year": 1894,
        "description": "A classic collection of stories set in the Indian jungle."
    },
    {
        "id": 2,
        "title": "Harry Potter and the Philosopher's Stone",
        "author": "J. K. Rowling",
        "category": "children's-adult",
        "available": true,
        "year": 1997,
        "description": "A young boy discovers that he is a wizard."
    },
    {
        "id": 3,
        "title": "The Adventures of Tom Sawyer",
        "author": "Mark Twain",
        "category": "children's-adult",
        "available": false,
        "year": 1876,
        "description": "The adventures of a lively boy growing up beside the Mississippi River."
    },
    {
        "id": 4,
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "category": "fiction",
        "available": true,
        "year": 1813,
        "description": "A novel about family, relationships, and first impressions."
    },
    {
        "id": 5,
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "category": "fiction",
        "available": false,
        "year": 1925,
        "description": "A story of ambition, wealth, and the American dream."
    },
    {
        "id": 6,
        "title": "Wings of Fire",
        "author": "A. P. J. Abdul Kalam",
        "category": "fiction",
        "available": true,
        "year": 1999,
        "description": "The autobiography of India's former President and scientist."
    },
    {
        "id": 7,
        "title": "Quantitative Aptitude",
        "author": "R. S. Aggarwal",
        "category": "exams",
        "available": true,
        "year": 2017,
        "description": "Practice material for quantitative aptitude and competitive examinations."
    },
    {
        "id": 8,
        "title": "Objective General English",
        "author": "S. P. Bakshi",
        "category": "exams",
        "available": false,
        "year": 2014,
        "description": "English language practice for competitive examinations."
    },
    {
        "id": 9,
        "title": "Indian Polity",
        "author": "M. Laxmikanth",
        "category": "exams",
        "available": true,
        "year": 2020,
        "description": "A guide to the Indian Constitution and political system."
    },
    {
        "id": 10,
        "title": "Mathematics - Class 10",
        "author": "NCERT",
        "category": "school",
        "available": true,
        "year": 2024,
        "description": "School mathematics textbook for Class 10."
    },
    {
        "id": 11,
        "title": "Science - Class 9",
        "author": "NCERT",
        "category": "school",
        "available": true,
        "year": 2024,
        "description": "School science textbook for Class 9."
    },
    {
        "id": 12,
        "title": "English - Class 8",
        "author": "NCERT",
        "category": "school",
        "available": false,
        "year": 2024,
        "description": "English textbook for middle-school students."
    },
    {
        "id": 13,
        "title": "Engineering Mathematics",
        "author": "B. S. Grewal",
        "category": "higher-edu",
        "available": true,
        "year": 2012,
        "description": "A reference book covering mathematics topics for engineering students."
    },
    {
        "id": 14,
        "title": "Introduction to Algorithms",
        "author": "Thomas H. Cormen",
        "category": "higher-edu",
        "available": false,
        "year": 2009,
        "description": "A detailed textbook on computer algorithms."
    },
    {
        "id": 15,
        "title": "Atomic Habits",
        "author": "James Clear",
        "category": "self-help",
        "available": true,
        "year": 2018,
        "description": "Practical ideas for building good habits and improving gradually."
    },
    {
        "id": 16,
        "title": "The 7 Habits of Highly Effective People",
        "author": "Stephen R. Covey",
        "category": "self-help",
        "available": true,
        "year": 1989,
        "description": "Principles for personal and professional effectiveness."
    },
    {
        "id": 17,
        "title": "Think and Grow Rich",
        "author": "Napoleon Hill",
        "category": "business",
        "available": false,
        "year": 1937,
        "description": "A classic book about goals, achievement, and success."
    },
    {
        "id": 18,
        "title": "The Lean Startup",
        "author": "Eric Ries",
        "category": "business",
        "available": true,
        "year": 2011,
        "description": "Methods for developing and managing new businesses."
    }
];

    const categoryNames = {
    "children's-adult": "Children's & Young Adult",
    "fiction": "Literature & Fiction",
    "exams": "Competitive Exams",
    "school": "School Textbooks",
    "higher-edu": "Higher Education",
    "self-help": "Self-help & Personal Growth",
    "business": "Business & Management"
};

    const coverImage = document.getElementById("book-cover");
    const titleElement = document.getElementById("book-title");
    const authorElement = document.getElementById("book-author");
    const descriptionElement = document.getElementById("book-description");
    const genreElement = document.getElementById("book-genre");
    const publishedElement = document.getElementById("book-published");
    const availabilityElement = document.getElementById("book-avaibility");
    const borrowButton = document.querySelector(".borrow-btn");


    const urlParams = new URLSearchParams(window.location.search);
    const bookId = Number(urlParams.get("id"));


    const book = books.find((item) => item.id === bookId);

    
    if (!book) {
        if (titleElement) titleElement.textContent = "Book not found";
        if (descriptionElement) {
            descriptionElement.textContent =
                "We could not find that book. Please return to the Books page and select a book.";
        }
        if (borrowButton) {
            borrowButton.disabled = true;
            borrowButton.textContent = "Unavailable";
        }
        if (coverImage) {
            coverImage.alt = "Book not found";
            coverImage.removeAttribute("src");
        }
        return;
    }


    if (titleElement) titleElement.textContent = book.title;
    if (authorElement) authorElement.textContent = book.author;
    if (descriptionElement) descriptionElement.textContent = book.description;
    if (genreElement) genreElement.textContent = categoryNames[book.category] || "Other";
    if (publishedElement) publishedElement.textContent = book.year;


    if (availabilityElement) {
        availabilityElement.textContent = book.available ? " Available" : " Currently unavailable";
    }


    if (coverImage) {
        coverImage.alt = `Cover of ${book.title}`;
        coverImage.src =
            `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-L.jpg?default=false`;
        coverImage.onerror = () => {
            coverImage.onerror = null;
            coverImage.removeAttribute("src");
            coverImage.alt = `No cover image available for ${book.title}`;
            coverImage.style.display = "none";
        };
    }

    if (borrowButton) {
        if (book.available) {
            borrowButton.disabled = false;
            borrowButton.textContent = "Borrow this Book";
            borrowButton.addEventListener("click", () => {
                alert(`"${book.title}" is available. Borrowing requests will be connected to the library system later.`);
            });
        } else {
            borrowButton.disabled = true;
            borrowButton.textContent = "Currently unavailable";
            borrowButton.title = "This book cannot be borrowed right now.";
        }
    }
    const wishlistBtn = document.getElementById("wishlist-btn");

wishlistBtn.addEventListener("click", function() {
    wishlistBtn.classList.toggle("active");

    if (wishlistBtn.classList.contains("active")) {
        wishlistBtn.innerHTML = "Added to Wishlist";
    } else {
        wishlistBtn.innerHTML = " Add to Wishlist";
    }
});
});