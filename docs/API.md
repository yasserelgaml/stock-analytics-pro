# Trading Analytics API Documentation

## Base URL
`http://localhost:8000/api/v1`

## Authentication
Most endpoints require a Bearer Token.
- **Header**: `Authorization: Bearer <your_jwt_token>`

---

## 🔐 Authentication
### Register
`POST /auth/register`
- **Body**: `{ "email": "user@example.com", "password": "securepassword" }`
- **Response**: `User` object

### Login
`POST /auth/login`
- **Body**: `form-data` with `username` (email) and `password`
- **Response**: `{ "access_token": "...", "token_type": "bearer" }`

---

## 📈 Analysis
### Get Stock Analysis
`GET /analysis/{ticker}`
- **Description**: Returns technical indicators (RSI, SMA, MACD) and company fundamentals.
- **Response**: `AnalysisResponse`

### Get AI Summary
`POST /analysis/{ticker}/ai-summary`
- **Description**: Generates a technical summary and sentiment analysis.
- **Response**: `AISummaryResponse`

### Get Price History
`GET /analysis/{ticker}/history`
- **Description**: Returns historical price data with SMA 20/50 overlays.
- **Response**: `List[PriceData]`

### Get Latest News
`GET /analysis/{ticker}/news`
- **Description**: Returns the latest 5 news stories for the ticker.
- **Response**: `List[NewsItem]`

---

## 📋 Watchlist
### Get My Watchlist
`GET /watchlist/`
- **Auth**: Required
- **Response**: `List[WatchlistItem]`

### Add to Watchlist
`POST /watchlist/`
- **Auth**: Required
- **Body**: `{ "ticker": "AAPL" }`
- **Response**: `WatchlistItem`

### Remove from Watchlist
`DELETE /watchlist/{ticker}`
- **Auth**: Required
- **Response**: `{ "detail": "..." }`

---

## 🛠 System
### Health Check
`GET /health`
- **Description**: Verifies API status and environment.
- **Response**: `{ "status": "healthy", ... }`