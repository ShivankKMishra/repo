import { z } from "zod";
import mongoose, { Document, Schema, model } from "mongoose";

// Zod schemas for validation
export const userSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().optional(),
  bio: z.string().optional(),
  isArtisan: z.boolean().default(false),
  location: z.string().optional(),
  contactInfo: z.string().optional(),
  joinDate: z.date().default(() => new Date()),
});

export const artisanProfileSchema = z.object({
  userId: z.string(),
  craft: z.string().optional(),
  experience: z.string().optional(),
  story: z.string().optional(),
  verified: z.boolean().default(false),
  socialMedia: z.string().optional(),
  skills: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().optional(),
  categoryId: z.string().optional(),
  artisanId: z.string(),
  stock: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
});

export const eventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  organizer: z.string().optional(),
  eventType: z.string().optional(),
  price: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const forumPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  userId: z.string(),
  category: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export const forumReplySchema = z.object({
  content: z.string(),
  postId: z.string(),
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
});

// Mongoose Schemas
const UserMongooseSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String,
  profilePicture: String,
  bio: String,
  isArtisan: { type: Boolean, default: false },
  location: String,
  contactInfo: String,
  joinDate: { type: Date, default: Date.now },
});

const ArtisanProfileMongooseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  craft: String,
  experience: String,
  story: String,
  verified: { type: Boolean, default: false },
  socialMedia: String,
  skills: String,
});

const CategoryMongooseSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  imageUrl: String,
});

const ProductMongooseSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  artisanId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const EventMongooseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  location: String,
  imageUrl: String,
  organizer: String,
  eventType: String,
  price: Number,
  createdAt: { type: Date, default: Date.now },
});

const ForumPostMongooseSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: String,
  createdAt: { type: Date, default: Date.now },
});

const ForumReplyMongooseSchema = new Schema({
  content: { type: String, required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'ForumPost', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

// Mongoose Models (will be initialized in db.ts)
export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
  isArtisan: boolean;
  location?: string;
  contactInfo?: string;
  joinDate: Date;
}

export interface ArtisanProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  craft?: string;
  experience?: string;
  story?: string;
  verified: boolean;
  socialMedia?: string;
  skills?: string;
}

export interface CategoryDocument extends Document {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface ProductDocument extends Document {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: mongoose.Types.ObjectId;
  artisanId: mongoose.Types.ObjectId;
  stock: number;
  createdAt: Date;
}

export interface EventDocument extends Document {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  imageUrl?: string;
  organizer?: string;
  eventType?: string;
  price?: number;
  createdAt: Date;
}

export interface ForumPostDocument extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  category?: string;
  createdAt: Date;
}

export interface ForumReplyDocument extends Document {
  content: string;
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

// Model exports (to be used in db.ts)
export const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', UserMongooseSchema);
export const ArtisanProfileModel = mongoose.models.ArtisanProfile || mongoose.model<ArtisanProfileDocument>('ArtisanProfile', ArtisanProfileMongooseSchema);
export const CategoryModel = mongoose.models.Category || mongoose.model<CategoryDocument>('Category', CategoryMongooseSchema);
export const ProductModel = mongoose.models.Product || mongoose.model<ProductDocument>('Product', ProductMongooseSchema);
export const EventModel = mongoose.models.Event || mongoose.model<EventDocument>('Event', EventMongooseSchema);
export const ForumPostModel = mongoose.models.ForumPost || mongoose.model<ForumPostDocument>('ForumPost', ForumPostMongooseSchema);
export const ForumReplyModel = mongoose.models.ForumReply || mongoose.model<ForumReplyDocument>('ForumReply', ForumReplyMongooseSchema);

// Type aliases for easier usage
export type User = UserDocument;
export type InsertUser = z.infer<typeof userSchema>;

export type ArtisanProfile = ArtisanProfileDocument;
export type InsertArtisanProfile = z.infer<typeof artisanProfileSchema>;

export type Category = CategoryDocument;
export type InsertCategory = z.infer<typeof categorySchema>;

export type Product = ProductDocument;
export type InsertProduct = z.infer<typeof productSchema>;

export type Event = EventDocument;
export type InsertEvent = z.infer<typeof eventSchema>;

export type ForumPost = ForumPostDocument;
export type InsertForumPost = z.infer<typeof forumPostSchema>;

export type ForumReply = ForumReplyDocument;
export type InsertForumReply = z.infer<typeof forumReplySchema>;
