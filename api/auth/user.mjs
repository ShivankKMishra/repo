// api/auth/user.mjs
import express from 'express';
import cors from 'cors';
import { authenticateJWT, isAuthenticated } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

// Get current user info
app.get('/api/user', isAuthenticated, (req, res) => {
  try {
    // User is already attached to req by authenticateJWT middleware
    const { password, ...userWithoutPassword } = req.user;
    return successResponse(res, 200, userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user:", error);
    return errorResponse(res, 500, "Failed to fetch user information");
  }
});

export default app;