// api/products/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated, isArtisan } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for creating products
const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  categoryId: z.number().int().positive(),
  imageUrl: z.string().url().optional(),
  stock: z.number().int().nonnegative().optional(),
  artisanId: z.number().int().positive(),
  featured: z.boolean().optional()
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const products = await storage.getProducts(limit);
    return successResponse(res, 200, products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return errorResponse(res, 500, "Failed to fetch products");
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, "Invalid product ID");
    }
    
    const product = await storage.getProduct(id);
    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }
    
    return successResponse(res, 200, product);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return errorResponse(res, 500, "Failed to fetch product");
  }
});

// Create a product (only for authenticated artisans)
app.post('/api/products', isArtisan, async (req, res) => {
  try {
    const productData = createProductSchema.parse(req.body);
    
    if (productData.artisanId !== req.user.id) {
      return errorResponse(res, 403, "You can only create products for yourself");
    }
    
    const product = await storage.createProduct(productData);
    return successResponse(res, 201, product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid product data", error.errors);
    }
    console.error("Failed to create product:", error);
    return errorResponse(res, 500, "Failed to create product");
  }
});

// Get products by category
app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      return errorResponse(res, 400, "Invalid category ID");
    }
    
    const products = await storage.getProductsByCategory(categoryId);
    return successResponse(res, 200, products);
  } catch (error) {
    console.error("Failed to fetch products by category:", error);
    return errorResponse(res, 500, "Failed to fetch products by category");
  }
});

// Get products by artisan
app.get('/api/products/artisan/:artisanId', async (req, res) => {
  try {
    const artisanId = parseInt(req.params.artisanId);
    if (isNaN(artisanId)) {
      return errorResponse(res, 400, "Invalid artisan ID");
    }
    
    const products = await storage.getProductsByArtisan(artisanId);
    return successResponse(res, 200, products);
  } catch (error) {
    console.error("Failed to fetch products by artisan:", error);
    return errorResponse(res, 500, "Failed to fetch products by artisan");
  }
});

export default app;