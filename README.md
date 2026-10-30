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
├── server.js               ← Express server + REST API
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

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

---

# Task 2 — Sign Up and User CRUD Operations

> **College Lab Assignment – Task 2** | User Management & Authentication Interface

---

## Assignment Aim

To design and implement a clean, responsive frontend and RESTful Express.js backend for managing user accounts stored in an in-memory JavaScript array. The interface is inspired by a minimalist Sign Up design featuring a white background, underline input fields, and bold red action accents.

---

## Objectives

- Build a clean Sign Up and Log In interface adhering to the specified visual style (white background, red buttons and links, underline input fields).
- Implement full CRUD (Create, Read, Update, Delete) functionality for user accounts via REST API.
- Maintain separate, isolated endpoints and in-memory data storage for Task 2 under `/api/task2/users`.
- Ensure robust validation on both frontend and backend (valid email format, minimum 6-character passwords, duplicate email prevention).
- Display a masked password representation (`••••••••`) in the management table and never expose actual passwords in API responses.
- Implement an accessible deletion confirmation dialog with red action and neutral cancel buttons.
- Write automated unit and integration tests using Node.js built-in `node:test` runner.
- Capture real browser screenshots of the running application using Playwright.

---

## Project Structure

```
MERTN task/
├── public/
│   ├── index.html           
│   ├── styles.css             
│   ├── app.js                  
│   └── task2/
│       ├── index.html          
│       ├── styles.css          
│       └── app.js              
├── screenshots/
│   ├── initial-output.png      
│   ├── add-item.png        
│   ├── edit-item.png           
│   ├── update-item.png         
│   ├── delete-confirmation.png 
│   ├── final-output.png        
│   └── task2/
│       ├── signup-page.png         
│       ├── login-page.png          
│       ├── signup-success.png      
│       ├── users-list.png        
│       ├── edit-user.png           
│       ├── delete-confirmation.png
│       └── after-delete.png        
├── server.js                   
├── package.json
└── README.md
```


## Application Screenshots (Task 2)

### 1. Sign Up Page
![Sign Up Page](screenshots/task2/signup-page.png)
*Initial clean Sign Up interface featuring a centered card on a white background, red accent button, and underline inputs.*

---

### 2. Log In Page
![Log In Page](screenshots/task2/login-page.png)
*Log In screen accessible via the "Already a member? Log In" link.*

---

### 3. Registration Success
![Registration Success](screenshots/task2/signup-success.png)
*Successful registration message displayed upon submitting valid user credentials.*

---

### 4. User Management Dashboard
![User Management Table](screenshots/task2/users-list.png)
*Dashboard table listing registered users with numeric IDs, email addresses, masked passwords, and Edit/Delete action buttons.*

---

### 5. Edit User Form
![Edit User Form](screenshots/task2/edit-user.png)
*Edit panel displaying the selected user's email, optional password update field, red Save button, and neutral Cancel button.*

---

### 6. Delete Confirmation Dialog
![Delete Confirmation Dialog](screenshots/task2/delete-confirmation.png)
*Confirmation modal dialog preventing accidental user deletion with red Delete and neutral Cancel buttons.*

---

### 7. After Deletion
![After Deletion](screenshots/task2/after-delete.png)
*Dashboard showing success alert banner after deleting a user record and reflecting the updated table state.*

---


