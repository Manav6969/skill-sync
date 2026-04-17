# SkillSync

Welcome to **SkillSync**! This is a real-time collaborative platform where teams can chat, share skills, and build projects together. 

This repository serves as the base codebase for our Engineering Challenge. Your team has been assigned one specific core issue to solve.

---

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Real-time:** Socket.io (currently)
- **Authentication:** Passport.js (Google OAuth), JWT

---

## 🛠 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or a free cluster on MongoDB Atlas)
- [Git](https://git-scm.com/)
- Docker (Optional, but highly recommended for testing DevOps and Database Transaction issues)

---

## 💻 Local Setup Instructions

Follow these instructions to get the application running on your local machine.

### 1. Clone the Repository
```bash
git clone <your-forked-repo-url>
cd skill-sync
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend/` directory using the following template:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skillsync
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
SESSION_SECRET=your_super_secret_session_key_here
NODE_ENV=development
```
*(If you are setting up OAuth, you will also need `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.)*

**Start the Backend Server:**
```bash
# Development mode with hot-reloading
npm run dev

# Or standard run
node server.js
```
The backend should now run on `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env` or `.env.local` file in the `frontend/` directory using the following template:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Start the Frontend Server:**
```bash
npm run dev
```
The frontend should now run on `http://localhost:3000`.

---

## 🤝 Contribution Guidelines

We are running a distributed challenge. Your team has been assigned **one specific issue** from the Issue Tracker.

### Branching Strategy
1. **Fork** the repository to your own account.
2. Create a specific branch for your issue: 
   ```bash
   git checkout -b fix/issue-number-description
   # Example: git checkout -b fix/issue-4-refresh-token-rotation
   ```
3. Commit your changes logically and with clear messages.

### The "AI Rule"
You are fully permitted (and encouraged) to use AI tools like ChatGPT, Claude, or Copilot.
**However:** The issues assigned to you are specifically designed with architectural traps that AI struggles with. Blindly copy-pasting an AI's first response will result in infinite loops, broken state, or hydration crashes. You must understand the *architecture* behind the code you are committing.

### Submitting a Pull Request
1. Once your code is stable, push your branch to your fork.
2. Open a Pull Request against the `main` branch of this repository.
3. Your PR Description **MUST** include:
   - A summary of what you changed.
   - Proof that it works (Screenshots, terminal output, or a loom video).
   - If your issue requires Docker (like MongoDB Replica Sets or Redis), include instructions on how the reviewer can test it.

---

## 🐞 Bug Reporting & Contact

If you find an issue in the baseline repository that is fundamentally blocking your team from working on your assigned task, open a `[BLOCKER]` issue in the GitHub tracker and notify the organizers immediately. 

Good luck, and build something awesome!
