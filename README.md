# eduStat-MAS 🎓  
### Student Marks Analysis System

**eduStat-MAS** is a web-based application designed to simplify how colleges manage and publish student results.  
This project replaces manual spreadsheet-based grading with a secure, centralized cloud system where faculty can update marks instantly, and students can check their results **without logging in**.

---

## 🚀 Features

### 👨‍🏫 For Faculty (Admin Side)

- 🔒 **Secure Login**  
  Authentication via Google Firebase, including a custom **Session Trap** to prevent unauthorized access when using the browser’s back button after logout.

- 📊 **Smart Dashboard**  
  Students are automatically grouped into **color-coded course cards** (e.g., CSE, ECE) for improved visibility.

- 🔍 **Real-Time Filtering**
  - Filter by Department  
  - **Dependent Dropdowns**: Selecting a department enables only relevant subjects  
  - **Instant Search** by Student Name or Roll Number

- ✏️ **Live Editing**  
  Update student marks directly in the dashboard table and save changes to the cloud instantly.

---

### 👨‍🎓 For Students (Public Side)

- 📄 **No Login Required**  
  Students can access their results using only their Roll Number.

- 🧮 **Auto-Calculation**
  - Grade Points (0–10)  
  - Letter Grades (S, A, B, etc.)  
  - Final GPA

- 🖨️ **Official Result Card**  
  Generates a clean, print-ready report card formatted in a college letterhead style.

---

## 🛠️ Tech Stack

This project uses a **Serverless Architecture**, eliminating the need to manage a physical backend server.

- **Frontend**: HTML5, CSS3 (custom responsive design), JavaScript (ES6+)
- **Backend**: Google Firebase (Serverless)
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore (NoSQL document store)
- **Hosting**: Firebase Hosting

---

## ⚙️ Local Setup & Installation

To run this project locally:

### 1️⃣ Clone the repository
```bash
git clone https://github.com/re-assist/eduStat-MAS.git
cd eduStat-MAS
