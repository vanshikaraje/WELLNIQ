# WELLNiq – AI Healthcare Voice Agent  

**WELLNIQ** is an **AI-powered healthcare assistant** that provides **real-time medical consultations** using **voice and chat interaction**. Built with **Next.js**, **Vapi API**, and **PlayHT voices**, it enables users to interact with virtual doctors across multiple specialties for quick and accurate guidance.  

---

## ✨ Features  
✔ **Voice-Based Consultation** – Talk naturally to AI doctors.  
✔ **Multiple Specialties** – General Physician, Cardiologist, Dermatologist, etc.  
✔ **Dynamic Voice Selection** – Each doctor has a unique voice.  
✔ **Secure Authentication** – Powered by **Clerk**.  
✔ **Session Management** – Start and continue consultations easily.  
✔ **Responsive UI** – Clean, modern interface using **Tailwind CSS** & **Framer Motion**.  

---

## 🛠 Tech Stack  
- **Frontend:** Next.js (App Router), React, Tailwind CSS, Framer Motion  
- **Auth:** Clerk  
- **Database:** Neon PostgreSQL + Drizzle ORM  
- **AI & Voice:** Vapi API + PlayHT Voices  
- **Deployment:** Vercel  

---

## 🚀 Installation  

### 1. Install dependencies  
```bash
npm install
```

### 2. Configure environment variables  
Create a `.env.local` file and add:  
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
DATABASE_URL=your_neon_postgres_url
VAPI_KEY=your_vapi_api_key
```

### 3. Start the development server  
```bash
npm run dev
```

---

---

## 📌 Roadmap  
- ✅ Voice-based AI consultations  
- ✅ Multiple doctor specialties  
- ⬜ Prescription generation  

---

## 🤝 Contributing  
Contributions are welcome! Please fork this repo and submit a PR.  

---



