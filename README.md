# Vitaran - Service Booking Platform

Vitaran is a production-quality Service Booking Platform linking local service customers with verified service providers (electricians, plumbers, tutors, etc.).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod, Lucide Icons.
- **Backend**: Node.js, Express.js, TypeScript, Mongoose, JWT authentication, bcryptjs password hashing.
- **Database**: MongoDB (with an automatic in-memory fallback server `mongodb-memory-server` if no local instance is found).

---

## 📁 Project Structure

```
vitaran/
  backend/
    src/
      config/        # Database & Env configurations
      controllers/   # HTTP controllers
      middleware/    # Auth, security, and error handlers
      models/        # Mongoose database models
      routes/        # Router endpoints
      services/      # Core business logic handlers
      validators/    # Zod schemas for input validation
      types/         # Custom Express typings
      seed.ts        # Seeding routine
      server.ts      # Server entry point
    .env.example
  frontend/
    src/
      app/           # Next.js App Router screens & pages
      components/    # Reusable Tailwind elements
      lib/           # API fetch client & Auth context provider
      types/         # Typed interfaces
    .env.example
```

---

## 🔒 Security & Business Rules

1. **Secure Hashing**: Passwords are securely hashed using `bcryptjs` with salt.
2. **Access Control**: Role permissions (`customer` vs `provider`) are verified server-side on every request.
3. **State Machine**: Booking status transitions follow strict rules:
   - `pending` ➔ `accepted`, `rejected`, or `cancelled`
   - `accepted` ➔ `completed` or `cancelled`
   - All illegal transitions (e.g. `completed` ➔ `pending`) are blocked.
4. **Ownership Verification**: Users can only see or edit bookings that they own.

---

## 🚀 Running the Platform

### 1. Prerequisite Settings
Make sure you have Node.js (v18+) installed. No local MongoDB is required, as the backend will automatically spin up an in-memory database fallback (`mongodb-memory-server`) and seed it on start!

### 2. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
*The API server starts on [http://localhost:5001](http://localhost:5001).*

### 3. Start the Next.js Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Next.js client starts on [http://localhost:3000](http://localhost:3000).*

---

## 🔑 Demo Credentials

On initial boot, the database is auto-seeded with test profiles:

- **Customer Login**:
  - Email: `customer@vitaran.com`
  - Password: `password123`

- **Provider Login (Electrician)**:
  - Email: `ravi.kumar@vitaran.com`
  - Password: `password123`

- **Provider Login (Tutor)**:
  - Email: `anjali.sharma@vitaran.com`
  - Password: `password123`

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` (Register a new account)
- `POST /api/auth/login` (Login and sign JWT token)

### Providers
- `GET /api/categories` (Fetch pre-defined categories)
- `GET /api/providers` (Filter/search providers with pagination)
- `GET /api/providers/:id` (Fetch details of a single provider)
- `PUT /api/providers/profile` (Create or update provider profile details)

### Bookings
- `POST /api/bookings` (Create booking request)
- `GET /api/bookings` (Retrieve dashboard bookings lists)
- `PUT /api/bookings/:id/status` (Accept, reject, or complete requests)
- `DELETE /api/bookings/:id` (Cancel requests)
