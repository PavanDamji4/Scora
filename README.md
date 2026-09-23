<h1 align="center">Scora</h1>

<p align="center">
  <b>The Intelligent Study Companion for Maharashtra State Board (SSC Class 10) Students</b>
</p>

<p align="center">
  <a href="https://github.com/PavanDamji4/Scora/stargazers"><img src="https://img.shields.io/github/stars/PavanDamji4/Scora?style=for-the-badge&color=5B4CF5&logo=github" alt="Stars"></a>
  <a href="https://github.com/PavanDamji4/Scora/network/members"><img src="https://img.shields.io/github/forks/PavanDamji4/Scora?style=for-the-badge&color=0D1F35&logo=github" alt="Forks"></a>
  <a href="https://github.com/PavanDamji4/Scora/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="License"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"></a>
  <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-Admin%20%7C%20Auth%20%7C%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase"></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Google%20Gemini-Flash%20Multimodal-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"></a>
</p>

<p align="center">
  <a href="#-about-scora">About</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-configuration">Configuration</a> •
  <a href="#-api-reference">API Docs</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📖 About Scora

Preparing for the **Maharashtra State Board Class 10 (SSC)** examination presents unique challenges: scattered study resources, cumbersome practical journals, unorganized previous year question papers (PYQs), and the lack of instant, curriculum-aligned academic support.

**Scora** is an all-in-one digital workspace engineered specifically for SSC candidates. By combining a curated academic repository with **Sarthi**—an AI study mentor fine-tuned for Maharashtra State Board concepts—Scora transforms board prep into a structured, habit-driven, and confident journey.

> [!TIP]
> **Why Sarthi?** Unlike generic LLMs that dump raw answers, **Sarthi** acts as an encouraging Socratic tutor: explaining geometric theorems, algebraic steps, science laws, and language grammar step-by-step without unnecessary preamble.

---

## ✨ Key Features

### 🤖 Sarthi — 24/7 AI Doubt Solver
- **SSC Curriculum Fine-Tuned**: Aligned with Maharashtra State Board syllabi (Algebra, Geometry, Science 1 & 2, History, Geography, Languages).
- **Multimodal Image Support**: Snap and upload textbook math problems, diagram questions, or chemical equations for instant, step-by-step breakdown.
- **Socratic Pedagogy**: Enforces structured numbering, bold key definitions, and formula retention rather than passive answer copying.

### 📚 Curated Study Vault
- **3-Year Board Question Papers**: Past papers (2022–2024+) with subject-wise categorization.
- **Complete Language Workbooks**: Verified materials for *English Kumarbharati*, *Marathi Aksharbharati*, and *Hindi Lokbharati*.
- **Practical & Activity Journals**: Ready references for *Science Practical*, *Maths Journal*, *Water Security*, *Defence Studies*, and *Physical & Health Education*.
- **In-App Document Viewer**: High-performance Google Drive PDF integration with fallback direct viewers.

### 📊 30-Day Habit & Consistency Tracker
- **Visual Consistency Heatmap**: 30-day activity grid inspired by contribution graphs.
- **Custom Study Tasks**: Add daily study goals tagged by subject with target durations.
- **Streaks & Analytics**: Real-time study streak counters (`🔥`) and daily completion percentage metrics.

### ⏱️ SSC Board Countdown & Dashboard
- **Dynamic Board Exam Countdown**: Real-time counter ticking down to the March SSC Board Examinations.
- **Daily Focus Checklist**: Prioritized list of syllabus targets for the day.
- **Personalized Header**: Academic greetings, school profile association, and quick jump navigation.

### 🔔 Smart Notification System
- **Firebase Cloud Messaging (FCM)**: Browser push alerts for daily study check-ins, task reminders, and board milestone countdowns.

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 & Vanilla JavaScript (ES6+ Modules)**: Lightweight, blazing fast, and dependency-free core runtime.
- **Tailwind CSS (CDN)**: Modern utility-first styling with a bespoke academic design system:
  - `Navy (#0D1F35)` • `Indigo (#5B4CF5)` • `Amber (#F59E0B)` • `Paper (#FAFAF9)` • `Pen Red (#E11D48)`
- **Typography**: Google Fonts (*Fraunces* for editorial elegance + *Inter* for crisp user interface clarity).
- **Mobile-First Layout**: Adaptive mobile viewport handling (`interactive-widget=resizes-content`), bottom tab navigation, and responsive touch modals.

### Backend & Cloud Services
- **Runtime**: Node.js (v18+) & Express.js.
- **AI Engine**: Google Generative AI SDK (`@google/generative-ai`) utilizing Gemini Flash multimodal models.
- **Database & Identity**: Firebase Authentication (Client & Admin SDK) & Google Cloud Firestore.
- **Notifications**: Firebase Cloud Messaging (FCM).
- **Security & Reliability**: `cors` policy management and `express-rate-limit` endpoint throttling.
- **Deployments**: Netlify (Frontend SPA) + Render (Backend API).

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND (Client / Netlify SPA)                    │
│                                                                                  │
│   ┌──────────────────┐        ┌──────────────────────┐      ┌────────────────┐   │
│   │   Mobile-First   │        │ Study Vault & Viewer │      │ Habit Tracker  │   │
│   │   Student UI     │        │ - 3-Year PYQs        │      │ 30-Day Heatmap │   │
│   │   (Tailwind+JS)  │        │ - Textbooks & Papers │      │ Streaks & Goal │   │
│   └────────┬─────────┘        └──────────┬───────────┘      └───────┬────────┘   │
│            │                             │                          │            │
│            │                             ▼                          │            │
│            │                   Google Drive PDF Viewer              │            │
│            │                                                        │            │
│            ▼                                                        ▼            │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │           Firebase Web SDK (Client Auth & FCM Notifications)             │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
└────────────────────────────────────────┼─────────────────────────────────────────┘
                                         │ HTTPS / REST (Bearer JWT + JSON)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND API (Node.js / Express on Render)               │
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                  CORS Middleware & Rate Limiting Security                │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
│                                        │
│                                        ▼
│   ┌──────────────────────────────────────────────────────────────────────────┐   │
│   │                  Sarthi AI Controller & Doubt Processing                 │   │
│   │    - Validates Firebase ID Token                                         │   │
│   │    - Normalizes question & Base64 image payload                          │   │
│   └────────────────────────────────────┬─────────────────────────────────────┘   │
│                                        │
│                  ┌─────────────────────┴─────────────────────┐                   │
│                  ▼                                           ▼                   │
│       ┌─────────────────────┐                     ┌─────────────────────┐        │
│       │ Firebase Admin SDK  │                     │   Gemini Service    │        │
│       │ - Auth Verification │                     │ - SSC Board Prompts │        │
│       │ - Firestore DB Sync │                     │ - Multimodal Vision │        │
│       └──────────┬──────────┘                     └──────────┬──────────┘        │
└──────────────────┼───────────────────────────────────────────┼───────────────────┘
                   │                                           │
                   ▼                                           ▼
        ┌─────────────────────┐                     ┌─────────────────────┐
        │   Cloud Firestore   │                     │ Google Gemini Flash │
        │  (User Data & Tasks)│                     │ (Reasoning & Solns) │
        └─────────────────────┘                     └─────────────────────┘
```

### Component Breakdown

| Tier / Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Client Interface** | Vanilla HTML5 / ES6 Modules / Tailwind CSS | Responsive mobile-first interface, 30-day consistency heatmap, and Sarthi AI chat view. |
| **Resource Viewer** | Embedded Google Drive & Fallback Viewer | Fast, in-app preview of 3-year PYQs, practical journals, and SSC workbooks. |
| **Client Auth & FCM** | Firebase Web SDK (v10) | User authentication, token lifecycle, and web push notifications. |
| **Backend Gateway** | Express.js on Node.js (Hosted on Render) | API routing, CORS verification, rate-limiting, and error handling. |
| **AI Inference** | Google Generative AI SDK (`@google/generative-ai`) | Multimodal doubt resolution with customized Maharashtra SSC prompt rules. |
| **Data & Cloud Storage** | Cloud Firestore & Firebase Admin | User profiles, subject tracking stats, exam targets, and seeded resources. |

<details>
<summary><b>📐 Click to view interactive Mermaid diagram (for GitHub preview)</b></summary>

```mermaid
graph TD
    subgraph Client ["Frontend (Netlify / Mobile Browser)"]
        UI["Tailwind + Vanilla JS Web App"]
        SW["Service Worker / FCM"]
        AuthC["Firebase Client Auth"]
    end

    subgraph Backend ["Backend API (Express / Render)"]
        Server["Express App Server"]
        RateLimit["Rate Limiter & CORS"]
        ChatCtrl["Chat Controller"]
        GeminiSvc["Gemini Service"]
        FBAdmin["Firebase Admin SDK"]
    end

    subgraph Cloud ["External Services"]
        GeminiAPI["Google Gemini Flash API"]
        Firestore[("Cloud Firestore")]
        Drive[("Google Drive PDF Store")]
    end

    UI -->|"Bearer Token & Prompts"| RateLimit
    RateLimit --> Server
    Server --> ChatCtrl
    ChatCtrl --> GeminiSvc
    GeminiSvc -->|"Multimodal Prompt"| GeminiAPI
    GeminiAPI -->|"Step-by-Step Solution"| GeminiSvc
    GeminiSvc --> Server
    Server -->|"JSON Response"| UI

    UI -->|"Auth & Sync"| AuthC
    AuthC -->|"Identity"| Firestore
    FBAdmin -->|"Verified Claims & Data"| Firestore
    UI -->|"Resource Preview"| Drive
```
</details>

---

## 📂 Repository Structure

```text
Scora/
├── backend/
│   ├── config/
│   │   └── firebase-admin.js       # Firebase Admin initialization
│   ├── controllers/
│   │   └── chat.controller.js      # Controller handling Sarthi chat requests
│   ├── middleware/
│   │   ├── cors.middleware.js      # Origin validation & security
│   │   └── rate-limiter.js         # API request rate limits
│   ├── routes/
│   │   └── chat.routes.js          # REST routes for AI interaction
│   ├── scripts/
│   │   └── seed-resources.js       # Firestore database seeder for PYQs & journals
│   ├── services/
│   │   ├── fcm.service.js          # Push notification dispatch service
│   │   ├── firestore.service.js    # Database persistence utilities
│   │   └── gemini.service.js       # Gemini multimodal prompt engineering
│   ├── .env.example                # Backend environment template
│   ├── package.json
│   └── server.js                   # Node.js entry point
│
├── frontend/
│   ├── public/
│   │   ├── assets/                 # Icons, badges, and brand assets
│   │   ├── css/
│   │   │   ├── base.css            # Base resets and utility classes
│   │   │   ├── components.css      # Reusable UI component styling
│   │   │   └── variables.css       # CSS custom properties & color tokens
│   │   ├── js/
│   │   │   ├── components/         # Bottom navigation, FABs, and modular UI
│   │   │   ├── api.js              # Backend fetch client
│   │   │   ├── auth.js             # Client-side Firebase auth handlers
│   │   │   ├── chat.js             # Sarthi chat engine & image upload handlers
│   │   │   ├── dashboard.js        # Countdown & overview controller
│   │   │   ├── tracker.js          # 30-day heatmap & habit state logic
│   │   │   └── vault.js            # Study vault filter & Drive modal logic
│   │   ├── chat.html               # Dedicated Sarthi AI tutor page
│   │   ├── dashboard.html          # Main student home dashboard
│   │   ├── index.html              # Authentication & landing portal
│   │   ├── settings.html           # Profile & notification preferences
│   │   ├── tracker.html            # Consistency & habit tracker page
│   │   └── vault.html              # Study materials, journals & PYQ vault
│   └── netlify.toml                # Netlify deployment & rewrite rules
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or later)
- [npm](https://www.npmjs.com/) (version 9.x or later)
- A [Firebase Project](https://console.firebase.google.com/) with **Authentication** and **Firestore** enabled
- A [Google AI Studio API Key](https://aistudio.google.com/) for Gemini models

---

### Installation & Local Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/PavanDamji4/Scora.git
cd Scora
```

#### 2. Backend Setup
Navigate into the backend directory and install dependencies:
```bash
cd backend
npm install
```

Configure your environment variables:
```bash
cp .env.example .env
```
Open `.env` and supply your credentials:
```env
PORT=5000
WEB_ORIGIN=http://localhost:3000

# Firebase Admin SDK Credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...
```

Start the backend development server:
```bash
npm run dev
# The API will listen on http://localhost:5000
```

*(Optional)* Seed Firestore with default SSC study materials & PYQs:
```bash
node scripts/seed-resources.js
```

#### 3. Frontend Setup
Because the frontend is static HTML5/ES6, it can be served using any local development HTTP server.

From the repository root or frontend directory:
```bash
# Using Python
python -m http.server 3000 --directory frontend/public

# Or using npx serve
npx serve frontend/public -l 3000
```

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## ⚙️ Environment Configuration

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Port number for the Express API server | `5000` |
| `WEB_ORIGIN` | Allowed client origin for CORS configuration | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API Key from Google AI Studio | `AIzaSyD...` |
| `FIREBASE_PROJECT_ID` | Google Firebase Project identifier | `scora-study-companion` |
| `FIREBASE_CLIENT_EMAIL` | Firebase Service Account client email | `firebase-adminsdk@...` |
| `FIREBASE_PRIVATE_KEY` | Firebase Service Account RSA private key | `"-----BEGIN PRIVATE KEY-----\n..."` |

---

## 📡 API Reference

### Health Check
```http
GET /api/health
```
**Response (200 OK):**
```json
{
  "status": "Scora backend is running"
}
```

---

### Ask Sarthi (AI Tutor)
```http
POST /api/chat
Authorization: Bearer <Firebase_ID_Token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Explain Pythagoras Theorem and provide standard SSC proof steps.",
  "subject": "Geometry",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..." 
}
```

**Response (200 OK):**
```json
{
  "reply": "1. Statement: In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.\n\n2. Given: In ΔABC, ∠ABC = 90°.\n\n3. To Prove: AC² = AB² + BC²..."
}
```



## 🤝 Contributing

Contributions make the open-source community a supportive space for students. Any contributions you make are **greatly appreciated**!

1. Fork the Project (`gh repo fork PavanDamji4/Scora`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---



## 👨‍💻 Author & Maintainer

**Pavan Damji**  
- GitHub: [@PavanDamji4](https://github.com/PavanDamji4)
- Project Repository: [PavanDamji4/Scora](https://github.com/PavanDamji4/Scora)

<p align="center">
  <sub>Built with ❤️ for Maharashtra Class 10 (SSC) Board Students.</sub>
</p>
