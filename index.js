require('dotenv').config();
const express = require('express');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const foodRoutes = require('./routes/foodRoutes');
const authRoutes = require('./routes/authRoutes');
const pgRoutes = require('./routes/pgRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { connectDB } = require('./utils/dbService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mount API Routes
app.use('/health', healthRoutes);
app.use('/food', foodRoutes); // Keep legacy food endpoint for backward compatibility
app.use('/api/auth', authRoutes);
app.use('/api/pgs', pgRoutes);
app.use('/api/submissions', submissionRoutes);

// Root route - serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Wildcard handler to redirect to index.html (useful for frontend navigation)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Connect to Database and start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 Food endpoint: http://localhost:${PORT}/food`);
    console.log(`🔗 Main app: http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});


