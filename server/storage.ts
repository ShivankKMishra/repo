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
import { db } from "./db";
import { eq, desc, asc, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

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

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
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
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const now = new Date();
    const [user] = await db.insert(users)
      .values({ ...userData, joinDate: now })
      .returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }
  
  // Artisan profile operations
  async getArtisanProfile(userId: number): Promise<ArtisanProfile | undefined> {
    const [profile] = await db.select()
      .from(artisanProfiles)
      .where(eq(artisanProfiles.userId, userId));
    return profile || undefined;
  }
  
  async createArtisanProfile(profileData: InsertArtisanProfile): Promise<ArtisanProfile> {
    const [profile] = await db.insert(artisanProfiles)
      .values({ ...profileData, verified: false })
      .returning();
    return profile;
  }
  
  async updateArtisanProfile(userId: number, profileData: Partial<ArtisanProfile>): Promise<ArtisanProfile | undefined> {
    const [profile] = await db.select()
      .from(artisanProfiles)
      .where(eq(artisanProfiles.userId, userId));
    
    if (!profile) return undefined;
    
    const [updatedProfile] = await db.update(artisanProfiles)
      .set(profileData)
      .where(eq(artisanProfiles.id, profile.id))
      .returning();
    
    return updatedProfile || undefined;
  }
  
  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select()
      .from(categories)
      .where(eq(categories.id, id));
    return category || undefined;
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories)
      .values(categoryData)
      .returning();
    return category;
  }
  
  // Product operations
  async getProducts(limit?: number): Promise<Product[]> {
    if (limit) {
      return db.select()
        .from(products)
        .orderBy(desc(products.createdAt))
        .limit(limit);
    }
    
    return db.select()
      .from(products)
      .orderBy(desc(products.createdAt));
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return db.select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));
  }
  
  async getProductsByArtisan(artisanId: number): Promise<Product[]> {
    return db.select()
      .from(products)
      .where(eq(products.artisanId, artisanId))
      .orderBy(desc(products.createdAt));
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select()
      .from(products)
      .where(eq(products.id, id));
    return product || undefined;
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const now = new Date();
    const [product] = await db.insert(products)
      .values({ ...productData, createdAt: now })
      .returning();
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  // Event operations
  async getEvents(limit?: number): Promise<Event[]> {
    if (limit) {
      return db.select()
        .from(events)
        .orderBy(asc(events.createdAt)) // Using createdAt instead of eventDate
        .limit(limit);
    }
    
    return db.select()
      .from(events)
      .orderBy(asc(events.createdAt)); // Using createdAt instead of eventDate
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select()
      .from(events)
      .where(eq(events.id, id));
    return event || undefined;
  }
  
  async createEvent(eventData: InsertEvent): Promise<Event> {
    const now = new Date();
    const [event] = await db.insert(events)
      .values({ ...eventData, createdAt: now })
      .returning();
    return event;
  }
  
  async updateEvent(id: number, eventData: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db.update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }
  
  // Forum operations
  async getForumPosts(limit?: number): Promise<ForumPost[]> {
    if (limit) {
      return db.select()
        .from(forumPosts)
        .orderBy(desc(forumPosts.createdAt))
        .limit(limit);
    }
    
    return db.select()
      .from(forumPosts)
      .orderBy(desc(forumPosts.createdAt));
  }
  
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const [post] = await db.select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id));
    return post || undefined;
  }
  
  async createForumPost(postData: InsertForumPost): Promise<ForumPost> {
    const now = new Date();
    const [post] = await db.insert(forumPosts)
      .values({ ...postData, createdAt: now })
      .returning();
    return post;
  }
  
  async getForumReplies(postId: number): Promise<ForumReply[]> {
    return db.select()
      .from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(asc(forumReplies.createdAt));
  }
  
  async createForumReply(replyData: InsertForumReply): Promise<ForumReply> {
    const now = new Date();
    const [reply] = await db.insert(forumReplies)
      .values({ ...replyData, createdAt: now })
      .returning();
    return reply;
  }
}

export const storage = new DatabaseStorage();
