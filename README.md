# 🍱 Lunch Buddy

> **Vision:** Debt Simplification for Lunch Buddy. No more awkward "I'll pay you later" moments.

Lunch Buddy is a full-stack application designed to make splitting bills and managing group expenses seamless. Built with performance and scalability in mind, it leverages a modern tech stack to ensure a smooth user experience.

---

## 🏗 Architecture Overview

The project is structured as a **Monorepo** containing two main modules:

### 🔙 Backend (`/backend`)
Built with **Python** and **FastAPI**, following a modular architecture:
- **FastAPI**: High-performance async web framework.
- **SQLAlchemy (Async)**: ORM for database interactions.
- **Alembic**: Database migrations management.
- **Pydantic**: Data validation and serialization (Schemas).
- **PostgreSQL**: Relational database system (Recommended).

### 📱 Frontend (`/frontend`)
Built with **React Native** via **Expo**, ensuring cross-platform compatibility:
- **Expo Router**: File-based routing (Next.js style).
- **Zustand**: Lightweight and fast state management.
- **TypeScript**: Static typing for robustness.
- **Axios**: HTTP client for API communication.

---

## 🚀 Getting Started

Follow these steps to set up the development environment locally.

### Prerequisites
- **Python** (v3.10+)
- **Node.js** (v18+) & **npm** (or yarn/bun)
- **PostgreSQL** database instance running locally or via Docker.

---

### 1️⃣ Backend Setup

Navigate to the backend directory and set up the Python environment.

```bash
cd backend

```

#### A. Create Virtual Environment

It's best practice to isolate dependencies.

```bash
# Create venv
python -m venv venv

# Activate venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

```

#### B. Install Dependencies

*(Ensure you have a `requirements.txt` generated from your imports, or install manually: `fastapi uvicorn sqlalchemy alembic pydantic python-dotenv asyncpg`)*

```bash
pip install -r requirements.txt

```

#### C. Environment Variables

Copy the example configuration and update it with your local credentials.

```bash
cp .env.example .env

```

> **Action Required:** Open `.env` and fill in `DATABASE_URL` (e.g., `postgresql+asyncpg://user:pass@localhost/lunch_buddy_db`), `SECRET_KEY`, and `BACKEND_CORS_ORIGINS` (e.g., `["http://localhost:8081"]`).

#### D. Database Migrations

Apply the database schema using Alembic.

```bash
alembic upgrade head

```

#### E. Run the Server

Start the development server with hot-reloading.

```bash
uvicorn main:app --reload

```

*The API will be available at `http://localhost:8000` (Docs at `/docs`).*

---

### 2️⃣ Frontend Setup

Open a new terminal and navigate to the frontend directory.

```bash
cd frontend

```

#### A. Install Dependencies

```bash
npm install

```

#### B. Environment Variables

Configure the API endpoint to point to your running backend.

```bash
cp .env.example .env

```

> **Action Required:** Open `.env` and set `EXPO_PUBLIC_API_URL`.
> * If running on **Android Emulator**: `http://10.0.2.2:8000/api/v1`
> * If running on **iOS Simulator**: `http://localhost:8000/api/v1`
> * If running on **Physical Device**: `http://<YOUR_LOCAL_IP>:8000/api/v1`
> 
> 

#### C. Run the App

Start the Expo development server.

```bash
npx expo start

```

* Press `a` for Android Emulator.
* Press `i` for iOS Simulator.
* Scan the QR code with the Expo Go app for physical devices.

---

## 🧪 Testing

### Backend

To run the backend test suite (Pytest):

```bash
cd backend
pytest

```

---

## 🤝 Contribution

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes.
4. Push to the branch.
5. Open a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

