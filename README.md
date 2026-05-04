---
title: Stock Analytics Pro API
emoji: 📈
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# 📈 Stock Analytics Pro


A professional-grade, full-stack stock analysis platform providing real-time technical indicators, fundamental data, and AI-powered market insights.

## 🚀 Features

### 🛠 Technical Analysis
- **Real-time Indicators**: RSI (14), MACD, and SMA (20, 50) calculations.
- **Interactive Charting**: Price history visualization with SMA overlays using Recharts.
- **Signal Generation**: Automated Buy/Sell/Hold signals based on technical crossovers.

### 🤖 AI Insights
- **Smart Summaries**: AI-generated technical position summaries.
- **Sentiment Analysis**: Bullish, Bearish, or Neutral sentiment detection.
- **Typing Effect**: Immersive AI response visualization.

### 👤 Personalization & Security
- **User Accounts**: Secure JWT-based authentication (Register/Login).
- **Private Watchlists**: Save and track your favorite tickers across global markets.
- **Secure Storage**: Password hashing with bcrypt and protected API routes.

### 🌐 Data & Performance
- **Fundamental Data**: Market Cap, P/E Ratio, Dividend Yield, and Sector info via Yahoo Finance.
- **Live News Feed**: Latest news stories integrated directly into the dashboard.
- **High Performance**: In-memory caching layer to reduce API latency and rate-limit risks.

## 🛠 Tech Stack

- **Backend**: FastAPI (Python 3.11+), SQLAlchemy (Async), PostgreSQL/SQLite.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Data**: yfinance, Pandas, Pandas-TA.
- **DevOps**: Docker, Docker Compose.

## 📦 Installation & Deployment

### Prerequisites
- Docker and Docker Compose installed.

### Quick Start (Docker)
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stock-analytics-pro.git
   cd stock-analytics-pro
   ```

2. Create a `.env` file in the root directory:
   ```env
   SECRET_KEY=your_super_secret_random_key
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=password
   POSTGRES_DB=trading_db
   ENVIRONMENT=production
   CORS_ORIGINS=http://localhost:3000
   ```

3. Launch the entire stack:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:8000`
   - **API Docs**: `http://localhost:8000/docs`

## 📖 API Documentation
Detailed API specifications can be found in `/docs/API.md`.