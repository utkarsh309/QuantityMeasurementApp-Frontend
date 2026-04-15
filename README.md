# ⚖️ QuantityMeasurementApp-Frontend (Angular)  

**Trainee:** Utkarsh  
**Branch:** `feat/angular-frontend`  

---

## 🚀 Deployment Links  

- **Frontend Deployed URL:**  http://quanment-frontend.s3-website.ap-south-1.amazonaws.com

---

## 📌 About Project  

A clean, modular, and scalable frontend for the Quantity Measurement App built using Angular.  
This project is an upgraded version of the earlier HTML/CSS/JS implementation, now using Angular architecture for better maintainability, scalability, and performance.  

---

## 📁 Project Structure  

```
src/
└── app/
    ├── core/                        ← Singleton services & guards
    │   ├── services/
    │   │   ├── auth.service.ts      ← JWT token management, OAuth
    │   │   └── quantity.service.ts  ← All API calls (convert/compare/add/subtract/divide)
    │   ├── guards/
    │   │   └── auth.guard.ts        ← GuestGuard (login/signup) & AuthGuard
    │   └── interceptors/            ← (reserved for future HTTP interceptors)
    │
    ├── shared/                      ← Reusable across features
    │   ├── components/
    │   │   └── navbar/              ← NavbarComponent (used on every page)
    │   ├── models/
    │   │   └── quantity.models.ts   ← TypeScript interfaces & unit constants
    │   └── shared.module.ts
    │
    └── features/                    ← Lazy-loaded feature modules
        ├── home/                    ← Landing page  (route: /)
        ├── auth/
        │   ├── login/               ← Login page    (route: /login)
        │   └── signup/              ← Signup page   (route: /signup)
        ├── operations/              ← Operations    (route: /operations)
        └── history/                 ← History       (route: /history)
```


---

## ✨ Features  

- **Login / Register** with JWT authentication  
- **Google OAuth2 Integration**  
- **Route Guards** for secure navigation  
- **Lazy Loading** for optimized performance  
- **Reusable Components (Navbar, Shared Modules)**  
- **3 Measurement Types** — Length, Temperature, Volume  
- **5 Operations** — Convert, Compare, Add, Subtract, Divide  
- **Operation History** — fetched from backend API  
- Clean and scalable Angular architecture (Core, Shared, Feature modules)  

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
| History | `GET /api/v1/quantities/history/{operation}` |



---

## ⚙️ Configuration  

Backend URLs and environment variables are managed using Angular environment configuration files.  
`src/environments/environment.ts`


---

## 🏗️ Build Output  

The production build generates optimized files inside:  
`dist/quanment-angular/`


---

