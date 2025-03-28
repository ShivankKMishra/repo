import { 
  type User, type InsertUser,
  type ArtisanProfile, type InsertArtisanProfile,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Event, type InsertEvent,
  type ForumPost, type InsertForumPost,
  type ForumReply, type InsertForumReply,
  UserModel, 
  ArtisanProfileModel, 
  CategoryModel, 
  ProductModel, 
  EventModel, 
  ForumPostModel, 
  ForumReplyModel 
} from "@shared/schema";
import mongoose from 'mongoose';
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  
  // Artisan profile operations
  getArtisanProfile(userId: string): Promise<ArtisanProfile | undefined>;
  createArtisanProfile(profile: InsertArtisanProfile): Promise<ArtisanProfile>;
  updateArtisanProfile(userId: string, profileData: Partial<ArtisanProfile>): Promise<ArtisanProfile | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(limit?: number): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductsByArtisan(artisanId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, productData: Partial<Product>): Promise<Product | undefined>;
  
  // Event operations
  getEvents(limit?: number): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, eventData: Partial<Event>): Promise<Event | undefined>;
  
  // Forum operations
  getForumPosts(limit?: number): Promise<ForumPost[]>;
  getForumPost(id: string): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumReplies(postId: string): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Session store
  sessionStore: any;
}

// In-memory storage as fallback
export class MemStorage implements IStorage {
  private users: User[] = [];
  private artisanProfiles: ArtisanProfile[] = [];
  private categories: Category[] = [];
  private products: Product[] = [];
  private events: Event[] = [];
  private forumPosts: ForumPost[] = [];
  private forumReplies: ForumReply[] = [];
  public sessionStore: any;
  
  constructor() {
    // Using a simple object for session store in memory implementation
    this.sessionStore = {
      get: (sid: string, cb: Function) => cb(null, null),
      set: (sid: string, session: any, cb: Function) => cb(null),
      destroy: (sid: string, cb: Function) => cb(null),
      all: (cb: Function) => cb(null, []),
      touch: (sid: string, session: any, cb: Function) => cb(null)
    };
    
    // Initialize with some seed data
    this.initData();
  }
  
  private initData() {
    // Categories
    this.categories = [
      { _id: '1', name: 'Woodworking', description: 'Handcrafted wooden items', imageUrl: 'https://images.unsplash.com/photo-1605457867610-e990b283f7a5?q=80&w=200' },
      { _id: '2', name: 'Pottery', description: 'Ceramic art and functional pieces', imageUrl: 'https://images.unsplash.com/photo-1606535943690-349f9611adcf?q=80&w=200' },
      { _id: '3', name: 'Textiles', description: 'Handwoven and custom-made textiles', imageUrl: 'https://images.unsplash.com/photo-1599641863314-ba21f4f015a1?q=80&w=200' },
      { _id: '4', name: 'Jewelry', description: 'Handcrafted jewelry and accessories', imageUrl: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?q=80&w=200' }
    ] as unknown as Category[];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user._id.toString() === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.users.length + 1;
    const newUser = {
      _id: id.toString(),
      ...userData,
      joinDate: new Date()
    } as unknown as User;
    
    this.users.push(newUser);
    return newUser;
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(user => user._id.toString() === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData } as User;
    return this.users[userIndex];
  }
  
  async getArtisanProfile(userId: string): Promise<ArtisanProfile | undefined> {
    return this.artisanProfiles.find(profile => profile.userId.toString() === userId);
  }
  
  async createArtisanProfile(profileData: InsertArtisanProfile): Promise<ArtisanProfile> {
    const id = this.artisanProfiles.length + 1;
    const newProfile = {
      _id: id.toString(),
      ...profileData,
      verified: false
    } as unknown as ArtisanProfile;
    
    this.artisanProfiles.push(newProfile);
    return newProfile;
  }
  
  async updateArtisanProfile(userId: string, profileData: Partial<ArtisanProfile>): Promise<ArtisanProfile | undefined> {
    const profileIndex = this.artisanProfiles.findIndex(profile => profile.userId.toString() === userId);
    if (profileIndex === -1) return undefined;
    
    this.artisanProfiles[profileIndex] = { ...this.artisanProfiles[profileIndex], ...profileData } as ArtisanProfile;
    return this.artisanProfiles[profileIndex];
  }
  
  async getCategories(): Promise<Category[]> {
    return this.categories;
  }
  
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.find(category => category._id.toString() === id);
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categories.length + 1;
    const newCategory = {
      _id: id.toString(),
      ...categoryData,
    } as unknown as Category;
    
    this.categories.push(newCategory);
    return newCategory;
  }
  
  async getProducts(limit?: number): Promise<Product[]> {
    const products = [...this.products];
    if (limit) {
      return products.slice(0, limit);
    }
    return products;
  }
  
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.products.filter(product => product.categoryId?.toString() === categoryId);
  }
  
  async getProductsByArtisan(artisanId: string): Promise<Product[]> {
    return this.products.filter(product => product.artisanId.toString() === artisanId);
  }
  
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.find(product => product._id.toString() === id);
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.products.length + 1;
    const newProduct = {
      _id: id.toString(),
      ...productData,
      createdAt: new Date()
    } as unknown as Product;
    
    this.products.push(newProduct);
    return newProduct;
  }
  
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | undefined> {
    const productIndex = this.products.findIndex(product => product._id.toString() === id);
    if (productIndex === -1) return undefined;
    
    this.products[productIndex] = { ...this.products[productIndex], ...productData } as Product;
    return this.products[productIndex];
  }
  
  async getEvents(limit?: number): Promise<Event[]> {
    const events = [...this.events];
    if (limit) {
      return events.slice(0, limit);
    }
    return events;
  }
  
  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.find(event => event._id.toString() === id);
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const id = this.events.length + 1;
    const newEvent = {
      _id: id.toString(),
      ...eventData,
      createdAt: new Date()
    } as unknown as Event;
    
    this.events.push(newEvent);
    return newEvent;
  }
  
  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event | undefined> {
    const eventIndex = this.events.findIndex(event => event._id.toString() === id);
    if (eventIndex === -1) return undefined;
    
    this.events[eventIndex] = { ...this.events[eventIndex], ...eventData } as Event;
    return this.events[eventIndex];
  }
  
  async getForumPosts(limit?: number): Promise<ForumPost[]> {
    const posts = [...this.forumPosts];
    if (limit) {
      return posts.slice(0, limit);
    }
    return posts;
  }
  
  async getForumPost(id: string): Promise<ForumPost | undefined> {
    return this.forumPosts.find(post => post._id.toString() === id);
  }
  
  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPosts.length + 1;
    const newPost = {
      _id: id.toString(),
      ...postData,
      createdAt: new Date()
    } as unknown as ForumPost;
    
    this.forumPosts.push(newPost);
    return newPost;
  }
  
  async getForumReplies(postId: string): Promise<ForumReply[]> {
    return this.forumReplies.filter(reply => reply.postId.toString() === postId);
  }
  
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplies.length + 1;
    const newReply = {
      _id: id.toString(),
      ...replyData,
      createdAt: new Date()
    } as unknown as ForumReply;
    
    this.forumReplies.push(newReply);
    return newReply;
  }
}

// MongoDB based storage
export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // = 14 days
    });
    
    // Initialize with some default categories if they don't exist
    this.initData();
  }

  private async initData() {
    // Check if we have categories already
    const existingCategories = await this.getCategories();
    
    if (existingCategories.length === 0) {
      // Add some initial categories
      const categories = [
        { name: 'Pottery', description: 'Traditional and contemporary pottery crafts', imageUrl: 'https://images.unsplash.com/photo-1606503825008-909a67e63c3d' },
        { name: 'Textiles', description: 'Handwoven and handcrafted textile products', imageUrl: 'https://images.unsplash.com/photo-1605028241606-ca01277028e4' },
        { name: 'Woodwork', description: 'Wooden crafts and furniture', imageUrl: 'https://images.unsplash.com/photo-1621983209322-809e29649e85' },
        { name: 'Jewelry', description: 'Handcrafted jewelry using traditional techniques', imageUrl: 'https://images.unsplash.com/photo-1590736969955-71f527d83d31' },
      ];
      
      for (const cat of categories) {
        await this.createCategory({
          name: cat.name,
          description: cat.description,
          imageUrl: cat.imageUrl
        });
      }
    }
  }
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id).lean();
      return user || undefined;
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username }).lean();
      return user || undefined;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return undefined;
    }
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email }).lean();
      return user || undefined;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return undefined;
    }
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel({
        ...userData,
        joinDate: new Date()
      });
      
      const savedUser = await newUser.save();
      return savedUser;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    try {
      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: userData },
        { new: true }
      ).lean();
      
      return updatedUser || undefined;
    } catch (error) {
      console.error("Error in updateUser:", error);
      return undefined;
    }
  }
  
  // Artisan profile operations
  async getArtisanProfile(userId: string): Promise<ArtisanProfile | undefined> {
    try {
      const profile = await ArtisanProfileModel.findOne({ userId }).lean();
      return profile || undefined;
    } catch (error) {
      console.error("Error in getArtisanProfile:", error);
      return undefined;
    }
  }
  
  async createArtisanProfile(profileData: InsertArtisanProfile): Promise<ArtisanProfile> {
    try {
      const newProfile = new ArtisanProfileModel({
        ...profileData,
        verified: false
      });
      
      const savedProfile = await newProfile.save();
      return savedProfile;
    } catch (error) {
      console.error("Error in createArtisanProfile:", error);
      throw error;
    }
  }
  
  async updateArtisanProfile(userId: string, profileData: Partial<ArtisanProfile>): Promise<ArtisanProfile | undefined> {
    try {
      const updatedProfile = await ArtisanProfileModel.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true }
      ).lean();
      
      return updatedProfile || undefined;
    } catch (error) {
      console.error("Error in updateArtisanProfile:", error);
      return undefined;
    }
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    try {
      return await CategoryModel.find().lean();
    } catch (error) {
      console.error("Error in getCategories:", error);
      return [];
    }
  }
  
  async getCategory(id: string): Promise<Category | undefined> {
    try {
      const category = await CategoryModel.findById(id).lean();
      return category || undefined;
    } catch (error) {
      console.error("Error in getCategory:", error);
      return undefined;
    }
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    try {
      const newCategory = new CategoryModel(categoryData);
      const savedCategory = await newCategory.save();
      return savedCategory;
    } catch (error) {
      console.error("Error in createCategory:", error);
      throw error;
    }
  }
  
  // Product operations
  async getProducts(limit?: number): Promise<Product[]> {
    try {
      let query = ProductModel.find().sort({ createdAt: -1 });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query.lean();
    } catch (error) {
      console.error("Error in getProducts:", error);
      return [];
    }
  }
  
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      return await ProductModel.find({ categoryId })
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      return [];
    }
  }
  
  async getProductsByArtisan(artisanId: string): Promise<Product[]> {
    try {
      return await ProductModel.find({ artisanId })
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      console.error("Error in getProductsByArtisan:", error);
      return [];
    }
  }
  
  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const product = await ProductModel.findById(id).lean();
      return product || undefined;
    } catch (error) {
      console.error("Error in getProduct:", error);
      return undefined;
    }
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    try {
      const newProduct = new ProductModel({
        ...productData,
        createdAt: new Date()
      });
      
      const savedProduct = await newProduct.save();
      return savedProduct;
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  }
  
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | undefined> {
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        { $set: productData },
        { new: true }
      ).lean();
      
      return updatedProduct || undefined;
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return undefined;
    }
  }
  
  // Event operations
  async getEvents(limit?: number): Promise<Event[]> {
    try {
      let query = EventModel.find().sort({ startDate: 1 });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query.lean();
    } catch (error) {
      console.error("Error in getEvents:", error);
      return [];
    }
  }
  
  async getEvent(id: string): Promise<Event | undefined> {
    try {
      const event = await EventModel.findById(id).lean();
      return event || undefined;
    } catch (error) {
      console.error("Error in getEvent:", error);
      return undefined;
    }
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    try {
      const newEvent = new EventModel({
        ...eventData,
        createdAt: new Date()
      });
      
      const savedEvent = await newEvent.save();
      return savedEvent;
    } catch (error) {
      console.error("Error in createEvent:", error);
      throw error;
    }
  }
  
  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event | undefined> {
    try {
      const updatedEvent = await EventModel.findByIdAndUpdate(
        id,
        { $set: eventData },
        { new: true }
      ).lean();
      
      return updatedEvent || undefined;
    } catch (error) {
      console.error("Error in updateEvent:", error);
      return undefined;
    }
  }
  
  // Forum operations
  async getForumPosts(limit?: number): Promise<ForumPost[]> {
    try {
      let query = ForumPostModel.find().sort({ createdAt: -1 });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      return await query.lean();
    } catch (error) {
      console.error("Error in getForumPosts:", error);
      return [];
    }
  }
  
  async getForumPost(id: string): Promise<ForumPost | undefined> {
    try {
      const post = await ForumPostModel.findById(id).lean();
      return post || undefined;
    } catch (error) {
      console.error("Error in getForumPost:", error);
      return undefined;
    }
  }
  
  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    try {
      const newPost = new ForumPostModel({
        ...postData,
        createdAt: new Date()
      });
      
      const savedPost = await newPost.save();
      return savedPost;
    } catch (error) {
      console.error("Error in createForumPost:", error);
      throw error;
    }
  }
  
  async getForumReplies(postId: string): Promise<ForumReply[]> {
    try {
      return await ForumReplyModel.find({ postId })
        .sort({ createdAt: 1 })
        .lean();
    } catch (error) {
      console.error("Error in getForumReplies:", error);
      return [];
    }
  }
  
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    try {
      const newReply = new ForumReplyModel({
        ...replyData,
        createdAt: new Date()
      });
      
      const savedReply = await newReply.save();
      return savedReply;
    } catch (error) {
      console.error("Error in createForumReply:", error);
      throw error;
    }
  }
}

// Use in-memory storage for now due to MongoDB connection issues
export const storage = new MemStorage();
