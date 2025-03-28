// api/forum/index.mjs
import express from 'express';
import cors from 'cors';
import { storage } from '../../server/storage.js';
import { z } from 'zod';
import { authenticateJWT, isAuthenticated } from '../_middleware.mjs';
import { errorResponse, successResponse } from '../_utils.mjs';

// Validation schema for creating forum posts
const createPostSchema = z.object({
  title: z.string().min(3).max(150),
  content: z.string().min(10),
  categoryId: z.number().int().positive().optional()
});

// Validation schema for creating forum replies
const createReplySchema = z.object({
  content: z.string().min(2),
  postId: z.number().int().positive()
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

// Get all forum posts
app.get('/api/forum/posts', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const posts = await storage.getForumPosts(limit);
    return successResponse(res, 200, posts);
  } catch (error) {
    console.error("Failed to fetch forum posts:", error);
    return errorResponse(res, 500, "Failed to fetch forum posts");
  }
});

// Get forum post by ID with replies
app.get('/api/forum/posts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, 400, "Invalid post ID");
    }
    
    const post = await storage.getForumPost(id);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }
    
    // Get replies for this post
    const replies = await storage.getForumReplies(id);
    
    // Get user information for post author and reply authors
    const { db } = await import("../../server/db.js");
    const { users } = await import("../../shared/schema.js");
    const { eq, inArray } = await import("drizzle-orm");
    
    // Get unique user IDs from post and replies
    const userIds = [post.userId, ...replies.map(reply => reply.userId)];
    const uniqueUserIds = [...new Set(userIds)];
    
    // Get user information
    const userRecords = await db.select({
      id: users.id,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      profilePicture: users.profilePicture,
      isArtisan: users.isArtisan
    })
    .from(users)
    .where(inArray(users.id, uniqueUserIds));
    
    // Create a map of user info by user ID
    const userMap = userRecords.reduce((map, user) => {
      map[user.id] = user;
      return map;
    }, {});
    
    // Add author info to post and replies
    const postWithAuthor = {
      ...post,
      author: userMap[post.userId] || { username: "Unknown" }
    };
    
    const repliesWithAuthors = replies.map(reply => ({
      ...reply,
      author: userMap[reply.userId] || { username: "Unknown" }
    }));
    
    return successResponse(res, 200, {
      post: postWithAuthor,
      replies: repliesWithAuthors
    });
  } catch (error) {
    console.error("Failed to fetch forum post:", error);
    return errorResponse(res, 500, "Failed to fetch forum post");
  }
});

// Create a forum post (for authenticated users only)
app.post('/api/forum/posts', isAuthenticated, async (req, res) => {
  try {
    const postData = createPostSchema.parse(req.body);
    
    const post = await storage.createForumPost({
      ...postData,
      userId: req.user.id // Associate post with the creator
    });
    
    return successResponse(res, 201, post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid post data", error.errors);
    }
    console.error("Failed to create forum post:", error);
    return errorResponse(res, 500, "Failed to create forum post");
  }
});

// Create a forum reply (for authenticated users only)
app.post('/api/forum/replies', isAuthenticated, async (req, res) => {
  try {
    const replyData = createReplySchema.parse(req.body);
    
    // Check if the post exists
    const post = await storage.getForumPost(replyData.postId);
    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }
    
    const reply = await storage.createForumReply({
      ...replyData,
      userId: req.user.id // Associate reply with the creator
    });
    
    return successResponse(res, 201, reply);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, "Invalid reply data", error.errors);
    }
    console.error("Failed to create forum reply:", error);
    return errorResponse(res, 500, "Failed to create forum reply");
  }
});

export default app;