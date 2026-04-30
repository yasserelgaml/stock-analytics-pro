"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingUp, BrainCircuit, LayoutDashboard, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      title: "Technical Charts",
      description: "Real-time price action with SMA 20/50 overlays and professional technical indicators.",
      icon: <TrendingUp className="text-blue-400" size={24} />,
    },
    {
      title: "AI Smart Insights",
      description: "Get instant, rule-based technical summaries and sentiment analysis for any ticker.",
      icon: <BrainCircuit className="text-emerald-400" size={24} />,
    },
    {
      title: "Personalized Watchlists",
      description: "Track your favorite stocks across global markets with a secure, private account.",
      icon: <LayoutDashboard className="text-purple-400" size={24} />,
    },
    {
      title: "Institutional Grade",
      description: "Fast, cached API responses and professional-grade data from Yahoo Finance.",
      icon: <Zap className="text-yellow-400" size={24} />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent -z-10" />
        
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
              <ShieldCheck size={14} />
              <span>Professional Grade Analysis</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Master the Markets with <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
                AI-Powered Insights
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              The ultimate technical analysis dashboard for professional traders. 
              Combine real-time data, advanced indicators, and AI summaries in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Get Started Free <TrendingUp size={20} />
              </button>
              <Link 
                href="/login" 
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to trade</h2>
            <p className="text-gray-400">Powerful tools designed for precision and speed.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 border-white/10 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 text-center">
        <p className="text-gray-500 text-sm">
          © {new Date().getFullYear()} Stock Analytics Pro. All rights reserved.
        </p>
      </footer>
    </div>
  );
}