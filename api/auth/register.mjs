// api/auth/register.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { generateToken } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';
import { hashPassword } from './_auth-utils.mjs';

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  isArtisan: z.boolean().optional().default(false),
  location: z.string().optional(),
  bio: z.string().optional()
});

const app = express();
app.use(cors());
app.use(express.json());

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const userData = registerSchema.parse(req.body);
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return errorResponse(res, 409, "Username already taken");
    }
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return errorResponse(res, 409, "Email already registered");
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    
    // Create user
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return successResponse(res, 201, {
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid registration data", error.errors);
    }
    console.error("Registration error:", error);
    return errorResponse(res, 500, "Failed to register user");
  }
});

export default app;