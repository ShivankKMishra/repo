// api/categories/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for creating categories
const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  imageUrl: z.string().url().optional()
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await storage.getCategories();
    return successResponse(res, 200, categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return errorResponse(res, 500, "Failed to fetch categories");
  }
});

// Get category by ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, "Invalid category ID");
    }
    
    const category = await storage.getCategory(id);
    if (!category) {
      return errorResponse(res, 404, "Category not found");
    }
    
    return successResponse(res, 200, category);
  } catch (error) {
    console.error("Failed to fetch category:", error);
    return errorResponse(res, 500, "Failed to fetch category");
  }
});

// Create a category (only for authenticated users)
app.post('/api/categories', isAuthenticated, async (req, res) => {
  try {
    const categoryData = createCategorySchema.parse(req.body);
    const category = await storage.createCategory(categoryData);
    return successResponse(res, 201, category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid category data", error.errors);
    }
    console.error("Failed to create category:", error);
    return errorResponse(res, 500, "Failed to create category");
  }
});

export default app;