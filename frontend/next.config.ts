import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  // ده اللي هيحل مشكلة Recharts و react-is
  transpilePackages: ['recharts', 'lucide-react', 'framer-motion', 'sonner', 'react-is'],
};

export default nextConfig;