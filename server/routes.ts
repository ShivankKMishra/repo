import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertCategorySchema,
  insertProductSchema,
  insertEventSchema,
  insertForumPostSchema,
  insertForumReplySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getProducts(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  app.get("/api/products/category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const products = await storage.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  
  app.get("/api/products/artisan/:artisanId", async (req, res) => {
    try {
      const artisanId = parseInt(req.params.artisanId);
      if (isNaN(artisanId)) {
        return res.status(400).json({ message: "Invalid artisan ID" });
      }
      
      const products = await storage.getProductsByArtisan(artisanId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by artisan" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create a product" });
      }
      
      if (!req.user.isArtisan) {
        return res.status(403).json({ message: "Only artisans can create products" });
      }
      
      const productData = insertProductSchema.parse(req.body);
      
      if (productData.artisanId !== req.user.id) {
        return res.status(403).json({ message: "You can only create products for yourself" });
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  // Artisan profiles
  app.get("/api/artisans", async (req, res) => {
    try {
      const users = await Promise.all(
        Array.from(storage["users"].values())
          .filter(user => user.isArtisan)
          .map(async (user) => {
            const profile = await storage.getArtisanProfile(user.id);
            const { password, ...userWithoutPassword } = user;
            return {
              ...userWithoutPassword,
              profile
            };
          })
      );
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artisans" });
    }
  });
  
  app.get("/api/artisans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid artisan ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user || !user.isArtisan) {
        return res.status(404).json({ message: "Artisan not found" });
      }
      
      const profile = await storage.getArtisanProfile(id);
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        ...userWithoutPassword,
        profile
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch artisan" });
    }
  });
  
  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const events = await storage.getEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  
  app.post("/api/events", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create an event" });
      }
      
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  // Forum
  app.get("/api/forum", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getForumPosts(limit);
      
      const postsWithReplyCounts = await Promise.all(
        posts.map(async (post) => {
          const replies = await storage.getForumReplies(post.id);
          return {
            ...post,
            replyCount: replies.length
          };
        })
      );
      
      res.json(postsWithReplyCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });
  
  app.get("/api/forum/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(id);
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      
      const replies = await storage.getForumReplies(id);
      
      res.json({
        post,
        replies
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });
  
  app.post("/api/forum", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create a forum post" });
      }
      
      const postData = insertForumPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid forum post data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });
  
  app.post("/api/forum/:postId/reply", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to reply to a forum post" });
      }
      
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      
      const replyData = insertForumReplySchema.parse({
        ...req.body,
        postId,
        userId: req.user.id
      });
      
      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reply data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reply" });
    }
  });
  
  // Newsletter signup
  app.post("/api/newsletter", (req, res) => {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: "Email is required" });
    }
    
    // In a real application, we would store this email in a database
    // and potentially integrate with an email provider like Mailchimp
    
    res.status(200).json({ message: "Successfully subscribed to newsletter" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
