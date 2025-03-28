// api/server.mjs
import express from 'express';
import cors from 'cors';
import loginRoutes from './auth/login.mjs';
import registerRoutes from './auth/register.mjs';
import userRoutes from './auth/user.mjs';
import productsRoutes from './products/index.mjs';
import categoriesRoutes from './categories/index.mjs';
import artisansRoutes from './artisans/index.mjs';
import eventsRoutes from './events/index.mjs';
import forumRoutes from './forum/index.mjs';
import newsletterRoutes from './newsletter/index.mjs';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use(loginRoutes);
app.use(registerRoutes);
app.use(userRoutes);
app.use(productsRoutes);
app.use(categoriesRoutes);
app.use(artisansRoutes);
app.use(eventsRoutes);
app.use(forumRoutes);
app.use(newsletterRoutes);

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : null
    }
  });
});

// Export app for serverless deployment
export default app;