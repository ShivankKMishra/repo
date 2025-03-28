// api/newsletter/index.mjs
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for newsletter subscription
const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  interests: z.array(z.string()).optional()
});

const app = express();
app.use(cors());
app.use(express.json());

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const subscriptionData = subscribeSchema.parse(req.body);
    
    // Here you would typically integrate with an email service provider like Mailchimp, SendGrid, etc.
    // For now, we'll just log the subscription and return success
    
    console.log('Newsletter subscription:', subscriptionData);
    
    // In a production environment, you'd store this in a database table or send to an email provider
    
    return successResponse(res, 201, {
      message: "Successfully subscribed to newsletter",
      email: subscriptionData.email
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid subscription data", error.errors);
    }
    console.error("Newsletter subscription error:", error);
    return errorResponse(res, 500, "Failed to process subscription");
  }
});

export default app;