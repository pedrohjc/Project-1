/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para suportar bibliotecas que usam Node.js Buffer
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Garantir que Buffer está disponível no servidor
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

