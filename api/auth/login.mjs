// api/auth/login.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { generateToken } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';
import { comparePasswords } from './_auth-utils.mjs';

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

const app = express();
app.use(cors());
app.use(express.json());

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const credentials = loginSchema.parse(req.body);
    
    // Get user by username
    const user = await storage.getUserByUsername(credentials.username);
    if (!user) {
      return errorResponse(res, 401, "Invalid username or password");
    }
    
    // Verify password
    const passwordMatch = await comparePasswords(credentials.password, user.password);
    if (!passwordMatch) {
      return errorResponse(res, 401, "Invalid username or password");
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return successResponse(res, 200, {
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid login data", error.errors);
    }
    console.error("Login error:", error);
    return errorResponse(res, 500, "Failed to login");
  }
});

export default app;