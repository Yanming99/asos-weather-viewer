<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# ASOS Weather Viewer 🌍

An interactive web application to explore **ASOS (Automated Surface Observing System)** weather station data worldwide.  
Built with **Next.js + React + TypeScript + React-Leaflet + Tailwind CSS**, powered by the **WindBorne Systems API**.

---

## ✨ Features

- 🌐 **Interactive Map**: Explore ASOS stations globally (React-Leaflet + OpenStreetMap tiles).  
- 📊 **Historical Data Table**: For each station, normalized display of:
  - Temperature (°C)  
  - Wind speed (knots, computed from `wind_x` / `wind_y` if needed)  
  - Pressure (hPa, with altimeter conversion if only `alti` available)  
- 🛡️ **Robust Data Handling**:
  - Zod schemas validate API responses and coerce strings → numbers  
  - Corrupted or incomplete rows filtered out automatically  
- ⚡ **API Proxy with Cache & Retry**:
  - Serverless route (`/api/windborne`) proxies WindBorne API calls  
  - In-memory cache (60s) respects 20 calls/minute limit  
  - Automatic retry with backoff for upstream hiccups  
- 📱 **Responsive UI** with Tailwind CSS for modern styling.

---

## 🚀 Getting Started

### Clone & Install
```bash
git clone https://github.com/Yanming99/asos-weather-viewer.git
cd asos-weather-viewer
npm install


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# asos-weather-viewer
>>>>>>> 3df43556b6121872f6a793656cce0a532db404b6
>>>>>>>
>>>>>>> 🔧 Tech Stack

Frontend: Next.js (App Router, TypeScript), Tailwind CSS

Mapping: React-Leaflet + Leaflet

Validation: Zod

Backend Proxy: Next.js API Route

Deployment: Vercel

📡 Data Source

WindBorne Systems ASOS API

/stations → list of stations

/historical_weather?station={id} → historical data

👤 Author

Yanming Luo

GitHub: Yanming99

Email: your.email@example.com

📜 License

MIT License
Data © WindBorne Systems
