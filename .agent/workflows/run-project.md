---
description: How to run the Finova full-stack application
---

To run the Finova project, you need to start both the backend server and the frontend development environment. Follow these steps:

### 1. Database Setup
Ensure you have **PostgreSQL** installed and running.
1. Create a database named `finova`.
2. Run the schema file to initialize the tables:
```powershell
psql -d finova -f server/database/schema.sql
```

### 2. Backend Setup
1. Navigate to the `server` directory.
2. Install dependencies:
```powershell
cd server
npm install
```
3. Configure your environment variables in `server/.env` (DB credentials, JWT secret).
4. Start the server:
```powershell
npm run dev
```

### 3. Frontend Setup
1. Open a new terminal in the root directory.
2. Install dependencies:
```powershell
npm install
```
3. Start the Vite development server:
```powershell
npm run dev
```

The application will be accessible at `http://localhost:5173` (frontend) and the API will run at `http://localhost:5000`.
