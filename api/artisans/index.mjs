// api/artisans/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated, isArtisan } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for creating artisan profiles
const createProfileSchema = z.object({
  craft: z.string().min(2).max(100),
  experience: z.string().optional(),
  skills: z.string().optional(),
  verified: z.boolean().optional().default(false)
});

// Validation schema for updating artisan profiles
const updateProfileSchema = createProfileSchema.partial();

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

// Get all artisans
app.get('/api/artisans', async (req, res) => {
  try {
    // With database implementation, we need to query for all users first
    // and then filter for artisans
    const { db } = await import("../../server/db.js");
    const { users } = await import("../../shared/schema.js");
    const { eq } = await import("drizzle-orm");
    
    // Get all users that are artisans
    const artisanUsers = await db.select()
      .from(users)
      .where(eq(users.isArtisan, true));
    
    // Get profiles for each artisan
    const artisansWithProfiles = await Promise.all(
      artisanUsers.map(async (user) => {
        const profile = await storage.getArtisanProfile(user.id);
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          profile
        };
      })
    );
    
    return successResponse(res, 200, artisansWithProfiles);
  } catch (error) {
    console.error("Error fetching artisans:", error);
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
    
    const user = await storage.getUser(id);
    if (!user || !user.isArtisan) {
      return errorResponse(res, 404, "Artisan not found");
    }
    
    const profile = await storage.getArtisanProfile(id);
    const { password, ...userWithoutPassword } = user;
    
    return successResponse(res, 200, {
      ...userWithoutPassword,
      profile
    });
  } catch (error) {
    console.error("Error fetching artisan:", error);
    return errorResponse(res, 500, "Failed to fetch artisan");
  }
});

// Create artisan profile (for authenticated artisans only)
app.post('/api/artisans/profile', isArtisan, async (req, res) => {
  try {
    // Check if profile already exists
    const existingProfile = await storage.getArtisanProfile(req.user.id);
    if (existingProfile) {
      return errorResponse(res, 400, "Profile already exists for this artisan");
    }
    
    const profileData = createProfileSchema.parse(req.body);
    const profile = await storage.createArtisanProfile({
      ...profileData,
      userId: req.user.id
    });
    
    return successResponse(res, 201, profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid profile data", error.errors);
    }
    console.error("Failed to create artisan profile:", error);
    return errorResponse(res, 500, "Failed to create artisan profile");
  }
});

// Update artisan profile (for authenticated artisans only)
app.patch('/api/artisans/profile', isArtisan, async (req, res) => {
  try {
    // Check if profile exists
    const existingProfile = await storage.getArtisanProfile(req.user.id);
    if (!existingProfile) {
      return errorResponse(res, 404, "Profile not found for this artisan");
    }
    
    const profileData = updateProfileSchema.parse(req.body);
    const updatedProfile = await storage.updateArtisanProfile(req.user.id, profileData);
    
    return successResponse(res, 200, updatedProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid profile data", error.errors);
    }
    console.error("Failed to update artisan profile:", error);
    return errorResponse(res, 500, "Failed to update artisan profile");
  }
});

export default app;