/** @type {import('next').NextConfig} */
const config = {

  eslint: { ignoreDuringBuilds: true },


  turbopack: { root: __dirname },

  outputFileTracingRoot: __dirname,
};

module.exports = config;
