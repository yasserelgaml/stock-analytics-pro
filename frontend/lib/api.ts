export interface AnalysisData {
  ticker: string;
  current_price: number;
  rsi: number | null;
  sma_20: number | null;
  sma_50: number | null;
  macd: number | null;
  signal: 'Buy' | 'Sell' | 'Hold';
  fundamentals: {
    market_cap: number | null;
    trailing_pe: number | null;
    dividend_yield: number | null;
    fifty_two_week_high: number | null;
    fifty_two_week_low: number | null;
    company_industry: string | null;
    company_sector: string | null;
  } | null;
}

export interface AISummary {
  summary: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface WatchlistItem {
  id: number;
  ticker: string;
  added_at: string;
}

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  email: string;
}

// تعديل السطر 47 ليكون مرناً ويقرأ من Vercel
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://127.0.0.1:8000/api/v1';

export async function fetchStockAnalysis(ticker: string): Promise<AnalysisData> {
  const response = await fetch(`${API_BASE_URL}/analysis/${ticker.toUpperCase()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Stock ticker not found');
    }
    throw new Error('Failed to fetch analysis data');
  }
  
  return response.json();
}

export async function fetchAISummary(ticker: string): Promise<AISummary> {
  const response = await fetch(`${API_BASE_URL}/analysis/${ticker.toUpperCase()}/ai-summary`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch AI summary');
  return response.json();
}

export async function fetchStockHistory(ticker: string) {
  const response = await fetch(`${API_BASE_URL}/analysis/${ticker.toUpperCase()}/history`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch price history');
  return response.json();
}

export async function fetchStockNews(ticker: string): Promise<NewsItem[]> {
  const response = await fetch(`${API_BASE_URL}/analysis/${ticker.toUpperCase()}/news`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch news');
  return response.json();
}

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
  const response = await fetch(`${API_BASE_URL}/watchlist/`, {
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch watchlist');
  return response.json();
}

export async function addToWatchlist(ticker: string): Promise<WatchlistItem> {
  const headers = {
    'Content-Type': 'application/json',
  };
  const response = await fetch(`${API_BASE_URL}/watchlist/`, {
    method: 'POST',
    headers: headers,
    credentials: 'include',
    body: JSON.stringify({ ticker: ticker.toUpperCase() }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to add to watchlist');
  }
  
  return response.json();
}

export async function removeFromWatchlist(ticker: string): Promise<{ detail: string }> {
  const response = await fetch(`${API_BASE_URL}/watchlist/${ticker.toUpperCase()}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to remove from watchlist');
  }
  
  return response.json();
}

export async function login(formData: FormData): Promise<AuthResponse> {
  const data: Record<string, any> = {};
  formData.forEach((value, key) => {
    const finalKey = key === 'username' ? 'email' : key;
    data[finalKey] = value;
  });

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const text = await response.text();

  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.detail || 'Login failed');
    } catch (e) {
      throw new Error(`Server Error: ${text.substring(0, 100)}`);
    }
  }
  
  return JSON.parse(text);
}

export async function register(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Registration failed');
  }
  return response.json();
}
