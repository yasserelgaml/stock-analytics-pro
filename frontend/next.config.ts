import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  // ده اللي هيحل مشكلة Recharts و react-is
  transpilePackages: ['recharts', 'lucide-react', 'framer-motion', 'sonner', 'react-is'],
};

export default nextConfig;