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

## 🧩 Horizontal Socket Scaling with Redis
This codebase now supports horizontally scaled Socket.io servers using Redis Pub/Sub plus the modern `@socket.io/redis-adapter`.

### Why this matters
If the backend scales to multiple Node instances behind a load balancer, WebSocket state is no longer local. A socket connected to Instance A cannot see sockets connected to Instance B unless a shared event bus exists. Without Redis, User A can send a chat message that is visible only to Instance A's clients and disappears for clients on Instance B.

### What changed
- Added a centralized Redis channel for chat events.
- Each Node instance subscribes to the channel and broadcasts received messages to its connected sockets.
- Socket.io is configured with `@socket.io/redis-adapter` so room membership and events can coordinate across instances.
- A proof-of-concept Docker Compose setup is included with two backend containers, one Redis instance, and an Nginx load balancer.

### Run the PoC
From the `skill-sync/` directory:
```bash
docker compose up --build
```

Then open the load balancer on `http://localhost`.

### Clean up
```bash
docker compose down
```

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

## 🏆 The 8 Engineering Challenges

Below are the 8 issues designed for this challenge. Each team will be assigned one. You are allowed to use AI, but be warned: these are meticulously crafted to stump blind copy-pasting.

### 1. [Frontend] Build an Optimistic UI Chat with Offline Retry
**Objective:** Currently, sending a message introduces a network delay. You must implement an "Optimistic UI" that instantly renders the message, but elegantly handles network failures by implementing a local retry queue that automatically syncs when reconnecting. 

### 2. [Security] Implement Client-Side End-to-End Encryption (E2EE)
**Objective:** Replace plain text WebSocket messaging with client-side AES-GCM encryption using the native `window.crypto.subtle` Web Crypto API so the database stores unbreakable ciphertext.

### 3. [Fullstack] Fix "Cursor Jumping" in Collaborative Notes
**Objective:** We are adding a Live Team Notes feature via WebSockets. However, incoming broadcast states violently reset the React `<textarea>` cursor to the extreme end. You must dive into native DOM `selectionStart` APIs to stabilize the caret dynamically.

### 4. [Security] Refresh Token Rotation & Server-Side Logout
**Objective:** Currently, logout only deletes your local browser cookie. Tokens remain active on the server forever. You must implement an asynchronous Token Denylist and "Refresh Token Rotation" that instantly revokes all tokens if an old token is fraudulently reused.

### 5. [Backend Algorithm] Implement Cursor-Based Pagination
**Objective:** To prevent memory crashes, paginate the chat history. You are strictly forbidden from using standard `.skip()` pagination. You must implement mathematically sound "Cursor Pagination" bridging timestamp sorts and `_id` fallback tiebreakers.

### 6. [Backend Protocol] Migrate from socket.io to `ws` natively
**Objective:** `socket.io` is too heavy. Strip it out and replace it with the lightweight `ws` npm package. Since `ws` lacks a "Rooms" concept natively, you must manually engineer a memory-safe `RoomConnectionManager` class to handle multiplexed broadcasts.

### 7. [Architecture] Horizontal WebSocket Scaling via Redis Pub/Sub
**Objective:** If our Node.js load balancer scales to 3 instances, the chat breaks because Users A and B are on different servers siloed from each other. You must implement Redis Pub/Sub so WebSockets successfully broadcast across a multi-server distributed cluster.

### 8. [DevOps] Advanced Multi-Stage Docker Build for Next.js
**Objective:** A standard Docker build for Next.js generates a bloated ~1.5GB image. You must restructure the build into a Multi-Stage Dockerfile leveraging Next.js `output: "standalone"` mode to produce a final Alpine Linux image strictly under 200MB.

---

## 🐞 Bug Reporting & Contact

If you find an issue in the baseline repository that is fundamentally blocking your team from working on your assigned task, open a `[BLOCKER]` issue in the GitHub tracker and notify the organizers immediately. 

Good luck, and build something awesome!
