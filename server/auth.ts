import { Express, Request, Response, NextFunction } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { 
  User as SelectUser,
  InsertUser,
  userSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// JWT Secret for signing tokens - from environment variables
const JWT_SECRET = process.env.VITE_JWT_SECRET || "karigar-connect-jwt-secret";
const JWT_EXPIRES_IN = process.env.VITE_JWT_EXPIRATION || "7d"; // Token expiration time

// Type definitions
interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SelectUser;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Generate JWT token
function generateToken(user: SelectUser): string {
  const payload: JwtPayload = {
    userId: user._id ? user._id.toString() : '',
    username: user.username,
    email: user.email
  };
  
  // Cast the secret to a string type that jwt.sign accepts
  const secret = String(JWT_SECRET);
  
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

// Authentication middleware
function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    // Cast the secret to a string type that jwt.verify accepts
    const secret = String(JWT_SECRET);
    
    jwt.verify(token, secret, async (err, payload) => {
      if (err) {
        return res.sendStatus(403);
      }
      
      if (payload && typeof payload !== 'string') {
        const jwtPayload = payload as JwtPayload;
        const user = await storage.getUser(jwtPayload.userId);
        if (user) {
          req.user = user;
        }
      }
      next();
    });
  } else {
    next();
  }
}

export function setupAuth(app: Express) {
  // Apply JWT authentication middleware
  app.use(authenticateJWT);

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    console.log("Registration request received:", req.body);
    try {
      // Validate the input
      console.log("Validating user input with schema");
      const userInput = userSchema.parse(req.body);
      console.log("Input validation passed:", userInput);
      
      // Check if username already exists
      console.log("Checking if username exists:", userInput.username);
      const existingUsername = await storage.getUserByUsername(userInput.username);
      if (existingUsername) {
        console.log("Username already exists");
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      console.log("Checking if email exists:", userInput.email);
      const existingEmail = await storage.getUserByEmail(userInput.email);
      if (existingEmail) {
        console.log("Email already exists");
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create the user with hashed password
      console.log("Hashing password");
      const hashedPassword = await hashPassword(userInput.password);
      console.log("Creating user in database");
      const user = await storage.createUser({
        ...userInput,
        password: hashedPassword,
      });
      console.log("User created successfully:", { id: user._id, username: user.username });
      
      // Generate token
      const token = generateToken(user);
      
      // Remove the password from the returned user
      const { password, ...userWithoutPassword } = user;
      
      console.log("User registered successfully, sending response with token");
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Error during registration:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error).message;
        console.error("Validation error:", validationError);
        return res.status(400).json({ message: validationError });
      }
      next(error);
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log("Login attempt for user:", username);
      
      // Find the user
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        console.log("Invalid credentials for user:", username);
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      console.log("User authenticated successfully:", { id: user._id, username: user.username });
      
      // Generate JWT token
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;
      
      console.log("Sending login response with token");
      res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Server error during login:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  });

  // Logout - client handles by removing the token
  app.post("/api/logout", (req, res) => {
    // JWT is stateless, so server doesn't need to do anything
    // Client will remove the token from local storage
    console.log("User logout - stateless with JWT");
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log("Returning authenticated user:", { id: req.user._id, username: req.user.username });
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}