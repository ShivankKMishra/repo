// api/artisans/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for creating artisan profile
const createArtisanSchema = z.object({
  userId: z.number().int().positive(),
  businessName: z.string().min(2).max(100),
  description: z.string().min(10),
  specialties: z.array(z.string()),
  location: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  website: z.string().url().optional(),
  socialMedia: z.object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional()
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

// Get all artisans
app.get('/api/artisans', async (req, res) => {
  try {
    const artisans = await storage.getArtisans();
    return successResponse(res, 200, artisans);
  } catch (error) {
    console.error("Failed to fetch artisans:", error);
    return errorResponse(res, 500, "Failed to fetch artisans");
  }
});

// Get artisan by ID
app.get('/api/artisans/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, "Invalid artisan ID");
    }
    
    const artisan = await storage.getArtisan(id);
    if (!artisan) {
      return errorResponse(res, 404, "Artisan not found");
    }
    
    return successResponse(res, 200, artisan);
  } catch (error) {
    console.error("Failed to fetch artisan:", error);
    return errorResponse(res, 500, "Failed to fetch artisan");
  }
});

// Create artisan profile (for authenticated users only)
app.post('/api/artisans', isAuthenticated, async (req, res) => {
  try {
    const artisanData = createArtisanSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    
    const artisan = await storage.createArtisan(artisanData);
    return successResponse(res, 201, artisan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid artisan data", error.errors);
    }
    console.error("Failed to create artisan profile:", error);
    return errorResponse(res, 500, "Failed to create artisan profile");
  }
});

export default app;