/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://www.linkedbook.shop/:path*",
      },
    ];
  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/map/index.html",
  //       destination: "/map", // redirecting to /map/index
  //       permanent: true, // This makes it a 308 permanent redirect
  //     },
  //   ];
  // },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
