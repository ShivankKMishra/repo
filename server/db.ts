import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as schema from "@shared/schema";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

// Configure mongoose
mongoose.set('strictQuery', false);

// Connection function
export const connectDB = async (): Promise<void> => {
  try {
    if (!MONGO_URI) {
      console.warn('MongoDB connection string is not defined, using in-memory storage');
      return;
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    };

    await mongoose.connect(MONGO_URI, options);
    console.log('MongoDB connected successfully');
    
    // Create some initial data if database is empty
    await createInitialData();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Using in-memory storage instead');
  }
};

// Create initial data if database is empty
async function createInitialData() {
  try {
    // Check if we have any categories
    const categoryCount = await schema.CategoryModel.countDocuments();
    if (categoryCount === 0) {
      console.log('Creating initial categories...');
      const categories = [
        { name: 'Woodworking', description: 'Handcrafted wooden items', imageUrl: 'https://images.unsplash.com/photo-1605457867610-e990b283f7a5?q=80&w=200' },
        { name: 'Pottery', description: 'Ceramic art and functional pieces', imageUrl: 'https://images.unsplash.com/photo-1606535943690-349f9611adcf?q=80&w=200' },
        { name: 'Textiles', description: 'Handwoven and custom-made textiles', imageUrl: 'https://images.unsplash.com/photo-1599641863314-ba21f4f015a1?q=80&w=200' },
        { name: 'Jewelry', description: 'Handcrafted jewelry and accessories', imageUrl: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?q=80&w=200' }
      ];
      
      await schema.CategoryModel.insertMany(categories);
      console.log('Initial categories created successfully');
    }
  } catch (error) {
    console.error('Error creating initial data:', error);
  }
}

// Connect to MongoDB when this file is imported
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.warn('Application will continue with limited functionality');
});

// Export models for easy access
export const { 
  UserModel, 
  ArtisanProfileModel, 
  CategoryModel, 
  ProductModel, 
  EventModel, 
  ForumPostModel, 
  ForumReplyModel 
} = schema;
