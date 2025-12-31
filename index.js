const express = require('express');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const foodRoutes = require('./routes/foodRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route - serve HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/health', healthRoutes);
app.use('/food', foodRoutes);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Food endpoint: http://localhost:${PORT}/food`);
});

