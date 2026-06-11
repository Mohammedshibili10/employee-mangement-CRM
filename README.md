# Employee Management CRM — Frontend

A simple React + Tailwind CSS frontend for an Employee Management CRM.
Beginner-friendly code, no backend (uses mock data).

## Tech

- React 18 (Vite)
- React Router v6
- Tailwind CSS v3

## Run it

```bash
cd frontend
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Login

There is no real login. On the login page just pick a role:

- **Admin** → opens the admin dashboard
- **Employee** → opens the employee dashboard

## Folder structure

```
src/
├── components/   reusable UI (common, admin, employee)
├── layouts/      AdminLayout, EmployeeLayout (sidebar + navbar)
├── pages/        auth, admin and employee pages
├── routes/       AppRoutes.jsx (all routes)
├── data/         mockData.js (fake data)
├── App.jsx
└── main.jsx
```

## Notes

- All data is fake and kept in `src/data/mockData.js`.
- Buttons like Save / Export only show an alert (demo only).
