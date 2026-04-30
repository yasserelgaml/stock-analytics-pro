import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // السطر الجاي ده هو حل مشكلة Recharts و Lucide
  transpilePackages: ['recharts', 'lucide-react', 'framer-motion', 'sonner'],
};

export default nextConfig;