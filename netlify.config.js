// Netlify-specific configuration
module.exports = {
  // Override the build directory
  buildDir: 'build',
  
  // Configure the dev server
  devServer: {
    port: 8888,
    historyApiFallback: true,
  },
  
  // Configure build options
  build: {
    environment: process.env.NODE_ENV || 'production',
    analyze: false,
    sourcemap: false,
    // Prevent treatment of warnings as errors
    failOnWarnings: false,
  },
  
  // Configure optimization
  optimization: {
    minimize: true,
    splitChunks: true,
    runtimeChunk: true,
  },
};
