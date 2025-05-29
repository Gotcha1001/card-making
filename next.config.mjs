/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/watermark",
        destination: "/api/download-card",
      },
    ];
  },
};

export default nextConfig;
