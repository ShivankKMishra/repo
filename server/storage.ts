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

// In-memory storage with localStorage persistence
class LocalStorage implements IStorage {
  private storage: Record<string, any> = {
    users: [],
    artisanProfiles: [],
    categories: [],
    products: [],
    events: [],
    forumPosts: [],
    forumReplies: []
  };
  public sessionStore: any;

  constructor() {
    // Use memorystore for session storage
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
    
    // Initialize with localStorage data if available
    this.initFromLocalStorage();
    
    // Initialize with seed data if storage is empty
    if (this.storage.categories.length === 0) {
      this.initData();
    }
  }

  private initFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const savedData = localStorage.getItem('artisan_marketplace');
        if (savedData) {
          this.storage = JSON.parse(savedData);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }

  private saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('artisan_marketplace', JSON.stringify(this.storage));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }

  private initData() {
    // Categories
    this.storage.categories = [
      { _id: '1', name: 'Woodworking', description: 'Handcrafted wooden items', imageUrl: 'https://images.unsplash.com/photo-1605457867610-e990b283f7a5?q=80&w=200' },
      { _id: '2', name: 'Pottery', description: 'Ceramic art and functional pieces', imageUrl: 'https://images.unsplash.com/photo-1606535943690-349f9611adcf?q=80&w=200' },
      { _id: '3', name: 'Textiles', description: 'Handwoven and custom-made textiles', imageUrl: 'https://images.unsplash.com/photo-1599641863314-ba21f4f015a1?q=80&w=200' },
      { _id: '4', name: 'Jewelry', description: 'Handcrafted jewelry and accessories', imageUrl: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?q=80&w=200' }
    ];
    this.saveToLocalStorage();
  }

  // User operations
  async getAllUsers(): Promise<User[]> {
    return this.storage.users;
  }
  
  async getUser(id: string): Promise<User | undefined> {
    return this.storage.users.find((user: User) => (user._id as string) === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.storage.users.find((user: User) => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.storage.users.find((user: User) => user.email === email);
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = (this.storage.users.length + 1).toString();
    const newUser = {
      _id: id,
      ...userData,
      joinDate: new Date()
    } as User;
    
    this.storage.users.push(newUser);
    this.saveToLocalStorage();
    return newUser;
  }
  
  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const userIndex = this.storage.users.findIndex((user: User) => (user._id as string) === id);
    if (userIndex === -1) return undefined;
    
    this.storage.users[userIndex] = { ...this.storage.users[userIndex], ...userData };
    this.saveToLocalStorage();
    return this.storage.users[userIndex];
  }

  // Forum operations
  async getForumPosts(limit?: number): Promise<ForumPost[]> {
    const posts = [...this.storage.forumPosts];
    if (limit) {
      return posts.slice(0, limit);
    }
    return posts;
  }
  
  async getForumPost(id: string): Promise<ForumPost | undefined> {
    return this.storage.forumPosts.find((post: ForumPost) => (post._id as string) === id);
  }
  
  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const id = (this.storage.forumPosts.length + 1).toString();
    const newPost = {
      _id: id,
      ...postData,
      createdAt: new Date()
    } as unknown as ForumPost;
    
    this.storage.forumPosts.push(newPost);
    this.saveToLocalStorage();
    return newPost;
  }
  
  async getForumReplies(postId: string): Promise<ForumReply[]> {
    return this.storage.forumReplies.filter((reply: ForumReply) => (reply.postId as unknown as string) === postId);
  }
  
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const id = (this.storage.forumReplies.length + 1).toString();
    const newReply = {
      _id: id,
      ...replyData,
      createdAt: new Date()
    } as unknown as ForumReply;
    
    this.storage.forumReplies.push(newReply);
    this.saveToLocalStorage();
    return newReply;
  }

  // Artisan operations
  async getArtisans(): Promise<ArtisanProfile[]> {
    return this.storage.artisanProfiles;
  }

  async getArtisan(id: string): Promise<ArtisanProfile | undefined> {
    return this.storage.artisanProfiles.find((artisan: ArtisanProfile) => (artisan._id as string) === id);
  }

  async createArtisan(profileData: InsertArtisanProfile): Promise<ArtisanProfile> {
    const id = (this.storage.artisanProfiles.length + 1).toString();
    const newArtisan = {
      _id: id,
      ...profileData,
      verified: false
    } as unknown as ArtisanProfile;
    
    this.storage.artisanProfiles.push(newArtisan);
    this.saveToLocalStorage();
    return newArtisan;
  }

  async updateArtisanProfile(userId: string, profileData: Partial<ArtisanProfile>): Promise<ArtisanProfile | undefined> {
    const profileIndex = this.storage.artisanProfiles.findIndex((profile: ArtisanProfile) => (profile.userId as unknown as string) === userId);
    if (profileIndex === -1) return undefined;
    
    this.storage.artisanProfiles[profileIndex] = { ...this.storage.artisanProfiles[profileIndex], ...profileData };
    this.saveToLocalStorage();
    return this.storage.artisanProfiles[profileIndex];
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return this.storage.categories;
  }
  
  async getCategory(id: string): Promise<Category | undefined> {
    return this.storage.categories.find((category: Category) => (category._id as string) === id);
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = (this.storage.categories.length + 1).toString();
    const newCategory = {
      _id: id,
      ...categoryData,
    } as Category;
    
    this.storage.categories.push(newCategory);
    this.saveToLocalStorage();
    return newCategory;
  }
  
  // Product operations
  async getProducts(limit?: number): Promise<Product[]> {
    const products = [...this.storage.products];
    if (limit) {
      return products.slice(0, limit);
    }
    return products;
  }
  
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.storage.products.filter((product: Product) => (product.categoryId as unknown as string) === categoryId);
  }
  
  async getProductsByArtisan(artisanId: string): Promise<Product[]> {
    return this.storage.products.filter((product: Product) => (product.artisanId as unknown as string) === artisanId);
  }
  
  async getProduct(id: string): Promise<Product | undefined> {
    return this.storage.products.find((product: Product) => (product._id as string) === id);
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = (this.storage.products.length + 1).toString();
    const newProduct = {
      _id: id,
      ...productData,
      createdAt: new Date()
    } as unknown as Product;
    
    this.storage.products.push(newProduct);
    this.saveToLocalStorage();
    return newProduct;
  }
  
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | undefined> {
    const productIndex = this.storage.products.findIndex((product: Product) => (product._id as string) === id);
    if (productIndex === -1) return undefined;
    
    this.storage.products[productIndex] = { ...this.storage.products[productIndex], ...productData };
    this.saveToLocalStorage();
    return this.storage.products[productIndex];
  }
  
  // Event operations
  async getEvents(limit?: number): Promise<Event[]> {
    const events = [...this.storage.events];
    if (limit) {
      return events.slice(0, limit);
    }
    return events;
  }
  
  async getEvent(id: string): Promise<Event | undefined> {
    return this.storage.events.find((event: Event) => (event._id as string) === id);
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const id = (this.storage.events.length + 1).toString();
    const newEvent = {
      _id: id,
      ...eventData,
      createdAt: new Date()
    } as Event;
    
    this.storage.events.push(newEvent);
    this.saveToLocalStorage();
    return newEvent;
  }
  
  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event | undefined> {
    const eventIndex = this.storage.events.findIndex((event: Event) => (event._id as string) === id);
    if (eventIndex === -1) return undefined;
    
    this.storage.events[eventIndex] = { ...this.storage.events[eventIndex], ...eventData };
    this.saveToLocalStorage();
    return this.storage.events[eventIndex];
  }

  async getArtisanProfile(userId: string): Promise<ArtisanProfile | undefined> {
    return this.storage.artisanProfiles.find((profile: ArtisanProfile) => (profile.userId as unknown as string) === userId);
  }

  async createArtisanProfile(profileData: InsertArtisanProfile): Promise<ArtisanProfile> {
    return this.createArtisan(profileData);
  }
}

// Export a single storage instance
export const storage = new LocalStorage();
