# 🌿 FloraLens — AI Botanical Identification & Plant Care Assistant

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Google GenAI SDK](https://img.shields.io/badge/Google_GenAI-SDK-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Vision_Tasks-0072b2?style=for-the-badge)](https://developers.google.com/mediapipe)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**FloraLens** is a modern, responsive web application engineered for botanists, gardeners, and plant lovers. Snap or upload any plant photo—including native iPhone HEIC formats—to instantly recognize species, retrieve botanical profiles, receive customized care instructions (watering, sunlight, soil), and chat with an interactive AI botanical assistant.

---

## ✨ Key Features & Capabilities

- 📸 **Instant Botanical Recognition**: Accurately classifies wild flora, house plants, succulents, trees, and flowers using Google's latest multimodal GenAI vision models.
- 📱 **Native iPhone HEIC Support**: Built-in conversion via `heic2any` allows seamless photo uploads directly from iOS devices without manual format conversions.
- 🪴 **Comprehensive Plant Profiles**: Displays binomial scientific names, family classifications, native origins, toxicity alerts (pet/child safety), and growth habits.
- 💧 **Actionable Care & Maintenance Guides**: Provides specific watering schedules, light requirements, optimal humidity ranges, and soil composition advice.
- 💬 **Interactive AI Plant Doctor**: Integrated botanical chatbot powered by `@google/genai` to troubleshoot yellowing leaves, pest infestations, pruning questions, and repotting advice.
- ⚡ **Cutting-Edge React 19 Architecture**: Built on React 19, TypeScript, and Vite for blazing-fast bundle loading and instant client rendering.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/) | Next-gen client UI and strong type contracts |
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Ultra-fast HMR and build bundling |
| **AI Vision Engine** | [@google/genai SDK](https://github.com/google-gemini/generative-ai-js) | Multimodal visual recognition & botanical reasoning |
| **Edge Vision** | [@mediapipe/tasks-vision](https://developers.google.com/mediapipe) | On-device pre-processing and image orientation |
| **Media Transcoder** | `heic2any` | Client-side conversion of Apple HEIC/HEIF images to JPEG/PNG |

---

## 📂 Project Structure

```text
FloraLens/
├── components/
│   ├── PlantCard.tsx     # Botanical profile, care metrics & toxicity warnings
│   └── ChatBot.tsx       # Real-time conversational AI plant assistant
├── App.tsx               # Primary dashboard & upload orchestration
├── index.html            # Entry HTML markup
├── index.tsx             # Root React mounting
├── package.json          # Dependencies & scripts
└── vite.config.ts        # Vite configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm
- A Google Gemini API Key ([Get one for free at Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/AnupamKhurana/FloraLens.git
cd FloraLens
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Key
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Launch Development Server
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:5173`** (or port specified by Vite).

---

## 💡 How It Works

```
  [ Take / Upload Photo ]
             │
             ├──▶ (Apple HEIC image?) ──▶ [ heic2any client conversion ]
             │
             ▼
    [ MediaPipe Preprocessing ]
             │
             ▼
  [ Google GenAI Vision Model ]
             │
             ├──▶ Structured Species & Family Match
             ├──▶ Toxicity & Pet-Safety Warnings
             ├──▶ Soil, Watering & Sun Requirements
             └──▶ Interactive "Ask FloraLens" Q&A Assistant
```

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or PR for:
- Expanded plant species databases
- Offline plant identification fallback
- PWA / Mobile camera integration enhancements

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.
