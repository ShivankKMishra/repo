import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import mongoose from "mongoose";
import { 
  categorySchema,
  productSchema,
  eventSchema,
  forumPostSchema,
  forumReplySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      
      // Convert mongoose documents to plain objects
      const categoryObjs = categories.map(category => 
        category.toObject ? category.toObject() : category
      );
      
      res.json(categoryObjs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Convert mongoose document to plain object if needed
      const categoryObj = category.toObject ? category.toObject() : category;
      
      res.json(categoryObj);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });
  
  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getProducts(limit);
      
      // Convert mongoose documents to plain objects
      const productObjs = products.map(product => 
        product.toObject ? product.toObject() : product
      );
      
      res.json(productObjs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  
  app.get("/api/products/category/:categoryId", async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const products = await storage.getProductsByCategory(categoryId);
      
      // Convert mongoose documents to plain objects
      const productObjs = products.map(product => 
        product.toObject ? product.toObject() : product
      );
      
      res.json(productObjs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  
  app.get("/api/products/artisan/:artisanId", async (req, res) => {
    try {
      const artisanId = req.params.artisanId;
      if (!artisanId || !mongoose.Types.ObjectId.isValid(artisanId)) {
        return res.status(400).json({ message: "Invalid artisan ID" });
      }
      
      const products = await storage.getProductsByArtisan(artisanId);
      
      // Convert mongoose documents to plain objects
      const productObjs = products.map(product => 
        product.toObject ? product.toObject() : product
      );
      
      res.json(productObjs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by artisan" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Convert mongoose document to plain object
      const productObj = product.toObject ? product.toObject() : product;
      
      res.json(productObj);
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
      
      const productData = productSchema.parse({
        ...req.body,
        artisanId: req.user._id.toString()
      });
      
      const product = await storage.createProduct(productData);
      
      // Convert mongoose document to plain object
      const productObj = product.toObject ? product.toObject() : product;
      
      res.status(201).json(productObj);
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
      // Get all users with in-memory storage
      const allUsers = await storage.getAllUsers();
      
      // Filter users that are artisans
      const artisanUsers = allUsers.filter(user => user.isArtisan);
      
      // Get profiles for each artisan
      const artisansWithProfiles = await Promise.all(
        artisanUsers.map(async (user) => {
          const profile = await storage.getArtisanProfile(user._id.toString());
          const { password, ...userWithoutPassword } = user;
          return {
            ...userWithoutPassword,
            profile
          };
        })
      );
      
      res.json(artisansWithProfiles);
    } catch (error) {
      console.error("Error fetching artisans:", error);
      res.status(500).json({ message: "Failed to fetch artisans" });
    }
  });
  
  app.get("/api/artisans/:id", async (req, res) => {
    try {
      const id = req.params.id;
      // No need to parse as integer for MongoDB
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid artisan ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user || !user.isArtisan) {
        return res.status(404).json({ message: "Artisan not found" });
      }
      
      const profile = await storage.getArtisanProfile(id);
      
      // Convert Mongoose document to plain object
      const userObj = user.toObject ? user.toObject() : user;
      const { password, ...userWithoutPassword } = userObj;
      
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
      
      // Convert mongoose documents to plain objects
      const eventObjs = events.map(event => 
        event.toObject ? event.toObject() : event
      );
      
      res.json(eventObjs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Convert mongoose document to plain object
      const eventObj = event.toObject ? event.toObject() : event;
      
      res.json(eventObj);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  
  app.post("/api/events", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create an event" });
      }
      
      // Add creator information to event data
      const eventData = eventSchema.parse({
        ...req.body,
        organizer: req.user.username || 'Anonymous',
        createdAt: new Date()
      });
      
      const event = await storage.createEvent(eventData);
      
      // Convert mongoose document to plain object if needed
      const eventObj = event.toObject ? event.toObject() : event;
      
      res.status(201).json(eventObj);
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
          // MongoDB document has _id instead of id
          const postObj = post.toObject ? post.toObject() : post;
          const id = postObj._id.toString();
          const replies = await storage.getForumReplies(id);
          return {
            ...postObj,
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
      const id = req.params.id;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(id);
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      
      const replies = await storage.getForumReplies(id);
      
      // Convert to plain objects if mongoose documents
      const postObj = post.toObject ? post.toObject() : post;
      const repliesObj = replies.map(reply => reply.toObject ? reply.toObject() : reply);
      
      res.json({
        post: postObj,
        replies: repliesObj
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
      
      const postData = forumPostSchema.parse({
        ...req.body,
        userId: req.user._id.toString(),
        createdAt: new Date()
      });
      
      const post = await storage.createForumPost(postData);
      
      // Convert mongoose document to plain object if needed
      const postObj = post.toObject ? post.toObject() : post;
      
      res.status(201).json(postObj);
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
      
      const postId = req.params.postId;
      if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      
      const replyData = forumReplySchema.parse({
        ...req.body,
        postId: postId,
        userId: req.user._id.toString()
      });
      
      const reply = await storage.createForumReply(replyData);
      
      // Convert to plain object if mongoose document
      const replyObj = reply.toObject ? reply.toObject() : reply;
      
      res.status(201).json(replyObj);
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
