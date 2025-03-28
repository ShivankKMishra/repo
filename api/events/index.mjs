// api/events/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for creating events
const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  eventDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    { message: "Invalid date format" }
  ),
  location: z.string().min(3),
  organizer: z.string().min(3),
  imageUrl: z.string().url().optional(),
  featured: z.boolean().optional()
});

// Validation schema for updating events
const updateEventSchema = createEventSchema.partial();

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const events = await storage.getEvents(limit);
    return successResponse(res, 200, events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return errorResponse(res, 500, "Failed to fetch events");
  }
});

// Get event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, "Invalid event ID");
    }
    
    const event = await storage.getEvent(id);
    if (!event) {
      return errorResponse(res, 404, "Event not found");
    }
    
    return successResponse(res, 200, event);
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return errorResponse(res, 500, "Failed to fetch event");
  }
});

// Create an event (for authenticated users only)
app.post('/api/events', isAuthenticated, async (req, res) => {
  try {
    const eventData = createEventSchema.parse(req.body);
    
    // Convert string date to Date object
    const eventDate = new Date(eventData.eventDate);
    
    const event = await storage.createEvent({
      ...eventData,
      eventDate,
      userId: req.user.id // Associate event with the creator
    });
    
    return successResponse(res, 201, event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid event data", error.errors);
    }
    console.error("Failed to create event:", error);
    return errorResponse(res, 500, "Failed to create event");
  }
});

// Update an event (for authenticated users - ideally should check if user is the creator)
app.patch('/api/events/:id', isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, "Invalid event ID");
    }
    
    // Check if event exists
    const event = await storage.getEvent(id);
    if (!event) {
      return errorResponse(res, 404, "Event not found");
    }
    
    // In a real application, we should check if the user is the creator of the event
    // or has admin privileges before allowing updates
    
    const eventData = updateEventSchema.parse(req.body);
    
    // Convert date if provided
    if (eventData.eventDate) {
      eventData.eventDate = new Date(eventData.eventDate);
    }
    
    const updatedEvent = await storage.updateEvent(id, eventData);
    
    return successResponse(res, 200, updatedEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid event data", error.errors);
    }
    console.error("Failed to update event:", error);
    return errorResponse(res, 500, "Failed to update event");
  }
});

export default app;