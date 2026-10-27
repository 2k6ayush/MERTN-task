# CRUD Operations on Items Using HTML, CSS, Express.js and REST API

> **College Assignment** – Third-Year Engineering | Web Technologies Practical

---

## Project Description

This project demonstrates **CRUD (Create, Read, Update, Delete)** operations on an array of items using a Node.js + Express.js backend, a vanilla HTML/CSS/JavaScript frontend, and a REST API for client–server communication.

Data is stored in an **in-memory JavaScript array** on the server (no database required), making the project self-contained and easy to run without any additional infrastructure.

---

## Aim of the Assignment

To understand and implement CRUD operations using a RESTful API architecture with an Express.js backend and a plain HTML/CSS/JavaScript frontend, demonstrating how modern web applications create, read, update, and delete data through HTTP methods.

---

## Objectives

- Implement a REST API using Express.js with proper HTTP methods and status codes.
- Perform CRUD operations on an in-memory JavaScript array.
- Build a responsive frontend that communicates with the API using the `fetch()` function.
- Validate input on both the frontend and the backend.
- Write automated API tests using Node.js built-in test runner.
- Document the project with a professional README including real application screenshots.

---

## Technologies Used

| Category   | Technology                        |
|------------|-----------------------------------|
| Runtime    | Node.js (v18+)                    |
| Backend    | Express.js 4.x                    |
| Frontend   | HTML5, CSS3, Vanilla JavaScript   |
| API Style  | REST (JSON over HTTP)             |
| HTTP Client| Browser `fetch()` API             |
| Data Store | In-memory JavaScript array        |
| Testing    | Node.js `node:test` + `node:assert` |
| Dev Tool   | nodemon (auto-restart)            |

---

## Features

- **Create** – Add a new item with a name and price using a form.
- **Read** – Items are loaded automatically from the server when the page opens.
- **Update** – Click Edit on any row to pre-fill the form, then submit the update.
- **Delete** – Click Delete on any row; a confirmation dialog prevents accidental deletion.
- **Input Validation** – Both frontend and backend reject empty names, negative prices, and non-numeric values.
- **Status Messages** – Clear success and error banners appear after every operation.
- **Responsive Layout** – Works correctly on desktops, tablets, and mobile devices.
- **Safe DOM Manipulation** – User data is always set via `textContent`, never via `innerHTML`.
- **Automated Tests** – 15 backend API tests covering all CRUD operations and edge cases.

---

## CRUD Operations Explained

| Operation | HTTP Method | Endpoint          | Description                    |
|-----------|-------------|-------------------|--------------------------------|
| Create    | `POST`      | `/api/items`      | Add a new item to the list     |
| Read All  | `GET`       | `/api/items`      | Retrieve all items             |
| Read One  | `GET`       | `/api/items/:id`  | Retrieve a single item by ID   |
| Update    | `PUT`       | `/api/items/:id`  | Update an existing item        |
| Delete    | `DELETE`    | `/api/items/:id`  | Remove an item from the list   |

---

## Project Folder Structure

```
MERTN task/
├── public/
│   ├── index.html          ← Frontend HTML page
│   ├── styles.css          ← CSS styles
│   └── app.js              ← Frontend CRUD logic (fetch API)
├── screenshots/
│   ├── initial-output.png
│   ├── add-item.png
│   ├── edit-item.png
│   ├── update-item.png
│   ├── delete-confirmation.png
│   └── final-output.png
├── tests/
│   └── api.test.js         ← Automated API tests
├── server.js               ← Express server + REST API
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## REST API Endpoints

| Method   | Endpoint         | Description              | Success Code | Error Codes      |
|----------|------------------|--------------------------|:------------:|:----------------:|
| `GET`    | `/api/items`     | Return all items         | `200 OK`     | `500`            |
| `GET`    | `/api/items/:id` | Return one item          | `200 OK`     | `404`            |
| `POST`   | `/api/items`     | Create a new item        | `201 Created`| `400`            |
| `PUT`    | `/api/items/:id` | Update an existing item  | `200 OK`     | `400`, `404`     |
| `DELETE` | `/api/items/:id` | Delete an item           | `200 OK`     | `404`            |

---

## Prerequisites

- [Node.js](https://nodejs.org/) **v18.0.0 or higher** (required for the built-in `fetch` API and `node:test` runner)
- npm (included with Node.js)
- A modern web browser (Chrome, Firefox, Edge, Safari)

To check your Node.js version:
```bash
node --version
```

---

## Installation

1. **Clone or download** the project folder.

2. **Navigate** into the project directory:
   ```bash
   cd "MERTN task"
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

---

## Running the Server

### Production mode
```bash
npm start
```

### Development mode (auto-restart on file changes)
```bash
npm run dev
```

Open your browser and visit: **[http://localhost:3000](http://localhost:3000)**

The server will print:
```
Server running on http://localhost:3000
```

To stop the server, press **Ctrl + C** in the terminal.

---

## Running Automated Tests

```bash
npm test
```

The test suite starts a temporary server on a random free port, runs all 15 tests, and shuts down cleanly.

### Expected output
```
TAP version 13
ok 1 - GET /api/items
ok 2 - GET /api/items/:id
ok 3 - POST /api/items
ok 4 - PUT /api/items/:id
ok 5 - DELETE /api/items/:id
ok 6 - Unknown API routes
ok 7 - Malformed JSON handling
1..7
# tests 15
# pass  15
# fail  0
```

---

## Application Screenshots

### Initial Output
![Initial CRUD application output](screenshots/initial-output.png)

*The application loads with two pre-seeded items: Book (₹250) and Pen (₹25). The form is ready to accept new entries.*

---

### Adding a New Item
![Adding an item named Notebook](screenshots/add-item.png)

*After submitting the form with Name = "Notebook" and Price = 50, a success message appears and the table refreshes to show all three items.*

---

### Editing an Item
![Editing the Book item](screenshots/edit-item.png)

*Clicking the Edit button on the Book row fills the form with "Book" and "250". The Submit button changes to "Update" and a Cancel button appears.*

---

### Updating an Item
![Updated Book price to 300](screenshots/update-item.png)

*After changing the price to 300 and clicking Update, the success message confirms the change. The table shows Book at ₹300, Pen at ₹25, and Notebook at ₹50.*

---

### Delete Confirmation
![Delete confirmation dialog](screenshots/delete-confirmation.png)

*Clicking Delete on the Notebook row triggers a browser confirmation dialog. The item is only removed if the user confirms.*

---

### Final Output
![Final CRUD application output](screenshots/final-output.png)

*After confirming the deletion of Notebook, the table returns to two items: Book (₹300) and Pen (₹25).*

---

## Expected Initial Data

When the server starts, it initialises the in-memory array with two sample records:

```json
[
  { "id": 1, "name": "Book",  "price": 250 },
  { "id": 2, "name": "Pen",   "price": 25  }
]
```

This data is reset every time the server restarts.

---

## Example API Requests and Responses

### GET /api/items
```bash
curl http://localhost:3000/api/items
```
```json
[
  { "id": 1, "name": "Book", "price": 250 },
  { "id": 2, "name": "Pen",  "price": 25  }
]
```

---

### GET /api/items/:id
```bash
curl http://localhost:3000/api/items/1
```
```json
{ "id": 1, "name": "Book", "price": 250 }
```

**404 response (item not found):**
```json
{ "error": "Item with id 99 not found." }
```

---

### POST /api/items
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Notebook", "price": 50}'
```
```json
{ "id": 3, "name": "Notebook", "price": 50 }
```

**400 response (validation error):**
```json
{ "error": "Field \"name\" must be a non-empty string." }
```

---

### PUT /api/items/:id
```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Book", "price": 300}'
```
```json
{ "id": 1, "name": "Book", "price": 300 }
```

---

### DELETE /api/items/:id
```bash
curl -X DELETE http://localhost:3000/api/items/1
```
```json
{ "message": "Item \"Book\" deleted successfully.", "item": { "id": 1, "name": "Book", "price": 300 } }
```

---

## Limitations of In-Memory Storage

| Limitation | Explanation |
|------------|-------------|
| **Data is not persistent** | All items are lost when the server restarts. |
| **No concurrency safety** | Simultaneous requests from multiple users can cause race conditions. |
| **No authentication** | Any user can create, update, or delete any item. |
| **Single instance only** | Cannot be scaled across multiple server processes sharing state. |
| **No search or filtering** | The API returns all items; there is no built-in query support. |

---

## Future Enhancements

- **Database integration** – Replace the in-memory array with MongoDB, PostgreSQL, or SQLite for persistent storage.
- **User authentication** – Add JWT-based login so only authorised users can modify items.
- **Pagination and search** – Support query parameters like `?page=1&limit=10&search=book`.
- **Input sanitisation** – Add a library such as `express-validator` for more robust server-side validation.
- **HTTPS support** – Serve the application over TLS in production.
- **Frontend framework** – Migrate the UI to React or Vue for a more maintainable component structure.
- **Docker containerisation** – Package the application into a Docker image for easy deployment.

---

## Conclusion

This project demonstrates a complete CRUD web application built with Node.js, Express.js, and plain HTML/CSS/JavaScript — without any databases or frontend frameworks. It covers the full request–response cycle from the browser form to the REST API and back, with proper HTTP status codes, input validation on both ends, automated backend testing, and a clean, responsive user interface. The implementation follows practical software engineering principles: separation of concerns, safe DOM manipulation, graceful error handling, and test isolation — making it a solid foundation for more advanced web development work.

---

*Submitted as part of the Web Technologies practical assignment.*
