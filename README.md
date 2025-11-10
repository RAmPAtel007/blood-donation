Here is the **updated, final README.md** with **SQL query processes + examples** added at the end exactly as you requested.
You can copy–paste this directly into your project.

✅ Includes:

* SQL concepts
* Query examples
* Explanation
* Output meaning
* Perfect for viva

---

# ✅ ✅ **FINAL README.md (With SQL Process & Examples Added at End)**

---

# ❤️ Blood Donation Management System

*A full-stack DBMS Mini Project | HTML + CSS + JavaScript + Node.js + MySQL*

---

## 📌 Project Overview

The **Blood Donation Management System** is a web-based application designed to simplify blood donor registration, donor searching, and blood request management.

This project uses:

* **Frontend:** HTML + CSS + JavaScript
* **Backend:** Node.js (Express.js)
* **Database:** MySQL
* **REST API Architecture**

It fits perfectly as a **DBMS mini project** for college.

---

## ✅ Features

### 👤 Donor Module

* Add a donor
* View donors
* Store data in MySQL

### 🔍 Search Module

* Search by **blood group + city**

### 🩸 Blood Request Module

* Submit blood requests
* Data stored in MySQL

---

# 📂 Project Structure

```
blood-donation/
│
├── server.js
├── db.js
├── package.json
├── sql/
│   └── blooddb.sql
│
└── public/
    ├── index.html
    ├── register.html
    ├── search.html
    ├── request.html
    ├── about.html
    ├── style.css
    └── script.js
```

---

# 🗄️ Database Schema (MySQL)

### ✅ Create Database

```sql
CREATE DATABASE blooddb;
USE blooddb;
```

### ✅ donors Table

```sql
CREATE TABLE donors (
  donor_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  age INT,
  gender VARCHAR(10),
  blood_group VARCHAR(5),
  city VARCHAR(30),
  phone VARCHAR(15)
);
```

### ✅ blood_requests Table

```sql
CREATE TABLE blood_requests (
  req_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  blood_group VARCHAR(5),
  city VARCHAR(30),
  reason VARCHAR(100),
  phone VARCHAR(15)
);
```

---

# ⚙️ Setup Instructions

### ✅ 1. Install Node.js

Download from: [https://nodejs.org](https://nodejs.org)

### ✅ 2. Install MySQL (Workbench or XAMPP)

### ✅ 3. Install project dependencies

```
npm install
```

### ✅ 4. Configure database

Edit `db.js`:

```js
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "YOUR_PASSWORD",
    database: "blooddb"
}).promise();
```

### ✅ 5. Start Server

```
node server.js
```

✅ Visit in browser:
👉 [http://localhost:3000/](http://localhost:3000/)

---

# 📡 API Endpoints

| Method | Endpoint          | Description          |
| ------ | ----------------- | -------------------- |
| POST   | `/register-donor` | Insert donor         |
| GET    | `/search-donors`  | Search donor         |
| POST   | `/request-blood`  | Insert blood request |
| GET    | `/get-requests`   | View blood requests  |

---

# 🎨 Frontend

Pure **HTML + CSS + JS** with JavaScript fetch API to communicate with backend.

---

# 📘 Viva Questions

### ✅ 1. Which architecture is used?

→ Client–Server + REST API + DBMS

### ✅ 2. Which database is used and why?

→ MySQL (open source, reliable, well-structured)

### ✅ 3. Explain CRUD.

Create / Read / Update / Delete — all used in this project.

---

# ✅ ✅ ✅ **SQL QUERY PROCESS + EXAMPLES (For Viva Exam)**

Here is a complete explanation of **important SQL operations**, written in simple language with examples.

This section strengthens your project viva.

---

# ✅ 1. **INSERT Query (Adding Data)**

Used to add new donors or blood requests.

### ✅ Example:

```sql
INSERT INTO donors(name, age, gender, blood_group, city, phone)
VALUES ('Amit Sharma', 25, 'Male', 'A+', 'Delhi', '9876543210');
```

### ✅ Process:

1. Choose table (`donors`)
2. Mention columns
3. Provide values
4. MySQL adds a new row

✅ Output:
A new donor record gets added to the donors table.

---

# ✅ 2. **SELECT Query (Viewing Data)**

Used to see stored donor information.

### ✅ Example:

```sql
SELECT * FROM donors;
```

### ✅ Process:

1. SELECT means “show me data”
2. `*` means “show all columns”
3. `FROM donors` → table name

✅ Output:
Shows all donor rows with full details.

---

# ✅ 3. **SELECT with WHERE (Filtering Data)**

Used to find donors by blood group and city.

### ✅ Example:

```sql
SELECT name, phone
FROM donors
WHERE blood_group='O+' AND city='Mumbai';
```

### ✅ Process:

1. SELECT only needed fields
2. WHERE → apply a condition
3. AND → multiple conditions

✅ Output:
Shows donors who match both blood group & city.

---

# ✅ 4. **UPDATE Query (Modifying Data)**

To update donor phone number.

### ✅ Example:

```sql
UPDATE donors
SET phone='9998887771'
WHERE donor_id=3;
```

### ✅ Process:

1. UPDATE table
2. SET → column changes
3. WHERE → specify which row
   ⚠️ Without WHERE, every row will change.

✅ Output:
Only donor with donor_id = 3 gets updated.

---

# ✅ 5. **DELETE Query (Removing Data)**

To delete donor record.

### ✅ Example:

```sql
DELETE FROM donors
WHERE donor_id=5;
```

✅ Deletes only one selected donor.

---

# ✅ 6. **COUNT Query (Aggregate Function)**

Used to count how many donors are available for each blood group.

### ✅ Example:

```sql
SELECT blood_group, COUNT(*) AS total_donors
FROM donors
GROUP BY blood_group;
```

### ✅ Process:

1. COUNT → counts rows
2. GROUP BY → groups by blood group

✅ Output:

```
A+   10
O+    8
B+    7
AB+   4
```

---

# ✅ 7. **LIKE Query (Pattern Search)**

Find donors whose city starts with “M”.

```sql
SELECT * FROM donors
WHERE city LIKE 'M%';
```

✅ Output:
Mumbai, Mysore, Madurai, etc.

---

# ✅ 8. **ORDER BY Query (Sorting)**

Sort donors alphabetically.

```sql
SELECT * FROM donors
ORDER BY name ASC;
```

✅ ASC = ascending (A–Z)

---

# ✅ 9. **JOIN Query (Two Tables)**

To match blood requests with donors (example concept):

```sql
SELECT d.name, r.blood_group, r.city
FROM donors d
JOIN blood_requests r
ON d.blood_group = r.blood_group;
```

✅ Output:
Shows potential donor matches.

---

# ✅ 10. **SUBQUERY (Query inside query)**

```sql
SELECT *
FROM donors
WHERE donor_id IN (
  SELECT donor_id FROM donors WHERE blood_group='O+'
);
```

✅ Output:
Same filtered result using inner query.




