const nextConfig = {
  async rewrites() {
    return [
      { source: '/library', destination: '/' },
      { source: '/submit', destination: '/' },
      { source: '/subscribe', destination: '/' },
      { source: '/login', destination: '/' },
      { source: '/signup', destination: '/' },
      { source: '/dashboard', destination: '/' },
      { source: '/forgot-password', destination: '/' },
      { source: '/reset-password', destination: '/' },
    ];
  },
};
module.exports = nextConfig;
