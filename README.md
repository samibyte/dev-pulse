# 🚼 DevPulse – Internal Tech Issue & Feature Tracker

DevPulse is a collaborative platform designed for software teams to report bugs, suggest features, and coordinate resolutions efficiently. This internal tool provides a streamlined workflow for contributors to submit entries and for maintainers to oversee the entire issue lifecycle.

---

## 🚀 Live Demo
**Live URL:** https://dev-puls3.vercel.app

---

## ✨ Features

- **User Roles & Permissions:**
  - **Contributor:** Register, log in, create issues, and update their own open issues.
  - **Maintainer:** Full administrative control, including updating any issue, deleting issues, and managing workflow states.
- **Robust Authentication:** Secure JWT-based authentication flow with password hashing using bcrypt.
- **Issue Management:** Categorize entries as `bug` or `feature_request` with status tracking (`open`, `in_progress`, `resolved`).
- **Advanced Filtering & Sorting:** Retrieve all issues with options to sort by newest/oldest and filter by type or status.
- **Raw SQL Performance:** Built using high-performance raw SQL queries with a native PostgreSQL driver (no ORM overhead).

---

## 🛠️ Technology Stack

| Technology | Usage |
| :--- | :--- |
| **Node.js** | LTS Runtime (v24.x+) |
| **TypeScript** | Type-safe development |
| **Express.js** | Modular backend architecture |
| **PostgreSQL** | Relational database storage |
| **Raw SQL** | Native `pg` driver for direct database interaction |
| **Bcrypt.js** | Password hashing (salt rounds: 10) |
| **JSON Web Token** | Secure authentication and authorization |

---

## 🗄️ Database Schema Summary

### 1. `users` Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL | Primary Key (Auto-increment) |
| `name` | VARCHAR | Full display name |
| `email` | VARCHAR | Unique login address |
| `password` | TEXT | Encrypted hash (never returned in responses) |
| `role` | VARCHAR | `contributor` or `maintainer` (Default: `contributor`) |
| `created_at` | TIMESTAMP | Auto-generated timestamp |
| `updated_at` | TIMESTAMP | Automatically refreshed on update |

### 2. `issues` Table
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | SERIAL | Primary Key (Auto-increment) |
| `title` | VARCHAR(150) | Short headline |
| `description` | TEXT | Detailed explanation (Min 20 characters) |
| `type` | VARCHAR | `bug` or `feature_request` |
| `status` | VARCHAR | `open`, `in_progress`, `resolved` (Default: `open`) |
| `reporter_id` | INTEGER | Reference to the user who submitted the issue |
| `created_at` | TIMESTAMP | Auto-generated timestamp |
| `updated_at` | TIMESTAMP | Automatically refreshed on update |

---

## 🌐 API Endpoints Specification

### Authentication Module
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate and receive JWT |

### Issues Module
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/issues` | Private | Create a bug or feature request |
| `GET` | `/api/issues` | Public | Get all issues (Filter: type, status. Sort: newest, oldest) |
| `GET` | `/api/issues/:id` | Public | Get full details of a specific issue |
| `PATCH` | `/api/issues/:id` | Private | Update issue (Maintainer or Owner) |
| `DELETE` | `/api/issues/:id` | Maintainer | Permanently remove an issue |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (LTS version)
- PostgreSQL Database
- `pnpm` or `npm` package manager

### Local Installation
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dev-pulse
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add the following:
   ```env
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_secret_key
   SALT_ROUNDS=10
   ```

4. **Database Initialization:**
   Run the SQL scripts (provided in the project or create tables manually based on the schema above).

5. **Run the application:**
   ```bash
   # Development mode
   pnpm dev

   # Production build
   pnpm build
   pnpm start
   ```

---

## 📦 Deployment

This project is configured for deployment on platforms like **Vercel**, **Render**, or **Railway**.
- Ensure `DATABASE_URL` and `JWT_SECRET` are set in the environment variables.
- Use **NeonDB**, **Supabase**, or **ElephantSQL** for a cloud-hosted PostgreSQL instance.

---

## ⚖️ License
This project is licensed under the ISC License.
