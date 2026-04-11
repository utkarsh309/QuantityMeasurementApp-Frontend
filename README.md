# ⚖️ QuantityMeasurementApp-Frontend  


**Trainee:** Utkarsh  
**Branch:** `feat/html-css-js-core`
**Branch:** `feat/angular-frontend`

A clean, responsive frontend for the Quantity Measurement App built using pure HTML, CSS, and JavaScript — no frameworks.

---

## 🔗 Backend Info

| Detail | Value |
|---|---|
| Framework | Spring Boot |
| Auth | JWT + OAuth2 (Google) |
| Database | MySQL |
| Base URL | `http://localhost:8081` |

> Backend runs separately. This frontend connects to it via REST APIs.

---

## 📁 Structure

```
├── index.html          ← Login page
├── register.html       ← Register page
├── dashboard.html      ← Main dashboard
├── css/
│   ├── auth.css        ← Login & register styles
│   └── dashboard.css   ← Dashboard styles
└── js/
    ├── auth.js         ← Login & register logic
    └── dashboard.js    ← All operations & history
```

---

## ✨ Features

- **Login / Register** with JWT authentication
- **3 Measurement Types** — Length, Temperature, Volume
- **5 Operations** — Convert, Compare, Add, Subtract, Divide
- **Operation History** — tracks last 30 operations in session
- No frameworks — pure HTML, CSS, JavaScript

---

## 🚀 How to Run

1. Make sure the **Spring Boot backend is running** on port `8081`
2. Open `index.html` in your browser

   **Or use Live Server (VS Code):**
   ```
   Right-click index.html → Open with Live Server
   ```

3. Register an account → Login → Use the dashboard

---

## 🔌 API Endpoints Used

| Operation | Endpoint |
|---|---|
| Register | `POST /auth/register` |
| Login | `POST /auth/login` |
| Convert | `POST /api/v1/quantities/convert` |
| Compare | `POST /api/v1/quantities/compare` |
| Add | `POST /api/v1/quantities/add` |
| Subtract | `POST /api/v1/quantities/subtract` |
| Divide | `POST /api/v1/quantities/divide` |

All `/api/v1/**` requests include `Authorization: Bearer <token>` header.

---


