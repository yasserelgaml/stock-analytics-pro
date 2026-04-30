"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Search, TrendingUp, Activity, BarChart3, AlertCircle, Loader2, Star, Trash2, LayoutDashboard, BrainCircuit, Download, Globe, Newspaper, LogOut, User as UserIcon } from 'lucide-react';
import { fetchStockAnalysis, fetchStockHistory, fetchWatchlist, addToWatchlist, removeFromWatchlist, AnalysisData, WatchlistItem, fetchAISummary, AISummary, fetchStockNews, NewsItem } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Typing effect component for AI summary
function TypingText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
}

export default function Dashboard() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [ticker, setTicker] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);

  // Protected Route Check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch Watchlist
  const { data: watchlist, mutate: mutateWatchlist } = useSWR<WatchlistItem[]>('/api/watchlist', fetchWatchlist);

  // Fetch Analysis Data
  const { data, error, isLoading } = useSWR<AnalysisData>(
    searchQuery ? `/api/v1/analysis/${searchQuery}` : null, 
    () => fetchStockAnalysis(searchQuery)
  );

  // Fetch History Data for Chart
  const { data: history, isLoading: isLoadingHistory } = useSWR(
    searchQuery ? `/api/v1/analysis/${searchQuery}/history` : null,
    () => fetchStockHistory(searchQuery)
  );

  // Fetch News Data
  const { data: news, isLoading: isLoadingNews } = useSWR<NewsItem[]>(
    searchQuery ? `/api/v1/analysis/${searchQuery}/news` : null,
    () => fetchStockNews(searchQuery)
  );

  // Fetch AI Summary when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      fetchAISummary(searchQuery)
        .then(setAiSummary)
        .catch(() => setAiSummary(null));
    } else {
      setAiSummary(null);
    }
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker) return;
    setSearchQuery(ticker.toUpperCase());
  };

  const handleAddToWatchlist = async () => {
    if (!searchQuery) return;
    try {
      await addToWatchlist(searchQuery);
      toast.success(`${searchQuery} added to watchlist`);
      setTicker(''); 
      mutateWatchlist();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemoveFromWatchlist = async (tickerToRemove: string) => {
    try {
      await removeFromWatchlist(tickerToRemove);
      toast.info(`${tickerToRemove} removed from watchlist`);
      mutateWatchlist();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const exportToCSV = () => {
    if (!history) return;
    const headers = "Date,Price\n";
    const rows = history.map((row: { date: string; price: number }) => `${row.date},${row.price}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${searchQuery}_history.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'Buy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Sell': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (!user && authLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">
      {/* Sidebar Watchlist */}
      <aside className="w-72 border-r border-white/10 p-6 hidden lg:flex flex-col gap-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold">Watchlist</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {watchlist?.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ x: 5 }}
              className="group flex items-center justify-between p-3 glass-card hover:bg-white/10 cursor-pointer transition-all"
              onClick={() => setSearchQuery(item.ticker)}
            >
              <span className="font-mono font-bold">{item.ticker}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemoveFromWatchlist(item.ticker); }}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
          {!watchlist && <div className="text-gray-600 text-sm text-center">Loading...</div>}
          {watchlist?.length === 0 && <div className="text-gray-600 text-sm text-center">No stocks saved.</div>}
        </div>

        {/* User Profile Section */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 p-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate">{user?.email}</p>
              <p className="text-[10px] text-gray-500">Pro Account</p>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 p-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center mb-12 mt-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
          >
            Stock Analytics
          </motion.h1>
          <p className="text-gray-400 mb-8 text-center max-w-md">
            Professional technical analysis for global and Egyptian markets.
          </p>

          <form onSubmit={handleSearch} className="relative w-full max-w-md group">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Enter Ticker (e.g. AAPL, COMI.CA)..."
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all pl-12 text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all font-medium"
            >
              Analyze
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-64"
            >
              <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
              <p className="text-gray-400">Calculating indicators...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center p-8 glass-card border-red-500/20 text-center max-w-md mx-auto"
            >
              <AlertCircle className="text-red-500 mb-4" size={48} />
              <h3 className="text-xl font-semibold mb-2">Analysis Error</h3>
              <p className="text-gray-400">{error.message}</p>
            </motion.div>
          ) : data ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                {/* Main Price Card */}
                <div className="glass-card p-8 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={120} />
                  </div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold">{data.ticker}</h2>
                        <button 
                          onClick={handleAddToWatchlist}
                          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-all"
                          title="Add to Watchlist"
                        >
                          <Star size={20} />
                        </button>
                      </div>
                      <p className="text-gray-400">Current Market Price</p>
                    </div>
                    <div className={`px-4 py-1 rounded-full border text-sm font-bold ${getSignalColor(data.signal)}`}>
                      {data.signal} Signal
                    </div>
                  </div>
                  <div className="text-6xl font-mono font-bold mb-4 relative z-10">
                    ${data.current_price.toFixed(2)}
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center text-emerald-400 text-sm">
                      <TrendingUp size={16} className="mr-2" />
                      <span>Real-time analysis active</span>
                    </div>
                    <button 
                      onClick={exportToCSV}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-all"
                    >
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                </div>

                {/* AI Insight Card */}
                <div className="glass-card p-6 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
                  <div className="flex items-center gap-3 mb-4 text-blue-400">
                    <BrainCircuit size={24} />
                    <h3 className="text-lg font-semibold">AI Smart Summary</h3>
                  </div>
                  <div className="text-gray-300 leading-relaxed italic">
                    {aiSummary ? (
                      <TypingText text={aiSummary.summary} />
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={16} />
                        <span>Generating insights...</span>
                      </div>
                    )}
                  </div>
                  {aiSummary && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-widest">Sentiment:</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        aiSummary.sentiment === 'Bullish' ? 'text-green-400 bg-green-400/10' : 
                        aiSummary.sentiment === 'Bearish' ? 'text-red-400 bg-red-400/10' : 'text-gray-400 bg-gray-400/10'
                      }`}>
                        {aiSummary.sentiment}
                      </span>
                    </div>
                  )}
                </div>

                {/* Chart Card */}
                <div className="glass-card p-6 h-96">
                  <h3 className="text-lg font-medium mb-4 text-gray-300">Price & Moving Averages</h3>
                  <div className="w-full h-72">
                    {isLoadingHistory ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#666" fontSize={10} tickMargin={10} />
                          <YAxis stroke="#666" fontSize={10} domain={['auto', 'auto']} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="sma_20" stroke="#fbbf24" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                          <Line type="monotone" dataKey="sma_50" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Fundamentals Grid */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-6 text-gray-400">
                    <Globe size={20} />
                    <span className="text-sm font-medium uppercase tracking-wider">Fundamentals</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FundStat label="Market Cap" value={data.fundamentals?.market_cap} isCurrency />
                    <FundStat label="P/E Ratio" value={data.fundamentals?.trailing_pe} />
                    <FundStat label="Div. Yield" value={data.fundamentals?.dividend_yield} isPercent />
                    <FundStat label="52W High" value={data.fundamentals?.fifty_two_week_high} isCurrency />
                    <FundStat label="52W Low" value={data.fundamentals?.fifty_two_week_low} isCurrency />
                    <FundStat label="Sector" value={data.fundamentals?.company_sector} />
                  </div>
                </div>

                {/* News Section */}
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-6 text-gray-400">
                    <Newspaper size={20} />
                    <span className="text-sm font-medium uppercase tracking-wider">Latest News</span>
                  </div>
                  <div className="space-y-4">
                    {isLoadingNews ? (
                      <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-500" size={24} /></div>
                    ) : news?.length ? (
                      news.map((item, idx) => (
                        <a 
                          key={idx} 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-all group"
                        >
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-[10px] text-gray-500">{item.publisher}</span>
                            <TrendingUp size={10} className="text-gray-600" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="text-center text-gray-600 text-sm py-4">No recent news found.</div>
                    )}
                  </div>
                </div>

                {/* Technical Indicators */}
                <div className="grid grid-cols-1 gap-4">
                  <MetricCard 
                    icon={<Activity size={20} />} 
                    label="RSI (14)" 
                    value={data.rsi?.toFixed(2) || 'N/A'} 
                    description="Overbought > 70, Oversold < 30"
                  />
                  <MetricCard 
                    icon={<BarChart3 size={20} />} 
                    label="SMA 20" 
                    value={data.sma_20?.toFixed(2) || 'N/A'} 
                    description="Short-term trend"
                  />
                  <MetricCard 
                    icon={<BarChart3 size={20} />} 
                    label="SMA 50" 
                    value={data.sma_50?.toFixed(2) || 'N/A'} 
                    description="Medium-term trend"
                  />
                  <MetricCard 
                    icon={<Activity size={20} />} 
                    label="MACD" 
                    value={data.macd?.toFixed(4) || 'N/A'} 
                    description="Momentum indicator"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              Enter a ticker symbol to start the technical analysis.
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function FundStat({ label, value, isCurrency = false, isPercent = false }: { label: string, value: any, isCurrency?: boolean, isPercent?: boolean }) {
  const formattedValue = typeof value === 'number' 
    ? isCurrency ? `$${(value / 1e9).toFixed(2)}B` : isPercent ? `${(value * 100).toFixed(2)}%` : value.toFixed(2)
    : value || 'N/A';

  return (
    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
      <div className="text-[10px] text-gray-500 uppercase mb-1">{label}</div>
      <div className="text-sm font-bold truncate">{formattedValue}</div>
    </div>
  );
}

function MetricCard({ icon, label, value, description }: { icon: React.ReactNode, label: string, value: string, description: string }) {
  return (
    <div className="glass-card p-6 hover:bg-white/10 transition-colors cursor-default">
      <div className="flex items-center gap-3 mb-3 text-gray-400">
        {icon}
        <span className="text-sm font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}