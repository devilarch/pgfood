const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const foodRoutes = require('./routes/foodRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Food Menu API',
    endpoints: {
      health: '/health',
      food: '/food'
    }
  });
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

