# Rollout — Feature Flag Management


## 📖 Overview

**Rollout** is a production-grade, open-source feature flag platform designed to help engineering teams deploy code safely, run percentage-based rollouts, and toggle functionality live in production with **sub-millisecond latency**.

---

## ✨ Key Features

-  **Sub-Millisecond Evaluation:** Built-in **Redis Cache-Aside** layer ensuring feature flag checks never slow down client or backend apps.
- **Multi-Tenant Workspaces:** Strict company/tenant scoping. Different teams and organizations operate independently within their own secure workspaces.
- **Advanced Traffic Targeting:**
  - **Deterministic Percentage Rollouts:** Stable MD5 hashing ensures a user consistently sees the same feature version across sessions.
  - **User Whitelisting:** Target specific testers by user ID or email.
-  **Graceful Fallback & High Availability:** Automatically falls back to MongoDB Atlas if Redis is ever unreachable—zero downtime or crashes.
-  **Full Audit Logging:** Tracks every flag creation, toggle switch, percentage update, and deletion with user identity and timestamp.
-  **Live Interactive Simulator:** Test and verify evaluation rules in real-time directly inside the dashboard.
-  **Modern Dark UI:** Sleek, responsive dashboard built with React, Tailwind CSS, and Lucide icons.

---

## 🏗️ Architecture

```
                                  ┌───────────────────────┐
                                  │  Client Apps / Backend│
                                  └──────────┬────────────┘
                                             │
                       GET /api/flags/evaluate/:key?company=...
                                             │
                                             ▼
                                  ┌───────────────────────┐
                                  │ Rollout Express API   │
                                  └──────┬─────────┬──────┘
                       Cache Hit         │         │   Cache Miss
                      (< 1ms)            │         │   (Fallback)
                                         ▼         ▼
                              ┌──────────────┐ ┌──────────────┐
                              │ Upstash      │ │ MongoDB      │
                              │ Cloud Redis  │ │ Atlas        │
                              └──────────────┘ └──────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or free MongoDB Atlas cluster)
- [Redis](https://upstash.com/) (Local or free Upstash Cloud Redis)

---

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Rollout.git
cd Rollout
```

---

### 2. Configure the Backend

Navigate to `server/`:
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/rollout?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
REDIS_URL=rediss://default:<password>@<your-db>.upstash.io:6379
```

Start the backend server:
```bash
npm run dev
# Server runs on http://localhost:4000
```

---

### 3. Configure the Frontend Dashboard

Open a new terminal and navigate to `client/`:
```bash
cd client
npm install
npm run dev
# Dashboard opens on http://localhost:5173
```

---

## 💻 Connecting Rollout to Your Client Apps

Integrating Rollout into any React, Next.js, or Vite application takes less than 1 minute!

### 1. Add the `useFeatureFlag` Hook
Copy this hook into your frontend project (e.g. `src/hooks/useFeatureFlag.js`):

```javascript
import { useEffect, useState } from "react";

const ROLLOUT_API = import.meta.env.VITE_ROLLOUT_URL || "http://localhost:4000";

/**
 * Evaluates a feature flag from Rollout on page load / mount
 * @param {string} flagKey - The key of the flag (e.g. "dark-mode")
 * @param {string} company - Your organization name (e.g. "Threads")
 * @param {string|null} userId - Optional user ID for percentage rollouts
 */
export function useFeatureFlag(flagKey, company = "YourCompany", userId = null) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkFlag = async () => {
      try {
        let url = `${ROLLOUT_API}/api/flags/evaluate/${encodeURIComponent(flagKey)}?company=${encodeURIComponent(company)}`;
        if (userId) url += `&userId=${encodeURIComponent(userId)}`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setEnabled(Boolean(data.enabled));
        }
      } catch (err) {
        // Safe fallback
      }
    };

    checkFlag();

    return () => {
      isMounted = false;
    };
  }, [flagKey, company, userId]);

  return enabled;
}

export default useFeatureFlag;
```

### 2. Use It Anywhere in Your UI
```jsx
import useFeatureFlag from "./hooks/useFeatureFlag";

function Header() {
  const showNewFeature = useFeatureFlag("ai-search", "Threads");

  return (
    <header>
      <h1>My Application</h1>
      {showNewFeature && <button className="ai-btn">✨ AI Search (Beta)</button>}
    </header>
  );
}
```

---

## 🛡️ Using Feature Flags in Backend (Node.js / Express)

You can protect entire routes or branch business logic in your backend:

```javascript
// utils/featureFlag.js
const ROLLOUT_API = process.env.ROLLOUT_URL || "http://localhost:4000";

export async function isFeatureEnabled(flagKey, userId = null, company = "Threads") {
  try {
    let url = `${ROLLOUT_API}/api/flags/evaluate/${encodeURIComponent(flagKey)}?company=${encodeURIComponent(company)}`;
    if (userId) url += `&userId=${encodeURIComponent(userId)}`;

    const res = await fetch(url);
    if (!res.ok) return true; // Safe fallback

    const data = await res.json();
    return Boolean(data.enabled);
  } catch (err) {
    return true; // Fail-open fallback
  }
}
```

### Example: Protect API Route
```javascript
router.post("/create-post", async (req, res) => {
  const canPost = await isFeatureEnabled("create-post", req.user._id, "Threads");
  if (!canPost) {
    return res.status(403).json({ error: "Posting is temporarily disabled by admin." });
  }

  // Normal post creation logic...
});
```