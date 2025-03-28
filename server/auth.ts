import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { 
  User as SelectUser,
  InsertUser,
  insertUserSchema
 } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends SelectUser {}
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

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "karigar-connect-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    console.log("Registration request received:", req.body);
    try {
      // Validate the input
      console.log("Validating user input with schema");
      const userInput = insertUserSchema.parse(req.body);
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
      console.log("User created successfully:", { id: user.id, username: user.username });
      
      // Remove the password from the returned user
      const { password, ...userWithoutPassword } = user;
      
      // Log the user in
      console.log("Logging in the new user");
      req.login(user, (err) => {
        if (err) {
          console.error("Error during login after registration:", err);
          return next(err);
        }
        console.log("User logged in successfully, sending response");
        res.status(201).json(userWithoutPassword);
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

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}
