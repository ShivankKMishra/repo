// api/_middleware.mjs
import jwt from 'jsonwebtoken';
import { storage } from '../server/storage.js';
import { errorResponse } from './_utils.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'localartisans-dev-jwt-secret';

// JWT payload interface
export function generateToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    isArtisan: user.isArtisan
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Authenticate JWT middleware
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    jwt.verify(token, JWT_SECRET, async (err, payload) => {
      if (err) {
        return next(); // Continue without authentication
      }
      
      // Get user from database
      try {
        const user = await storage.getUser(payload.userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
      
      next();
    });
  } else {
    next();
  }
}

// Check if user is authenticated
export function isAuthenticated(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 401, "Authentication required");
  }
  next();
}

// Check if user is an artisan
export function isArtisan(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 401, "Authentication required");
  }
  
  if (!req.user.isArtisan) {
    return errorResponse(res, 403, "Access restricted to artisans only");
  }
  
  next();
}