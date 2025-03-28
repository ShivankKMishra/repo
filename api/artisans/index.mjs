// api/artisans/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

const router = express.Router();
router.use(cors());
router.use(express.json());
router.use(authenticateJWT);

// Get all artisans
router.get('/', async (req, res) => {
  try {
    const artisans = await storage.getArtisans();
    return successResponse(res, 200, artisans);
  } catch (error) {
    console.error("Failed to fetch artisans:", error);
    return errorResponse(res, 500, "Failed to fetch artisans");
  }
});

// Get artisan by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
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
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const artisanData = {
      ...req.body,
      userId: req.user.id
    };
    
    const artisan = await storage.createArtisan(artisanData);
    return successResponse(res, 201, artisan);
  } catch (error) {
    console.error("Failed to create artisan profile:", error);
    return errorResponse(res, 500, "Failed to create artisan profile");
  }
});

export default router;