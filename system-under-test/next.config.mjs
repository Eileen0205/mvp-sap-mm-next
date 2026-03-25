/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Rewrites para redirigir llamadas API a un servidor externo (mock server)
  // Solo se activa cuando NEXT_PUBLIC_API_URL está definida
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    // Si no hay URL externa configurada, no hacer rewrites
    if (!apiUrl) {
      return []
    }
    
    console.log(`[Next.js] API calls will be proxied to: ${apiUrl}`)
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
