import { 
  users, type User, type InsertUser,
  artisanProfiles, type ArtisanProfile, type InsertArtisanProfile,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  events, type Event, type InsertEvent,
  forumPosts, type ForumPost, type InsertForumPost,
  forumReplies, type ForumReply, type InsertForumReply
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Artisan profile operations
  getArtisanProfile(userId: number): Promise<ArtisanProfile | undefined>;
  createArtisanProfile(profile: InsertArtisanProfile): Promise<ArtisanProfile>;
  updateArtisanProfile(userId: number, profileData: Partial<ArtisanProfile>): Promise<ArtisanProfile | undefined>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(limit?: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductsByArtisan(artisanId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  
  // Event operations
  getEvents(limit?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined>;
  
  // Forum operations
  getForumPosts(limit?: number): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  getForumReplies(postId: number): Promise<ForumReply[]>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;
  
  // Session store
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artisanProfiles: Map<number, ArtisanProfile>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private events: Map<number, Event>;
  private forumPosts: Map<number, ForumPost>;
  private forumReplies: Map<number, ForumReply>;
  
  // Counters for IDs
  private userIdCounter: number;
  private artisanProfileIdCounter: number;
  private categoryIdCounter: number;
  private productIdCounter: number;
  private eventIdCounter: number;
  private forumPostIdCounter: number;
  private forumReplyIdCounter: number;
  
  // Session store
  public sessionStore: any;
  
  constructor() {
    this.users = new Map();
    this.artisanProfiles = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.events = new Map();
    this.forumPosts = new Map();
    this.forumReplies = new Map();
    
    this.userIdCounter = 1;
    this.artisanProfileIdCounter = 1;
    this.categoryIdCounter = 1;
    this.productIdCounter = 1;
    this.eventIdCounter = 1;
    this.forumPostIdCounter = 1;
    this.forumReplyIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    }) as any;
    
    // Initialize with some categories
    this.initData();
  }
  
  private initData() {
    // Add some initial categories
    const categories = [
      { name: 'Pottery', description: 'Traditional and contemporary pottery crafts', imageUrl: 'https://images.unsplash.com/photo-1606503825008-909a67e63c3d' },
      { name: 'Textiles', description: 'Handwoven and handcrafted textile products', imageUrl: 'https://images.unsplash.com/photo-1605028241606-ca01277028e4' },
      { name: 'Woodwork', description: 'Wooden crafts and furniture', imageUrl: 'https://images.unsplash.com/photo-1621983209322-809e29649e85' },
      { name: 'Jewelry', description: 'Handcrafted jewelry using traditional techniques', imageUrl: 'https://images.unsplash.com/photo-1590736969955-71f527d83d31' },
    ];
    
    categories.forEach(cat => {
      this.createCategory({
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl
      });
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user = { ...userData, id, joinDate: now } as User;
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Artisan profile operations
  async getArtisanProfile(userId: number): Promise<ArtisanProfile | undefined> {
    return Array.from(this.artisanProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createArtisanProfile(profileData: InsertArtisanProfile): Promise<ArtisanProfile> {
    const id = this.artisanProfileIdCounter++;
    const profile = { ...profileData, id, verified: false } as ArtisanProfile;
    this.artisanProfiles.set(id, profile);
    return profile;
  }
  
  async updateArtisanProfile(userId: number, profileData: Partial<ArtisanProfile>): Promise<ArtisanProfile | undefined> {
    const profile = await this.getArtisanProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile = { ...profile, ...profileData };
    this.artisanProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category = { ...categoryData, id } as Category;
    this.categories.set(id, category);
    return category;
  }
  
  // Product operations
  async getProducts(limit?: number): Promise<Product[]> {
    const products = Array.from(this.products.values());
    if (limit) {
      return products.slice(0, limit);
    }
    return products;
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async getProductsByArtisan(artisanId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.artisanId === artisanId,
    );
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const now = new Date();
    const product = { ...productData, id, createdAt: now } as Product;
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  // Event operations
  async getEvents(limit?: number): Promise<Event[]> {
    const events = Array.from(this.events.values());
    if (limit) {
      return events.slice(0, limit);
    }
    return events;
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const now = new Date();
    const event = { ...eventData, id, createdAt: now } as Event;
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const event = await this.getEvent(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  // Forum operations
  async getForumPosts(limit?: number): Promise<ForumPost[]> {
    const posts = Array.from(this.forumPosts.values());
    if (limit) {
      return posts.slice(0, limit);
    }
    return posts;
  }
  
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }
  
  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostIdCounter++;
    const now = new Date();
    const post = { ...postData, id, createdAt: now } as ForumPost;
    this.forumPosts.set(id, post);
    return post;
  }
  
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return Array.from(this.forumReplies.values()).filter(
      (reply) => reply.postId === postId,
    );
  }
  
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const id = this.forumReplyIdCounter++;
    const now = new Date();
    const reply = { ...replyData, id, createdAt: now } as ForumReply;
    this.forumReplies.set(id, reply);
    return reply;
  }
}

export const storage = new MemStorage();
