/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/api/image/**", // Allow images from your API
      },
    ],
    domains: [
      "img.daisyui.com",
      "pbs.twimg.com",
      "placehold.co",
      "png.pngtree.com",
      "localhost",
      "api-storage.cli.pics",
    ],
    dangerouslyAllowSVG: true, // Allow SVG files
  },

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },
};

export default nextConfig;
