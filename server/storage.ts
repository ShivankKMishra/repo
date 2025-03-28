import { 
  type User, type InsertUser,
  type ArtisanProfile, type InsertArtisanProfile,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Event, type InsertEvent,
  type ForumPost, type InsertForumPost,
  type ForumReply, type InsertForumReply
} from "@shared/schema";
import session from "express-session";
import { v4 as uuidv4 } from "uuid";
import createMemoryStore from "memorystore";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface IStorage {
  // User operations
  getAllUsers(): Promise<User[]>;
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
    // Use memorystore for session storage
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
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

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }
  
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => (user._id as string) === id);
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
    const userIndex = this.users.findIndex(user => (user._id as string) === id);
    if (userIndex === -1) return undefined;
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData } as User;
    return this.users[userIndex];
  }
  
  async getArtisanProfile(userId: string): Promise<ArtisanProfile | undefined> {
    return this.artisanProfiles.find(profile => (profile.userId as string) === userId);
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
    const profileIndex = this.artisanProfiles.findIndex(profile => (profile.userId as string) === userId);
    if (profileIndex === -1) return undefined;
    
    this.artisanProfiles[profileIndex] = { ...this.artisanProfiles[profileIndex], ...profileData } as ArtisanProfile;
    return this.artisanProfiles[profileIndex];
  }
  
  async getCategories(): Promise<Category[]> {
    return this.categories;
  }
  
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.find(category => (category._id as string) === id);
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
    return this.products.filter(product => (product.categoryId as string) === categoryId);
  }
  
  async getProductsByArtisan(artisanId: string): Promise<Product[]> {
    return this.products.filter(product => (product.artisanId as string) === artisanId);
  }
  
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.find(product => (product._id as string) === id);
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
    const productIndex = this.products.findIndex(product => (product._id as string) === id);
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
    return this.events.find(event => (event._id as string) === id);
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
    const eventIndex = this.events.findIndex(event => (event._id as string) === id);
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
    return this.forumPosts.find(post => (post._id as string) === id);
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
    return this.forumReplies.filter(reply => (reply.postId as string) === postId);
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

// Use in-memory storage for now due to MongoDB connection issues
export const storage = new MemStorage();

// In-memory storage for development
let storage: Record<string, any> = {
  forumPosts: [],
  forumReplies: [],
  artisans: [],
  users: []
};

// Initialize storage from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const savedData = localStorage.getItem('artisan_marketplace');
    if (savedData) {
      storage = JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
}

// Save to localStorage whenever data changes
const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('artisan_marketplace', JSON.stringify(storage));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

// Forum Posts
export const getForumPosts = async (limit?: number) => {
  let posts = storage.forumPosts || [];
  if (limit) {
    posts = posts.slice(0, limit);
  }
  return posts;
};

export const getForumPost = async (id: number) => {
  const posts = storage.forumPosts || [];
  return posts.find((post: any) => post.id === id);
};

export const createForumPost = async (data: any) => {
  const posts = storage.forumPosts || [];
  const newPost = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...data
  };
  posts.push(newPost);
  storage.forumPosts = posts;
  saveToStorage();
  return newPost;
};

// Forum Replies
export const getForumReplies = async (postId: number) => {
  const replies = storage.forumReplies || [];
  return replies.filter((reply: any) => reply.postId === postId);
};

export const createForumReply = async (data: any) => {
  const replies = storage.forumReplies || [];
  const newReply = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...data
  };
  replies.push(newReply);
  storage.forumReplies = replies;
  saveToStorage();
  return newReply;
};

// Artisans
export const getArtisans = async () => {
  return storage.artisans || [];
};

export const getArtisan = async (id: number) => {
  const artisans = storage.artisans || [];
  return artisans.find((artisan: any) => artisan.id === id);
};

export const createArtisan = async (data: any) => {
  const artisans = storage.artisans || [];
  const newArtisan = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...data
  };
  artisans.push(newArtisan);
  storage.artisans = artisans;
  saveToStorage();
  return newArtisan;
};

// Users
export const getUsers = async () => {
  return storage.users || [];
};

export const getUser = async (id: number) => {
  const users = storage.users || [];
  return users.find((user: any) => user.id === id);
};

export const createUser = async (data: any) => {
  const users = storage.users || [];
  const newUser = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...data
  };
  users.push(newUser);
  storage.users = users;
  saveToStorage();
  return newUser;
};
