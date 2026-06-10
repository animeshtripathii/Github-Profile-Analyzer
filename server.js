require('dotenv').config();

const app = require('./src/app');
const { testConnection } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    
    await testConnection();

    app.listen(PORT, () => {
      console.log(`\n🚀 GitHub Profile Analyzer is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📡 API base:     http://localhost:${PORT}/api/profiles\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

start();
